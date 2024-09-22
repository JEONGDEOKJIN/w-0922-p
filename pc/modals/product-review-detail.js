(() => {
  const { pageHelper, utils, EventManager, actions } = ShopbySkin;
  const productReviewDetailLayerModalHelper = pageHelper.productReviewDetailLayerModalHelper();

  productReviewDetailLayerModalHelper.initialize({
    layerModalHelperKey: 'product-review-detail',
  });

  const redirectLoginPage = () => {
    const nextUrl = `${location.origin}/pages/sign-in/sign-in.html`;

    location.href = `${nextUrl}?from=${encodeURIComponent(location.href)}`;
  };

  const ACTION_HANDLER_MAP = {
    RECOMMEND: () => {
      if (!utils.isSignIn()) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>로그인 후 이용할 수 있습니다.</em>',
          onClose: redirectLoginPage,
        });
      }
    },
    VIEW_PHOTO_REVIEWS: async ({ target }) => {
      const productNo = target.closest('[shopby-product-no]')?.getAttribute('shopby-product-no');
      const reviewNo = target.closest('[shopby-review-no]')?.getAttribute('shopby-review-no');

      if (!productNo) {
        return;
      }

      const { data } = await actions.getPhotoReviewsByProductNo({
        productNo,
        reviewNo,
      });

      const photoReviewsContents = data.contents?.map((content) => ({
        ...content,
        productNo: content.registerNo,
      }));
      const photoReviewsCount = photoReviewsContents.length;

      productReviewDetailLayerModalHelper.closeLayerModal();
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-review-photos',
        title: `포토(${photoReviewsCount})`,
        isFull: false,
        data: {
          images: photoReviewsContents,
        },
      });
    },
  };

  document.querySelector('board-reviews-detail')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');
    ACTION_HANDLER_MAP[action]?.({ target });
  });
})();
