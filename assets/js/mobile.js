$(() => {
  $(window).on('resize.mobile', function () {
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    $('html').toggleClass('mobile', w <= 800);
  }).resize();

  $('.mobile-toolbar__button a').click(function (e) {
    e.preventDefault();

    let $this = $(this);
    let $wrapper = $this.closest('.mobile-toolbar__button');
    let state = $wrapper.data('mobile');

    if (!state) return;

    if (state === document.mobileState && state === 'news') {
      $('#news-filter').val('default').change();
      $('#main-page').scrollTop(0);
    }
    document.mobileState = state;

    $('html').removeClass((index, className) => {
      return (className.match(/mobile--\S+/g) || []).join(' ');
    }).addClass('mobile--' + state);

    $('.mobile-toolbar__button.active').removeClass('active');
    $wrapper.addClass('active');
    $(window).scroll();
  });
  $('.mobile-toolbar__button.active a').click();
});