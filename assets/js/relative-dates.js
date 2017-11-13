
$(() => {
  'use strict';

  let rtimesTimer = setInterval(() => {
    relativeDates();
  }, 5000);
  relativeDates();
}); // onready

// Functions
function relativeDates() {
  $('time').each(function() { // For some reason, "this" is handled differently in arrow functions
    let $this = $(this);
    let utc = $this.attr('utc');
    if (!utc) return;
    let date = new Date(utc);
    let strdate = moment(date).format('LLLL');
    $this
      .html($.timeago(date))
      .attr({
        title: strdate,
        datetime: strdate
      });
  });
}

function relativeDate(utc) {
  let date = new Date(utc);
  return $.timeago(date)
}