(() => {
  const { pageHelper, utils, EventManager } = ShopbySkin;
  const { initialize } = pageHelper.orderCompleteHelper();

  const orderNo = new URLSearchParams(location.search).get('orderNo');
  const guestToken = new URLSearchParams(location.search).get('guestToken');
  const isSuccess = new URLSearchParams(location.search).get('result') === 'SUCCESS';
  const orderRequestType = 'NORMAL';

  isSuccess && initialize({ orderNo, guestToken, isSuccess, orderRequestType });

  // 주문 완료 하단 "주문 내역 조회"
  const goOrderListEl = document.querySelector('[shopby-action="GO_ORDER_LIST"]');
  goOrderListEl.addEventListener('click', () => {
    location.href = utils.isSignIn() ? '../my/order-list.html' : '/';
  });
})();
