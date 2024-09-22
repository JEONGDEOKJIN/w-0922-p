(() => {
  const { actions } = ShopbySkin;

  const bannerId = document.currentScript.getAttribute("shopby-banner-id");

  if (bannerId) {
    actions?.getBannerById?.({ bannerId });
  }
})();
