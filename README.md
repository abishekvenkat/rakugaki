<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/icons/rakugaki-dark.svg">
  <img alt="Rakugaki" src="public/icons/rakugaki-light.svg" height="80">
</picture>

# Rakugaki

*rakugaki (落書き) — Japanese for "doodle" or "scribble". which is exactly what your notes are. don't lie.*

A markdown note-taking app that lives on your Mac and keeps your notes off the cloud. No accounts. No subscriptions. No "we updated our privacy policy" emails. Just you, your thoughts, and your filesystem.

---

## what it looks like

> 📹 recording coming soon

---

## why this exists

Every other notes app wants to sync your grocery lists to three data centers across two continents. Rakugaki does not. Your notes are files on your disk. You can read them with any text editor. You can back them up however you want. You own them outright, which is a surprisingly rare thing to be able to say about your own writing.

It also looks nice. That part matters.

---

## installing it

Rakugaki is a PWA, which means you install it from a browser rather than the App Store. This is either a feature or a problem depending on how you feel about the App Store.

**Chrome or Edge (recommended)**

1. Go to [rakugaki.vercel.app](https://rakugaki.vercel.app) *(or wherever you're hosting it)*
2. Click the little install icon in the address bar — it looks like a circle with an arrow pointing up `⊕`
3. Click **Install Rakugaki**
4. It shows up in your Applications folder and Dock like a normal app

**Safari on macOS Sonoma or later**

1. Go to the site in Safari
2. Click **File** in the menu bar
3. Click **Add to Dock**
4. Done. Tell your friends you installed an app without touching the App Store.

**Safari on iPhone or iPad**

1. Open the site
2. Tap the Share button (the box with an arrow)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**

Once it's installed, open it from your Dock or Launchpad. The web version just shows install instructions — the actual app only appears when you open it as an installed PWA. This is intentional and slightly annoying, sorry.

---

## how to use it

**Opening and saving files**

- Hover over the left edge of the window to reveal the sidebar
- Click **Open File** to open any `.md` or `.txt` file from your Mac
- Hit `Cmd+S` to save. If it's a new note, it'll ask where to save it.
- You can also export to `.txt` or `.rtf` from the sidebar if you need to send it somewhere that can't handle Markdown

**Multiple notes**

Tabs work the way tabs work. `Cmd+T` opens a new one. `Cmd+W` closes it. A blue dot on a tab means you have unsaved changes.

**Editing modes**

The button in the top right cycles through Edit, Split, and Preview. Click it once to move forward, keep clicking to go back around.

- **Edit** — just the raw Markdown
- **Preview** — rendered output, Mermaid diagrams included
- **Split** — both at once, side by side, with a draggable divider

**Session restore**

If you close the app mid-thought and reopen it, your unsaved notes come back automatically. No setup needed. Rakugaki quietly saves your session every few seconds in the background and restores it on next launch. Once you actually save a file with `Cmd+S`, the recovery copy is deleted.

You can also designate a folder for longer-term recovery backups in Settings. Rakugaki will write `.md` files there every 30 seconds as a secondary fallback. Useful if you want the drafts to survive a browser reset or a new device.

**Command palette**

`Cmd+K` opens it. Search for any action without hunting through the sidebar.

**Keyboard shortcuts**

| shortcut | what it does |
|---|---|
| `Cmd+S` | save |
| `Cmd+N` | new note |
| `Cmd+T` | new tab |
| `Cmd+W` | close tab |
| `Cmd+K` | command palette |
| `Cmd+,` | settings |
| `Cmd+\` | toggle sidebar |
| `Cmd+Shift+E` | toggle edit/preview |
| `Cmd+Shift+Z` | zen mode |
| `Cmd+F` | find |
| `Cmd+H` | find and replace |

that should be enough features for a text editor.

---

## a few things to know

**Your notes are not synced anywhere.** This is the whole point. If you want them on another device, put them in a folder that iCloud or Dropbox already syncs. Rakugaki just reads and writes files — it doesn't care where those files live.

**Your content comes back, but not the file path.** Rakugaki restores your unsaved text on reopen. What it can't restore is which file on disk that text belonged to — browser security doesn't allow storing file handles across sessions. So after a restore, the first `Cmd+S` will ask where to save. Pick the same file and you're back to normal.

**Safari's PWA support is fine but not great.** The File System Access API works on Chrome and Edge. Safari has its own implementation that behaves slightly differently. If something feels off on Safari, try Chrome.

---

## the tech, briefly

Next.js app, CodeMirror editor, Mermaid for diagrams, remark for Markdown parsing. All local, no backend, no database. The service worker handles offline mode.

---

## contributing

File an issue if something's broken. PRs welcome if you know what you're doing and don't mind the codebase being opinionated about things.

---

*built because Notion is too much and Apple Notes is not enough.*
