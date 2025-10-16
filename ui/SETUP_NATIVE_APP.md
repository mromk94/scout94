# 🚀 Scout94 Native Mac App - Manual Setup

## ✅ What I've Created So Far:

1. **`tauri.conf.json`** - App configuration
2. **`src-tauri/Cargo.toml`** - Rust dependencies
3. **`src-tauri/src/main.rs`** - Native backend with menus & tray
4. **`src-tauri/build.rs`** - Build script

---

## 🛠️ Complete Setup (Run These Commands)

### Step 1: Install Rust (if not installed)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Step 2: Install Tauri CLI
```bash
cd /Users/mac/CascadeProjects/scout94/ui
npm install --save-dev @tauri-apps/cli @tauri-apps/api
```

### Step 3: Update package.json scripts
Add these to your `package.json` scripts section:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "tauri": "tauri",
  "tauri:dev": "tauri dev",
  "tauri:build": "tauri build"
}
```

### Step 4: Create app icons
We need icons for the Mac app. Run:
```bash
cd /Users/mac/CascadeProjects/scout94/ui
mkdir -p src-tauri/icons
```

You'll need to create or download icons. For now, we can use a placeholder.

### Step 5: Run in development mode
```bash
npm run tauri:dev
```

This will:
- Open a native Mac window
- Load your React UI
- Enable hot-reload
- Show system tray icon

### Step 6: Build the .dmg installer
```bash
npm run tauri:build
```

This creates:
- `src-tauri/target/release/Scout94.app`
- `src-tauri/target/release/bundle/dmg/Scout94_1.0.0_aarch64.dmg`

---

## 🎯 What's Included

### Native Menu Bar:
- **Scout94** menu with About, Hide, Quit
- **File** menu with New Test (⌘N), Open Project (⌘O)
- **Test** menu with Run All (⌘R), Visual Test (⌘⇧V), Audit (⌘⇧A)
- **View** menu with Toggle Split (⌘\), Show IDE (⌘1), Show Chat (⌘2)
- **Window** and **Help** menus

### System Tray:
- 🚀 Scout94 icon in menu bar
- Quick access to Run Tests, Visual Test, Audit
- Show/Hide window
- Quit option

### Native Features:
- Resizable window (1400x900 default)
- Minimum size: 1200x700
- File system access (read/write project files)
- Native notifications
- Keyboard shortcuts

---

## 🐛 Troubleshooting

### "Rust not found"
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### "tauri command not found"
```bash
npm install --save-dev @tauri-apps/cli
```

### "Missing icons"
You can generate icons from a single PNG:
```bash
npm install --save-dev @tauri-apps/cli
npx tauri icon path/to/your-icon.png
```

Or use a placeholder for testing.

### Build fails
Make sure you have Xcode Command Line Tools:
```bash
xcode-select --install
```

---

## 📦 Final Output

After `npm run tauri:build`, you'll get:

**Location:**
```
src-tauri/target/release/bundle/
├── dmg/
│   └── Scout94_1.0.0_aarch64.dmg  ← Installer
└── macos/
    └── Scout94.app                 ← Application
```

**Installation:**
1. Open `Scout94_1.0.0_aarch64.dmg`
2. Drag Scout94 to Applications folder
3. Launch from Applications or Spotlight

---

## ⚡ Quick Test

To quickly test if Tauri is working:
```bash
cd /Users/mac/CascadeProjects/scout94/ui
npm install --save-dev @tauri-apps/cli @tauri-apps/api
npm run tauri:dev
```

If it opens a native window with your UI, you're good! 🎉

---

## 🎨 Current Status

✅ Tauri configuration created
✅ Rust backend with menus created  
✅ System tray integration created
⏳ Need to install dependencies
⏳ Need to create icons
⏳ Need to test build

---

**Want me to help you through any specific step?**
