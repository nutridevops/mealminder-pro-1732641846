chrome.runtime.onInstalled.addListener(() => {
  console.log('MealMinder Recipe Capture extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'RECIPE_CAPTURED') {
    // Handle recipe captured event
    console.log('Recipe captured:', request.data);
    sendResponse({ status: 'success' });
  }
});
