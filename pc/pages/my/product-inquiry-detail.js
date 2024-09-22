(() => {
  const { EventManager, actions } = ShopbySkin;

  let shopbyCommonData = {};
  EventManager.on('PAGE_LOAD_COMPLETED', (commonData) => {
    shopbyCommonData = commonData;
  });

  const moveToList = () => {
    location.href = '/pages/my/product-inquiry-list.html';
  };

  const moduleActionHandler = {
    MODIFY: ({ productNo, inquiryNo }) => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-inquiry-form',
        title: '상품문의',
        modalAddClass: 'product-inquiry-form-modal',
        isFull: false,
        data: {
          productNo,
          inquiryNo,
          isModify: true,
          commonData: shopbyCommonData,
        },
        onClose: ({ reason }) => {
          if (reason === 'DID_MODIFY') {
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'SUCCESS',
              message: '<em>상품문의가 수정되었습니다.</em>',
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },
    DELETE: ({ inquiryNo }) => {
      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: '<em>삭제 시 복구가 불가능합니다.<br>정말 삭제하시겠습니까?</em>',
        onConfirm: async () => {
          await actions.deleteProductInquiryBy({ inquiryNo });
          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'SUCCESS',
            message: '<em>삭제되었습니다.</em>',
            onClose: () => {
              moveToList();
            },
          });
        },
      });
    },
    LIST: () => {
      moveToList();
    },
  };

  const productInquiryDetailModuleEl = document.querySelector('product-inquiry-detail');
  productInquiryDetailModuleEl?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');
    const productNo = target.closest('[shopby-product-no]')?.getAttribute('shopby-product-no');
    const inquiryNo = target.closest('[shopby-inquiry-no]')?.getAttribute('shopby-inquiry-no');

    moduleActionHandler[action]?.({ productNo, inquiryNo });
  });
})();
