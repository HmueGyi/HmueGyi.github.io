# Portfolio Programming Languages & Architecture

ဒီ Portfolio website (`HmueGyi.github.io`) ကို Build tool / bundler (Webpack, Vite) နဲ့ Frontend framework (React, Vue) တွေ မသုံးဘဲ **Pure Static Web Stack** (HTML5 + Modular CSS3 + Vanilla ES6+ JavaScript) နဲ့ တိုက်ရိုက် GitHub Pages ပေါ်မှာ မြန်မြန်ဆန်ဆန် Run နိုင်အောင် ရေးသားတည်ဆောက်ထားပါတယ်။ Testing/Automation အတွက်ပဲ Node.js (ESM) ကို Dev environment မှာ တွဲသုံးထားပါတယ်။

---

## အသုံးပြုထားသော Language များ အနှစ်ချုပ်

| Language / Format | အသုံးပြုသည့် အခန်းကဏ္ဍ | အဓိက ဖိုင်များ |
| :--- | :--- | :--- |
| **HTML5** | Page structure, Semantics, SEO, Accessibility, SVG/Video/Canvas markup | `index.html` |
| **CSS3** | Design tokens (Dark/Light themes), Glassmorphism, Layout, GPU Animations | `css/*.css` (Active 7 ဖိုင်) |
| **JavaScript (ES6+)** | UI interaction, Canvas 2D effects, Theme ripple, Scrollspy, Form `fetch()` | `js/main.js`, `js/modules/*.js` |
| **JSON / JSON-LD** | Search engine Schema (`Person`), NPM dev configuration & scripts | `index.html` (`ld+json`), `package.json` |
| **Node.js (`.mjs`)** | Headless browser automated smoke test & local static test server | `scripts/check.mjs` |
| **SVG / XML / TXT / MD** | Icons, Sitemap, Crawler rules, Documentation | `assets/icons/*.svg`, `sitemap.xml`, `robots.txt`, `*.md` |

---

## 1. HTML5 (`index.html` — 659 lines)

Site တစ်ခုလုံးရဲ့ Single-page document ဖြစ်ပြီး Framework templating မပါဘဲ Semantic HTML5 နဲ့ ရေးထားပါတယ်။

- **Semantic Structure:** `<header>`, `<nav id="navMenu">`, `<main class="container">` (Sections: `#home`, `#about`, `#skills`, `#projects`, `#contact`), `<footer>` တို့ကို စနစ်တကျ ခွဲထားပါတယ်။
- **Anti-Flash Theme Script (`<head>` inline script):** JS modules တွေ မ load ခင် `localStorage.getItem('theme')` နဲ့ OS `prefers-color-scheme` ကို ချက်ချင်းစစ်ပြီး `<html class="light">` ထည့်ပေးထားတာကြောင့် Light mode မှာ Dark flash မဖြစ်အောင် ကာကွယ်ထားပါတယ်။
- **Accessibility & Fallback:**
  - `aria-label`, `aria-expanded`, `aria-hidden`, `aria-live="polite"` နဲ့ `.sr-only` screen-reader utilities တွေ ထည့်ထားပါတယ်။
  - `<noscript>` block ထဲမှာ JS ပိတ်ထားရင်တောင် `[data-reveal]` content တွေနဲ့ nav link တွေ ပေါ်နေစေဖို့ fallback CSS ထည့်ထားပါတယ်။
- **SEO & Social Metadata:** Canonical URL, Open Graph (`og:*`), Twitter Card (`twitter:*`), နဲ့ Schema.org `Person` JSON-LD တွေ ပါဝင်ပါတယ်။
- **Media & Graphics Elements:**
  - Hero mascot အတွက် `<video id="robot-media">` (`robot.webm`, `robot.mp4` + `robot-poster.jpg` fallback)
  - Dynamic 2D visual effects များအတွက် `<canvas id="bg-canvas">` နဲ့ `<canvas id="cursor-fx">`
  - Theme switcher icon နဲ့ `#backToTop` circular progress ring (`.btt-ring-fill`) အတွက် Inline `<svg>`

---

## 2. CSS3 (`css/*.css` — Modular Vanilla CSS)

Sass/LESS သို့မဟုတ် Tailwind CSS မသုံးဘဲ Pure CSS3 ကို တာဝန်အလိုက် ဖိုင် 7 ဖိုင်ခွဲပြီး `index.html` ထဲမှာ အစဉ်လိုက် ချိတ်ဆက်ရေးသားထားပါတယ်-

1. **`css/fonts.css`** (73 lines) — Google Fonts CDN အစား Self-hosted `.woff2` ဖောင့်များ (`Outfit` 400/800, `Inter` 400/500/700, `JetBrains Mono` 400) ကို `@font-face` (`font-display: swap`) နဲ့ ချိတ်ထားပါတယ်။
2. **`css/variables.css`** (82 lines) — Design System Token များကို CSS Custom Properties (`--bg-color`, `--link-color`, `--accent`, `--glass-bg`, `--ease-out-expo`, `--transition-smooth` စသည်) နဲ့ သတ်မှတ်ထားပြီး `:root` (Midnight Observatory Dark Theme) နဲ့ `html.light` (Alpine Morning Mist Light Theme) ကို ခွဲထားပါတယ်။
3. **`css/global.css`** (128 lines) — Box-sizing reset, body radial gradient backgrounds, smooth scroll, typography headings, `:focus-visible` keyboard ring, `.sr-only` တို့ကို ရေးထားပါတယ်။
4. **`css/layout.css`** (407 lines) — Full-width glassmorphic sticky `<header>`, `.nav-underline` (GPU `scaleX` slide indicator), mobile slide-in nav drawer + `body.menu-open` background scale depth effect, နဲ့ `<footer>` grid တို့ကို Flexbox/Grid နဲ့ ရေးထားပါတယ်။
5. **`css/components.css`** (638 lines) — Shimmer `.btn`, `.skills-logos` icon cards (item တစ်ခုချင်းစီအတွက် `--skill-rgb` brand glow), `.project-card` glassmorphism + CSS variables (`--mx`, `--my`) သုံး mouse spotlight gradient, form validation (`:user-valid` / `:user-invalid`), `#backToTop` circular SVG ring button, နဲ့ touch devices (`@media (hover: none)`) tap styles တို့ ပါဝင်ပါတယ်။
6. **`css/sections.css`** (684 lines) — Hero layout & `.robot-wrap` orbital HUD rings + click pulse animation, About layout & `.about-photo`, Skills & Projects grid (tag hover stagger waves), `.section-active` glow, `.typewriter::after` caret, နဲ့ Responsive media queries များ ပါဝင်ပါတယ်။
7. **`css/animations.css`** (646 lines) — Keyframe animations, View Transitions API (`::view-transition-old/new(root)`), `[data-reveal]` / `[data-stagger]` blur + slide entrance animations, `#scroll-progress` (`scaleX`), `#page-loader`, `#cursor-fx` / `#bg-canvas` layer positioning, နဲ့ `@media (prefers-reduced-motion: reduce)` support တို့ကို ရေးထားပါတယ်။

---

## 3. JavaScript (ES6+ — `js/main.js` & `js/modules/*.js`)

Transpiler / Bundler မလိုဘဲ Browser-native **ES6+ Vanilla JavaScript** ကို **IIFE (`(() => { ... })()`) + Shared Namespace (`window.Portfolio`)** pattern နဲ့ Modular ခွဲရေးထားပါတယ်။

### Module Architecture & Boot Sequence
- **`js/modules/elements.js`** — `window.Portfolio` global singleton ကို တည်ဆောက်ပြီး DOM element cache (`P.dom`), `prefers-reduced-motion` tracker, Theme / Motion / Page-revealed event listeners (`Set`), နဲ့ `P.modules` registry တို့ကို စုစည်းပေးထားပါတယ်။
- **`js/main.js`** — လက်ရှိအသုံးပြုနေသော feature initializer များကို အစဉ်လိုက် စတင်ပေးသော Entry point ဖြစ်ပါတယ်။

### Feature Modules (`js/modules/`)
1. **`theme.js`** (`initTheme`) — Dark/Light theme toggle ကို `localStorage`, system `prefers-color-scheme`, theme-aware image swap (`data-theme-light-src`), screen reader `aria-live` announcement, နဲ့ **View Transitions API (`document.startViewTransition` + `clipPath` circular ripple)** တို့နဲ့ ရေးထားပါတယ်။
2. **`menu.js`** (`initMenu`, `closeMobileMenu`) — Mobile navigation drawer ကို `Tab` focus trap, `Escape` key handling, focus restoration, နဲ့ `body.menu-open` class toggle တို့နဲ့ accessible ဖြစ်အောင် ရေးထားပါတယ်။
3. **`loader.js`** (`initLoader`, `initReveal`) — Page load overlay (`minDelay = 580ms`, `900ms` fallback) နဲ့ `IntersectionObserver` သုံးပြီး scroll ဆင်းလာတဲ့အခါ `[data-reveal]` တွေနဲ့ `section h3` တွေကို animate လုပ်ပေးပါတယ်။
4. **`typewriter.js`** (`initTypewriter`) — Hero section ထဲက စာကြောင်း 4 ကြောင်းကို ရိုက်လိုက်/ဖျက်လိုက် loop လုပ်ပေးပြီး reduced-motion mode မှာ static fallback text ပြပေးပါတယ်။
5. **`nav.js`** (`initNav`) — Scrollspy နဲ့ active section စစ်ပြီး nav link underline (`.nav-underline`) ကို GPU `translate3d(...) scaleX(...)` နဲ့ ရွှေ့ပေးခြင်း, `.section-active` toggle, smooth anchor scrolling, `#backToTop` visibility တို့ကို ထိန်းချုပ်ပါတယ်။
6. **`background.js`** (`initBackground`) — HTML5 **Canvas 2D API** (`requestAnimationFrame` + HiDPI `devicePixelRatio` + `visibilitychange` pause) သုံးပြီး:
   - **Night Mode:** Twinkling stars, mouse parallax, shooting star
   - **Light Mode:** Interactive dot-matrix neural wave, pointer proximity links, sunlit bokeh dust တို့ကို ရေးဆွဲထားပါတယ်။
7. **`cursor.js`** (`initCursorFX`) — Desktop pointer devices (`hover: hover`, non-low-end CPU, non-save-data) အတွက် `#cursor-fx` Canvas 2D ပေါ်မှာ theme-aware **sparkle trail + click burst** particles များ ရေးဆွဲထားပါတယ်။ *(Pointer ဘေးက Custom Cursor Halo Ring ကို အသုံးမပြုတော့ဘဲ ဖယ်ရှားထားပြီးဖြစ်ပါတယ်။)*
8. **`hero.js`** (`initHeroParallax`, `initAboutParallax`) — Hero mascot (`.robot-parallax`) နဲ့ `.hero-blob` တွေကို lerped `requestAnimationFrame` mouse parallax လုပ်ခြင်း, mascot click `.pulse-active` trigger, နဲ့ About photo scroll parallax တို့ ပါဝင်ပါတယ်။
9. **`interactions.js`** (`initScrollProgress`, `initCardTilt`, `initMagneticSkills`, `initMagneticButtons`, `initFooterYear`) — Top scroll progress bar (`scaleX`) & `#backToTop` SVG ring (`strokeDashoffset`), 3D project card perspective tilt + CSS spotlight vars (`--mx`, `--my`, `--px`, `--py`), skill icon & CTA button magnetic hover physics, နဲ့ dynamic copyright year တို့ကို ရေးထားပါတယ်။
10. **`storytelling.js`** (`initStorytelling`) — Lenis smooth scrolling, GSAP ScrollTrigger နဲ့ hero/section heading များအတွက် editorial word reveal နှင့် hero visual scroll depth ကို ထည့်ပေးပါတယ်။ Reduced-motion preference ရှိလျှင် animation များကို ပိတ်ပါတယ်။
11. **`form.js`** (`initContactForm`) — Contact form ကို `fetch()` API + `URLSearchParams`/`FormData` နဲ့ `formsubmit.co` Ajax endpoint သို့ Asynchronous `POST` ပို့ပေးပြီး honeypot (`_honey`) spam check နဲ့ UI status feedback ပြပေးပါတယ်။

---

## 4. Testing, Configuration & Supporting Formats

- **Node.js ES Module (`scripts/check.mjs` — 390 lines):** Runtime website အတွက် မလိုအပ်ဘဲ Developer QA/Smoke test အတွက်သာ ရေးထားပါတယ်။ Node built-in modules (`node:http`, `node:fs/promises`, `node:path`, `node:url`) နဲ့ `playwright` / `patchright` ကို သုံးပြီး static server တင်ကာ JS errors, 404 assets, broken images, `<video>` playback, theme flash, scroll reveals, desktop/mobile overflow, reduced-motion, နဲ့ no-JS readability တွေကို အလိုအလျောက် စစ်ဆေးပေးပါတယ်။
- **JSON (`package.json` — 16 lines):** Local preview (`python3 -m http.server 5500`), `check`, `check:shots`, `validate` (`html-validate`) scripts နဲ့ `devDependencies` များကို သတ်မှတ်ထားပါတယ်။
- **XML & Plain Text (`sitemap.xml`, `robots.txt`):** Search engine crawlers များအတွက် indexing ညွှန်ကြားချက်များ ဖြစ်ပါတယ်။
- **SVG (`assets/icons/*.svg`):** Resolution-independent vector icons (`favicon.svg`, `huggingface.svg`, `langchain-dark.svg`, `langchain-light.svg`, `ollama.svg`, `telegram.svg`, `viber.svg`).
