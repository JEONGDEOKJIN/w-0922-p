(() => {
  const { EventManager, pageHelper } = ShopbySkin;

  const selectProductLayerModalHelper = pageHelper.selectProductLayerModalHelper();
  selectProductLayerModalHelper.initialize({
    layerModalHelperKey: 'select-product',
  });

  const moduleActionHelper = {
    SEARCH: (helper) => {
      const { selectProductSearchField } = helper.getState();
      if (!selectProductSearchField) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'WARNING',
          message: '<em>카테고리를 선택해주세요.</em>',
        });
      }

      helper.search();
    },

    SELECTED_PRODUCT: (helper, { target }) => {
      const productNo = target.closest('[shopby-product-no]')?.getAttribute('shopby-product-no');

      if (!productNo) {
        return;
      }

      helper.submit({
        productNo,
      });
    },
  };

  document.querySelector('select-product-search-field')?.addEventListener('click', ({ target }) => {
    const action = target.closest('[shopby-action]')?.getAttribute('shopby-action');

    moduleActionHelper[action]?.(selectProductLayerModalHelper);
  });

  document.querySelector('select-product-list')?.addEventListener('click', ({ target }) => {
    const action = target.closest('[shopby-action]')?.getAttribute('shopby-action');

    moduleActionHelper[action]?.(selectProductLayerModalHelper, { target });
  });
})();
