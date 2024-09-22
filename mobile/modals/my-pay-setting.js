(() => {
  const { pageHelper, EventManager } = ShopbySkin;
  const myPaySettingLayerModalHelper = pageHelper.myPaySettingLayerModalHelper();

  myPaySettingLayerModalHelper.initialize({
    layerModalHelperKey: 'my-pay-setting-layer-modal',
  });

  const moduleActionHandler = {
    CLICK_UNREGISTER_MY_PAY_SERVICE: () => {
      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message:
          '서비스를 해지하시겠습니까? 서비스해지 시 주문 취소 및 환불이 불가할 수 있습니다. 주문 및 반품이 진행 중인 경우 주문취소 및 반품 환불이 완료된 이후에 해지해 주세요.',
        onConfirm: () => {
          myPaySettingLayerModalHelper.cancelMyPayService();
        },
      });
    },

    CLICK_CHANGE_PASSWORD_ON_MY_PAY: () => {
      myPaySettingLayerModalHelper.modifyMyPayPassword();
    },

    CLICK_REGISTER_CART_AND_ACCOUNT_ON_MY_PAY: ({ target }) => {
      const registerType = target.getAttribute('shopby-register-type');

      myPaySettingLayerModalHelper.openMyPayRegister(registerType);
    },

    CLICK_BOOKMARK_ON_MY_PAY: ({ target }) => {
      const paymentItem = target.closest('.my-pay-setting-modal__list-item');

      if (!paymentItem) {
        return;
      }

      myPaySettingLayerModalHelper.modifyMainMyPayPayment(paymentItem);
    },

    CLICK_REMOVE_PAYMENT_ON_MY_PAY: ({ target }) => {
      const paymentItem = target.closest('.my-pay-setting-modal__list-item');

      if (!paymentItem) {
        return;
      }

      EventManager.fire('MODAL_CONFIRM_OPEN', {
        message: '등록된 결제수단을 삭제하시겠습니까?',
        onConfirm: async () => {
          await myPaySettingLayerModalHelper.deleteMyPayPayment(paymentItem);

          EventManager.fire('MODAL_ALERT_OPEN', {
            message: '삭제 처리되었습니다.',
          });
        },
      });
    },
  };

  const containerEl = document.body.querySelector('[shopby-layer-modal-helper-key="my-pay-setting-layer-modal"]');

  containerEl?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');
    const bookmarkBtn = target.closest('.my-pay-setting-modal__bookmark-btn');

    if (bookmarkBtn) {
      moduleActionHandler.CLICK_BOOKMARK_ON_MY_PAY({ target });

      return;
    }

    moduleActionHandler[action]?.({ target });
  });
})();
