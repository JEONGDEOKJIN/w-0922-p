(() => {
  const { pageHelper, actions, EventManager } = ShopbySkin;

  const containerEl = document.querySelector('[shopby-helper-key="previous-order-list-helper-key"]');

  const datePickerHelper = pageHelper.datePickerHelper();
  datePickerHelper.initialize();

  const previousOrdersAction = actions.getPreviousOrdersAction();

  const previousOrdersHelper = pageHelper.previousOrdersHelper();
  previousOrdersHelper.initialize({
    helperKey: 'previous-order-list-helper-key',
    previousOrdersAction,
  });

  const CLICK_EVENT_HANDLER_MAP = {
    SEARCH_ORDERS: () => {
      const params = new URLSearchParams(location.search);
      location.href = `${location.origin}${location.pathname}?${params.toString()}`;
    },
  };

  const clickEventListener = (event) => {
    const actionType = event.target.getAttribute('shopby-action');

    CLICK_EVENT_HANDLER_MAP[actionType]?.({
      event,
    });
  };

  containerEl.addEventListener('click', clickEventListener);

  EventManager.on('PAGE_LOAD_COMPLETED', () => {
    EventManager.fire('INIT_PREVIOUS_ORDERS');
  });
})();
