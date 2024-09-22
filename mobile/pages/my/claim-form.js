/* eslint-disable complexity */
(() => {
  const {
    pageHelper,
    EventManager,
    utils: { getQueryParams, makeVerificationResult, handleFocusEvent },
    actions,
    constants,
  } = ShopbySkin;

  const { claimType, ...params } = getQueryParams(globalThis.location);

  const containerEl = document.querySelector('[shopby-helper-key="claim-form-helper-key"]');
  const claimFormHelper = pageHelper.claimFormHelper();

  const claimAction = actions.getClaimAction({
    claimType,
    ...params,
  });
  const nextAction = actions.getNextAction();

  claimFormHelper.initialize({
    helperKey: 'claim-form-helper-key',
    claimAction,
    nextAction,
    claimType,
    ...params,
  });

  const REQUIRED_MOBILE_NUMBER_SIZE = 11;
  const verificationMap = {
    checkResponsibleObjectType: ({ responsibleObjectType, orderStatusType }) => {
      if (orderStatusType === 'DEPOSIT_WAIT') {
        return makeVerificationResult();
      }

      if (!responsibleObjectType) {
        return makeVerificationResult({
          reason: '귀책대상을 선택해주세요.',
          fields: ['responsibleObjectType'],
        });
      }

      return makeVerificationResult();
    },
    checkClaimReasonType: ({ claimReasonType, orderStatusType }) => {
      if (orderStatusType === 'DEPOSIT_WAIT') {
        return makeVerificationResult();
      }

      if (!claimReasonType) {
        return makeVerificationResult({
          reason: '사유를 선택해주세요.',
          fields: ['claimReasonType'],
        });
      }

      return makeVerificationResult();
    },
    checkClaimReasonDetail: ({ claimReasonDetail }) => {
      if (!claimReasonDetail?.trim()) {
        return makeVerificationResult({
          reason: '상세 사유를 입력해주세요.',
          fields: ['claimReasonDetail'],
        });
      }

      return makeVerificationResult();
    },
    checkBankAccountInfo: ({ bankAccountInfo }) => {
      if (!bankAccountInfo) {
        return makeVerificationResult();
      }

      if (!bankAccountInfo.bank) {
        return makeVerificationResult({
          reason: '은행을 선택해주세요.',
          fields: ['bank'],
        });
      }

      if (!bankAccountInfo.bankAccount) {
        return makeVerificationResult({
          reason: '계좌번호를 입력해주세요.',
          fields: ['bankAccount'],
        });
      }

      if (!bankAccountInfo.bankDepositorName) {
        return makeVerificationResult({
          reason: '예금주를 입력해주세요.',
          fields: ['bankDepositorName'],
        });
      }

      return makeVerificationResult();
    },
    checkReturnInformation: ({
      returnAddress,
      isCollectionInfoFormNecessary,
      returnWayType,
      deliveryCompanyType,
      invoiceNo,
    }) => {
      if (!isCollectionInfoFormNecessary) {
        return makeVerificationResult();
      }

      if (returnWayType.includes('SELLER')) {
        if (!returnAddress?.receiverName) {
          return makeVerificationResult({
            reason: '반품자명을 입력해주세요.',
            fields: ['receiverName'],
          });
        }

        if (!returnAddress?.receiverZipCd) {
          return makeVerificationResult({
            reason: '반품지 주소를 입력해주세요.',
            fields: ['receiverZipCdToReturn'],
          });
        }

        if (!returnAddress?.receiverDetailAddress) {
          return makeVerificationResult({
            reason: '상세 주소를 입력해주세요.',
            fields: ['receiverDetailAddress'],
          });
        }

        if (!returnAddress?.receiverContact1) {
          return makeVerificationResult({
            reason: '반품 수거 정보의 휴대폰 번호를 입력해주세요.',
            fields: ['receiverMobileNo'],
          });
        }

        if (returnAddress?.receiverContact1 < REQUIRED_MOBILE_NUMBER_SIZE) {
          return makeVerificationResult({
            reason: '정확한 휴대폰번호를 입력해주세요.',
            fields: ['receiverMobileNo'],
          });
        }
      } else {
        if (!deliveryCompanyType) {
          return makeVerificationResult({
            reason: '택배사를 선택해주세요.',
            fields: ['deliveryCompanyType'],
          });
        }

        if (!invoiceNo) {
          return makeVerificationResult({
            reason: '송장 번호를 입력해주세요.',
            fields: ['invoiceNo'],
          });
        }
      }

      return makeVerificationResult();
    },
    checkExchangeInformation: ({ isCollectionInfoFormNecessary, exchangeAddress }) => {
      if (!isCollectionInfoFormNecessary) {
        return makeVerificationResult();
      }

      if (claimType !== 'EXCHANGE') {
        return makeVerificationResult();
      }

      if (!exchangeAddress?.receiverName) {
        return makeVerificationResult({
          reason: '수령자명을 입력해주세요.',
          fields: ['exchangeReceiverName'],
        });
      }

      if (!exchangeAddress?.receiverDetailAddress) {
        return makeVerificationResult({
          reason: '상세 주소를 입력해주세요.',
          fields: ['exchangeDetailAddress'],
        });
      }

      if (!exchangeAddress?.receiverContact1) {
        return makeVerificationResult({
          reason: '교환 출고 정보의 휴대폰 번호를 입력해주세요.',
          fields: ['exchangeMobileNo'],
        });
      }

      if (exchangeAddress?.receiverContact1 < REQUIRED_MOBILE_NUMBER_SIZE) {
        return makeVerificationResult({
          reason: '정확한 휴대폰번호를 입력해주세요.',
          fields: ['exchangeMobileNo'],
        });
      }

      return makeVerificationResult();
    },
  };

  const requestUtil = {
    COLLECTION_TYPE: {
      BUYER: 'BUYER_DIRECT_RETURN',
      SELLER: 'SELLER_COLLECT',
    },
    getReturnWayType: (claimType, collectionType) =>
      claimType === 'CANCEL' ? collectionType : requestUtil.COLLECTION_TYPE[collectionType],
  };

  const getClaimReasonType = ({ orderStatusType, claimReasonType }) => {
    /** NOTE 오로라 기본스킨 정책
     * 입금대기 상태 상품을 취소하는 경우 사유는 CHANGE_MIND로 고정하여
     * 상세 사유만 입력 가능하도록 처리
     */

    if (claimType === 'CANCEL' && orderStatusType === 'DEPOSIT_WAIT') {
      return 'CHANGE_MIND';
    }

    return claimReasonType;
  };

  const makeRequest = (prevState = {}) => {
    const {
      claimInformationForm: { isAccountFormNecessary, bankAccountInfo },
      claimReasonForm: { claimReasonDetail, claimReasonType, claimInfo, responsibleObjectType, claimImageUrls },
      returnInformationForm,
      exchangeInformationForm,
    } = claimFormHelper.getState();

    const _claimReasonType = getClaimReasonType({
      orderStatusType: claimInfo.originalOption.orderStatusType,
      claimReasonType,
    });

    return {
      ...prevState,
      isCollectionInfoFormNecessary: exchangeInformationForm.isCollectionInfoFormNecessary,
      isAccountFormNecessary,
      bankAccountInfo: isAccountFormNecessary ? bankAccountInfo ?? {} : null,
      orderStatusType: claimInfo.originalOption.orderStatusType,
      claimType,
      claimReasonType: _claimReasonType,
      claimImageUrls,
      responsibleObjectType,
      returnWayType: requestUtil.getReturnWayType(claimType, returnInformationForm.collectionType),
      claimReasonDetail,
      returnAddress: returnInformationForm.returnAddress,
      deliveryCompanyType: returnInformationForm?.deliveryCompany?.type,
      invoiceNo: returnInformationForm?.invoiceNo,
      exchangeAddress: exchangeInformationForm.exchangeAddress,
    };
  };

  const CLICK_EVENT_HANDLER_MAP = {
    // 전체 선택
    TOGGLE_ALL: ({ event: { target } }) => {
      const productsEl = containerEl.querySelector('[slot="products"]');

      [...productsEl.children].forEach((el) => {
        const orderOptionNo = el.getAttribute('shopby-order-option-no');
        claimAction.toggleOneOrderOption({
          orderOptionNo,
          isChecked: target.checked,
        });
      });
    },
    // 상품 옵션 선택
    TOGGLE_ORDER_OPTION: ({ event: { target } }) => {
      const orderOptionNo = target.getAttribute('shopby-order-option-no');

      claimAction.toggleOneOrderOption({
        orderOptionNo,
        isChecked: target.checked,
      });
    },
    // 상품 옵션 수량 증가
    HANDLE_DECREASE_COUNT_BTN_CLICK: ({ event: { target } }) => {
      const quantityChangerEl = target.closest('[slot="quantityChanger"]');
      const orderOptionNo = quantityChangerEl.getAttribute('shopby-order-option-no');
      const orderCnt = Number(quantityChangerEl.querySelector('[slot="orderCnt"]').value ?? 1);

      const calcCnt = Math.max(orderCnt - 1, 1);

      claimAction.changeClaimAmount({
        [orderOptionNo]: calcCnt,
      });
    },
    // 상품 옵션 수량 감소
    HANDLE_INCREASE_COUNT_BTN_CLICK: ({ event: { target } }) => {
      const quantityChangerEl = target.closest('[slot="quantityChanger"]');
      const orderOptionNo = quantityChangerEl.getAttribute('shopby-order-option-no');
      const orderCnt = Number(quantityChangerEl.querySelector('[slot="orderCnt"]').value ?? 1);

      const maxCnt = Number(quantityChangerEl.getAttribute('shopby-max'));
      const calcCnt = Math.min(orderCnt + 1, maxCnt);

      claimAction.changeClaimAmount({
        [orderOptionNo]: calcCnt,
      });
    },
    // 판매자 수거 정보 > 수거지 주소
    SEARCH_ZIP_CODE_TO_RETURN: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        modalAddClass: 'search-zip-code full-modal',
        name: 'page-zip-code',
        onClose: ({ reason, state }) => {
          if (reason === 'DID_SUBMIT') {
            EventManager.fire('FETCH_ADDRESS_INFORMATION', {
              includesContact: false,
              returnAddress: {
                receiverAddress: state.address,
                receiverJibunAddress: state.jibunAddress,
                receiverZipCd: state.zipCode,
                receiverDetailAddress: state.detailAddress,
              },
            });
          }
        },
      });
    },
    // 교환 출고 정보 > 배송지 주소
    SEARCH_ZIP_CODE_TO_EXCHANGE: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        modalAddClass: 'search-zip-code full-modal',
        name: 'page-zip-code',
        onClose: ({ reason, state }) => {
          if (reason === 'DID_SUBMIT') {
            EventManager.fire('FETCH_ADDRESS_INFORMATION', {
              includesContact: false,
              exchangeAddress: {
                receiverAddress: state.address,
                receiverJibunAddress: state.jibunAddress,
                receiverZipCd: state.zipCode,
                receiverDetailAddress: state.detailAddress,
              },
            });
          }
        },
      });
    },
    // 배송지 관리 모달
    SELECT_FROM_SHIPPING_ADDRESSES: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'shipping-addresses',
        onClose: ({ reason, state }) => {
          if (reason === 'DID_SUBMIT') {
            const { address } = state;

            EventManager.fire('FETCH_ADDRESS_INFORMATION', {
              returnAddress: {
                receiverAddress: address.receiverAddress,
                receiverJibunAddress: address.receiverJibunAddress,
                receiverZipCd: address.receiverZipCd,
                receiverDetailAddress: address.receiverDetailAddress,
                receiverContact1: address.receiverContact1,
                receiverContact2: address.receiverContact2,
                receiverName: address.receiverName,
              },
            });
          }
        },
      });
    },
    // 교환 출고 정보 > 배송지 주소
    SELECT_FROM_SHIPPING_ADDRESSES_FOR_EXCHANGE: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'shipping-addresses',
        onClose: ({ reason, state }) => {
          if (reason === 'DID_SUBMIT') {
            const { address } = state;

            EventManager.fire('FETCH_ADDRESS_INFORMATION', {
              exchangeAddress: {
                receiverAddress: address.receiverAddress,
                receiverJibunAddress: address.receiverJibunAddress,
                receiverZipCd: address.receiverZipCd,
                receiverDetailAddress: address.receiverDetailAddress,
                receiverContact1: address.receiverContact1,
                receiverContact2: address.receiverContact2,
                receiverName: address.receiverName,
              },
            });
          }
        },
      });
    },
    // 클레임 신청
    HANDLE_CLAIM_BTN_CLICK: async ({ event, helper }) => {
      event.preventDefault();

      const claimTypeLabel = constants.CLAIM_TYPE_MAP[claimType];

      if (!helper.getState()?.claimProducts?.checkedCount) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>${claimTypeLabel}상품을 하나 이상 선택해 주세요.</em>`,
        });

        return;
      }

      const { reason, fields } = await helper.claim(makeRequest, verificationMap);

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
      } else {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'SUCCESS',
          message: `<em>${claimTypeLabel} 신청이 완료되었습니다.<br />${claimTypeLabel}관련 정보는 마이페이지의 취소/반품/교환 내역에서 확인 가능합니다.</em>`,
          onClose: () => {
            if (!document.referrer || location.href === document.referrer) {
              history.back();

              return;
            }
            location.href = document.referrer;
          },
        });
      }
    },
    // 첨부이미지 삭제
    HANDLE_ATTACH_DELETE_BTN: ({ event: { target } }) => {
      const imageUrl = target.getAttribute('shopby-image-url');

      if (!imageUrl) {
        return;
      }

      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: '<em>첨부파일을 삭제하시겠습니까?</em>',
        onConfirm: () => {
          EventManager.fire('DELETE_ATTACHMENT_IMAGE_URL', imageUrl);
        },
      });
    },
    // 취소
    HANDLE_CANCEL_BTN_CLICK: () => {
      if (!document.referrer || location.href === document.referrer) {
        history.back();

        return;
      }
      location.href = document.referrer;
    },
  };

  const clickEventListener = (event) => {
    const actionType = event.target.getAttribute('shopby-action');

    CLICK_EVENT_HANDLER_MAP[actionType]?.({
      event,
      helper: claimFormHelper,
    });
  };

  containerEl.addEventListener('click', clickEventListener);

  EventManager.on('PAGE_LOAD_COMPLETED', () => {
    claimAction.fetchClaimInfo(params.orderOptionNo);
  });
})();
