(() => {
  $('.dropdown').each(function () {
    const $this = $(this);

    $this
      .addClass('dropdown--enabled')
      .click(function () {
        $this.removeClass('active');
      });

    $('.dropdown__handler', $this).click(function (e) {
      e.stopPropagation();
      e.preventDefault();
      $this.addClass('active');
    });

    $('.dropdown__panel', $this).click(function (e) {
      e.stopPropagation();
    });
  });
})();