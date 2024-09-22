(() => {
  const { EventManager, actions } = ShopbySkin;

  const moveToList = () => {
    location.href = '/pages/my/product-review-list.html';
  };

  const moduleActionHandler = {
    MODIFY: ({ boardName, productNo, reviewNo }) => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-review-form',
        title: boardName,
        modalAddClass: 'product-review-form-modal',
        isFull: false,
        data: {
          isModify: true,
          productNo,
          reviewNo,
        },
        onClose: ({ reason }) => {
          if (reason === 'DID_MODIFY') {
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'SUCCESS',
              message: '<em>상품후기가 수정되었습니다.</em>',
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },
    DELETE: ({ productNo, reviewNo, givenAccumulation }) => {
      const confirmMessage =
        givenAccumulation.toUpperCase() === 'Y'
          ? '<em>삭제 시 복구가 불가하며,<br>지급된 적립금이 차감됩니다.<br>정말 삭제하시겠습니까?</em>'
          : '<em>삭제 시 복구가 불가능합니다.<br>정말 삭제하시겠습니까?</em>';

      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: confirmMessage,
        onConfirm: async () => {
          try {
            const { isSuccess } = await actions.deleteReviewBy({ productNo, reviewNo });

            if (isSuccess) {
              EventManager.fire('MODAL_ALERT_OPEN', {
                noticeType: 'SUCCESS',
                message: '<em>삭제되었습니다.</em>',
                onClose: () => {
                  moveToList();
                },
              });
            }
          } catch (e) {
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'CAUTION',
              message: `<em>${e.error?.description}</em>`,
            });
          }
        },
      });
    },
    LIST: () => {
      moveToList();
    },
  };

  const productReviewDetailModuleEl = document.querySelector('product-review-detail');
  productReviewDetailModuleEl?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');
    const productNo = target.closest('[shopby-product-no]')?.getAttribute('shopby-product-no');
    const reviewNo = target.closest('[shopby-review-no]')?.getAttribute('shopby-review-no');
    const boardName = target.closest('[shopby-board-name]')?.getAttribute('shopby-board-name');
    const givenAccumulation = target.closest('[shopby-given-accumulation]')?.getAttribute('shopby-given-accumulation');

    moduleActionHandler[action]?.({ boardName, productNo, reviewNo, givenAccumulation });
  });

  document.removeEventListener('click', productReviewDetailModuleEl);
})();
