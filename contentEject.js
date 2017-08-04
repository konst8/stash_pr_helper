(function($){
  var $reviewersInput = $('.pull-request-reviewers .select2-input');
  var index = 0;

  $reviewersInput.val(reviewersArray[index]).click();

  $( document ).ajaxComplete(function( event, xhr, settings ) {
    if (typeof xhr.responseText !== "undefined"
      && typeof $.parseJSON(xhr.responseText).values[0] !== "undefined"
      && $.parseJSON(xhr.responseText).values[0].name === reviewersArray[index]) {
      $('.select2-highlighted .select2-result-label').trigger('mouseup');
      if (index < reviewersArray.length) {
        index += 1;
        $reviewersInput.val(reviewersArray[index]).click();
        if (index === reviewersArray.length) {
          $('.pr-helper-overlay').remove();
        }
      } 
    } else {
      $('.pr-helper-overlay').remove();
    }
  });

  $( document ).ajaxError(function(event, jqxhr, settings, thrownError) {
    $('.pr-helper-overlay').remove();
  });

})(jQuery);