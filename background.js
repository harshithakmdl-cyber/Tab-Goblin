// Keep the extension service worker minimal. Chrome itself restores discarded tabs
// when the user selects them. Session data is stored in chrome.storage.local.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("tabGoblinData").then(result => {
    if (!result.tabGoblinData) {
      chrome.storage.local.set({ tabGoblinData: { kept: [], sessions: [] } });
    }
  });
});
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get("tabGoblinData").then(result => {
    const data = result.tabGoblinData || { kept: [], sessions: [] };
    data.kept = data.kept.filter(id => id !== tabId);
    chrome.storage.local.set({ tabGoblinData: data });
  });
});
