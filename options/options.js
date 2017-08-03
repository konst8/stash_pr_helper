'use strict';

(function ($){
  
  // PR entity's default object.
  // We will inherit from it later.

  const Entity = {

    $container: null,
    $add: null,
    titleHelpText: null,
    contentHelpText: null,
    cssClass: null,

    init() {
      chrome.storage.sync.get(this.name, this.load.bind(this));
      this.$add.on('click', this.add.bind(this));
      this.$container.sortable();
      $('button#save').on('click', this.save.bind(this));
    },

    _compose(title = '', content = '') {
      var collapsed = content !== '' ? ' collapsed' : '';
      var $_entity = $('<div/>', {
        'class': 'entity ui-state-default ' + this.cssClass + collapsed,
        'html': [
          $('<span/>', {
            'class': 'close-trigger ui-icon ui-icon-close'
          })
            .on('click', function(){
              $(this).closest('.entity').remove();
            }),
          $('<span/>', {
            'class': 'expand-trigger ui-icon ui-icon-caret-1-s'
          })
            .on('click', function(){
              $(this).closest('.entity').toggleClass('collapsed')
                .find('.content')
                  .attr('data-title', $(this).siblings('.content').find('input').val())
                  .attr('data-content', $(this).siblings('.content').find('textarea').val());
            }),
          $('<span/>', {
            'class': 'ui-icon ui-icon-arrow-4'
          }),
          $('<div/>', {
            'class': 'content',
            'data-title': title,
            'data-content': content,
            'html': [
              $('<input/>', {
                'type': 'text',
                'placeholder': this.titleHelpText
              })
                .val(title),
              $('<textarea/>', {
                'rows': 5,
                'placeholder': this.contentHelpText
              })
                .val(content)
            ]
          })
        ]
      })
      return $_entity;
    },

    add() {
      this.$container.append(this._compose());
    },

    remove() {
      this.closest('.entity').remove();
    },

    load(chromeStorage) {
      var storedEntities = chromeStorage[this.name];
      if (storedEntities !== undefined) {
        var $_container = $();
        storedEntities.map(entity => {
          $_container = $_container.add(this._compose(entity.title, entity.content));
        });
        this.$container.html($_container);
      } else {
        this.$container.html(this._compose());
      }
    },

    save() {
      var entities = [];
      var $entity = $('.entity', this.$container);
      $entity.each(function(){
        var title = $('input', this).val();
        var content = $('textarea', this).val();
        if (content === '') {
          return true;
        }
        var data = {
          'title': $('input', this).val(),
          'content': $('textarea', this).val()
        }
        entities.push(data);
      });
      chrome.storage.sync.set({
        [this.name]: entities }, function(){
          //window.close();
      });
    }
  };

  function createEntity(properties) {
    return Object.assign(Object.create(Entity), properties);
  }

  // PR description

  const description = createEntity({
    name: 'description',
    $container: $('.descriptions'),
    $add: $('a#add-description'),
    titleHelpText: "Title",
    contentHelpText: "PR's description",
    cssClass: "description-entity"
  });
  description.init();

  // PR reviewers

  const reviewers = createEntity({
    name: 'reviewers',
    $container: $('.reviewers'),
    $add: $('a#add-reviewers'),
    titleHelpText: "Title",
    contentHelpText: "PR reviewers in csv format",
    cssClass: "reviewers-entity"
  });
  reviewers.init();


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
            'text': entity.title + ': ' + entity.content,
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
        .on('keyup click', this, this.selectSuggestion.preHandler);
      return $_selectbox;
    },

    showSuggestions(event) {
      var arrowsKeyCodes = [37, 38, 39, 40];
      if (arrowsKeyCodes.indexOf(event.which) !== -1 && this.value === '') {
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
    storageName: 'description',
    $targetInput: $('#pull-request-description'),
  });
  descriptionSuggestions.init();

})(jQuery)
