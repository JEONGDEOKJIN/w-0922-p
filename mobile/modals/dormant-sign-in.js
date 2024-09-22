(() => {
  const { pageHelper, EventManager } = ShopbySkin;

  const dormantSignInLayerModalHelper = pageHelper.dormantSignInLayerModalHelper();

  const containerEl = document.querySelector('[shopby-layer-modal-helper-key="dormant-sign-in"]');
  dormantSignInLayerModalHelper.initialize({
    layerModalHelperKey: 'dormant-sign-in',
  });

  const CLICK_EVENT_HANDLER_MAP = {
    CANCEL: async (helper) => {
      await helper.signOut();
      helper.closeLayerModal();
    },
    DORMANT_SIGN_IN: async (helper) => {
      await helper.reactivateDormantAccount();

      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'SUCCESS',
        message: '<em>정상적으로 휴면해제 처리되었습니다.</em>',
        onClose: () => {
          helper.closeLayerModal({ reason: 'DID_SUBMIT' });
        },
      });
    },
  };

  const clickEventListener = ({ target }) => {
    const action = target.getAttribute('shopby-action');

    CLICK_EVENT_HANDLER_MAP[action]?.(dormantSignInLayerModalHelper);
  };

  containerEl.addEventListener('click', clickEventListener);
})();
