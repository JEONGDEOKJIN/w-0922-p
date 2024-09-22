(() => {
  const { EventManager } = ShopbySkin;

  const designPopup = document.querySelector('design-popup');

  const popupActionMap = {
    CLOSE_DESIGN_POPUP: ({ popupNo }) => {
      EventManager.fire('CLOSE_DESIGN_POPUP', { popupNo });
    },
    NO_VISIBLE_TODAY: ({ popupNo }) => {
      EventManager.fire('NO_VISIBLE_TODAY', { popupNo, shouldHide: true });
    },
  };

  designPopup?.addEventListener('click', ({ target }) => {
    const action = target.closest('[shopby-action]')?.getAttribute('shopby-action');
    const popupNo = target.closest('[shopby-popup-no]')?.getAttribute('shopby-popup-no');

    popupActionMap[action]?.({
      popupNo,
    });
  });
})();
