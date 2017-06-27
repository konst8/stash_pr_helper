chrome.storage.sync.get('reviewers', insertReviewers);

function insertReviewers(chromeStorage) {
  var reviewersList = chromeStorage.reviewers.split(', ');
  reviewersList = reviewersList.map(function(value, index){
    var newValue = "'" + value + "'";
    return newValue;
  });
  var ajaxRequest = new XMLHttpRequest();
  var embeddedScriptUrl = chrome.extension.getURL("codeToEject.js");
  ajaxRequest.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var script = document.createElement('script');
      var code = document.createTextNode('var reviewersList = [' + reviewersList + ']; ' + this.response);
      script.appendChild(code);
      (document.body || document.head).appendChild(script);
    }
  };
  ajaxRequest.open("GET", embeddedScriptUrl, true);
  ajaxRequest.send();
}