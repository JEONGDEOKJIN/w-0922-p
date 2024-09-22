(() => {
  const { pageHelper } = ShopbySkin;
  const couponRegisterFormLayerModalHelper = pageHelper.couponRegisterFormLayerModalHelper();
  couponRegisterFormLayerModalHelper.initialize({
    layerModalHelperKey: 'coupon-register-form',
  });

  const moduleActionHandler = {
    CANCEL: (helper) => {
      helper.closeLayerModal();
    },
    SUBMIT: (helper) => {
      const { registerCouponForm } = helper.getState();
      const { code } = registerCouponForm;

      helper.submit({ code });
    },
  };

  document.querySelector('register-coupon-form-btns')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.(couponRegisterFormLayerModalHelper);
  });
})();
