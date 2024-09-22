(() => {
  const { pageHelper } = ShopbySkin;

  const selectOrderProductLayerModalHelper = pageHelper.selectOrderProductLayerModalHelper();
  selectOrderProductLayerModalHelper.initialize({
    layerModalHelperKey: 'select-order-product',
  });

  const moduleActionHelper = {
    SELECTED_PRODUCT: (helper, orderNo) => {
      helper.submit({
        orderNo,
      });

      helper.closeLayerModal();
    },
  };

  document.querySelector('select-order-product-list')?.addEventListener('click', ({ target }) => {
    const action = target.closest('[shopby-action]')?.getAttribute('shopby-action');
    const orderNo = target.closest('[shopby-order-no]')?.getAttribute('shopby-order-no');

    moduleActionHelper[action]?.(selectOrderProductLayerModalHelper, orderNo);
  });
})();
