(function($){
  var $reviewersInput = $('.pull-request-reviewers .select2-input');
  var time = 0;
  $.each(reviewersList, function(index, value){
    setTimeout(function(){
      $reviewersInput.val(reviewersList[index]).click();
    }, time);
    setTimeout(function(){
      $('.select2-highlighted .select2-result-label').trigger('mouseup');
    }, time + 2000);
    time += 2000;
  });
})(jQuery);