(() => {
  const { pageHelper, EventManager } = ShopbySkin;

  const couponGuideLayerModalHelper = pageHelper.couponGuideLayerModalHelper();

  couponGuideLayerModalHelper.initialize({
    layerModalHelperKey: 'coupon-guide',
  });

  EventManager.fire('INIT_COUPON_GUIDE', couponGuideLayerModalHelper.store.getState().data);
})();
