(() => {
  const { EventManager, utils } = ShopbySkin;

  const slideMenuEL = document.querySelector('slide-menu');

  const slideMenuClickActionMap = {
    CLOSE_SLIDE_MENU: () => {
      EventManager.fire('TOGGLE_HEADER_SLIDE_MENU', { type: 'close' });
    },
    TOGGLE_SLIDE_MENU_CHILD_CATEGORY: (e) => {
      const categoryWrapEl = e?.target?.closest('[shopby-category-no]');

      EventManager.fire('TOGGLE_SLIDE_MENU_CHILD_CATEGORY', {
        wrapEl: categoryWrapEl,
      });
    },
    SIGN_OUT: () => {
      EventManager.fire('SIGN_OUT');
    },
    GO_MY_MENU: (e) => {
      if (!utils.isSignedIn()) {
        e.preventDefault();

        const from = e.target.href;

        const nextUrl = `${location.origin}/pages/sign-in/sign-in.html`;

        location.href = `${nextUrl}?from=${encodeURIComponent(from)}`;
      }
    },
  };

  const clickEventListener = (e) => {
    const action = e?.target?.closest('[shopby-action]')?.getAttribute('shopby-action');

    slideMenuClickActionMap[action]?.(e);
  };

  slideMenuEL?.addEventListener('click', clickEventListener);
})();
