(() => {
  const { pageHelper, EventManager, utils } = ShopbySkin;
  const { initialize } = pageHelper.orderCompleteHelper();

  const orderNo = new URLSearchParams(location.search).get('orderNo');
  const guestToken = new URLSearchParams(location.search).get('guestToken');
  const isSuccess = new URLSearchParams(location.search).get('result') === 'SUCCESS';
  const orderRequestType = 'NORMAL';

  isSuccess && initialize({ orderNo, guestToken, isSuccess, orderRequestType });

  // 결제 정보 모듈
  const orderPaymentModule = document.querySelector('order-payment');
  orderPaymentModule.addEventListener('click', ({ target }) => {
    const actionTarget = target.getAttribute('shopby-action');
    if (actionTarget === 'COPY_ACCOUNT') {
      const account = target.getAttribute('shopby-account');
      utils.copyToClipboard(account, () => {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'SUCCESS',
          message: '계좌번호가 복사되었습니다.',
        });
      });
    }
  });
  // 주문 완료 하단 "주문 내역 조회"
  const goOrderListEl = document.querySelector('[shopby-action="GO_ORDER_LIST"]');
  goOrderListEl.addEventListener('click', () => {
    location.href = utils.isSignIn() ? '/pages/my/order-list.html' : '/';
  });
})();
