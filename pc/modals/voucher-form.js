// ShopbySkin.pageHelper가 객체일 경우
const CustomPageHelper = {
  ...ShopbySkin.pageHelper, // 기존 pageHelper의 모든 속성과 메서드를 포함
  voucherFormLayerModalHelper: function () {
    return {
      // initialize 메서드 구현
      initialize: function (options) {
        console.log("Initializing with options:", options);
        const containerEl = document.querySelector(
          `[shopby-layer-modal-helper-key="${options.layerModalHelperKey}"]`
        );
        if (containerEl) {
          // 필요한 초기화 작업 수행
          console.log("Container element found:", containerEl);
        } else {
          console.error("Container element not found");
        }
      },

      // 다른 필요한 메서드들도 추가 가능
      otherMethod: function () {
        console.log("Other method logic here");
      },

      // submit 메서드 추가
      submit: async function (makeRequest, verificationMap) {
        const requestData = makeRequest();

        // 검증 로직 수행
        const verificationResult =
          verificationMap.checkReceiverName(requestData);

        if (verificationResult.reason) {
          return verificationResult;
        }

        // 검증이 통과된 경우 API 요청 등을 수행할 수 있음
        console.log("Request Data:", requestData);

        // 비동기 작업 시 예제
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              reason: null, // 성공 시 null
              fields: [], // 필요시 오류 필드 정보
            });
          }, 1000);
        });
      },
    };
  },
};

// 기존 모듈을 커스텀 모듈로 대체
ShopbySkin.pageHelper = CustomPageHelper;

(() => {
  const {
    pageHelper,
    EventManager,
    utils: { makeVerificationResult, handleFocusEvent },
    constants,
  } = ShopbySkin;

  const voucherFormLayerModalHelper = pageHelper.voucherFormLayerModalHelper();

  const containerEl = document.querySelector(
    '[shopby-layer-modal-helper-key="voucher-form"]'
  );

  voucherFormLayerModalHelper.initialize({
    layerModalHelperKey: "voucher-form",
  });

  const getOnlyNumber = (value) =>
    value?.replace(constants.REG_EX_FOR_VALIDATION.NUMBER, "");

  const verificationMap = {
    checkReceiverName({ voucherNumber }) {
      console.log(voucherNumber, "voucherNumber");

      if (!voucherNumber) {
        return makeVerificationResult({
          reason: "상품권 번호를 입력해주세요",
          fields: ["voucherNumber"],
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
    } = voucherFormLayerModalHelper.getState();

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
      addressType: "BOOK",
      receiverState: state || null,
      receiverCity: city || null,
      countryCd: countryCd || null,
      receiverFirstName: firstName || null,
    };
  };

  const CLICK_EVENT_HANDLER_MAP = {
    // 취소
    CANCEL: ({ helper }) => {
      helper.closeLayerModal();
    },

    SUBMIT: async ({ helper, e }) => {
      e.preventDefault();

      console.log(helper, "helper");

      const { reason, fields } = await helper.submit(
        makeRequest,
        verificationMap
      );

      if (reason) {
        EventManager.fire("MODAL_ALERT_OPEN", {
          noticeType: "CAUTION",
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
  };

  const clickEventListener = (e) => {
    const action = e.target.getAttribute("shopby-action");

    CLICK_EVENT_HANDLER_MAP[action]?.({
      e,
      helper: voucherFormLayerModalHelper,
    });
  };

  containerEl.addEventListener("click", clickEventListener);
})();
