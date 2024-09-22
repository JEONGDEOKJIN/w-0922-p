(() => {
  const { EventManager, pageHelper } = ShopbySkin;

  const myProductReviewListHelper = pageHelper.myProductReviewListHelper();
  myProductReviewListHelper.initialize();

  const moduleActionHandler = {
    REGISTER: (_, { productNo, reviewNo, usesAttachment }) => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-review-form',
        title: '상품 후기',
        modalAddClass: 'product-review-form-modal',
        isFull: false,
        data: {
          productNo,
          reviewNo,
          usesAttachment,
          isSelectProduct: true,
        },
        onClose: ({ reason }) => {
          if (reason === 'DID_SUBMIT') {
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'success',
              message: '<em>상품후기가 등록되었습니다.</em>',
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },
  };

  document.querySelector('product-review-total-count')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');
    const productNo = target.closest('[shopby-product-no]')?.getAttribute('shopby-product-no');
    const reviewNo = target.closest('[shopby-review-no]')?.getAttribute('shopby-review-no');
    const usesAttachment = target.closest('[shopby-uses-attachment]')?.getAttribute('shopby-uses-attachment');

    moduleActionHandler[action]?.(myProductReviewListHelper, { productNo, reviewNo, usesAttachment });
  });
})();
