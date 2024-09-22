(() => {
  const { pageHelper, EventManager } = ShopbySkin;

  const passwordAuthenticationLayerModalHelper = pageHelper.passwordAuthenticationLayerModalHelper();

  const containerEl = document.querySelector('[shopby-layer-modal-helper-key="password-authentication"]');

  passwordAuthenticationLayerModalHelper.initialize({
    layerModalHelperKey: 'password-authentication',
  });

  const handleSubmit = async ({ value, helper }) => {
    if (!value) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>비밀번호를 입력해주세요</em>',
      });

      return;
    }

    await helper.submit({ password: value });

    helper.closeLayerModal({ reason: 'DID_SUBMIT', state: { currentPassword: value } });
  };

  const CLICK_EVENT_HANDLER_MAP = {
    CANCEL: (helper) => {
      helper.closeLayerModal();
    },
    SUBMIT: (helper) => {
      const { passwordAuthenticationForm } = helper.getState();

      handleSubmit({ value: passwordAuthenticationForm.password.value, helper });
    },
  };

  const clickEventListener = ({ target }) => {
    const closetElAction = target.closest('[shopby-action]')?.getAttribute('shopby-action');

    if (closetElAction === 'OPEN_ID_CLICK') {
      const provider = target.closest('[shopby-provider]')?.getAttribute('shopby-provider');

      passwordAuthenticationLayerModalHelper.openIdSignIn({
        nextPath: location.href,
        previousPath: location.href,
        provider,
        redirectUri: `${location.origin}/callback/auth-callback.html`,
      });

      return;
    }

    const action = target.getAttribute('shopby-action');

    CLICK_EVENT_HANDLER_MAP[action]?.(passwordAuthenticationLayerModalHelper);
  };

  const keypressEventListener = ({ target, key }) => {
    const action = target.getAttribute('shopby-action');

    if (key === 'Enter' && action === 'PASSWORD_KEYPRESS') {
      handleSubmit({ helper: passwordAuthenticationLayerModalHelper, value: target.value.trim() });
    }
  };

  containerEl.addEventListener('click', clickEventListener);
  containerEl.addEventListener('keypress', keypressEventListener);
})();
