(() => {
  const { pageHelper } = ShopbySkin;
  const paymentProgressLayerModalHelper = pageHelper.paymentProgressLayerModalHelper();

  paymentProgressLayerModalHelper.initialize({
    layerModalHelperKey: 'payment-progress-layer-modal',
  });

  const moduleActionHandler = {
    CLICK_OPEN_PAYMENT_WINDOW: () => {
      paymentProgressLayerModalHelper.openPay();
    },

    CLICK_CANCEL_PAYMENT: () => {
      paymentProgressLayerModalHelper.closeLayerModal();
    },

    CLICK_GO_CART: () => {
      location.replace(`${location.origin}/pages/order/cart.html`);
    },
  };

  const containerEl = document.body.querySelector('[shopby-layer-modal-helper-key="payment-progress-layer-modal"]');

  containerEl?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.({ target });
  });
})();
