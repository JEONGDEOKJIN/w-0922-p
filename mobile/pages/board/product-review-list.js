(() => {
  const { EventManager, pageHelper } = ShopbySkin;

  const searchParams = new URLSearchParams(location.search);
  const params = Object.fromEntries(searchParams.entries());

  const boardReviewsListHelper = pageHelper.boardReviewsListHelper();
  boardReviewsListHelper.initialize(params);

  const moduleActionHandler = {
    REGISTER: ({ target }) => {
      const usesAttachment = target.closest('[shopby-uses-attachment]')?.getAttribute('shopby-uses-attachment');

      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-review-form',
        title: '상품후기',
        isFull: true,
        data: {
          isSelectProduct: true,
          usesAttachment,
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

  document.querySelector('board-reviews-list')?.addEventListener('click', ({ target }) => {
    const action = target.closest('[shopby-action]')?.getAttribute('shopby-action');

    moduleActionHandler[action]?.({ target });
  });
})();
