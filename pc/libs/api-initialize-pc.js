(() => {
  const { EventManager, actions, CUSTOM_EVENT } = ShopbySkin;

  document.addEventListener(CUSTOM_EVENT.CALL_COMMON_SHOP_API, async () => {
    const commonData = await actions.executeCommonAction('PC');

    ShopbySkin.platform = 'PC';
    EventManager.fire('PAGE_LOAD_COMPLETED', commonData);
  });
})();
