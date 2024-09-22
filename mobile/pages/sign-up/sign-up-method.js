(() => {
  const {
    pageHelper,
    utils: { isSignedIn },
  } = ShopbySkin;

  if (isSignedIn()) {
    if (!document.referrer || location.href === document.referrer) {
      history.back();

      return;
    }
    location.href = document.referrer;
  }

  const signUpMethodHelper = pageHelper.signUpMethodHelper();

  signUpMethodHelper.initialize({
    helperKey: 'sign-up-method',
  });

  const containerEl = document.querySelector('open-id-sign-in');

  const clickEventListener = ({ target }) => {
    const action = target.closest('[shopby-action]')?.getAttribute('shopby-action');

    if (action === 'OPEN_ID_CLICK') {
      const provider = target.closest('[shopby-provider]')?.getAttribute('shopby-provider');

      signUpMethodHelper.openIdSignIn({
        nextPath: '/',
        provider,
        redirectUri: `${location.origin}/callback/auth-callback.html`,
      });
    }
  };

  containerEl.addEventListener('click', clickEventListener);
})();
