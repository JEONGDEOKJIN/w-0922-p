(() => {
  const { pageHelper } = ShopbySkin;

  const datePickerHelper = pageHelper.datePickerHelper();
  datePickerHelper.initialize();

  const MODULE_ACTION_HANDLER = {
    SEARCH_ACCUMULATION: () => {
      const params = new URLSearchParams(location.search);
      location.href = `${location.origin}${location.pathname}?${params.toString()}`;
    },
  };

  const dateTypeSelectorModule = document.querySelector('date-search');
  dateTypeSelectorModule?.addEventListener('click', ({ target }) => {
    const actionTarget = target.getAttribute('shopby-action');

    if (!actionTarget) {
      return;
    }

    MODULE_ACTION_HANDLER[actionTarget]();
  });
})();
