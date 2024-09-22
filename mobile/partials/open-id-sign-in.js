(() => {
  const { pageHelper } = ShopbySkin;

  const signInHelper = pageHelper.signInHelper();

  signInHelper.initialize({
    helperKey: 'sign-in-form',
  });

  const containerEl = document.querySelector('open-id-sign-in');

  const getFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);

    const from = searchParams.get('from');

    const mainUrl = '/';
    return decodeURIComponent(from || mainUrl);
  };

  const clickEventListener = ({ target }) => {
    const action = target.closest('[shopby-action]')?.getAttribute('shopby-action');

    if (action === 'OPEN_ID_CLICK') {
      const provider = target.closest('[shopby-provider]')?.getAttribute('shopby-provider');

      signInHelper.openIdSignIn({
        nextPath: getFromUrl(),
        previousPath: location.href,
        provider,
        redirectUri: `${location.origin}/callback/auth-callback.html`,
      });
    }
  };

  containerEl.addEventListener('click', clickEventListener);
})();
