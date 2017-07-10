
chrome.tabs.onUpdated.addListener(getIconStatus);
chrome.tabs.onActivated.addListener(getIconStatus);


function getIconStatus(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {message: "loaded?"}, function(response) {
      if (response) {
        chrome.browserAction.setBadgeBackgroundColor({color:'lightgreen'});
        chrome.browserAction.setBadgeText({text:" "});
      } else {
        chrome.browserAction.setBadgeText({text:""});
      }
    });
  });
}

// chrome.tabs.onUpdated.addListener(function() {
//   chrome.tabs.query({currentWindow: true, active: true}, function(){alert('updated');});
// });

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse){
//     if (typeof request.content_script_loaded !== undefined) {
//       chrome.browserAction.setBadgeBackgroundColor({color:'lightgreen'});
//       chrome.browserAction.setBadgeText({text:"OK"});
//     }
//   }
// );

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.runtime.openOptionsPage();
  // chrome.browserAction.setBadgeBackgroundColor({color:'lightgreen'});
  // chrome.browserAction.setBadgeText({text:"OK"});
  // chrome.tabs.executeScript(null, {file: "libs/jquery-ui-1.12.1.custom/external/jquery/jquery.js"});
  // chrome.tabs.executeScript(null, {file: "addReviewersScript.js"});
});