chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === 'install') {
		chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
	}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.status === 'loading') {
		chrome.storage.local.remove(`inputFields-${tabId}`);
	}
});

chrome.tabs.onRemoved.addListener((tabId) => {
	chrome.storage.local.remove(`inputFields-${tabId}`);
});
