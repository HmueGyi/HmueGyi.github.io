#!/usr/bin/env node
/**
 * Smoke test for the portfolio.
 *
 *   node scripts/check.mjs                    # serves the repo and checks it
 *   node scripts/check.mjs --url http://localhost:5500/
 *   node scripts/check.mjs --shots ./tmp      # also writes screenshots
 *
 * Catches the class of bugs the eye misses and that cost the most:
 *   - uncaught JS errors / console errors
 *   - failed network requests (404 assets, blocked CDNs)
 *   - broken images (complete but naturalWidth === 0)
 *   - content that stays hidden because a reveal observer never fired
 *   - a hero mascot that stopped animating
 *   - horizontal overflow on a phone
 *   - light/dark theme not applying
 *
 * Exit code 0 = all checks passed. Requires no dependencies: it starts a
 * static server on a free port when --url is not given.
 */

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const argVal = name => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
};

const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webm': 'video/webm',
    '.mp4': 'video/mp4',
    '.woff2': 'font/woff2',
    '.xml': 'application/xml',
    '.txt': 'text/plain; charset=utf-8'
};

async function startServer() {
    const server = createServer(async (req, res) => {
        const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        let filePath = join(ROOT, normalize(urlPath));
        // "GET /" must serve index.html, not the directory itself
        if (urlPath.endsWith('/')) filePath = join(filePath, 'index.html');
        if (!filePath.startsWith(ROOT)) {
            res.writeHead(403).end();
            return;
        }
        try {
            const data = await readFile(filePath);
            res.writeHead(200, { 'Content-Type': TYPES[extname(filePath)] || 'application/octet-stream' });
            res.end(data);
        } catch {
            try {
                const data = await readFile(join(ROOT, '404.html'));
                res.writeHead(404, { 'Content-Type': TYPES['.html'] });
                res.end(data);
            } catch {
                res.writeHead(404).end('Not found');
            }
        }
    });
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    const { port } = server.address();
    return { server, url: `http://127.0.0.1:${port}/` };
}

/** Resolve a Playwright-compatible driver: local devDependency first, then the
 *  copy that ships with CodeGPT (patchright), so the check runs with no install. */
async function loadChromium() {
    const { createRequire } = await import('node:module');
    const { readFileSync } = await import('node:fs');
    const { homedir } = await import('node:os');

    const roots = [];
    if (process.env.CODEGPT_RUNTIME_MODULES) roots.push(process.env.CODEGPT_RUNTIME_MODULES);
    try {
        const home = process.env.CODEGPT_HOME || join(homedir(), '.codegpt');
        const runtime = JSON.parse(readFileSync(join(home, 'runtime.json'), 'utf8'));
        if (runtime.modulesRoot) roots.push(runtime.modulesRoot);
    } catch { /* not running under CodeGPT */ }
    roots.push(ROOT);

    for (const name of ['patchright', 'playwright', 'playwright-core']) {
        try {
            const mod = await import(name);
            const chromium = mod.chromium || mod.default?.chromium;
            if (chromium) return chromium;
        } catch { /* try the next one */ }
        for (const root of roots) {
            try {
                const mod = createRequire(join(root, 'noop.js'))(name);
                const chromium = mod?.chromium ?? mod?.default?.chromium;
                if (chromium) return chromium;
            } catch { /* try the next root */ }
        }
    }
    return null;
}

/** Launch the pinned browser, else the first Chrome/Chromium found on this machine. */
async function launchWithFallback(chromium) {
    const { existsSync } = await import('node:fs');
    const { homedir } = await import('node:os');
    const opts = { args: ['--no-sandbox', '--disable-dev-shm-usage'] };
    try {
        return await chromium.launch({ ...opts, headless: true });
    } catch (e) {
        let pinned = '';
        try { pinned = chromium.executablePath(); } catch { /* ignore */ }
        const candidates = process.platform === 'win32'
            ? [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA]
                .filter(Boolean)
                .flatMap(r => ['Google\\Chrome\\Application\\chrome.exe', 'Microsoft\\Edge\\Application\\msedge.exe']
                    .map(f => join(r, f)))
            : process.platform === 'darwin'
                ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                   '/Applications/Chromium.app/Contents/MacOS/Chromium']
                : ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium',
                   '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge', '/snap/bin/chromium'];
        for (const path of candidates) {
            if (!existsSync(path)) continue;
            try {
                return await chromium.launch({ ...opts, headless: true, executablePath: path });
            } catch { /* try the next one */ }
        }
        throw new Error(
            `No browser available. Pinned path: ${pinned || '(unknown)'}\n` +
            'Install one of:\n' +
            '  npx playwright install chromium\n' +
            '  sudo apt install chromium   (or Google Chrome)\n' +
            `Original error: ${e.message}`
        );
    }
}

const results = [];
function check(name, ok, detail = '') {
    results.push({ name, ok, detail });
    const mark = ok ? '\u001b[32m✓\u001b[0m' : '\u001b[31m✗\u001b[0m';
    console.log(`${mark} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
    let server;
    let url = argVal('--url');
    if (!url) {
        const started = await startServer();
        server = started.server;
        url = started.url;
        console.log(`Serving ${ROOT} at ${url}\n`);
    }

    const chromium = await loadChromium();
    if (!chromium) {
        console.error('Playwright/patchright not found. Run with --url and check manually, or install: npm i -D playwright');
        server?.close();
        process.exit(2);
    }

    // Use an already-installed browser when the pinned build is absent: the
    // pinned Chromium is a ~190 MB download and is often missing offline.
    const browser = await launchWithFallback(chromium);
    const pageErrors = [];
    const consoleErrors = [];
    const failedRequests = [];

    // Emulate a dark-preferring OS so "the site starts dark" is a real assertion,
    // not an artefact of headless Chromium defaulting to light.
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    const page = await ctx.newPage();
    page.on('pageerror', e => pageErrors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`); });

    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(2500);

    // ---- desktop, dark theme ----
    const desktop = await page.evaluate(() => {
        const media = document.getElementById('robot-media');
        const tw = document.getElementById('typewriter');
        return {
            dark: !document.documentElement.classList.contains('light'),
            title: document.title,
            h1: document.querySelector('h1')?.innerText.trim(),
            typewriter: tw ? tw.textContent.trim() : null,
            media: media
                ? {
                    kind: media.tagName,
                    readyState: media.readyState ?? null,
                    paused: media.paused ?? null,
                    src: (media.currentSrc || '').split('/').pop()
                }
                : null,
            brokenImages: [...document.images]
                .filter(i => i.complete && i.naturalWidth === 0)
                .map(i => i.currentSrc || i.src),
            overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            strayH2: document.querySelectorAll('main h2:not(.hero-title)').length,
            projectCount: document.querySelectorAll('.project-card').length,
            ogImage: document.querySelector('meta[property="og:image"]')?.content,
            jsonLd: !!document.querySelector('script[type="application/ld+json"]'),
            fontLoaded: document.fonts ? document.fonts.check('800 1em Outfit') : null
        };
    });

    check('no uncaught JS errors', pageErrors.length === 0, pageErrors.join(' | '));
    check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
    check('no failed requests', failedRequests.length === 0, failedRequests.slice(0, 5).join(' | '));
    check('no broken images', desktop.brokenImages.length === 0, desktop.brokenImages.join(', '));
    check('hero mascot is a playing <video> (not the old GIF)',
        desktop.media?.kind === 'VIDEO' && desktop.media.readyState >= 2 && desktop.media.paused === false,
        desktop.media ? `${desktop.media.kind} ${desktop.media.src} readyState=${desktop.media.readyState} paused=${desktop.media.paused}` : 'not found');
    check('hero title is visible',
        await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.hero-title')).opacity) > 0.9));
    check('typewriter is typing', !!desktop.typewriter && desktop.typewriter.length > 0, desktop.typewriter || 'empty');
    check('starts in dark mode when the OS prefers dark', desktop.dark);
    check('self-hosted font loaded', desktop.fontLoaded !== false, String(desktop.fontLoaded));
    check('every nav link is visible',
        await page.evaluate(() => [...document.querySelectorAll('#navMenu a')]
            .every(a => parseFloat(getComputedStyle(a).opacity) > 0.9)),
        await page.evaluate(() => [...document.querySelectorAll('#navMenu a')]
            .filter(a => parseFloat(getComputedStyle(a).opacity) < 0.9)
            .map(a => a.textContent).join(', ')));
    check('five project cards render', desktop.projectCount === 5, `${desktop.projectCount} cards`);
    check('section outline is h3 → h4 (no stray <h2>)', desktop.strayH2 === 0, `${desktop.strayH2} found`);
    check('og:image set', !!desktop.ogImage, desktop.ogImage || 'missing');
    check('Person JSON-LD present', desktop.jsonLd);
    check('no horizontal overflow (desktop)', desktop.overflowX === 0, `${desktop.overflowX}px`);

    // ---- scroll through: everything must end up visible ----
    await page.evaluate(async () => {
        document.documentElement.style.scrollBehavior = 'auto';
        const step = window.innerHeight * 0.6;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise(r => setTimeout(r, 120));
        }
        await new Promise(r => setTimeout(r, 1200));
    });
    const hidden = await page.evaluate(() =>
        [...document.querySelectorAll('[data-reveal]')]
            .filter(el => parseFloat(getComputedStyle(el).opacity) < 0.9)
            .map(el => (el.textContent || '').trim().slice(0, 30)));
    check('all revealed content is visible after scrolling', hidden.length === 0, hidden.join(' | '));

    // ---- light theme ----
    await page.evaluate(() => {
        window.scrollTo(0, 0);
    });
    await page.evaluate(() => document.getElementById('toggleTheme').click());
    await page.waitForTimeout(900);
    const light = await page.evaluate(() => ({
        light: document.documentElement.classList.contains('light'),
        stored: localStorage.getItem('theme'),
        broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src),
        langchain: document.querySelector('.langchain-wordmark')?.getAttribute('src'),
        bg: getComputedStyle(document.body).backgroundColor
    }));
    check('theme toggle switches to light', light.light && light.stored === 'light', light.bg);
    check('no broken images in light mode', light.broken.length === 0, light.broken.join(', '));
    check('light-mode artwork swapped in', /langchain-light/.test(light.langchain || ''), light.langchain || '');

    // ---- theme survives a reload, with no dark flash ----
    await page.reload({ waitUntil: 'load' });
    const flashCheck = await page.evaluate(() => ({
        lightBeforeScripts: document.documentElement.classList.contains('light')
    }));
    check('light theme applied before first paint (no flash)', flashCheck.lightBeforeScripts);

    // ---- mobile ----
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2200);
    const mobile = await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
        return {
            overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            menuVisible: getComputedStyle(document.getElementById('menuToggle')).display !== 'none',
            broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length
        };
    });
    await page.evaluate(() => document.getElementById('menuToggle').click());
    await page.waitForTimeout(500);
    const menu = await page.evaluate(() => {
        const nav = document.getElementById('navMenu');
        const r = nav.getBoundingClientRect();
        return {
            open: nav.classList.contains('open'),
            onScreen: r.right <= window.innerWidth + 1,
            expanded: document.getElementById('menuToggle').getAttribute('aria-expanded'),
            focusInside: nav.contains(document.activeElement)
        };
    });
    check('no horizontal overflow (mobile 390px)', mobile.overflowX === 0, `${mobile.overflowX}px`);
    check('no broken images (mobile)', mobile.broken === 0);
    check('hamburger visible on mobile', mobile.menuVisible);
    check('mobile menu opens, is on screen, focus moves inside',
        menu.open && menu.onScreen && menu.expanded === 'true' && menu.focusInside, JSON.stringify(menu));

    // ---- reduced motion ----
    const ctx2 = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'dark', viewport: { width: 1440, height: 900 } });
    const page2 = await ctx2.newPage();
    const reducedErrors = [];
    page2.on('pageerror', e => reducedErrors.push(String(e)));
    await page2.goto(url, { waitUntil: 'load' });
    await page2.waitForTimeout(1500);
    const reduced = await page2.evaluate(() => ({
        hidden: [...document.querySelectorAll('[data-reveal]')]
            .filter(el => parseFloat(getComputedStyle(el).opacity) < 0.9).length,
        typewriter: document.getElementById('typewriter').textContent.trim().length
    }));
    check('reduced motion: nothing left hidden', reduced.hidden === 0, `${reduced.hidden} hidden`);
    check('reduced motion: no JS errors', reducedErrors.length === 0, reducedErrors.join(' | '));

    // ---- no JavaScript ----
    const ctx3 = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark', viewport: { width: 1280, height: 900 } });
    const page3 = await ctx3.newPage();
    await page3.goto(url, { waitUntil: 'load' });
    await page3.waitForTimeout(800);
    const noJs = await page3.evaluate(() => ({
        visible: [...document.querySelectorAll('[data-reveal]')]
            .every(el => parseFloat(getComputedStyle(el).opacity) > 0.9),
        projects: document.querySelectorAll('.project-card').length
    })).catch(() => ({ visible: null, projects: null }));
    check('content readable without JavaScript', noJs.visible !== false, JSON.stringify(noJs));

    // ---- optional screenshots ----
    const shots = argVal('--shots');
    if (shots) {
        await mkdir(shots, { recursive: true });
        for (const [name, cfg] of Object.entries({
            'desktop-dark': { width: 1440, height: 900, theme: 'dark' },
            'desktop-light': { width: 1440, height: 900, theme: 'light' },
            'mobile': { width: 390, height: 844, theme: 'light' }
        })) {
            const c = await browser.newContext({ viewport: { width: cfg.width, height: cfg.height }, colorScheme: 'dark' });
            const p = await c.newPage();
            await p.goto(url, { waitUntil: 'load' });
            await p.waitForTimeout(2500);
            if (cfg.theme === 'light') await p.evaluate(() => document.getElementById('toggleTheme').click());
            // Reveal animations only fire while scrolling; a fullPage capture
            // without this writes a screenshot of invisible sections.
            await p.evaluate(async () => {
                document.documentElement.style.scrollBehavior = 'auto';
                const step = window.innerHeight * 0.6;
                for (let y = 0; y < document.body.scrollHeight; y += step) {
                    window.scrollTo(0, y);
                    await new Promise(r => setTimeout(r, 120));
                }
                window.scrollTo(0, 0);
                await new Promise(r => setTimeout(r, 900));
            });
            await p.screenshot({ path: join(shots, `${name}.png`), fullPage: name.startsWith('desktop') });
            await c.close();
        }
        console.log(`\nScreenshots written to ${resolve(shots)}`);
    }

    await browser.close();
    server?.close();

    const failed = results.filter(r => r.ok === false);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    process.exit(failed.length ? 1 : 0);
}

main().catch(err => {
    console.error(err);
    process.exit(2);
});
