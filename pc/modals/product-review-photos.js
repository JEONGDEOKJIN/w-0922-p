(() => {
  const { pageHelper, EventManager } = ShopbySkin;
  const productReviewPhotosLayerModalHelper = pageHelper.productReviewPhotosLayerModalHelper();
  productReviewPhotosLayerModalHelper.initialize({
    layerModalHelperKey: 'product-review-photos',
  });

  const ACTION_HANDLER_MAP = {
    REVIEW_DETAIL_POPUP: (target) => {
      const productNo = target.closest('[shopby-review-product-no]')?.getAttribute('shopby-review-product-no');
      const reviewNo = target.closest('[shopby-review-no]')?.getAttribute('shopby-review-no');

      productReviewPhotosLayerModalHelper.closeLayerModal();
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-review-detail',
        title: '상품후기 상세',
        data: {
          productNo,
          reviewNo,
          queryParams: {
            boardType: 'ALL',
          },
        },
      });
    },
  };

  document.querySelector('board-reviews-photos')?.addEventListener('click', ({ target }) => {
    ACTION_HANDLER_MAP[target.getAttribute('shopby-action')]?.(target);
  });
})();
