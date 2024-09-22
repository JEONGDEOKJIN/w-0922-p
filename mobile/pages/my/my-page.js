(() => {
  const { actions, EventManager } = ShopbySkin;

  const containerEl = document.querySelector('[shopby-helper-key="my-page-helper-key"]');

  let shopbyCommonData = {};
  EventManager.on('PAGE_LOAD_COMPLETED', (commonData) => {
    shopbyCommonData = commonData;
  });

  const clickEventListener = ({ target }) => {
    const actionType = target.closest('[shopby-action]')?.getAttribute('shopby-action');

    const CLICK_EVENT_HANDLER_MAP = {
      LOGOUT: async () => {
        await actions.postSignOut();
        location.href = '/';
      },
      GRADE_BENEFIT: () => {
        EventManager.fire('OPEN_LAYER_MODAL', {
          name: 'grade-benefit-guide',
          title: '등급혜택 안내',
          isFull: true,
          data: {
            commonData: shopbyCommonData,
          },
        });
      },
    };

    CLICK_EVENT_HANDLER_MAP[actionType]?.();
  };

  containerEl.addEventListener('click', clickEventListener);
})();
