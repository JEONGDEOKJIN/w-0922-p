(() => {
  const {
    EventManager,
    pageHelper,
    utils: { handleFocusEvent, changePasswordVerifyMap, isSignedIn },
  } = ShopbySkin;

  if (isSignedIn()) {
    if (!document.referrer || location.href === document.referrer) {
      history.back();

      return;
    }
    location.href = document.referrer;
  }

  const changePasswordHelper = pageHelper.changePasswordHelper();

  changePasswordHelper.initialize({
    helperKey: 'change-password',
  });

  const containerEl = document.querySelector('password-change-form');

  const checkInvalidPasswordForm = (request) => {
    const changePasswordVerifyMapKeys = Object.keys(changePasswordVerifyMap).filter((key) => key !== 'currentPassword');

    const errors = changePasswordVerifyMapKeys?.map((key) => {
      if (!request) {
        return {
          field: 'newPassword',
          message: '새로운 비밀번호를 입력해주세요',
          isValid: false,
        };
      }
      const value = request[key]?.value ?? '';

      if (key !== 'newPasswordConfirm') {
        return { ...changePasswordVerifyMap?.[key](value), field: key };
      }

      return {
        ...changePasswordVerifyMap?.[key](value, request.newPassword?.value),
        field: key,
      };
    });

    return errors.filter((error) => !error.isValid);
  };

  const clickEventListener = async ({ target }) => {
    const action = target.getAttribute('shopby-action');

    if (action === 'SUBMIT') {
      const { changePassword } = changePasswordHelper.getState();

      const invalidRequest = checkInvalidPasswordForm(changePassword);

      if (invalidRequest?.length) {
        const [error] = invalidRequest;
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>${error.message}</em>`,
          onClose: () => {
            handleFocusEvent({ containerEl, fields: error.field });
            EventManager.fire('INVALID_PROFILE_FORM', {
              data: invalidRequest,
            });
          },
        });

        return;
      }

      const searchParams = new URLSearchParams(decodeURIComponent(location.search));
      const params = Object.fromEntries(searchParams.entries());

      await changePasswordHelper.submit({
        certificationNumber: params?.certificationNumber,
        findMethod: params?.findMethod,
        key: params?.key,
        memberId: params?.memberId,
        newPassword: changePassword.newPassword.value,
      });

      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'SUCCESS',
        message: `<em>비밀번호가 변경되었습니다.</em>`,
        onClose: () => {
          location.href = `/pages/sign-in/sign-in.html`;
        },
      });
    }
  };

  containerEl.addEventListener('click', clickEventListener);
})();
