(() => {
  const { EventManager, pageHelper } = ShopbySkin;

  const selectProductLayerModalHelper = pageHelper.selectProductLayerModalHelper();
  selectProductLayerModalHelper.initialize({
    layerModalHelperKey: 'select-product',
  });

  const moduleActionHelper = {
    SEARCH: (helper) => {
      const { selectProductSearchField = {} } = helper.getState();
      const { selectData = [] } = selectProductSearchField;

      const isSelectedCategoryNo = [...selectData]
        .reverse()
        .find(({ selectedCategoryNo }) => selectedCategoryNo > 0)?.selectedCategoryNo;

      if (!isSelectedCategoryNo) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'WARNING',
          message: '<em>카테고리를 선택해주세요.</em>',
        });

        return;
      }

      helper.search();
    },

    SELECT_PRODUCT: (helper, { target }) => {
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
    moduleActionHelper.SELECT_PRODUCT(selectProductLayerModalHelper, { target });
  });
})();
