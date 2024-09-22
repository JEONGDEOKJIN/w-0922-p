(() => {
  const { pageHelper, EventManager } = ShopbySkin;
  const findPasswordAuthenticationLayerModalHelper = pageHelper.findPasswordAuthenticationLayerModalHelper();

  findPasswordAuthenticationLayerModalHelper.initialize({
    layerModalHelperKey: 'find-password-authentication',
  });
  const containerEl = document.querySelector('[shopby-layer-modal-helper-key="find-password-authentication"]');

  containerEl.addEventListener('click', async ({ target }) => {
    const action = target.getAttribute('shopby-action');

    if (action === 'AUTHENTICATION_SUBMIT') {
      const { findPasswordTimer, findAccountAuthentication } = findPasswordAuthenticationLayerModalHelper.getState();

      if (findPasswordTimer.isExpiredTime) {
        findPasswordAuthenticationLayerModalHelper.startAuthentication();
      } else {
        if (!findAccountAuthentication || !findAccountAuthentication.certificatedNumber?.length) {
          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'CAUTION',
            message: '<em>인증번호를 입력해주세요.</em>',
          });

          return;
        }
        if (findAccountAuthentication.certificatedNumber?.length < 6) {
          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'CAUTION',
            message: '<em>인증번호는 6자리입니다.</em>',
          });

          return;
        }

        await findPasswordAuthenticationLayerModalHelper.submit(findAccountAuthentication.certificatedNumber);

        const {
          helperState: { parentState },
        } = findPasswordAuthenticationLayerModalHelper.getState();

        const certificationNumber = findAccountAuthentication.certificatedNumber;
        location.href = `/pages/sign-in/change-password.html?memberId=${parentState.memberId}&certificationNumber=${certificationNumber}&findMethod=${parentState.findMethod}`;

        findPasswordAuthenticationLayerModalHelper.closeLayerModal();
      }
    }
  });
})();
