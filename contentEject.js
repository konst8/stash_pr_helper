(function($){
  var reviewers = reviewersArray || [];
  var loadedReviewers = [];
  var length = reviewers.length;

  reviewers.forEach(function(user) {
    loadUser(user, collectReviewersObjects);
  });

  function loadUser(user, callback) {
    var requestObject = {
      avatarSize: 32, 
      permission: "LICENSED_USER", 
      start: 0, 
      filter: user
    };
    $.get( "/rest/api/latest/users", requestObject)
      .done(function(data) {
        if (data.values.length > 0) {
          var loadedUserObject = data.values[0];
          var preparedUserObject = {
            id: loadedUserObject.name,
            text: loadedUserObject.displayName,
            item: loadedUserObject
          };
          callback(preparedUserObject, user);
        } else {
          callback('fail', user);
        }
      })
      .fail(function(){
        callback('fail', user);
      });
  }

  function collectReviewersObjects(preparedUserObject, user) {    
    if (preparedUserObject === 'fail') {
      length = length - 1;
      console.error("User " + user + " was not found.");
    } else {
      loadedReviewers.push(preparedUserObject);
    }
    if (length === loadedReviewers.length) {
      pushReviewers(loadedReviewers);
    }
  }

  function pushReviewers(loadedReviewers) {
    $('.pr-helper-overlay').removeClass('active');
    var existingReviewers = AJS.$('#reviewers').auiSelect2('data');
    AJS.$('#reviewers')
      .auiSelect2('data', null)
      .trigger("change");
    existingReviewers.forEach(function(existingReviewer){
      AJS.$('#reviewers').trigger({
        'type': 'change',
        'removed': existingReviewer
      });
    });
    loadedReviewers.forEach(function(loadedReviewer){
      AJS.$('#reviewers').trigger({
        type: 'change',
        added: loadedReviewer
      });
    });
    AJS.$('#reviewers')
      .auiSelect2('data', loadedReviewers);
    $('li.select2-no-results ~ li').remove();
  }

})(jQuery);