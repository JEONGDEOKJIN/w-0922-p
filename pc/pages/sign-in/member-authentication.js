(() => {
  const {
    pageHelper,
    EventManager,
    utils: { getLocalStorage },
  } = ShopbySkin;

  const memberAuthenticationHelper = pageHelper.memberAuthenticationHelper();
  const containerEl = document.querySelector(`[shopby-helper-key="member-authentication"]`);

  memberAuthenticationHelper.initialize({
    helperKey: 'member-authentication',
  });

  const getFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);

    const from = searchParams.get('from');

    const mainUrl = '/';
    return decodeURIComponent(from || mainUrl);
  };

  const fetchDirectUrl = async (helper) => {
    try {
      const payload = JSON.parse(getLocalStorage('REGISTER_ORDER_AFTER_AUTHENTICATION'));
      if (!payload) {
        location.replace(getFromUrl());

        return;
      }

      const { data: orderSheet } = await helper.makeOrderSheet(payload);

      const orderSheetNoURL = orderSheet.orderSheetNo
        ? `/pages/order/order-sheet-form.html?ordersheetNo=${orderSheet.orderSheetNo}`
        : getFromUrl();
      location.replace(orderSheetNoURL);
    } catch (e) {
      location.replace(getFromUrl());
    }
  };

  const handleCertificationSubmit = async ({ helper, contactInfo, certificationInfo }) => {
    if (!certificationInfo) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>인증을 진행해주세요.</em>',
      });

      return;
    }

    const { certificatedNumber, certificationType: type } = certificationInfo;

    if (!certificatedNumber) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>인증 번호를 입력해주세요.</em>',
      });

      return;
    }

    const usage = `CHANGE_${type === 'SMS' ? 'MOBILE_NO' : 'EMAIL'}`;

    await helper.fetchAuthentications({
      type,
      certificatedNumber,
      usage,
      notiAccount: contactInfo,
    });

    EventManager.fire('END_TIMER');
    EventManager.fire(`SUCCESS_CERTIFICATION_${type}`);

    const payload =
      type === 'EMAIL' ? { email: contactInfo, certificated: true } : { mobileNo: contactInfo, certificated: true };

    await helper.modify({ ...payload, version: '1.0' });

    EventManager.fire('MODAL_ALERT_OPEN', {
      noticeType: 'SUCCESS',
      message: '<em>인증이 완료되었습니다.</em>',
      onClose: async () => await fetchDirectUrl(helper),
    });
  };

  const CLICK_EVENT_HANDLER_MAP = {
    EMAIL_CERTIFICATION: async (helper) => {
      const { emailMemberAuthentication } = helper.getState();

      const isInvalidEmail =
        emailMemberAuthentication?.email.value === '@' || !emailMemberAuthentication?.email.isValid;

      if (isInvalidEmail) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>${emailMemberAuthentication?.email.message ?? '이메일을 입력해주세요.'}</em>`,
        });

        return;
      }

      if (emailMemberAuthentication?.emailCertificationStatus === 'INITIAL') {
        await helper.sendCertificationCode(emailMemberAuthentication.email.value, 'EMAIL');

        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'SUCCESS',
          message: '<em>인증번호가 발송되었습니다.<br>이메일로 발송된 인증번호를 입력하여 인증을 완료해 주세요.</em>',
        });
      } else {
        EventManager.fire('MODAL_CONFIRM_OPEN', {
          noticeType: 'WARNING',
          message: '<em>인증번호를 재발송하시겠습니까?</em>',
          onConfirm: async () => {
            await helper.sendCertificationCode(emailMemberAuthentication.email.value, 'EMAIL');

            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'SUCCESS',
              message:
                '<em>인증번호가 발송되었습니다.<br>이메일로 발송된 인증번호를 입력하여 인증을 완료해 주세요.</em>',
            });
          },
        });
      }
    },
    SMS_CERTIFICATION: async (helper) => {
      const { smsMemberAuthentication } = helper.getState();

      const isInvalidMobileNo = !smsMemberAuthentication?.mobileNo.value || !smsMemberAuthentication?.mobileNo.isValid;

      if (isInvalidMobileNo) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>${smsMemberAuthentication?.mobileNo.message ?? '휴대폰 번호를 입력해주세요.'}</em>`,
        });

        return;
      }

      if (smsMemberAuthentication?.smsCertificationStatus === 'INITIAL') {
        await helper.sendCertificationCode(smsMemberAuthentication.mobileNo.value, 'SMS');
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'SUCCESS',
          message:
            '<em>인증번호가 발송되었습니다.<br>휴대폰 번호로 발송된 인증번호를 입력하여 인증을 완료해 주세요.</em>',
        });
      } else {
        EventManager.fire('MODAL_CONFIRM_OPEN', {
          noticeType: 'WARNING',
          message: '<em>인증번호를 재발송하시겠습니까?</em>',
          onConfirm: async () => {
            await helper.sendCertificationCode(smsMemberAuthentication.mobileNo.value, 'SMS');
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'SUCCESS',
              message:
                '<em>인증번호가 발송되었습니다.<br>휴대폰 번호로 발송된 인증번호를 입력하여 인증을 완료해 주세요.</em>',
            });
          },
        });
      }
    },
    AUTHENTICATION_BY_PHONE: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'kcp-sms-authentication',
        data: { type: 'JOIN_TIME' },
        onClose: ({ reason, state }) => {
          if (reason === 'DID_SUBMIT') {
            const { exist } = state;
            if (exist) {
              EventManager.fire('MODAL_ALERT_OPEN', {
                noticeType: 'CAUTION',
                message: `<em>휴대폰번호가 이미 사용중입니다.</em>`,
              });

              return;
            }

            ShopbySkin.EventManager.fire('SUCCESS_AUTHENTICATION_SMS_PAYMENT_TIME', state);
          }
        },
      });
    },
    EMAIL_AUTHENTICATION_SUBMIT: async (helper) => {
      const { emailCertification, emailMemberAuthentication } = helper.getState();

      await handleCertificationSubmit({
        helper,
        contactInfo: emailMemberAuthentication.email.value,
        certificationInfo: emailCertification,
      });
    },
    SMS_AUTHENTICATION_SUBMIT: async (helper) => {
      const { smsCertification, smsMemberAuthentication } = helper.getState();

      await handleCertificationSubmit({
        helper,
        contactInfo: smsMemberAuthentication.mobileNo.value,
        certificationInfo: smsCertification,
      });
    },
    AUTHENTICATION_BY_PHONE_SUBMIT: async (helper) => {
      const { memberAuthenticationResult } = helper.getState();
      await helper.authenticationByPhone(memberAuthenticationResult.key);

      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'SUCCESS',
        message: '<em>인증이 완료되었습니다.</em>',
        onClose: async () => await fetchDirectUrl(helper),
      });
    },
    CLOSE: () => {
      if (!document.referrer || location.href === document.referrer) {
        history.back();

        return;
      }
      location.href = document.referrer;
    },
  };

  const clickEventListener = ({ target }) => {
    const action = target.getAttribute('shopby-action');

    CLICK_EVENT_HANDLER_MAP[action]?.(memberAuthenticationHelper);
  };

  containerEl.addEventListener('click', clickEventListener);
})();
