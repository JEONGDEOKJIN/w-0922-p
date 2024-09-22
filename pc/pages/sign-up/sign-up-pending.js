(() => {
  const {
    utils: { isSignedIn },
  } = ShopbySkin;

  if (isSignedIn()) {
    if (!document.referrer || location.href === document.referrer) {
      history.back();

      return;
    }
    location.href = document.referrer;
  }
})();
