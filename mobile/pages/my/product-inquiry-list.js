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

  document.querySelector('product-inquiry-total-count')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.();
  });

  document.querySelector('product-inquiry-list')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');
    const productNo = target.closest('[shopby-product-no]')?.getAttribute('shopby-product-no');
    const inquiryNo = target.closest('[shopby-inquiry-no]')?.getAttribute('shopby-inquiry-no');

    moduleActionHandler[action]?.(myProductInquiryListHelper, { productNo, inquiryNo });
  });
})();
