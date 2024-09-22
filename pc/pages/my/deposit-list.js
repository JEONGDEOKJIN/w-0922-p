(() => {
  const { pageHelper, EventManager } = ShopbySkin;

  const datePickerHelper = pageHelper.datePickerHelper();
  datePickerHelper.initialize();

  const MODULE_ACTION_HANDLER = {
    SEARCH_ACCUMULATION: () => {
      const params = new URLSearchParams(location.search);
      location.href = `${location.origin}${
        location.pathname
      }?${params.toString()}`;
    },
    
    REGISTER: () => {
      EventManager.fire("OPEN_LAYER_MODAL", {
        name: "voucher-form",
        title: "쿠폰 번호 입력",
        modalAddClass: "coupon-registration-modal",
        isFull: false,
        onClose: ({ reason }) => {
          if (reason === "DID_SUBMIT") {
            EventManager.fire("MODAL_ALERT_OPEN", {
              noticeType: "SUCCESS",
              message: "<em>쿠폰 등록이 완료되었습니다.</em>",
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },
  };

  const dateTypeSelectorModule = document.querySelector("date-search");
  dateTypeSelectorModule?.addEventListener("click", ({ target }) => {
    const actionTarget = target.getAttribute("shopby-action");

    if (!actionTarget) {
      return;
    }

    MODULE_ACTION_HANDLER[actionTarget]();
  });

  // const containerEl = document.querySelector(
  //   '[shopby-helper-key="profile-shipping-address"]'
  // );

  // const CLICK_EVENT_HANDLER_MAP = {
  //   REGISTER_VOUCHER: () => {
  //     const afterRegisterForm = ({ reason }) => {
  //       if (reason === "DID_SUBMIT") {
  //         EventManager.fire("MODAL_ALERT_OPEN", {
  //           noticeType: "SUCCESS",
  //           message: "<em>배송지가 등록되었습니다.</em>",
  //           data: {
  //             totalCount,
  //           },
  //           onClose: () => {},
  //         });
  //       }
  //     };

  //     EventManager.fire("OPEN_LAYER_MODAL", {
  //       isFull: false,
  //       modalAddClass: "voucher-form",
  //       name: "voucher-form",
  //       title: "상품권 등록",
  //       onClose: afterRegisterForm,
  //       data: {},
  //     });
  //   },
  // };

  // const clickEventListener = ({ target }) => {
  //   const actionType = target.getAttribute("shopby-action");

  //   const addressNo = Number(
  //     target
  //       .closest("[shopby-address-no]")
  //       ?.getAttribute?.("shopby-address-no") ?? 0
  //   );
  //   const addressName = target
  //     .closest("[shopby-address-name]")
  //     ?.getAttribute?.("shopby-address-name");
  //   const isDefault =
  //     target
  //       .closest("[shopby-default-yn]")
  //       ?.getAttribute?.("shopby-default-yn") === "Y";
  //   const totalCount = Number(target.getAttribute("shopby-total-count") || 0);

  //   CLICK_EVENT_HANDLER_MAP[actionType]?.({
  //     addressNo,
  //     isDefault,
  //     totalCount,
  //     addressName,
  //   });
  // };

  // containerEl.addEventListener("click", clickEventListener);

  // EventManager.on("PAGE_LOAD_COMPLETED", () => {});
})();
