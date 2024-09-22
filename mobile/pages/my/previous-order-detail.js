(() => {
  const { actions, EventManager, utils } = ShopbySkin;

  const containerEl = document.querySelector('[shopby-helper-key="previous-order-detail"]');

  const previousOrdersAction = actions.getPreviousOrdersAction();

  const { orderNo } = utils.getQueryParams();

  const CLICK_EVENT_HANDLER_MAP = {
    GO_BACK: () => {
      if (!document.referrer || location.href === document.referrer) {
        history.back();

        return;
      }
      location.href = document.referrer;
    },
  };

  const clickEventListener = ({ target }) => {
    const actionType = target.getAttribute('shopby-action');

    CLICK_EVENT_HANDLER_MAP[actionType]?.({
      target,
    });
  };

  containerEl.addEventListener('click', clickEventListener);

  EventManager.on('PAGE_LOAD_COMPLETED', () => {
    // 이전 주문 상세 정보 조회
    const fetchFn = utils.isSignIn()
      ? previousOrdersAction.fetchPreviousOrder
      : previousOrdersAction.fetchGuestPreviousOrderBy;

    fetchFn({
      pathVariable: {
        orderNo,
      },
    });
  });
})();
