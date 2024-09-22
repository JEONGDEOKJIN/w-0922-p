(function () {
  const { EventManager, utils, pageHelper, constants } = ShopbySkin;

  const { isMobileDevice, createPageScriptInstance } = utils;
  const { REG_EX_FOR_VALIDATION } = constants;

  const loginUrl = '/pages/sign-in/sign-in.html';

  const orderSheetFormHelper = pageHelper.orderSheetFormHelper();
  const containerEl = document.body;

  orderSheetFormHelper.initialize({ orderSheetNo: getOrderSheetNo() });

  const ordererInfoInstance = containerEl.querySelector('orderer-info');

  // eslint-disable-next-line complexity
  function checkValidationPassword(password) {
    if (password.length < 8 || password.length > 20) {
      return 'errorMessageInvalidPasswordLength';
    }
    const patternNumber = /[0-9]/g;
    const patternEnglish = /[a-zA-Z]/g;
    const patternSpecial = /[!@#$%^&+=\-_.()]/g;

    const checkNumber = patternNumber.test(password) ? 1 : 0;
    const checkEnglish = patternEnglish.test(password) ? 1 : 0;
    const checkSpecial = patternSpecial.test(password) ? 1 : 0;
    const checkSum = checkNumber + checkEnglish + checkSpecial;

    if (password.length < 10 && checkSum < 3) {
      return 'errorMessageInvalidPassword';
    }
    if (checkSum < 2) {
      return 'errorMessageLessInvalidPassword';
    }

    return '';
  }

  ordererInfoInstance.setCheckValidationPasswordHandler(checkValidationPassword);

  function getOrderSheetNo() {
    const { href } = globalThis.location;
    const url = new URL(href);
    const params = new URLSearchParams(url.search);

    return params.get('ordersheetNo') || params.get('orderSheetNo') || params.get('ordersheetno');
  }

  function executePageScript() {
    const scriptPlatformType = isMobileDevice ? 'MOBILE' : 'PC';
    const pageScriptInstance = createPageScriptInstance(scriptPlatformType);

    pageScriptInstance.appendPageScript('PAGE_SCRIPT', 'ORDER');
  }

  // eslint-disable-next-line complexity
  EventManager.on('PAGE_LOAD_COMPLETED', async () => {
    if (!getOrderSheetNo()) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>주문번호가 없습니다.</em>',
      });
    }

    try {
      await orderSheetFormHelper.fetchData();

      executePageScript();
    } catch (e) {
      if (e.isMyPayInfoError) {
        executePageScript();

        return;
      }

      if (e.error) {
        const { code, description } = e.error;

        const replacedUrl = {
          main: '/index.html',
          CECO003: `${loginUrl}?from=${encodeURIComponent(location.href)}`,
        }[code || 'main'];

        EventManager.fire('MODAL_ALERT_OPEN', {
          message: `<em>${description}</em>`,
          noticeType: 'CAUTION',
          onClose: () => {
            if (replacedUrl) {
              location.replace(replacedUrl);
            }
          },
        });
      }
    }
  });

  containerEl.addEventListener('input', (evt) => {
    const { target } = evt;

    const validationCheckInput = target.closest('input[shopby-valid]');

    if (!validationCheckInput) {
      return;
    }

    const valid = target.getAttribute('shopby-valid');
    const maxLength = target.getAttribute('maxlength');

    if (maxLength) {
      const maxLengthValue = Number(maxLength);
      const { value } = target;

      if (value.length > maxLength) {
        validationCheckInput.value = value.slice(0, maxLengthValue);
      }
    }

    if (validationCheckInput && valid) {
      const { value } = target;
      const validRegEx = valid.split(',');

      validationCheckInput.value = validRegEx.reduce((acc, cur) => acc.replace(REG_EX_FOR_VALIDATION[cur], ''), value);
    }

    validationCheckInput.value = validationCheckInput.value.trim();
  });

  const validationMap = {
    ordererName: (value) => {
      if (!value) {
        return {
          message: '주문자 명을 입력해주세요.',
          slotName: 'ordererInfo.ordererName',
        };
      }

      return false;
    },
    emailId: (value) => {
      if (!value) {
        return {
          message: '이메일 아이디를 입력해주세요.',
          slotName: 'ordererInfo.emailId',
        };
      }

      return false;
    },
    emailDomain: (value) => {
      if (!value) {
        return {
          message: '이메일 도메인을 입력해주세요.',
          slotName: 'ordererInfo.emailDomain',
        };
      }

      return false;
    },
    ordererContact1: (value) => {
      const MIN_CONTACT_LENGTH = 10;
      const slotName = 'ordererInfo.ordererContact1';

      if (!value) {
        return {
          message: '주문자 휴대폰 번호를 입력해주세요.',
          slotName,
        };
      }

      if (value.length < MIN_CONTACT_LENGTH) {
        return {
          message: '휴대폰번호는 10자~12자 이내로 입력해주세요.',
          slotName,
        };
      }

      return false;
    },
    receiverName: (value) => {
      if (!value) {
        return {
          message: '받는 사람을 입력해주세요',
          slotName: 'shippingInfo.receiverName',
        };
      }

      return false;
    },
    receiverAddress: (value) => {
      if (!value) {
        return {
          message: '주소를 입력해주세요.',
          slotName: 'shippingInfo.receiverAddress',
        };
      }

      return false;
    },
    receiverDetailAddress: (value) => {
      if (!value) {
        return {
          message: '상세 주소를 입력해주세요.',
          slotName: 'shippingInfo.receiverDetailAddress',
        };
      }

      return false;
    },
    receiverContact1: (value) => {
      const MIN_CONTACT_LENGTH = 10;
      const slotName = 'shippingInfo.receiverContact1';

      if (!value) {
        return {
          message: '받는 사람 휴대폰 번호를 입력해주세요.',
          slotName,
        };
      }

      if (value.length < MIN_CONTACT_LENGTH) {
        return {
          message: '휴대폰번호는 10자~12자 이내로 입력해주세요.',
          slotName,
        };
      }

      return false;
    },
    password: (value) => {
      if (!value) {
        return {
          message: '주문 비밀번호를 입력해주세요.',
          slotName: 'guestInfo.password',
        };
      }

      return false;
    },
    passwordForConfirmation: (value) => {
      if (!value) {
        return {
          message: '주문 비밀번호 확인란을 입력해주세요.',
          slotName: 'guestInfo.passwordForConfirmation',
        };
      }

      return false;
    },
    customsIdNumber: (value) => {
      if (!value) {
        return {
          message: '개인통관고유부호를 입력해주세요.',
          slotName: 'shippingInfo.customsIdNumber',
        };
      }

      if (!/\bp\d{12}\b/i.test(value)) {
        return {
          message: '개인통관고유부호가 유효하지 않습니다.',
          slotName: 'shippingInfo.customsIdNumber',
        };
      }

      return false;
    },
  };

  const closeAlertAfter = (slotName) => () => {
    if (slotName === 'shippingInfo.receiverAddress') {
      // '주소' 입력란이 무효할 때 [우편번호 찾기]버튼 포커스
      const findZipCodeBtn = containerEl.querySelector('.order-sheet__find-zip-code-btn');

      findZipCodeBtn?.focus();

      return;
    }

    const inputField = document.body.querySelector(`[slot="${slotName}"]`);

    if (inputField) {
      inputField.focus();
    }
  };

  const checkValidation = ({ data, fields }) => {
    let errorInfo = null;

    for (let i = 0; i < fields.length; i += 1) {
      const fieldName = fields[i];

      if (!validationMap[fieldName]) {
        continue;
      }
      const error = validationMap[fieldName](_.get(data, fieldName)?.trim(), data);

      if (error) {
        errorInfo = error;
        break;
      }
    }

    if (errorInfo?.message) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: `<em>${errorInfo.message}</em>`,
        onClose: closeAlertAfter(errorInfo.slotName),
      });

      return false;
    }

    return true;
  };

  // eslint-disable-next-line complexity
  const handlePayBtnClick = async () => {
    const formData = orderSheetFormHelper.getFormData();

    const {
      ordererInfo,
      shippingInfo,
      orderSheetTerms,
      hasDeliverableProduct,
      guestInfo,
      hasInternationalShippingProduct,
      payMethods,
      blockUseAccumulationWhenUseCoupon,
      selectedCoupon,
      accumulationInputValue,
    } = formData;

    const isValidOrdererInfo = checkValidation({
      data: ordererInfo,
      fields: ['ordererName', 'emailId', 'emailDomain', 'ordererContact1'],
    });

    if (!isValidOrdererInfo) {
      return;
    }

    if (!utils.isSignIn()) {
      const isValidGuestInfo = checkValidation({
        data: guestInfo,
        fields: ['password', 'passwordForConfirmation'],
      });

      const password = _.get(guestInfo, 'password');
      const passwordConfirm = _.get(guestInfo, 'passwordForConfirmation');

      const isSamePassword = password === passwordConfirm;

      if (!isValidGuestInfo) {
        return;
      }

      if (!isSamePassword) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>입력하신 주문 비밀번호가 일치하지 않습니다.</em>',
          onClose: closeAlertAfter('guestInfo.password'),
        });

        return;
      }
    }

    const isValidShippingInfo = checkValidation({
      data: shippingInfo,
      fields: ['receiverName', 'receiverAddress', 'receiverDetailAddress', 'receiverContact1'],
    });

    if (hasDeliverableProduct && !isValidShippingInfo) {
      return;
    }

    if (hasInternationalShippingProduct) {
      // 해외 배송일 때 개인통관고유부호 확인
      const isValidCustomIdNumber = checkValidation({
        data: shippingInfo,
        fields: ['customsIdNumber'],
      });

      if (!isValidCustomIdNumber) {
        return;
      }
    }

    const isNotValidCheckedTerms = orderSheetTerms.filter(({ required }) => required).some(({ checked }) => !checked);

    if (isNotValidCheckedTerms) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>필수 약관을 확인해 주세요.</em>',
        onClose: () => {
          const termCheckBox = containerEl.querySelector('input[shopby-term-id]');

          termCheckBox?.focus();
        },
      });

      return;
    }

    const { cartCouponIssueNo, productCoupons } = selectedCoupon;
    const isCouponSelected = cartCouponIssueNo || productCoupons?.length;
    const isAccumulationExist = accumulationInputValue > 0;
    const isInvalidCouponAndAccumulation = blockUseAccumulationWhenUseCoupon && isCouponSelected && isAccumulationExist;

    if (isInvalidCouponAndAccumulation) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>쿠폰, 적립금을 함께 사용하실 수 없습니다.</em>',
        onClose: () => {
          const inputField = containerEl.querySelector(`[slot=accumulationInputValue]`);
          inputField?.focus();
        },
      });

      return;
    }

    if (!payMethods.selectedPayMethod) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>결제 가능한 수단이 존재하지 않습니다.</em>',
      });

      return;
    }

    const { pgType: selectedPgType, payType: selectedPayType } = payMethods.selectedPayMethod;

    if (selectedPgType === 'MY_PAY') {
      await orderSheetFormHelper.applyMyPayCustomCss();
    }

    const isPgTypeNone = selectedPgType === 'NONE';
    const isDepositWithoutBankbook = selectedPayType === 'ACCOUNT' && isPgTypeNone; // 무통장 입금 여부
    const isOnlyAccumulation = selectedPayType === 'ACCUMULATION' && isPgTypeNone; // 적립금 전액 사용 여부
    const isPgProgressLayerModalNeeded = !isDepositWithoutBankbook && !isOnlyAccumulation; // PG 진행 레이어 노출이 필요하지 않을 때

    const payBtn = containerEl.querySelector('.order-sheet__pay-btn');

    try {
      payBtn?.setAttribute('disabled', '');
      if (isPgProgressLayerModalNeeded) {
        EventManager.fire('OPEN_LAYER_MODAL', {
          name: 'payment-progress',
          modalAddClass: 'payment-progress-layer-modal',
          isFull: false,
          onClose: () => {
            payBtn?.removeAttribute('disabled');
          },
        });
      }

      await orderSheetFormHelper.pay({
        platform: isMobileDevice ? 'MOBILE_WEB' : 'PC',
        confirmUrl: `${location.origin}/pages/order/order-confirm.html?deliverable=${
          hasDeliverableProduct ? 'Y' : 'N'
        }`,
      });
    } catch (e) {
      console.error('결제 오류 발생!', e);
      if (isPgProgressLayerModalNeeded) {
        EventManager.fire('CLOSE_PAYMENT_PROGRESS_LAYER_MODAL');
      }

      if (e.error?.description) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>${e.error?.description}</em>`,
        });
      } else {
        EventManager.fire('OPEN_LAYER_MODAL', {
          name: 'pg-progress',
          modalAddClass: 'pg-progress-layer-modal',
          isFull: false,
        });
      }

      payBtn?.removeAttribute('disabled');
    } finally {
      payBtn?.removeAttribute('disabled');
    }
  };

  const modifyMainMyPayPayment = async (el) => {
    const payToken = el.getAttribute('shopby-pay-token');
    const {
      myPayMode: { myPayPaymentInfos = [] },
    } = orderSheetFormHelper.getFormData();

    const foundPayment = myPayPaymentInfos.find((payment) => payToken === payment.payToken);

    if (foundPayment) {
      const { main, payMethod } = foundPayment;

      if (!main) {
        const isRegisteredMainMyPayPayment = myPayPaymentInfos
          .filter((paymentInfo) => paymentInfo.payMethod === payMethod)
          .some(({ main: pMain }) => pMain);

        if (isRegisteredMainMyPayPayment) {
          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'CAUTION',
            message:
              '<em>이미 주 결제수단이 설정되어 있습니다. \n 기존 설정되어 있는 결제수단을 해지 후 설정해 주세요.</em>',
          });

          return;
        }
      }

      await orderSheetFormHelper.actions.modifyMainPayment({ payToken });

      await orderSheetFormHelper.actions.fetchMyPayInfo();
    }
  };

  function openApplyCouponModal() {
    const {
      selectedCoupon: initialSelectedCoupon,
      blockUseAccumulationWhenUseCoupon,
      accumulationInputValue,
    } = orderSheetFormHelper.getFormData();

    EventManager.fire('OPEN_LAYER_MODAL', {
      name: 'apply-coupon',
      data: {
        commonData: orderSheetFormHelper.commonData,
        orderSheetNo: getOrderSheetNo(),
        initialSelectedCoupon,
        blockUseAccumulationWhenUseCoupon,
        accumulationInputValue,
      },
      onClose: async ({ reason, state }) => {
        if (reason === 'DID_SUBMIT') {
          const successHandler = () => {
            ShopbySkin.EventManager.fire('APPLY_COUPON_ON_ORDER_SHEET', {
              moduleKey: 'promotion-info,',
              state,
            });
          };

          const { accumulationInputValue, selectedCoupon, productCouponCount, cartCouponCount } = state;

          await fetchPaymentInfo(
            {
              selectedCoupon,
              accumulationUseAmt: Number(accumulationInputValue),
              productCouponCount,
              cartCouponCount,
            },
            successHandler
          );
        }
      },
    });
  }

  // eslint-disable-next-line complexity
  async function fetchPaymentInfo(
    { selectedCoupon, productCouponCount, cartCouponCount, accumulationUseAmt, ...rest },
    successHandler
  ) {
    orderSheetFormHelper.updatePaymentInfo({
      selectedCoupon,
      accumulationUseAmt,
      productCouponCount,
      cartCouponCount,
      ...rest,
    });

    try {
      const res = await orderSheetFormHelper.fetchPaymentInfo(orderSheetFormHelper.paymentInfo);

      const { cartCouponApplied = true, productCoupons = [] } = res?.data?.appliedCoupons ?? {};

      const isImpossibleCartCoupon = selectedCoupon.cartCouponIssueNo > 0 && !cartCouponApplied;
      const isImpossibleProductCouponIncluded =
        selectedCoupon.productCoupons.length > 0 && productCoupons.some(({ couponApplied }) => !couponApplied);

      if (isImpossibleCartCoupon || isImpossibleProductCouponIncluded) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>선택한 쿠폰에 적용이 불가한 쿠폰이 포함되어 있습니다.</em>`,
        });
      } else if (typeof successHandler === 'function') {
        successHandler();
      }
    } catch (e) {
      const error = e?.error;

      if (error) {
        const errorCode = error?.code;
        if (errorCode) {
          const regExp = /^C\d+/gi; // code가 CXXXXX이면 쿠폰 이슈이므로 쿠폰 창을 새로 띄어주어야한다.
          const matchResult = errorCode.match(regExp);

          // eslint-disable-next-line max-depth
          if (matchResult?.length) {
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'CAUTION',
              message: `<em>${error.description}</em>`,
              onClose: () => {
                openApplyCouponModal();
              },
            });
          } else {
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'CAUTION',
              message: `<em>${error.description}</em>`,
            });
          }
        }
      }
    }
  }

  const resetCouponWithAccumulationUseAmt = async ({ accumulationUseAmt }) => {
    const state = {
      selectedCoupon: { productCoupons: [], cartCouponIssueNo: 0, promotionCode: '', channelType: '' },
      allCouponAmt: 0,
    };
    EventManager.fire('SELECT_COUPONS', { state });
    EventManager.fire('APPLY_COUPON_ON_ORDER_SHEET', {
      moduleKey: 'promotion-info',
      state,
    });
    await fetchPaymentInfo({
      selectedCoupon: state.selectedCoupon,
      accumulationUseAmt,
      productCouponCount: 0,
      cartCouponCount: 0,
    });
  };

  const applyMaxAccumulation = async () => {
    const {
      selectedCoupon,
      productCouponCount,
      cartCouponCount,
      paymentInfo: { availableMaxAccumulationAmt },
    } = orderSheetFormHelper.getFormData();

    EventManager.fire('APPLY_ACCUMULATION_ON_ORDER_SHEET', availableMaxAccumulationAmt);

    await fetchPaymentInfo({
      selectedCoupon,
      accumulationUseAmt: Number(availableMaxAccumulationAmt),
      productCouponCount,
      cartCouponCount,
    });
  };

  const checkAccumulationLessThanMin = ({ accumulationAmt }) => {
    const {
      paymentInfo: { minAccumulationLimit },
    } = orderSheetFormHelper.getFormData();

    const { mallConfig } = orderSheetFormHelper.commonData;
    const { accumulationName } = mallConfig.accumulationConfig;
    if (accumulationAmt === 0 || accumulationAmt >= minAccumulationLimit) {
      return false;
    }

    EventManager.fire('MODAL_ALERT_OPEN', {
      noticeType: 'CAUTION',
      message: `<em>최소 사용 가능 ${accumulationName}은(는) ${minAccumulationLimit} 입니다.</em>`,
    });

    return true;
  };

  const checkUseAccumulationWhenUseCoupon = async ({ accumulationUseAmt }) => {
    const { selectedCoupon, productCouponCount, cartCouponCount } = orderSheetFormHelper.getFormData();
    const { cartCouponIssueNo, productCoupons } = selectedCoupon;
    const isCouponSelected = cartCouponIssueNo || productCoupons?.length;

    if (isCouponSelected && accumulationUseAmt > 0) {
      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: '적립금 사용 시 쿠폰 사용이 불가합니다.<br/>적립금을 사용하시겠습니까?',
        onConfirm: async () => {
          await resetCouponWithAccumulationUseAmt({ accumulationUseAmt });
        },
        onCancel: async () => {
          await fetchPaymentInfo({ selectedCoupon, accumulationUseAmt: 0, productCouponCount, cartCouponCount });
        },
      });
    } else {
      await fetchPaymentInfo({
        selectedCoupon,
        accumulationUseAmt,
        productCouponCount,
        cartCouponCount,
      });
    }
  };

  const CLICK_EVENT_HANDLER_MAP = {
    SHOW_TERM_DETAIL: ({ elTarget }) => {
      const { orderSheetTerms } = orderSheetFormHelper.getFormData();
      const termId = Number(elTarget.getAttribute('shopby-term-id'));
      const foundTerm = orderSheetTerms.find(({ termsNo, customTermsNo }) => {
        const termNo = termsNo ?? customTermsNo;

        return termNo === termId;
      });

      if (foundTerm) {
        EventManager.fire('OPEN_LAYER_MODAL', {
          name: 'term-detail',
          data: { ...foundTerm, title: foundTerm.termsName },
        });
      }
    },
    SEARCH_ZIP_CODE: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'page-zip-code',
        modalAddClass: 'search-zip-code full-modal',
        onClose: ({ reason, state }) => {
          if (reason === 'DID_SUBMIT') {
            ShopbySkin.EventManager.fire('SELECT_ZIP_CODE', {
              moduleKey: 'shipping-address-info',
              state,
            });
          }
        },
      });
    },
    CLICK_OPEN_APPLY_COUPON_MODAL: openApplyCouponModal,
    CLICK_OPEN_SHIPPING_ADDRESS_FORM: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'shipping-addresses',
        onClose: ({ reason, state }) => {
          if (reason === 'DID_SUBMIT') {
            const {
              address: { receiverAddress, receiverJibunAddress, receiverZipCd, receiverDetailAddress, ...address },
            } = state;

            EventManager.fire('SELECT_SHIPPING_ADDRESS', {
              returnAddress: {
                receiverAddress,
                receiverJibunAddress,
                receiverZipCd,
                receiverDetailAddress,
                receiverContact1: address.receiverContact1,
                receiverContact2: address.receiverContact2,
                receiverName: address.receiverName,
                addressName: address.addressName,
                countryCd: address.countryCd,
                receiverState: address.state,
                receiverCity: address.city,
                shippingEtcInfo: address.shippingEtcInfo,
              },
            });
          }
        },
      });
    },
    USE_ACCUMULATION_AMT: () => {
      const { selectedCoupon, blockUseAccumulationWhenUseCoupon } = orderSheetFormHelper.getFormData();

      if (!blockUseAccumulationWhenUseCoupon) {
        applyMaxAccumulation();

        return;
      }

      const { cartCouponIssueNo, productCoupons } = selectedCoupon;
      const isCouponSelected = cartCouponIssueNo || productCoupons?.length;

      if (isCouponSelected) {
        EventManager.fire('MODAL_CONFIRM_OPEN', {
          noticeType: 'WARNING',
          message: '적립금 사용 시 쿠폰 사용이 불가합니다.<br/>적립금을 사용하시겠습니까?',
          onConfirm: async () => {
            await resetCouponWithAccumulationUseAmt({ accumulationUseAmt: 0 });
            await applyMaxAccumulation();
          },
        });
      } else {
        applyMaxAccumulation();
      }
    },
    CLICK_MY_PAY_BTN: () => {
      const redirectLoginPage = () => {
        location.replace(`${loginUrl}?from=${encodeURIComponent(location.href)}`);
      };

      if (!utils.isSignIn()) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>로그인하셔야 본 서비스를 이용하실 수 있습니다.</em>',
          onClose: redirectLoginPage,
        });
      }
    },
    CLICK_MY_PAY_SETTING: async () => {
      const {
        isMyPayMember,
        myPayMode: { myPayPaymentInfos },
      } = orderSheetFormHelper.getFormData();

      if (!isMyPayMember) {
        await orderSheetFormHelper.openSignUpMyPay();
      } else {
        EventManager.fire('OPEN_LAYER_MODAL', {
          name: 'my-pay-setting',
          data: {
            myPayPaymentInfos,
            commonData: orderSheetFormHelper.commonData,
          },
          onClose: ({ reason }) => {
            if (reason === 'DID_SUBMIT') {
              orderSheetFormHelper.actions?.fetchMyPayInfo();
            }
          },
        });
      }
    },
    CLICK_MY_PAY_REGISTER_CARD: () => {
      orderSheetFormHelper.openMyPayRegister('CARD');
    },
    CLICK_MY_PAY_REGISTER_ACCOUNT: () => {
      orderSheetFormHelper.openMyPayRegister('ACCOUNT');
    },
    CLICK_BOOKMARK_ON_MY_PAY: ({ elTarget }) => {
      const paymentItem = elTarget.closest('.my-pay-payment-item');

      if (!paymentItem) {
        return;
      }

      modifyMainMyPayPayment(paymentItem);
    },
    CLICK_PAY_BTN: handlePayBtnClick,
    CLICK_LOGIN: () => {
      location.replace(`${loginUrl}?from=${encodeURIComponent(location.href)}`);
    },
  };

  const CHANGE_EVENT_HANDLER_MAP = {
    CHANGE_INPUT_ACCUMULATION: async ({ elTarget }) => {
      const {
        selectedCoupon,
        productCouponCount,
        cartCouponCount,
        paymentInfo: { availableMaxAccumulationAmt },
        blockUseAccumulationWhenUseCoupon,
      } = orderSheetFormHelper.getFormData();

      if (elTarget.value > availableMaxAccumulationAmt) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>입력 불가능한 금액입니다.</em>',
          onClose: async () => {
            ShopbySkin.EventManager.fire('APPLY_ACCUMULATION_ON_ORDER_SHEET', availableMaxAccumulationAmt);

            await fetchPaymentInfo({
              selectedCoupon,
              accumulationUseAmt: availableMaxAccumulationAmt,
              productCouponCount,
              cartCouponCount,
            });
          },
        });

        return;
      }

      const accumulationAmt = Number(elTarget.value.replaceAll(',', ''));

      ShopbySkin.EventManager.fire('APPLY_ACCUMULATION_ON_ORDER_SHEET', accumulationAmt);

      if (checkAccumulationLessThanMin({ accumulationAmt })) {
        return;
      }

      if (!blockUseAccumulationWhenUseCoupon) {
        await fetchPaymentInfo({
          selectedCoupon,
          accumulationUseAmt: accumulationAmt,
          productCouponCount,
          cartCouponCount,
        });

        return;
      }

      checkUseAccumulationWhenUseCoupon({ accumulationUseAmt: accumulationAmt });
    },
  };

  const clickEventListener = ({ target }) => {
    const action = target.getAttribute('shopby-action');
    const myPayRegisterWrap = target.getAttribute('.my-pay-payment-item-register-wrap');
    const myPayPaymentBookmarkBtn = target.closest('.my-pay-payment-item__bookmark-btn');
    const myPayPaymentRegisterBtn = target.closest('.my-pay-payment-item__register-btn');

    if (['SHOW_TERM_DETAIL'].includes(action)) {
      CLICK_EVENT_HANDLER_MAP[action]?.({
        elTarget: target,
      });
    } else if (myPayPaymentBookmarkBtn) {
      CLICK_EVENT_HANDLER_MAP.CLICK_BOOKMARK_ON_MY_PAY({ elTarget: myPayPaymentBookmarkBtn });
    } else if (myPayPaymentRegisterBtn) {
      const actionName = myPayPaymentRegisterBtn.getAttribute('shopby-action');

      CLICK_EVENT_HANDLER_MAP[actionName]?.();
    } else if (myPayRegisterWrap) {
      const actionName = myPayRegisterWrap.getAttribute('shopby-action');

      CLICK_EVENT_HANDLER_MAP[actionName]?.();
    } else {
      CLICK_EVENT_HANDLER_MAP[action]?.();
    }
  };

  const changeEventListener = ({ target }) => {
    const action = target.getAttribute('shopby-action');

    if (action === 'CHANGE_INPUT_ACCUMULATION') {
      CHANGE_EVENT_HANDLER_MAP[action]?.({
        elTarget: target,
      });
    }
  };

  const popupCallback = async ({ data }) => {
    if (data.isSuccess) {
      await orderSheetFormHelper.actions.fetchMyPayInfo();
    }
  };
  // 모바일 일때만 사용
  EventManager.fire('INIT_MY_PAY_PAYMENTS_SLIDER', {
    spaceBetween: 12,
    direction: 'horizontal',
    effect: 'slide',
    slidesPerView: 'auto',
  });

  containerEl.addEventListener('click', clickEventListener);
  containerEl.addEventListener('change', changeEventListener);

  window.addEventListener('message', popupCallback, false);
})();
