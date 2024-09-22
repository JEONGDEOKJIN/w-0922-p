(() => {
  const { pageHelper } = ShopbySkin;
  const pgProgressLayerModalHelper = pageHelper.pgProgressLayerModalHelper();

  pgProgressLayerModalHelper.initialize({
    layerModalHelperKey: 'pg-progress-layer-modal',
  });

  const moduleActionHandler = {
    CLICK_GO_CART: () => {
      location.replace(`${location.origin}/pages/order/cart.html`);
    },
    CLICK_MOVE_PAY_COMPLETE: () => {
      location.replace(`${location.origin}/pages/order/order-confirm.html`);
    },
  };

  const containerEl = document.body.querySelector('[shopby-layer-modal-helper-key="pg-progress-layer-modal"]');

  containerEl?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.();
  });
})();
