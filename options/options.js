(function($){

  // PR templates

  var template = {

    $wrapper: $('.templates'),
    $addButton: $('a#add-template'),

    compose: function (templateName, templateBody){
      if (typeof templateName === 'undefined') {
        var templateName = '';
      }
      if (typeof templateBody === 'undefined') {
        var templateBody = '';
      }
      var collapsed = arguments.length < 1 ? 0 : ' collapsed';
      var $_template = $('<div/>', {
        'class': 'template ui-state-default' + collapsed,
        'html': [
          $('<span/>', {
            'class': 'ui-icon ui-icon-close'
          }),
          $('<span/>', {
            'class': 'ui-icon ui-icon-caret-1-s'
          })
            .on('click', function(){
              $(this).parent().toggleClass('collapsed');
            }),
          $('<span/>', {
            'class': 'ui-icon ui-icon-arrow-4'
          }),
          $('<div/>', {
            'class': 'content',
            'data-name': templateName,
            'data-body': templateBody,
            'html': [
              $('<input/>', {
                'type': 'text',
                'placeholder': 'Template name'
              })
                .val(templateName),
              $('<textarea/>', {
                'rows': 5,
                'placeholder': 'Add example PR text here'
              })
                .val(templateBody)
            ]
          })
        ]
      });
      return $_template;
    },

    load: function (chromeStorage) {
      if (typeof chromeStorage.templates !== 'undefined' && chromeStorage.templates.length) {
        var templatesData = chromeStorage.templates;
        var $_templatesContainer = $();
        templatesData.map(function(templateData){
          $_templatesContainer = $_templatesContainer.add(template.compose(templateData.templateName, templateData.templateBody));
        });
        template.$wrapper.html($_templatesContainer);
      } else {
        template.$wrapper.html(template.compose());
      }
    },

    add: function() {
      template.$wrapper.append(template.compose());
    },

    save: function() {
      var templates = [];
      $('.template').each(function(){
        var templateName = $('input', this).val();
        var templateBody = $('textarea', this).val();
        if (templateBody === '') {
          return true;
        }
        var data = {
          'templateName': $('input', this).val(),
          'templateBody': $('textarea', this).val()
        }
        templates.push(data);
      });
      chrome.storage.sync.set({
        templates: templates }, function(){
          window.close();
      });
    }
  };

  chrome.storage.sync.get('templates', template.load);
  template.$addButton.on('click', template.add);
  template.$wrapper.sortable();

  // PR reviewers groups

  var $groupsWrapper = $('.groups');
  var $group = $('.group');
  var $saveButton = $('#save');
  var $cancelButton = $('#cancel');
  chrome.storage.sync.get('groups', loadGroups);
  $('#add-group').on('click', addNewGroup);
  $('body').on('click', '.ui-icon-close', removeCurrentGroup);
  $saveButton
    .on('click', template.save)
    .on('click',  saveGroups);
  $cancelButton.on('click', function(){window.close()});
  $groupsWrapper.sortable();

  function createGroup(groupName, reviewers){
    if (typeof groupName === 'undefined') {
      var groupName = '';
    }
    if (typeof reviewers === 'undefined') {
      var reviewers = '';
    }
    var collapsed = arguments.length < 1 ? 0 : ' collapsed';
    var $_group = $('<div/>', {
      'class': 'group ui-state-default' + collapsed,
      'html': [
        $('<span/>', {
          'class': 'ui-icon ui-icon-close'
        }),
        $('<span/>', {
          'class': 'ui-icon ui-icon-caret-1-s'
        })
          .on('click', function(){
            $(this)
              .parent()
                .toggleClass('collapsed')
                .find('.content')
                  .attr('data-name', $(this).siblings('.content').find('input').val())
                  .attr('data-body', $(this).siblings('.content').find('textarea').val());
          }),
        $('<span/>', {
          'class': 'ui-icon ui-icon-arrow-4'
        }),
        $('<div/>', {
          'class': 'content',
          'data-name': groupName,
          'data-body': reviewers,
          'html': [
            $('<input/>', {
              'type': 'text',
              'placeholder': 'Group name'
            })
              .val(groupName),
            $('<textarea/>', {
              'rows': 2,
              'placeholder': 'List of reviewers in csv format, e.g.: bgates, sjobs, adobkin, kmishur'
            })
              .val(reviewers)
          ]
        })
      ]
    });
    return $_group;
  }

  function loadGroups(chromeStorage) {
    if (typeof chromeStorage.groups !== 'undefined' && chromeStorage.groups.length) {
      var groupsData = chromeStorage.groups;
      var $_groupsContainer = $();
      groupsData.map(function(groupData){
        $_groupsContainer = $_groupsContainer.add(createGroup(groupData.groupName, groupData.reviewers));
      })
      $groupsWrapper.html($_groupsContainer);
    } else {
      $groupsWrapper.html(createGroup());
    }
  }

  function addNewGroup() {
    $groupsWrapper.append(createGroup());
  }

  function removeCurrentGroup() {
    $(this).parent($group).remove();
  }

  function saveGroups() {
    var groups = [];
    $('.group').each(function(){
      var groupName = $('input', this).val();
      var reviewers = $('textarea', this).val();
      if (reviewers === '') {
        return true;
      }
      var data = {
        'groupName': $('input', this).val(),
        'reviewers': $('textarea', this).val()
      }
      groups.push(data);
    });
    chrome.storage.sync.set({
      groups: groups }, function(){
        window.close();
    });
  }

})(jQuery);
