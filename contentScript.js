(function($){

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.message === "loaded?") {
        sendResponse({loaded: true});
      }
    }
  );

  $('body').prepend(
    $('<div/>', {
      class: 'pr-helper-overlay'
    })
  );

  const Suggestion = {

    storageName: null,
    targetInput: null,
    appendSelector: null,
    appendType: 'after', // options: 'after', 'before', 'prepend', 'append'

    init() {
      var selector = this.targetInput;
      this.appendSelector = this.appendSelector === null ? this.targetInput : this.appendSelector;
      $('body').on('keyup', selector, this, this.showSuggestions);
    },

    load(chromeStorage) {
      var storedEntities = chromeStorage[this.storageName];
      if (typeof storedEntities !== undefined) {
        var $_suggestionsSelectbox = this._compose(storedEntities);
        $(this.appendSelector)[this.appendType]($_suggestionsSelectbox);
        $_suggestionsSelectbox.focus();
      } 
    },

    _compose(entities) {
      function _composeOptions(entities) {
        var $_options = $();
        entities.map(entity => {
          var $_option = $('<option/>', {
            text: ' ',
            'data-title': entity.title,
            'data-content': entity.content
          });
          $_options = $_options.add($_option);
        });
        return $_options;
      }
      var $_selectbox = $('<select/>', {
        class: 'pr-helper-suggestion',
        html: _composeOptions(entities)
      })
        .attr({'size': entities.length < 2 ? 2 : entities.length})
        .on('blur', function(){
          $(this).remove();
        })
        .on('click keydown', this, this.selectSuggestion);
      return $_selectbox;
    },

    showSuggestions(event) {
      var arrowsKeyCodes = [37, 38, 39, 40];
      if (arrowsKeyCodes.indexOf(event.which) !== -1 && this.value === '') {
        var suggestionObject = event.data;
        chrome.storage.sync.get(suggestionObject.storageName, suggestionObject.load.bind(suggestionObject));
      }
    },

    selectSuggestion(event) {
      var rightArrowAndReturnKeyCodes = [13, 39];
      if (event.type === "click" || rightArrowAndReturnKeyCodes.indexOf(event.which) !== -1) {
        var currentSelectbox = this;
        var suggestionObject = event.data;
        event.stopPropagation();
        event.preventDefault();
        suggestionObject.handleSelectedSuggestion(currentSelectbox, suggestionObject);
        return false;
      }
    },

    handleSelectedSuggestion(currentSelectbox, suggestionObject) {
      var selectedContent = $(currentSelectbox).find('option:selected').attr('data-content');
      $(suggestionObject.targetInput)
        .val(selectedContent)
        .focus();
      $(currentSelectbox).remove();
    }
  }

  function createSuggestions(properties) {
    return Object.assign(Object.create(Suggestion), properties);
  }

  // Suggestions for PR description field

  const descriptionSuggestions = createSuggestions({
    storageName: 'description',
    targetInput: '#pull-request-description'
  });
  descriptionSuggestions.init();

  // Suggestions for PR reviewers field

  const reviewersSuggestions = createSuggestions({
    storageName: 'reviewers',
    targetInput: '.select2-search-field .select2-input',
    appendSelector: '.select2-container',
    appendType: 'append',

    showSuggestions(event) {
      var arrowsKeyCodes = [37, 38, 39, 40];
      if (arrowsKeyCodes.indexOf(event.which) !== -1 
        && $('.select2-drop .select2-result-label:visible').length < 1) {
          var suggestionObject = event.data;
          chrome.storage.sync.get(suggestionObject.storageName, suggestionObject.load.bind(suggestionObject));
          suggestionObject._hideDefaultDropdown();
      }
    },

    handleSelectedSuggestion(currentSelectbox, suggestionObject) {
      (function insertReviewers() {
        var reviewersCsv = $(currentSelectbox).find('option:selected').attr('data-content');
        reviewersArray = reviewersCsv.split(', ');
        reviewersArray = reviewersArray.map(function(value, index){
          var newValue = "'" + value + "'";
          return newValue;
        });
        var ajaxRequest = new XMLHttpRequest();
        var embeddedScriptUrl = chrome.extension.getURL("contentEject.js");
        ajaxRequest.onreadystatechange = function() {
          if (this.readyState === 4 && this.status === 200) {
            var script = document.createElement('script');
            var code = document.createTextNode('var reviewersArray = [' + reviewersArray + ']; ' + this.response);
            script.appendChild(code);
            (document.body || document.head).appendChild(script);
          }
        };
        ajaxRequest.open("GET", embeddedScriptUrl, true);
        ajaxRequest.send();
      })();
      suggestionObject._hideDefaultDropdown();
      $(currentSelectbox).remove();
      $('.pr-helper-overlay').addClass('active');
    },

    _hideDefaultDropdown() {
      $("#select2-drop-mask").hide();
      $("#select2-drop")
        .hide()
        .removeAttr("id");
      $('.select2-container-active')
        .removeClass("select2-dropdown-open")
        .removeClass("select2-container-active");
    }
  });
  reviewersSuggestions.init();

})(jQuery);