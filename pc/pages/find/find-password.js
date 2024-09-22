(() => {
  const {
    EventManager,
    pageHelper,
    utils: { handleFocusEvent, isSignedIn },
  } = ShopbySkin;

  if (isSignedIn()) {
    if (!document.referrer || location.href === document.referrer) {
      history.back();

      return;
    }
    location.href = document.referrer;
  }

  const findPasswordHelper = pageHelper.findPasswordHelper();

  const containerEl = document.querySelector('[shopby-helper-key="find-password"]');

  findPasswordHelper.initialize({
    helperKey: 'find-password',
  });

  const handleSubmit = async (helper) => {
    const { findAccountBasicInformation } = helper.getState();
    if (!findAccountBasicInformation || !findAccountBasicInformation.memberId) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>아이디를 입력해주세요.</em>',
        onClose: () => {
          handleFocusEvent(containerEl, 'memberId');
        },
      });

      return;
    }

    const { data } = await helper.fetchAccountFindPassword({
      payload: { memberId: findAccountBasicInformation.memberId },
    });

    EventManager.fire('OPEN_LAYER_MODAL', {
      name: 'find-password-authentication',
      data: { ...findAccountBasicInformation, ...data },
    });
  };

  const handleCertificationMobileNo = async (helper) => {
    const { findAccountBasicInformation } = helper.getState();
    if (!findAccountBasicInformation || !findAccountBasicInformation.memberId) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>아이디를 입력해주세요.</em>',
        onClose: () => {
          handleFocusEvent(containerEl, 'memberId');
        },
      });

      return;
    }

    const { data: memberInfo } = await helper.fetchAccountFindPassword({
      payload: { memberId: findAccountBasicInformation.memberId },
    });

    if (!memberInfo.hasCI) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>휴대폰 인증 회원이 아닙니다. 이메일 인증 혹은 휴대폰번호 인증을 진행해주세요</em>',
      });

      return;
    }

    EventManager.fire('OPEN_LAYER_MODAL', {
      name: 'kcp-sms-authentication',
      data: { type: 'FIND_PASSWORD' },
      onClose: async ({ reason, state }) => {
        if (reason === 'DID_SUBMIT') {
          const { data } = await helper.fetchProfileFindId({
            payload: {
              ...state,
              findMethod: 'MOBILE',
            },
          });

          if (!data?.length) {
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'CAUTION',
              message: '<em>회원정보를 찾을 수 없습니다.</em>',
            });

            return;
          }
          const certificatedMemberId = data[0].id;
          if (certificatedMemberId !== findAccountBasicInformation.memberId) {
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'CAUTION',
              message: '<em>회원정보가 일치하지 않습니다.</em>',
            });

            return;
          }
          location.href = `/pages/sign-in/change-password.html?memberId=${findAccountBasicInformation.memberId}&key=${state.key}&findMethod=${findAccountBasicInformation.findMethod}`;
        }
      },
    });
  };

  const clickEventListener = ({ target }) => {
    const action = target.getAttribute('shopby-action');
    switch (action) {
      case 'CERTIFICATION_MOBILE_NO':
        handleCertificationMobileNo(findPasswordHelper);
        break;
      case 'FIND_PASSWORD_SUBMIT':
        handleSubmit(findPasswordHelper);
        break;
      default:
        break;
    }
  };

  containerEl.addEventListener('click', clickEventListener);
})();
