(() => {
  const { pageHelper } = ShopbySkin;

  const authCallbackHelper = pageHelper.authCallbackHelper();
  const searchParams = new URLSearchParams(decodeURIComponent(location.search));
  const code = searchParams.get('code');

  authCallbackHelper.initialize({
    redirectUri: `${location.origin}/callback/auth-callback.html`,
    code,
  });
})();
