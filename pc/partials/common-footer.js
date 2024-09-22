(() => {
  const { EventManager, utils } = ShopbySkin;
  const { createPageScriptInstance } = utils;
  const pageScriptInstance = createPageScriptInstance('PC');

  EventManager.on('PAGE_LOAD_COMPLETED', () => {
    pageScriptInstance.appendPageScript('COMMON_FOOTER');
  });
})();
