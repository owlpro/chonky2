<p align="center">
    <img src="./images/chonky-logo-v7.png" alt="Chonky v7 Logo" width="500" />
    <br />
    <a href="https://www.npmjs.com/package/chonky2">
        <img alt="NPM package" src="https://img.shields.io/npm/v/chonky2.svg?style=flat&colorB=ffac5c" />
    </a>
    <a href="https://tldrlegal.com/license/mit-license">
        <img alt="MIT license" src="https://img.shields.io/npm/l/chonky2?style=flat&colorB=dcd67a" />
    </a>
    <a href="https://www.npmjs.com/package/chonky2">
        <img alt="NPM downloads" src="https://img.shields.io/npm/dt/chonky2?style=flat&colorB=aef498" />
    </a>
    <a href="https://github.com/owlpro/chonky2">
        <img alt="GitHub stars" src="https://img.shields.io/github/stars/owlpro/chonky2?style=flat&colorB=50f4cc" />
    </a>
    <br /><br />
</p>

# Chonky2

**Chonky2** is a modernized and optimized fork of [Chonky](https://github.com/TimboKZ/Chonky) —
a powerful React file browser component that recreates the native file explorer experience in the browser.

Users can **drag & drop**, **select multiple files**, **toggle between grid and list views**, and use **keyboard shortcuts** seamlessly.

---

## 🚀 What's New

### ⚛️ React 19.2 Support
- Fully compatible with **React 19.2** and the new JSX runtime.
- Improved internal architecture for better performance and tree-shaking.

### 🎨 No UI Framework Required
- Material UI, Emotion, styled-components and JSS are no longer needed.
- Styles are plain CSS, injected automatically, and themed with CSS variables.

### 🪶 Built-in Lucide Icon Pack
- **FontAwesome removed completely.**
- Icons are now powered by **[Lucide](https://lucide.dev/)** and bundled directly within the package.
- No external icon imports or configuration required.

### 📦 Package Modernization
- New package name: **`chonky2`**
- Fully compatible with **Vite** and **ESM**
- Reduced dependency footprint and improved build times

---

## 📦 Installation

```bash
npm install chonky2
```

The only peer dependencies are `react` and `react-dom` (19 or newer).

---

## ⚙️ Quick Start

```tsx
import { FileBrowser, FileList, FileToolbar } from 'chonky2';

const files = [
  { id: 'file1', name: 'Document.pdf' },
  { id: 'file2', name: 'Photo.png' },
];

export default function Example() {
  return (
    <FileBrowser files={files}>
      <FileToolbar />
      <FileList />
    </FileBrowser>
  );
}
```

- No need to import icons or stylesheets — they are included automatically.

---

## 🎨 Theming

Pass `darkMode` for the built-in dark theme. To change colors or sizes, override the
CSS variables on `.chonky-theme` from your own stylesheet:

```css
.chonky-theme {
    --chonky-primary: #7b1fa2;
    --chonky-text-active: #7b1fa2;
    --chonky-toolbar-size: 34px;
}
```

The full list of variables is at the top of
[`src/styles/chonky.css`](./src/styles/chonky.css).

---

## 🌍 Translations

Pass a locale and translated messages through `i18n`. Messages use ICU syntax
(`{arg}`, `plural`, `select`, `selectordinal`, `#`); numbers, dates and plural rules
come from the browser's `Intl` APIs.

```tsx
<FullFileBrowser
    files={files}
    i18n={{
        locale: 'fa',
        messages: {
            'chonky.toolbar.searchPlaceholder': 'جست‌وجو',
            'chonky.toolbar.visibleFileCount': '{fileCount, plural, other {# مورد}}',
            'chonky.actions.open_files.button.name': 'باز کردن',
        },
    }}
/>
```

---

## 🔁 Migration from Original Chonky

1️⃣ Uninstall the old package:
```bash
npm uninstall chonky
```

2️⃣ Install Chonky2:
```bash
npm install chonky2
```

3️⃣ Update your imports:
```diff
- import { FileBrowser } from 'chonky';
+ import { FileBrowser } from 'chonky2';
```

4️⃣ Remove all FontAwesome or external icon imports — they are now handled internally via Lucide.

---

## 🧩 Compatibility

| Library | Version |
|----------|----------|
| React | 19 or newer |
| TypeScript | Supported (types included) |

---

## 📸 Preview

<p align="center">
  <img src="https://chonky.io/chonky-v2-preview.gif" alt="Chonky2 preview" />
</p>

---

## 📚 Documentation

Documentation for Chonky2 is currently being updated.  
Until then, refer to the original [Chonky documentation](https://chonky.io/).  
Most APIs remain **backward-compatible**.

---

## 📝 Changelog

### 6.5.5 (2025-10-15)
- Upgraded to React 19.2
- Migrated to MUI 6.5 with new styled engine
- Removed FontAwesome and added built-in **Lucide Icon Pack**
- Improved ESM and Vite compatibility
- Reduced bundle size and dependencies

---

## 🧾 License

MIT © [Tim Kuzhagaliyev](https://github.com/TimboKZ)  
Maintained and upgraded by [Mahdi Amiri](https://github.com/owlpro)

---

## 🔗 Useful Links

- NPM: https://www.npmjs.com/package/chonky2  
- GitHub: https://github.com/owlpro/chonky2  
- Issues: https://github.com/owlpro/chonky2/issues

---

## 💎 Sponsored by

<p align="center">
  <a href="https://vahdatoptic.com" target="_blank" style="text-decoration:none;">
    <img style="background-color: #fff;border-radius: 8px;" src="./images/logo-vahdat.svg" alt="Vahdat Optic Logo" width="160" /><br/>
    <b>Developed and enhanced with the support of</b><br/>
    <span style="font-size:1.2em; font-weight:600; color:#0073e6;">Vahdat Optic</span><br/>
    <a href="https://vahdatoptic.com" target="_blank" style="color:#ffac5c; font-weight:500;">https://vahdatoptic.com</a>
  </a>
</p>