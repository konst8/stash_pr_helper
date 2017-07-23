(function($){

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "loaded?") {
      sendResponse({loaded: true});
    }
  }
);

chrome.storage.sync.get('templates', addTemplatesSuggestions);
chrome.storage.sync.get('groups', addGroupsSuggestions);

// PR templates

function addTemplatesSuggestions(chromeStorage) {
  var $_templates = $('<select/>', {
      'class': 'suggested-templates',
      'html': $_templateSelectOptions(chromeStorage.templates)
    })
      .attr({'size': chromeStorage.templates.length < 2 ? 2 : chromeStorage.templates.length})
      .on('blur', function(){
        $('.suggested-templates').hide();
      })
      .on('keyup keypress keydown', function(ev){
        var templateBody = $(this).find('option:selected').attr('data-template-body');
        var rightArrowAndReturnKeyCodes = [13, 39];
        if (rightArrowAndReturnKeyCodes.indexOf(ev.which) != -1) {
          ev.stopPropagation();
          ev.preventDefault();
          $('textarea#pull-request-description').val(templateBody).trigger('focus');
          $('.suggested-templates').hide();
          return false;
        }
      });

  $('textarea#pull-request-description').on('keyup', function(ev){
    var arrowsKeyCodes = [37, 38, 39, 40];
    if (arrowsKeyCodes.indexOf(ev.which) != -1 && this.value == '') {
      $(this).after($_templates);
        $('.suggested-templates')
          .show()
          .focus();
      }
  });
}

function $_templateSelectOptions(templatesData) {
  var $_options = $();
  templatesData.map(function(templateData){
    var $_option = $('<option/>', {
      'text': ' ',
      'data-template-name': templateData.templateName,
      'data-template-body': templateData.templateBody
    })
      .on('click', function(){
        insertTempate(templateData.templateBody);
      });
    $_options = $_options.add($_option);
  });
  return $_options;
}

// PR reviewers groups

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
      .attr({'size': chromeStorage.groups.length < 2 ? 2 : chromeStorage.groups.length})
      .on('blur', function(){
        $('.suggested-revievers-groups').hide();
      })
      .on('keyup keypress keydown', function(ev){
        var reviewersCsv = $(this).find('option:selected').attr('data-reviewers');
        var rightArrowAndReturnKeyCodes = [13, 39];
        if (rightArrowAndReturnKeyCodes.indexOf(ev.which) != -1) {
          ev.stopPropagation();
          ev.preventDefault();
          insertReviewers(reviewersCsv);
          hideDefaultDropdown();
          return false;
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