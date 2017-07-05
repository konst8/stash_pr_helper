(function($){

  var $groupsWrapper = $('.groups');
  var $group = $('.group');
  var $saveButton = $('#save');

  var testStorage = {
    'groups': [
      {
        'groupName': 'group 1',
        'reviewers': 'rev1, rev2, rev3'
      }, 
      {
        'groupName': 'group 2',
        'reviewers': 'rev4, rev5, rev6'
      }, 
    ]
  };

  function createGroup(groupName, reviewers){
    if (typeof groupName === 'undefined') {
      var groupName = '';
    }
    if (typeof reviewers === 'undefined') {
      var reviewers = '';
    }
    var $_group = $('<div/>', {
      'class': 'group ui-state-default',
      'html': [
        $('<span/>', {
          'class': 'ui-icon ui-icon-close'
        }),
        $('<span/>', {
          'class': 'ui-icon ui-icon-arrow-4'
        }),
        $('<div/>', {
          'class': 'content',
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

  // <div class="group ui-state-default">
  //     <span class="ui-icon ui-icon-arrow-4"></span>
  //     <div class="content">
  //       <input type="text" placeholder="Input group name">
  //       <textarea id="reviewers" rows="2" placeholder="Input a list of reviewers in csv format, e.g.: bgates, sjobs, jsmith, aivanov"></textarea>
  //     </div>
  //   </div>

  // Load existing values.
  chrome.storage.sync.get('groups', loadGroups);

  function loadGroups(chromeStorage) {
    console.log(chromeStorage);
    if (typeof chromeStorage.groups !== 'undefined' && chromeStorage.groups.length) {
      var groupsData = chromeStorage.groups;
      console.log(groupsData);
      var $_groupsContainer = $();
      groupsData.map(function(groupData){
        $_groupsContainer = $_groupsContainer.add(createGroup(groupData.groupName, groupData.reviewers));
      })
      console.log($_groupsContainer);
      $groupsWrapper.html($_groupsContainer);
    } else {
      $groupsWrapper.html(createGroup());
    }
  }

  function addNewGroup() {
    $groupsWrapper.append(createGroup());
  }

  function removeCurrentGroup() {
    console.log(this);
    $(this).parent($group).remove();
  }

  $('#add-group').on('click', addNewGroup);
  $('body').on('click', '.ui-icon-close', removeCurrentGroup);

  // Saves options to chrome.storage.sync.
  function saveGroups() {
    // var reviewers = document.getElementById('reviewers').value;
    // chrome.storage.sync.set({
    //   reviewers: reviewers
    // }, function(){
    //   window.close();
    // });
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

  $saveButton.on('click', saveGroups);


  // Make groups sortable
  $groupsWrapper.sortable();

})(jQuery);
