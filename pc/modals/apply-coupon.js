(() => {
  const { pageHelper, EventManager } = ShopbySkin;
  const applyCouponLayerModalHelper = pageHelper.applyCouponLayerModalHelper();

  applyCouponLayerModalHelper.initialize({
    layerModalHelperKey: 'apply-coupon',
  });

  const applyCoupon = (state) => {
    applyCouponLayerModalHelper.closeLayerModal({
      reason: 'DID_SUBMIT',
      state,
    });
  };

  const moduleActionHandler = {
    CLICK_APPLY_COUPON_CANCEL: () => {
      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: '취소 시 선택한 쿠폰은 적용되지 않습니다.<br>취소하시겠습니까?',
        onConfirm: () => {
          applyCouponLayerModalHelper.closeLayerModal({
            reason: 'DID_CLOSE',
          });
        },
      });
    },
    CLICK_APPLY_COUPON_BTN_FOR_ORDER_SHEET: () => {
      const state = applyCouponLayerModalHelper.getState().couponModal;
      const { blockUseAccumulationWhenUseCoupon, accumulationInputValue } =
        applyCouponLayerModalHelper.getState().helperState;

      if (!blockUseAccumulationWhenUseCoupon) {
        applyCoupon(state);

        return;
      }

      const { cartCouponIssueNo, productCoupons } = state.selectedCoupon;
      const isCouponSelected = cartCouponIssueNo || productCoupons?.length;
      const useAccumulationWhenUseCoupon = accumulationInputValue && isCouponSelected;

      if (useAccumulationWhenUseCoupon) {
        EventManager.fire('MODAL_CONFIRM_OPEN', {
          noticeType: 'WARNING',
          message: '쿠폰 적용 시 적립금 사용이 불가합니다.<br/>쿠폰을 적용하시겠습니까?',
          onConfirm: () => applyCoupon(state),
        });
      } else {
        applyCoupon(state);
      }
    },
    SHOW_PRODUCT_COUPON_WARNING_MESSAGE: (target) => {
      const cartCouponUsable = target.getAttribute('shopby-cart-coupon-usable');
      const skipsAccumulation = target.getAttribute('shopby-skips-accumulation');

      const messages = [];

      if (skipsAccumulation === 'true') {
        messages.push('쿠폰 사용 시, 적립금 적립이 불가합니다.');
      }

      if (cartCouponUsable === 'false') {
        messages.push('본 쿠폰 사용 시, 주문 쿠폰 사용이 불가합니다.');
      }

      EventManager.fire('MODAL_ALERT_OPEN', {
        title: '쿠폰 사용 시 혜택 제한 안내',
        message: messages.join('<br>'),
        visibleBottomButton: false,
        useCloseButton: true,
        modalAddClass: 'simple-text-alert',
      });
    },
    SHOW_CART_COUPON_WARNING_MESSAGE: (target) => {
      const productCouponUsable = target.getAttribute('shopby-product-coupon-usable');
      const skipsAccumulation = target.getAttribute('shopby-skips-accumulation');

      const messages = [];

      if (skipsAccumulation === 'true') {
        messages.push('쿠폰 사용 시, 적립금 적립이 불가합니다.');
      }

      if (productCouponUsable === 'false') {
        messages.push('본 쿠폰 사용 시, 상품 쿠폰 사용이 불가합니다.');
      }

      EventManager.fire('MODAL_ALERT_OPEN', {
        title: '쿠폰 사용 시 혜택 제한 안내',
        message: messages.join('<br>'),
        visibleBottomButton: false,
        useCloseButton: true,
        modalAddClass: 'simple-text-alert',
      });
    },
  };

  const containerEl = document.body.querySelector('[shopby-layer-modal-helper-key="apply-coupon"]');

  containerEl?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.(target);
  });
})();
