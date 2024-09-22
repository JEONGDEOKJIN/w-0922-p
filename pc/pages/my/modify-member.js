(() => {
  const {
    pageHelper,
    EventManager,
    utils: { changeProfileFormVerifyMap, handleFocusEvent },
  } = ShopbySkin;

  const modifyMemberFormHelper = pageHelper.modifyMemberFormHelper();
  const containerEl = document.querySelector(`[shopby-helper-key="modify-member-form"]`);
  modifyMemberFormHelper.initialize({
    helperKey: 'modify-member-form',
  });

  const flattenRequest = (helper) => {
    const {
      profileBasicInformation,
      profileNicknameInformation,
      profileEmailInformation,
      profileSmsInformation,
      profileCertification,
      profileOptionalInformation,
      termsInformation,
      profileExtraInformation,
    } = helper.getState();

    const selectedCustomTerms = termsInformation?.customTerms.filter(({ checked }) => !!checked).map((term) => term.id);
    return {
      memberName: profileBasicInformation?.memberName,
      password: profileBasicInformation?.password,
      profileConfirm: profileBasicInformation?.passwordConfirm,
      isPasswordEditMode: profileBasicInformation?.isPasswordEditMode,
      ...profileEmailInformation,
      ...profileSmsInformation,
      ...profileCertification,
      ...profileOptionalInformation,
      extraInfo: profileExtraInformation?.extraInfoContents,
      nickname: profileNicknameInformation?.nickname,
      joinTermsAgreements: termsInformation?.terms,
      customTermsNos: selectedCustomTerms,
    };
  };

  const checkInvalidProfileForm = (request) => {
    // eslint-disable-next-line complexity
    const errors = Object.keys(changeProfileFormVerifyMap)?.map((key) => {
      if (!request[key]) {
        return { isValid: true, field: key };
      }

      const value = request?.[key]?.value ?? '';

      switch (key) {
        case 'passwordConfirm':
          return {
            ...changeProfileFormVerifyMap?.[key]({ value, comparisonValue: request?.password?.value }),
            field: key,
          };
        case 'nickname':
          return {
            ...changeProfileFormVerifyMap?.[key]({
              value,
              isDuplicated: request?.nickname?.isDuplicate,
              isRequired: request?.nickname?.isRequired,
            }),
            field: key,
          };
        case 'email':
          return {
            ...changeProfileFormVerifyMap?.[key]({
              value,
              isDuplicated: request?.email?.isDuplicate,
              isRequired: request?.email?.isRequired,
            }),
            field: key,
          };
        case 'mobileNo':
        case 'telephoneNo':
          return {
            ...changeProfileFormVerifyMap?.[key]({ value, isRequired: request?.[key]?.isRequired }),
            field: key,
          };
        case 'detailAddress':
          return {
            ...changeProfileFormVerifyMap?.[key]({
              value,
              zipCode: request?.zipCd,
              isRequired: request?.detailAddress?.isRequired,
            }),
            field: key,
          };
        case 'birthday':
        case 'sex':
          return {
            ...changeProfileFormVerifyMap?.[key]({ value, isRequired: request?.[key]?.isRequired }),
            field: key,
          };
        case 'extraInfo':
          return { ...changeProfileFormVerifyMap?.[key](request.extraInfo), field: key };
        case 'joinTermsAgreements':
          return { ...changeProfileFormVerifyMap?.[key](request.joinTermsAgreements), field: key };
        default:
          return {
            ...changeProfileFormVerifyMap?.[key]({ value, isRequired: request?.[key]?.isRequired }),
            field: key,
          };
      }
    });

    const omittedErrors = errors.filter((error) => {
      if (['password', 'passwordConfirm'].includes(error.field) && !request?.isPasswordEditMode) {
        return false;
      }

      return !error.isValid;
    });

    return omittedErrors;
  };

  // eslint-disable-next-line complexity
  const checkCertificatedValidation = (request) => {
    const invalidEmail = request?.emailCertificationStatus === 'INITIAL';
    const invalidSmsInternalCertification = request?.smsCertificationStatus === 'INITIAL';
    const invalidSmsExternalAuthentication = request?.smsCertificationStatus === 'SMS_AUTHENTICATION' && !request?.ci;

    if (invalidEmail || invalidSmsInternalCertification || invalidSmsExternalAuthentication) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: `<em>${invalidEmail ? '이메일 인증을 진행해 주세요.' : '휴대폰 인증을 진행해 주세요.'}</em>`,
        onClose: () => {
          handleFocusEvent({ containerEl, fields: invalidEmail ? 'email' : 'mobileNo' });
        },
      });

      return false;
    }

    const message = request.certificatedNumber?.length ? '인증을 진행해주세요.' : '인증번호를 입력해주세요.';

    if (request.certificated && (!request.certificated.value || !request.certificated.isValid)) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: `<em>${request.certificated.message ?? message}</em>`,
        onClose: () => {
          handleFocusEvent({ containerEl, fields: 'certificatedNumber' });
        },
      });

      return false;
    }

    return true;
  };

  const checkPasswordAuthentication = (helper) => {
    const {
      helperState,
      profileInformation: { openIdProvider },
    } = helper.getState();

    const { isAuthenticated } = helperState ?? {};
    const isInValidOpenIdAuthentication = openIdProvider && !isAuthenticated;

    if (isInValidOpenIdAuthentication) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        message: '<em>계정 재인증 후 회원정보 수정이 가능합니다.</em>',
        noticeType: 'CAUTION',
      });

      return false;
    }

    return true;
  };

  const CLICK_EVENT_HANDLER_MAP = {
    // eslint-disable-next-line complexity
    EMAIL_CERTIFICATION: async (helper) => {
      const { profileEmailInformation } = helper.getState();

      const isInvalidEmail = profileEmailInformation?.email.value === '@' || !profileEmailInformation?.email.isValid;

      if (isInvalidEmail) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>${profileEmailInformation?.email.message ?? '이메일을 입력해주세요.'}</em>`,
        });

        return;
      }

      if (profileEmailInformation?.emailCertificationStatus === 'INITIAL') {
        await helper.sendCertificationCode(profileEmailInformation.email.value, 'EMAIL');

        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'SUCCESS',
          message: '<em>인증번호가 발송되었습니다.</em>',
        });
      } else {
        EventManager.fire('MODAL_CONFIRM_OPEN', {
          noticeType: 'WARNING',
          message: '<em>인증번호를 재발송하시겠습니까?</em>',
          onConfirm: async () => {
            await helper.sendCertificationCode(profileEmailInformation.email.value, 'EMAIL');

            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'SUCCESS',
              message: '<em>인증번호가 발송되었습니다.</em>',
            });
          },
        });
      }
    },
    // eslint-disable-next-line complexity
    SMS_CERTIFICATION: async (helper) => {
      const { profileSmsInformation } = helper.getState();

      const isInvalidMobileNo = !profileSmsInformation?.mobileNo.value || !profileSmsInformation?.mobileNo.isValid;

      if (isInvalidMobileNo) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>${profileSmsInformation?.mobileNo.message ?? '휴대폰 번호를 입력해주세요.'}</em>`,
        });

        return;
      }

      if (profileSmsInformation?.smsCertificationStatus === 'INITIAL') {
        await helper.sendCertificationCode(profileSmsInformation.mobileNo.value, 'SMS');
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'SUCCESS',
          message: '<em>인증번호가 발송되었습니다.</em>',
        });
      } else {
        EventManager.fire('MODAL_CONFIRM_OPEN', {
          noticeType: 'WARNING',
          message: '<em>인증번호를 재발송하시겠습니까?</em>',
          onConfirm: async () => {
            await helper.sendCertificationCode(profileSmsInformation.mobileNo.value, 'SMS');
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'SUCCESS',
              message: '<em>인증번호가 발송되었습니다.</em>',
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
            ShopbySkin.EventManager.fire('SUCCESS_AUTHENTICATION_SMS', state);
          }
        },
      });
    },
    SEARCH_ZIP_CODE: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        isFull: false,
        modalAddClass: 'search-zip-code',
        name: 'page-zip-code',
        onClose: ({ reason, state }) => {
          if (reason === 'DID_SUBMIT') {
            ShopbySkin.EventManager.fire('SELECT_ZIP_CODE', {
              moduleKey: 'profile-optional-information',
              state,
            });
          }
        },
      });
    },
    SHOW_TERM_DETAIL: ({ elTarget, helper }) => {
      const { termsInformation } = helper.getState();

      if (!termsInformation) {
        return;
      }

      const mergedTerms = [...termsInformation.terms, ...termsInformation.customTerms];

      const selectedTerm = mergedTerms.find((term) => elTarget.getAttribute('shopby-term-id') === term.id.toString());
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'term-detail',
        data: selectedTerm,
      });
    },
    MODIFY: async (helper) => {
      const flattedRequest = flattenRequest(helper);
      const invalidRequest = checkInvalidProfileForm(flattedRequest);

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

      if (!checkCertificatedValidation(flattedRequest)) {
        return;
      }

      if (!checkPasswordAuthentication(helper)) {
        return;
      }

      await helper.modify({ ...flattedRequest });
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'SUCCESS',
        message: '<em>회원정보가 수정되었습니다.</em>',
        onClose: () => location.replace(`${location.origin}/pages/my/my-page.html`),
      });
    },
    CANCEL_MODIFY: () => {
      location.replace('/pages/my/my-page.html');
    },
  };

  const clickEventListener = ({ target }) => {
    const action = target.getAttribute('shopby-action');
    if (action === 'SHOW_TERM_DETAIL') {
      CLICK_EVENT_HANDLER_MAP[action]?.({
        helper: modifyMemberFormHelper,
        elTarget: target,
      });
    } else {
      CLICK_EVENT_HANDLER_MAP[action]?.(modifyMemberFormHelper);
    }
  };
  containerEl.addEventListener('click', clickEventListener);
})();
