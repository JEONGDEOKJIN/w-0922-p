(() => {
  const { EventManager, pageHelper } = ShopbySkin;
  const myCouponListHelper = pageHelper.myCouponListHelper();

  const searchParams = new URLSearchParams(location.search);
  const params = Object.fromEntries(searchParams.entries());

  myCouponListHelper.initialize({
    ...params,
    tab: params.usable === 'false' ? 'UNISSUABLE' : 'ISSUABLE',
  });

  const moduleActionHandler = {
    REGISTER: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'coupon-register-form',
        title: '쿠폰 등록',
        modalAddClass: 'coupon-registration-modal',
        isFull: false,
        onClose: ({ reason }) => {
          if (reason === 'DID_SUBMIT') {
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'SUCCESS',
              message: '<em>쿠폰이 등록이 완료되었습니다.</em>',
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },
  };

  document.querySelector('coupon-total-count')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');
    moduleActionHandler[action]?.();
  });
})();
