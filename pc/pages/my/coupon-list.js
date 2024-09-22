(() => {
  const { EventManager, pageHelper } = ShopbySkin;

  const myCouponListHelper = pageHelper.myCouponListHelper();
  const datePickerHelper = pageHelper.datePickerHelper();

  const searchParams = new URLSearchParams(location.search);
  const params = Object.fromEntries(searchParams.entries());

  datePickerHelper.initialize();
  myCouponListHelper.initialize({
    ...params,
    tab: params.usable === "false" ? "UNISSUABLE" : "ISSUABLE",
  });

  const MODULE_ACTION_HANDLER = {
    REGISTER: () => {
      EventManager.fire("OPEN_LAYER_MODAL", {
        name: "coupon-register-form",
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

    SEARCH_ACCUMULATION: () => {
      const params = new URLSearchParams(location.search);
      location.href = `${location.origin}${
        location.pathname
      }?${params.toString()}`;
    },
  };
  document
    .querySelector("coupon-total-count")
    ?.addEventListener("click", ({ target }) => {
      const action = target.getAttribute("shopby-action");

      MODULE_ACTION_HANDLER[action]?.();
    });

  const dateTypeSelectorModule = document.querySelector("date-search");
  dateTypeSelectorModule?.addEventListener("click", ({ target }) => {
    const actionTarget = target.getAttribute("shopby-action");

    if (!actionTarget) {
      return;
    }

    MODULE_ACTION_HANDLER[actionTarget]();
  });
})();
