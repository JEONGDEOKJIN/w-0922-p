(() => {
  const { EventManager, pageHelper } = ShopbySkin;

  const myProductInquiryListHelper = pageHelper.myProductInquiryListHelper();
  myProductInquiryListHelper.initialize({
    answered: null,
    searchType: 'ALL',
    hasTotalCount: true,
  });

  const moduleActionHandler = {
    REGISTER: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-inquiry-form',
        title: '상품문의',
        modalAddClass: 'product-inquiry-form-modal',
        isFull: false,
        data: {
          isSelectProduct: true,
          commonData: myProductInquiryListHelper.commonData,
        },
        onClose: ({ reason }) => {
          if (reason === 'DID_SUBMIT') {
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'SUCCESS',
              message: '<em>상품문의가 등록됐습니다.</em>',
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },
  };

  const registerBtnEl = document.querySelector('[shopby-product-register-btn]');
  registerBtnEl?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.();
  });

  document.removeEventListener('click', registerBtnEl);
})();
