/**
 * Full-page UX: open the SPA in a new tab instead of a tiny popup.
 * No host permissions — only chrome-extension:// pages.
 */
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
})
