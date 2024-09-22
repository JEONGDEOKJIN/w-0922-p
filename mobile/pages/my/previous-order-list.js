(() => {
  const { pageHelper, actions, EventManager } = ShopbySkin;

  const previousOrdersAction = actions.getPreviousOrdersAction();

  const previousOrdersHelper = pageHelper.previousOrdersHelper();
  previousOrdersHelper.initialize({
    previousOrdersAction,
  });

  EventManager.on('PAGE_LOAD_COMPLETED', () => {
    EventManager.fire('INIT_PREVIOUS_ORDERS');
  });
})();
