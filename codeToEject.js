(function($){
  var $reviewersInput = $('.pull-request-reviewers .select2-input');
  var $suggestedResult = $('.select2-highlighted .select2-result-label'); 
  var time = 0;
  var index = 0;

  // $.each(reviewersList, function(index, value){
  //   setTimeout(function(){
  //     $reviewersInput.val(reviewersList[index]).click();
  //   }, time);
  //   setTimeout(function(){
  //     $suggestedResult.trigger('mouseup');
  //   }, time + 2000);
  //   time += 2000;
  // });

  $reviewersInput.val(reviewersList[index]).click();

  $( document ).ajaxComplete(function( event, xhr, settings ) {
    if ($.parseJSON(xhr.responseText).values[0].name === reviewersList[index]) {
      $('.select2-highlighted .select2-result-label').trigger('mouseup');
      if (index < reviewersList.length) {
        index += 1;
        $reviewersInput.val(reviewersList[index]).click();
      }
    }
  });

})(jQuery);