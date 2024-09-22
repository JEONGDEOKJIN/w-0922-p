(() => {
  const { pageHelper, EventManager, actions, utils } = ShopbySkin;
  const couponDownloadLayerModalHelper = pageHelper.couponDownloadLayerModalHelper();
  const { productNo } = pageHelper.productDetailHelper();
  const channelType = utils.getChannelType();

  const couponActionByProduct = actions.getCouponActionByProduct();

  couponDownloadLayerModalHelper.initialize({
    layerModalHelperKey: 'coupon-download',
    productNo,
    channelType,
    couponActionByProduct,
  });

  couponDownloadLayerModalHelper.fetchCoupons(productNo, channelType);

  const ACTION_HANDLER_MAP = {
    // 개별 쿠폰 받기
    DOWNLOAD_COUPON_BTN: (target) => {
      const targetEl = target.hasAttribute('shopby-coupon-no') ? target : target?.closest('[shopby-coupon-no]');
      const couponNo = Number(targetEl.getAttribute('shopby-coupon-no'));
      const disabled = targetEl.getAttribute('shopby-disabled');

      couponDownloadLayerModalHelper.downloadCoupon(couponNo, disabled, channelType);
    },

    // 쿠폰 한번에 받기
    DOWNLOAD_COUPONS_BTN: async () => {
      const downloadedCoupons = await couponDownloadLayerModalHelper.downloadCoupons(productNo, channelType);

      if (downloadedCoupons && !downloadedCoupons.length) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          message: '발급 가능한 쿠폰이 없습니다.',
        });
      }
    },

    // 쿠폰 이용 안내 툴팁
    TOGGLE_COUPON_GUIDE: (target) => {
      const couponNo = target.getAttribute('shopby-coupon-no');

      document.querySelector(`[shopby-element='coupon-guide-tooltip-${couponNo}']`)?.classList.toggle('active');
    },
  };

  document.querySelector('coupon-download-information').addEventListener('click', ({ target }) => {
    ACTION_HANDLER_MAP[target.getAttribute('shopby-action')]?.(target);
  });
})();
