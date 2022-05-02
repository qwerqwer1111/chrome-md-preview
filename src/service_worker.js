chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request.href) {
    return true;
  }
  fetch(request.href)
    .then((r) => r.text())
    .then((text) => sendResponse({ text }));
  return true;
});
