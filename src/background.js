chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request.href) {
    return;
  }
  const xhr = new XMLHttpRequest();
  xhr.open('GET', request.href, false);
  xhr.send();
  sendResponse({ text: xhr.responseText });
});
