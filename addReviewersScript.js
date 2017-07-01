// chrome.storage.sync.get('reviewers', insertReviewers);

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

function addGroupsSuggestions() {
  var groups = $('<select/>', {
      'class': 'suggested-revievers-groups',
      'html': [
          $('<option/>', {
              'text': 'test group 1',
          })
              .attr({'data-revievers': 'test1, test2, test3'}),
          $('<option/>', {
              'text': 'test group 2' 
          })]
      })
          .attr({'size': 2})
          .on('blur', function(){
              $('.suggested-revievers-groups').hide();
          });

  $('.select2-search-field .select2-input')
      .on('keyup', function(ev){
          var arrowsKeyCodes = [37, 38, 39, 40];
          if (arrowsKeyCodes.indexOf(ev.which) != -1 && this.value == '') {
              $(this).parents('.select2-container').append(groups);
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