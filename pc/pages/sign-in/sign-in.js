(() => {
  const {
    EventManager,
    pageHelper,
    utils: { handleFocusEvent, isSignedIn },
    actions,
  } = ShopbySkin;

  if (isSignedIn()) {
    if (!document.referrer || location.href === document.referrer) {
      history.back();

      return;
    }
    location.href = document.referrer;
  }

  const signInHelper = pageHelper.signInHelper();

  signInHelper.initialize({
    helperKey: 'sign-in-form',
  });

  const containerEl = document.querySelector('[shopby-helper-key="sign-in"]');

  const previousOrdersAction = actions.getPreviousOrdersAction();

  const checkGuestOrderValid = (payload) => {
    if (!payload || !payload.guestOrderNo) {
      return {
        field: 'guestOrderNo',
        message: '주문번호를 입력해주세요.',
      };
    }

    if (!payload.guestOrderPassword) {
      return {
        field: 'guestOrderPassword',
        message: '주문번호 비밀번호를 입력해주세요.',
      };
    }

    return {
      field: '',
      message: '',
    };
  };

  const showInvalidModal = (validResult) => {
    if (validResult.message) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: `<em>${validResult.message}</em>`,
        onClose: () => {
          handleFocusEvent({ containerEl, fields: validResult.field });
        },
      });

      return false;
    }

    return true;
  };

  const handleGuestOrderSearch = async (params, includesPreviousOrder) => {
    const validationResult = checkGuestOrderValid(params);
    if (!showInvalidModal(validationResult)) {
      return;
    }

    const { guestOrderNo: orderNo, guestOrderPassword: password } = params;

    if (includesPreviousOrder) {
      await previousOrdersAction.searchGuestPreviousOrder({
        pathVariable: {
          orderNo,
        },
        requestBody: {
          password,
        },
      });

      location.href = `/pages/my/previous-order-detail.html?orderNo=${orderNo}`;
    } else {
      await signInHelper.searchGuestOrder({ orderNo, password });

      location.href = `/pages/my/order-detail.html?orderNo=${orderNo}`;
    }
  };

  const clickEventListener = ({ target }) => {
    const action = target.getAttribute('shopby-action');

    if (action === 'SUBMIT_GUEST_ORDER') {
      const includesPreviousOrder = target?.getAttribute('shopby-includes-previous-order') === 'true';
      const selectedPreviousOrderTab = target?.getAttribute('shopby-current-tab') === 'PREVIOUS_ORDER';

      const { guestOrder } = signInHelper.getState();

      handleGuestOrderSearch(guestOrder, includesPreviousOrder && selectedPreviousOrderTab);
    }
  };

  const keypressEventListener = ({ target, key }) => {
    const action = target.getAttribute('shopby-action');

    if (key === 'Enter' && action === 'GUEST_ORDER_PASSWORD_KEYPRESS') {
      const { guestOrder } = signInHelper.getState();

      handleGuestOrderSearch({ ...guestOrder, guestOrderPassword: target.value.trim() });
    }
  };

  containerEl.addEventListener('click', clickEventListener);
  containerEl.addEventListener('keypress', keypressEventListener);
})();
