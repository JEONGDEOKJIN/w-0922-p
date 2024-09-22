(() => {
  const {
    pageHelper,
    EventManager,
    utils: { handleFocusEvent, changePasswordVerifyMap },
  } = ShopbySkin;

  const expiredPasswordChangeFormHelper = pageHelper.expiredPasswordChangeFormHelper();

  const containerEl = document.querySelector('[shopby-helper-key="expired-password-change-form"]');

  expiredPasswordChangeFormHelper.initialize({
    helperKey: 'expired-password-change-form',
  });

  const getFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from');

    const mainUrl = `/`;

    return from ?? decodeURIComponent(mainUrl);
  };

  const checkInvalidPasswordForm = (request) => {
    const errors = Object.keys(changePasswordVerifyMap)?.map((key) => {
      if (!request) {
        return {
          field: 'currentPassword',
          message: '현재 비밀번호를 입력해주세요',
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

  const CLICK_EVENT_HANDLER_MAP = {
    CHANGE_NEXT_TIME: async (helper) => {
      await helper.modifyPassword({
        willChangeNextTime: true,
      });

      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'SUCCESS',
        message: '<em>해당 안내는 90일 뒤에 다시 안내됩니다.</em>',
        onClose: () => location.replace(getFromUrl()),
      });
    },
    SUBMIT: async (helper) => {
      const { expiredPasswordChangeForm } = helper.getState();

      const invalidRequest = checkInvalidPasswordForm(expiredPasswordChangeForm);

      if (invalidRequest?.length) {
        const [error] = invalidRequest;
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>${error.message}</em>`,
          onClose: () => {
            handleFocusEvent({ containerEl, fields: error.field });
          },
        });

        return;
      }
      const { currentPassword, newPassword } = expiredPasswordChangeForm;

      if (currentPassword.value === newPassword.value) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>현재 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.</em>',
          onClose: () => {
            handleFocusEvent({ containerEl, fields: 'newPassword' });
          },
        });

        return;
      }
      try {
        await helper.checkPassword(expiredPasswordChangeForm.currentPassword.value);
        await helper.modifyPassword({
          currentPassword: expiredPasswordChangeForm.currentPassword.value,
          newPassword: expiredPasswordChangeForm.newPassword.value,
          willChangeNextTime: false,
        });

        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'SUCCESS',
          message: '<em>회원님의 비밀번호가 안전하게 변경되었습니다.</em>',
          onClose: () => ShopbySkin.utils.signOut({ redirect: getFromUrl() }),
        });
      } catch (e) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>${e?.error.description}</em>`,
          onClose: () => {
            handleFocusEvent({ containerEl, fields: 'currentPassword' });
          },
        });
      }
    },
  };

  const clickEventListener = ({ target }) => {
    const action = target.getAttribute('shopby-action');

    CLICK_EVENT_HANDLER_MAP[action]?.(expiredPasswordChangeFormHelper);
  };
  containerEl.addEventListener('click', clickEventListener);
})();
