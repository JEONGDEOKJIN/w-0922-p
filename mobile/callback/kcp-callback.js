(() => {
  const { pageHelper } = ShopbySkin;

  const kcpCallbackHelper = pageHelper.kcpCallbackHelper();

  kcpCallbackHelper.initialize({
    helperKey: 'kcp-callback',
  });
})();
