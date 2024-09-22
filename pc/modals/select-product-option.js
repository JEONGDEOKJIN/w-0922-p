(() => {
  const { pageHelper, EventManager, actions, utils } = ShopbySkin;

  const modalHelper = pageHelper?.selectProductOptionLayerModalHelper?.();

  const { initForModal, addCart } = pageHelper.productDetailHelper();

  const selectProductOptionActionMap = {
    ADD_CART: async () => {
      await addCart();

      EventManager.fire('MODAL_CONFIRM_OPEN', {
        message: '<p>장바구니에 담았습니다.</p>',
        cancelLabel: '쇼핑계속하기',
        confirmLabel: '장바구니 가기',
        onConfirm: () => {
          location.href = '/pages/order/cart.html';
        },
      });
    },

    COUPON_DOWNLOAD: () => {
      const { productNo } = modalHelper.store.state.parentState;

      if (!utils.isSignIn()) {
        ShopbySkin.EventManager.fire('MODAL_ALERT_OPEN', {
          message: '로그인하셔야 본 서비스를 이용하실 수 있습니다',
          onClose: () => {
            const nextUrl = `${location.origin}/pages/sign-in/sign-in.html`;

            location.href = `${nextUrl}?from=${encodeURIComponent(location.href)}`;
          },
        });
      }

      ShopbySkin.EventManager.fire('OPEN_LAYER_MODAL', {
        title: '쿠폰 다운받기',
        name: 'coupon-download',
        modalAddClass: 'select-product-option-modal__coupon-modal',
        data: {
          productNo,
        },
        isFull: false,
        onClose: () => null,
      });
    },
  };

  modalHelper.initialize({
    layerModalHelperKey: 'select-product-option',
  });

  const { productNo } = modalHelper.store.state.parentState;

  initForModal({
    productNo,
    cartAction: actions.getCartAction(),
  });

  document.querySelector('layer-modal-area')?.addEventListener?.('click', ({ target }) => {
    selectProductOptionActionMap[target.getAttribute('shopby-action')]?.();
  });
})();
