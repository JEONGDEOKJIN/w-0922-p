(() => {
  const { pageHelper, EventManager, utils, actions } = ShopbySkin;
  const eventDetailHelper = pageHelper.eventDetailHelper();

  const containerEl = document.querySelector('[shopby-helper-key="event-detail-helper-key"]');

  const { event: eventNoOrId } = utils.getQueryParams(location);
  const eventDetailRequest = {
    eventNo: eventNoOrId,
    sortType: 'ADMIN_SETTING',
    soldout: true,
  };

  const redirectLoginPage = () => {
    const nextUrl = '/pages/sign-in/sign-in.html';

    location.href = `${nextUrl}?from=${encodeURIComponent(location.href)}`;
  };

  eventDetailHelper.initialize({
    helperKey: 'event-detail-helper-key',
  });

  const likeHelper = {
    toggleClassName: (likeEl) => {
      likeEl.classList.toggle('is-active');
    },
    toggleLikeStatus: async (likeEl) => {
      const productNo = likeEl.getAttribute('shopby-product-no') ?? 0;

      await actions.toggleLikeStatus({
        productNo: Number(productNo),
      });
    },
  };

  const CLICK_EVENT_HANDLER_MAP = {
    HANDLE_COUPON_BTN_CLICK: () => {
      if (!utils.isSignIn()) {
        ShopbySkin.EventManager.fire('MODAL_CONFIRM_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>로그인하셔야 본 서비스를 이용하실 수 있습니다.</em>',
          onConfirm: redirectLoginPage,
        });

        return;
      }

      const { coupon, eventNo } = document.querySelector('event-detail-product-list').store.state ?? {};

      ShopbySkin.EventManager.fire('OPEN_LAYER_MODAL', {
        title: '쿠폰받기',
        name: 'coupon-download',
        data: {
          coupons: coupon?.coupons ?? [],
          eventNo,
        },
        isFull: false,
        onClose: () => null,
      });
    },
    HANDLE_SECTION_ID_CLICK: ({ target, helper }) => {
      const tabId = target.getAttribute('shopby-tab-id');
      helper.eventAction.selectEventCategory(tabId);
    },
    LIKE_PRODUCT: ({ target }) => {
      if (!utils.isSignIn()) {
        ShopbySkin.EventManager.fire('MODAL_CONFIRM_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>로그인하셔야 본 서비스를 이용하실 수 있습니다.</em>',
          onConfirm: redirectLoginPage,
        });

        return;
      }

      const likeEl = target.closest('[shopby-product-no]');
      likeHelper.toggleClassName(likeEl);
      likeHelper.toggleLikeStatus(likeEl);
    },
  };

  const CHANGE_EVENT_HANDLER_MAP = {
    HANDLE_SORT_CHANGE: ({ target, helper }) => {
      helper.eventAction.fetchEventDetail({
        ...eventDetailRequest,
        sortType: target.value,
      });
    },
  };

  EventManager.fire('INIT_EVENT_PRODUCT_SECTION_SLIDER', {
    spaceBetween: 32,
    direction: 'horizontal',
    effect: 'slide',
    slidesPerView: 'auto',
  });

  EventManager.on('PAGE_LOAD_COMPLETED', () => {
    eventDetailHelper.eventAction.fetchEventDetail(eventDetailRequest);
  });

  const clickEventListener = ({ target }) => {
    const actionType = target.getAttribute('shopby-action') ?? target.closest('button')?.getAttribute('shopby-action');

    CLICK_EVENT_HANDLER_MAP[actionType]?.({
      helper: eventDetailHelper,
      target,
    });
  };

  const changeEventListener = ({ target }) => {
    const actionType = target.getAttribute('shopby-action');

    CHANGE_EVENT_HANDLER_MAP[actionType]?.({
      helper: eventDetailHelper,
      target,
    });
  };

  containerEl.addEventListener('click', clickEventListener);
  containerEl.addEventListener('change', changeEventListener);
})();
