'use strict';

(function ($){
  
  // PR entity ("abstract")

  class Entity {

    constructor() {
      if (new.target === Entity) {
        throw new Error("Can't instantiate abstract class!")
      }
    }

    init() {
      this.options()
      chrome.storage.sync.get([this.constructor.name], this.load.bind(this))
      this.$add.on('click', this.add.bind(this))
      this.$container.sortable()
      $('button#save').on('click', this.save.bind(this))
    }

    options() {
      throw new Error("Abstract method! All the options must be overriden in an instantiable class")
      this.$container
      this.$add
      this.titleHelpText
      this.contentHelpText
      this.cssClass      
    }

    _compose(title = '', content = '') {
      var collapsed = content !== '' ? ' collapsed' : ''
      var $_entity = $('<div/>', {
        'class': 'entity ui-state-default ' + this.cssClass + collapsed,
        'html': [
          $('<span/>', {
            'class': 'close-trigger ui-icon ui-icon-close'
          })
            .on('click', function(){
              $(this).closest('.entity').remove()
            }),
          $('<span/>', {
            'class': 'expand-trigger ui-icon ui-icon-caret-1-s'
          })
            .on('click', function(){
              $(this).closest('.entity').toggleClass('collapsed')
                .find('.content')
                  .attr('data-title', $(this).siblings('.content').find('input').val())
                  .attr('data-content', $(this).siblings('.content').find('textarea').val())
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
      return $_entity
    }

    add() {
      this.$container.append(this._compose())
    }

    remove() {
      this.closest('.entity').remove()
    }

    load(chromeStorage) {
      var storedEntitiesNames = Object.getOwnPropertyNames(chromeStorage)
      if (storedEntitiesNames.length) {
        var storedEntities = chromeStorage[storedEntitiesNames[0]]
        var $_container = $()
        storedEntities.map(entity => {
          $_container = $_container.add(this._compose(entity.title, entity.content))
        })
        this.$container.html($_container)
      } else {
        this.$container.html(this._compose())
      }
    }

    save() {
      var entities = []
      var $entity = $('.entity', this.$container)
      $entity.each(function(){
        var title = $('input', this).val()
        var content = $('textarea', this).val()
        if (content === '') {
          return true
        }
        var data = {
          'title': $('input', this).val(),
          'content': $('textarea', this).val()
        }
        entities.push(data)
      })
      chrome.storage.sync.set({
        [this.constructor.name]: entities }, function(){
          window.close()
      })
    }
  }

  // PR description

  class Description extends Entity {

    options() {
      this.$container = $('.descriptions')
      this.$add = $('a#add-description')
      this.titleHelpText = "Title"
      this.contentHelpText = "PR's description"
      this.cssClass = "description-entity"
    }
  }

  var description = new Description()
  description.init()

  // PR reviewers

  class Reviewers extends Entity {

    options() {
      this.$container = $('.reviewers')
      this.$add = $('a#add-reviewers')
      this.titleHelpText = "Title"
      this.contentHelpText = "PR reviewers in csv format"
      this.cssClass = "reviewers-entity"
    }
  }

  var reviewers = new Reviewers()
  reviewers.init()

})(jQuery)
