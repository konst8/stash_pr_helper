chrome.storage.sync.get('reviewers', insertReviewers);

function insertReviewers(chromeStorage) {
  var reviewersList = chromeStorage.reviewers.split(', ');
  reviewersList = reviewersList.map(function(value, index){
    var newValue = "'" + value + "'";
    return newValue;
  });
  console.log(reviewersList);
  var codeToInject = "(function($){ var reviewersList = ["+reviewersList+"]; var $reviewersInput = $('.pull-request-reviewers .select2-input'); var time = 0; $.each(reviewersList, function(index, value){ setTimeout(function(){ $reviewersInput .val(reviewersList[index]) .click(); }, time); setTimeout(function(){   $('.select2-highlighted .select2-result-label').trigger('mouseup'); }, time + 2000); time += 2000; }); })(jQuery);"
  console.log(codeToInject);
  var script = document.createElement('script');
  var code = document.createTextNode('(function() {' + codeToInject + '})();');
  script.appendChild(code);
  (document.body || document.head).appendChild(script);
}