(function($){

// chrome.storage.sync.get('reviewers', insertReviewers);
chrome.storage.sync.get('groups', addGroupsSuggestions);

// function insertReviewers(chromeStorage) {
//   var reviewersList = chromeStorage.reviewers.split(', ');
//   reviewersList = reviewersList.map(function(value, index){
//     var newValue = "'" + value + "'";
//     return newValue;
//   });
//   var ajaxRequest = new XMLHttpRequest();
//   var embeddedScriptUrl = chrome.extension.getURL("codeToEject.js");
//   ajaxRequest.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//       var script = document.createElement('script');
//       var code = document.createTextNode('var reviewersList = [' + reviewersList + ']; ' + this.response);
//       script.appendChild(code);
//       (document.body || document.head).appendChild(script);
//     }
//   };
//   ajaxRequest.open("GET", embeddedScriptUrl, true);
//   ajaxRequest.send();
// }

function insertReviewers(reviewersCsv) {
  reviewersArray = reviewersCsv.split(', ');
  reviewersArray = reviewersArray.map(function(value, index){
    var newValue = "'" + value + "'";
    return newValue;
  });
  var ajaxRequest = new XMLHttpRequest();
  var embeddedScriptUrl = chrome.extension.getURL("codeToEject.js");
  ajaxRequest.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var script = document.createElement('script');
      var code = document.createTextNode('var reviewersArray = [' + reviewersArray + ']; ' + this.response);
      script.appendChild(code);
      (document.body || document.head).appendChild(script);
    }
  };
  ajaxRequest.open("GET", embeddedScriptUrl, true);
  ajaxRequest.send();
}

function createSelectOptions(groupsData) {
  var $_options = $();
  groupsData.map(function(groupData){
    console.log(groupData);
    var $_option = $('<option/>', {
      'text': groupData.groupName,
      'data-reviewers': groupData.reviewers
    })
      .on('click', function(){
        insertReviewers(groupData.reviewers);
      });
    $_options = $_options.add($_option);
  });
  return $_options;
}

function addGroupsSuggestions(chromeStorage) {
  var $_groups = $('<select/>', {
      'class': 'suggested-revievers-groups',
      'html': createSelectOptions(chromeStorage.groups)
    })
      .attr({'size': chromeStorage.groups.length})
      .on('blur', function(){
        $('.suggested-revievers-groups').hide();
      })
      .on('keyup', function(ev){
        var reviewersCsv = $(this).find('option:selected').attr('data-reviewers');
        var rightArrowAndReturnKeyCodes = [13, 39];
        if (rightArrowAndReturnKeyCodes.indexOf(ev.which) != -1) {
          ev.preventDefault();
          insertReviewers(reviewersCsv);
          hideDefaultDropdown();
        }
      });

  $('.select2-search-field .select2-input').on('keyup', function(ev){
    var arrowsKeyCodes = [37, 38, 39, 40];
    if (arrowsKeyCodes.indexOf(ev.which) != -1 && this.value == '') {
      $(this).parents('.select2-container').append($_groups);
        hideDefaultDropdown();
        $('.suggested-revievers-groups')
          .show()
          .focus();
      }
  });
}

function hideDefaultDropdown() {
  $("#select2-drop-mask").hide();
  $("#select2-drop")
    .hide()
    .removeAttr("id");
  $('.select2-container-active')
    .removeClass("select2-dropdown-open")
    .removeClass("select2-container-active");
}

})(jQuery);