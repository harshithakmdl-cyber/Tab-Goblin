# Tab Goblin (Chrome Extension)

A small Manifest V3 extension for managing tabs.

## Features
- Shows open tab count and a goblin mood based on tab count.
- Lists tabs by last activity.
- Discards tabs to reduce memory use without closing them.
- Lets you mark tabs as **Keep** so they are easy to identify and are not accidentally selected for sleeping from the popup.
- Saves up to 10 sessions locally and restores their URLs.
- Displays sleeping/discarded tab count.

## Install in Chrome
1. Download and extract `tab-goblin-extension.zip`.
2. Open Chrome and visit `chrome://extensions`.
3. Turn on **Developer mode** (top-right).
4. Click **Load unpacked**.
5. Select the extracted `tab-goblin-extension` folder that contains `manifest.json`.
6. Pin the Tab Goblin icon from the Extensions puzzle-piece menu.
7. Open a normal website and click the Tab Goblin icon.

## Use
- **Put to sleep**: Chrome discards the tab's page memory. It remains in the tab strip and reloads when opened.
- **Keep / Unkeep**: Marks a tab as important in Tab Goblin.
- **Save session**: Saves the current normal webpage URLs locally (up to 10 sessions).
- **Restore session**: Opens the saved URLs in new tabs.
- **Delete**: Removes a saved session.

## Notes
- Chrome may prevent discarding the active tab, pinned tabs, or certain special pages. The extension disables the sleep button for active and pinned tabs.
- A discarded tab is not closed. Chrome reloads it when you activate it.
- The extension does not read webpage contents. It uses tab titles and URLs for its own tab list and session restore.
- Session restoration opens tabs from saved URLs; it cannot restore unsaved form text or the exact page state.
- Data is stored locally in Chrome using `chrome.storage.local`.
