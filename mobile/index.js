(() => {
  const { EventManager, utils } = ShopbySkin;

  // 상단 카테고리 slider 초기화
  EventManager.fire('INIT_CATEGORY_SLIDER', {
    direction: 'horizontal',
    effect: 'slide',
    slidesPerView: 'auto',
    spaceBetween: 15,
    slidesOffsetBefore: 15,
    slidesOffsetAfter: 15,
  });

  const { createPageScriptInstance } = utils;
  const pageScriptInstance = createPageScriptInstance('MOBILE');
  pageScriptInstance.appendPageScript('PAGE_SCRIPT', 'MAIN');

  EventManager.on('ON_API', (data) => {
    const { mallName = '' } = data?.mallConfig?.mall || {};

    const titleEl = document.head.querySelector('title');

    if (titleEl instanceof HTMLElement) {
      titleEl.innerText = mallName;
    }
  });
})();
