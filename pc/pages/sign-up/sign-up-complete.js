(() => {
  const {
    EventManager,
    utils: { isSignedIn, createPageScriptInstance, isMobileDevice },
  } = ShopbySkin;

  if (isSignedIn()) {
    if (!document.referrer || location.href === document.referrer) {
      history.back();

      return;
    }
    location.href = document.referrer;
  }

  EventManager.on('PAGE_LOAD_COMPLETED', () => {
    // pageScript
    const scriptPlatformType = isMobileDevice ? 'MOBILE' : 'PC';
    const pageScriptInstance = createPageScriptInstance(scriptPlatformType);

    pageScriptInstance.appendPageScript('PAGE_SCRIPT', 'MEMBER_JOIN_COMPLETE');
  });
})();
