// Load existing values.
chrome.storage.sync.get('reviewers', load_current_reviewers);

function load_current_reviewers(chromeStorage) {
  var reviewers = chromeStorage.reviewers;
  document.getElementById('reviewers').value = reviewers;
}

// Saves options to chrome.storage.sync.
function save_reviewers() {
  var reviewers = document.getElementById('reviewers').value;
  chrome.storage.sync.set({
    reviewers: reviewers
  }, function(){
    window.close();
  });
}

document.getElementById('save').addEventListener('click',
    save_reviewers);