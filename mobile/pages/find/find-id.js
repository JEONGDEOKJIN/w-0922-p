(() => {
  const {
    EventManager,
    pageHelper,
    constants: { REG_EX_FOR_CHECK_FORMAT },
    utils: { makeVerificationResult, handleFocusEvent, isSignedIn },
  } = ShopbySkin;

  if (isSignedIn()) {
    if (!document.referrer || location.href === document.referrer) {
      history.back();

      return;
    }
    location.href = document.referrer;
  }

  const findIdHelper = pageHelper.findIdHelper();

  const containerEl = document.querySelector('[shopby-helper-key="find-id"]');

  findIdHelper.initialize({
    helperKey: 'find-id',
  });

  const verificationMap = {
    memberName: (memberName) => {
      if (!memberName) {
        return makeVerificationResult({
          reason: '이름을 입력해주세요.',
          fields: ['memberName'],
        });
      }

      return makeVerificationResult();
    },
    // eslint-disable-next-line default-param-last
    email: ({ value = '@', findMethod }) => {
      if (findMethod !== 'EMAIL') {
        return makeVerificationResult();
      }

      const [id, domain] = value.split('@');

      if (!id || !domain) {
        return makeVerificationResult({
          reason: '이메일을 입력해주세요',
          fields: ['email'],
        });
      }

      const isInvalidEmail =
        !id.match(REG_EX_FOR_CHECK_FORMAT.EMAIL_ID) || !domain.match(REG_EX_FOR_CHECK_FORMAT.EMAIL_DOMAIN);

      if (isInvalidEmail) {
        return makeVerificationResult({
          reason: '입력된 이메일은 잘못된 형식입니다.',
          fields: ['email'],
        });
      }

      return makeVerificationResult();
    },
    mobileNo: ({ value, findMethod }) => {
      if (findMethod !== 'SMS') {
        return makeVerificationResult();
      }

      const REQUIRED_MOBILE_NUMBER_SIZE = 10;

      if (!value) {
        return makeVerificationResult({
          reason: '휴대폰번호를 입력해주세요.',
          fields: ['mobileNumber'],
        });
      }

      if (value.length < REQUIRED_MOBILE_NUMBER_SIZE) {
        return makeVerificationResult({
          reason: '정확한 휴대폰번호를 입력해주세요.',
          fields: ['mobileNumber'],
        });
      }

      return makeVerificationResult();
    },
  };

  const handleSubmit = async (helper) => {
    const { findAccountBasicInformation } = helper.getState();

    const errors = Object.keys(verificationMap)?.map((key) => {
      if (!findAccountBasicInformation) {
        return makeVerificationResult({
          reason: '이름을 입력해주세요.',
          fields: ['memberName'],
        });
      }

      if (['email', 'mobileNo'].includes(key)) {
        return verificationMap?.[key]({
          value: findAccountBasicInformation[key],
          findMethod: findAccountBasicInformation.findMethod,
        });
      }

      return verificationMap?.[key](findAccountBasicInformation[key]);
    });

    const [firstErrorField] = errors.filter(({ reason }) => !!reason);

    if (firstErrorField) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: `<em>${firstErrorField.reason}</em>`,
        onClose: () => handleFocusEvent({ containerEl, fields: firstErrorField.fields }),
      });

      return;
    }
    const { data } = await helper.fetchProfileFindId({ payload: findAccountBasicInformation });

    if (!data?.length) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>회원정보를 찾을 수 없습니다.</em>',
      });

      return;
    }
    EventManager.fire('OPEN_LAYER_MODAL', { name: 'find-id-result', data });
  };
  const clickEventListener = ({ target }) => {
    const action = target.getAttribute('shopby-action');
    switch (action) {
      case 'CERTIFICATION_MOBILE_NO':
        EventManager.fire('OPEN_LAYER_MODAL', {
          name: 'kcp-sms-authentication',
          data: { type: 'FIND_ID' },
          onClose: async ({ reason, state }) => {
            if (reason === 'DID_SUBMIT') {
              const { data } = await findIdHelper.fetchProfileFindId({
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

              EventManager.fire('OPEN_LAYER_MODAL', { name: 'find-id-result', data });
            }
          },
        });
        break;
      case 'FIND_ID_SUBMIT':
        handleSubmit(findIdHelper);
        break;
      default:
        break;
    }
  };
  containerEl.addEventListener('click', clickEventListener);
})();
