(() => {
  const { EventManager, utils } = ShopbySkin;
  const { isSignedIn } = utils;

  EventManager.on('PAGE_LOAD_COMPLETED', () => {
    if (isSignedIn()) {
      window.location.replace(location.state?.from ?? '/', {
        state: {
          ...location.state,
        },
      });
    }
  });
})();
