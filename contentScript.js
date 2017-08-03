(function($){

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "loaded?") {
      sendResponse({loaded: true});
    }
  }
);

//chrome.storage.sync.get('templates', addTemplatesSuggestions);
chrome.storage.sync.get('groups', addGroupsSuggestions);

// PR templates

  // Default suggestion object (selectbox with suggestions
  // to be appended for some input or textarea on the page).

  const Suggestion = {

    storageName: null,
    $targetInput: null,
    $appendSelector: null,
    appendType: 'after', // options: 'after', 'before', 'prepend', 'append'

    init() {
      this.$appendSelector = this.$appendSelector === null ? this.$targetInput : this.$appendSelector;
      //chrome.storage.sync.get(this.storageName, this.load.bind(this));
      this.$targetInput.on('click keyup', this, this.showSuggestions);
    },

    load(chromeStorage) {
      var storedEntities = chromeStorage[this.storageName];
      if (typeof storedEntities !== undefined) {
        var $_suggestionsSelectbox = this._compose(storedEntities);
        this.$appendSelector[this.appendType]($_suggestionsSelectbox);
        $_suggestionsSelectbox.focus();
      } 
    },

    _compose(entities) {
      function _composeOptions(entities) {
        var $_options = $();
        entities.map(entity => {
          var $_option = $('<option/>', {
            'text': ' ',
            'data-title': entity.title,
            'data-content': entity.content
          });
          $_options = $_options.add($_option);
        });
        return $_options;
      }
      var $_selectbox = $('<select/>', {
        'class': 'pr-helper-suggestion',
        'html': _composeOptions(entities)
      })
        .attr({'size': entities.length < 2 ? 2 : entities.length})
        .on('blur', function(){
          $(this).remove();
        })
        .on('click keydown', this, this.selectSuggestion.preHandler);
      return $_selectbox;
    },

    showSuggestions(event) {
      var arrowsKeyCodes = [37, 38, 39, 40];
      if (arrowsKeyCodes.indexOf(event.which) !== -1 && this.value === '') {
              console.log("wtf?");
        var suggestionObject = event.data;
        chrome.storage.sync.get(suggestionObject.storageName, suggestionObject.load.bind(suggestionObject));
      }
    },

    selectSuggestion: {
      preHandler(event) {
        var rightArrowAndReturnKeyCodes = [13, 39];
        if (event.type === "click" || rightArrowAndReturnKeyCodes.indexOf(event.which) !== -1) {
          var currentSelectbox = this;
          var suggestionObject = event.data;
          event.stopPropagation();
          event.preventDefault();
          event.data.selectSuggestion.handler(currentSelectbox, suggestionObject);
          return false;
        }
      },
      handler(currentSelectbox, suggestionObject) {
        var selectedContent = $(currentSelectbox).find('option:selected').attr('data-content');
        suggestionObject.$targetInput.val(selectedContent);
        this.postHandler(currentSelectbox, suggestionObject);
      },
      postHandler(currentSelectbox, suggestionObject) {
        suggestionObject.$targetInput.focus();
        $(currentSelectbox).hide();
      }
    }
  }

  function createSuggestions(properties) {
    return Object.assign(Object.create(Suggestion), properties);
  }

  const descriptionSuggestions = createSuggestions({
    storageName: 'templates',
    $targetInput: $('#pull-request-description')
  });
  descriptionSuggestions.init();

// PR reviewers groups

function insertReviewers(reviewersCsv) {
  reviewersArray = reviewersCsv.split(', ');
  reviewersArray = reviewersArray.map(function(value, index){
    var newValue = "'" + value + "'";
    return newValue;
  });
  var ajaxRequest = new XMLHttpRequest();
  var embeddedScriptUrl = chrome.extension.getURL("contentEject.js");
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