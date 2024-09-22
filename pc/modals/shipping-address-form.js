(() => {
  const {
    pageHelper,
    EventManager,
    utils: { makeVerificationResult, handleFocusEvent },
    constants,
  } = ShopbySkin;

  const shippingAddressFormLayerModalHelper = pageHelper.shippingAddressFormLayerModalHelper();

  const containerEl = document.querySelector('[shopby-layer-modal-helper-key="shipping-address-form"]');

  const addressNo = new URLSearchParams(location.search).get('addressNo');

  shippingAddressFormLayerModalHelper.initialize({
    layerModalHelperKey: 'shipping-address-form',
    addressNo,
  });

  const getOnlyNumber = (value) => value?.replace(constants.REG_EX_FOR_VALIDATION.NUMBER, '');

  const verificationMap = {
    checkReceiverName({ receiverName }) {
      if (!receiverName) {
        return makeVerificationResult({
          reason: '받는사람을 입력해주세요.',
          fields: ['receiverName'],
        });
      }

      return makeVerificationResult();
    },
    checkAddressInfo({ receiverAddress, receiverZipCd, receiverDetailAddress }) {
      const reason = '주소를 입력해주세요.';

      if (!receiverZipCd || !receiverAddress) {
        return makeVerificationResult({
          reason,
          fields: ['zipCode'],
        });
      }

      if (!receiverDetailAddress) {
        return makeVerificationResult({
          reason,
          fields: ['detailAddress'],
        });
      }

      return makeVerificationResult();
    },
    checkMobileNumber({ receiverContact1 }) {
      const REQUIRED_MOBILE_NUMBER_SIZE = 11;

      if (!receiverContact1) {
        return makeVerificationResult({
          reason: '휴대폰번호를 입력해주세요.',
          fields: ['mobileNumber'],
        });
      }

      if (getOnlyNumber(receiverContact1).length < REQUIRED_MOBILE_NUMBER_SIZE) {
        return makeVerificationResult({
          reason: '정확한 휴대폰번호를 입력해주세요.',
          fields: ['mobileNumber'],
        });
      }

      return makeVerificationResult();
    },
    checkPhoneNumber({ receiverContact2 }) {
      const REQUIRED_PHONE_NUMBER_SIZE = 9;

      if (!receiverContact2) {
        return makeVerificationResult();
      }

      if (getOnlyNumber(receiverContact2).length < REQUIRED_PHONE_NUMBER_SIZE) {
        return makeVerificationResult({
          reason: '정확한 전화번호를 입력해주세요.',
          fields: ['phoneNumber'],
        });
      }

      return makeVerificationResult();
    },
  };

  const makeRequest = (prevState = {}) => {
    const {
      myShippingAddressAddressInformation: {
        address,
        detailAddress,
        jibunAddress,
        zipCode,
        countryCd,
        city,
        state,
        firstName,
      } = {},
      myShippingAddressBasicInformation,
      myShippingAddressExtraInformation,
      myShippingAddressContactInformation,
    } = shippingAddressFormLayerModalHelper.getState();

    return {
      ...prevState,
      ...myShippingAddressBasicInformation,
      ...myShippingAddressExtraInformation,
      receiverAddress: address,
      receiverDetailAddress: detailAddress,
      receiverJibunAddress: jibunAddress,
      receiverZipCd: zipCode,
      receiverContact1: myShippingAddressContactInformation?.mobileNumber,
      receiverContact2: myShippingAddressContactInformation?.phoneNumber,
      addressType: 'BOOK',
      receiverState: state || null,
      receiverCity: city || null,
      countryCd: countryCd || null,
      receiverFirstName: firstName || null,
    };
  };

  const CLICK_EVENT_HANDLER_MAP = {
    CANCEL: ({ helper }) => {
      helper.closeLayerModal();
    },
    MODIFY: async ({ helper, e }) => {
      e.preventDefault();

      const { reason, fields } = await helper.modify(makeRequest, verificationMap);

      if (reason) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>${reason}</em>`,
          onClose: () => {
            handleFocusEvent({
              containerEl,
              fields,
            });
          },
        });
      }
    },
    SUBMIT: async ({ helper, e }) => {
      e.preventDefault();

      const { reason, fields } = await helper.submit(makeRequest, verificationMap);

      if (reason) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>${reason}</em>`,
          onClose: () => {
            handleFocusEvent({
              containerEl,
              fields,
            });
          },
        });
      }
    },
    SEARCH_SHIPPING_ADDRESS_FORM_ZIP_CODE: ({ helper }) => {
      helper.openLayerModal({
        isFull: false,
        modalAddClass: 'search-zip-code',
        name: 'shipping-address-form-zip-code',
        title: '주소찾기',
        onClose: ({ reason, state }) => {
          if (reason === 'DID_SUBMIT') {
            ShopbySkin.EventManager.fire('SELECT_ZIP_CODE', {
              state,
            });
          }
        },
      });
    },
  };

  const clickEventListener = (e) => {
    const action = e.target.getAttribute('shopby-action');

    CLICK_EVENT_HANDLER_MAP[action]?.({
      e,
      helper: shippingAddressFormLayerModalHelper,
    });
  };

  containerEl.addEventListener('click', clickEventListener);
})();
