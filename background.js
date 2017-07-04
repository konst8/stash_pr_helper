chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null, {file: "libs/jquery-ui-1.12.1.custom/external/jquery/jquery.js"});
  chrome.tabs.executeScript(null, {file: "addReviewersScript.js"});
});