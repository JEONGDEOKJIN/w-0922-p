(() => {
  const { EventManager, utils } = ShopbySkin;
  const { setGlobalsVariableBy, isMobileDevice } = utils;

  const headerEl = document.querySelector('shopby-header');

  // 클릭이벤트 맵
  // 1. SIGN_OUT : 로그아웃
  const headerActionMap = {
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

  // 클릭이벤트 핸들러
  const clickEventListener = (e) => {
    const action = e?.target?.closest('[shopby-action]')?.getAttribute('shopby-action');

    headerActionMap[action]?.(e);
  };

  // 상단 카테고리 slider 초기화
  EventManager.on('PAGE_LOAD_COMPLETED', ({ profile }) => {
    EventManager.fire('INIT_CATEGORY_SLIDER', {
      direction: 'horizontal',
      effect: 'slide',
      slidesPerView: 'auto',
      spaceBetween: 20,
    });

    setGlobalsVariableBy('getPlatform', () => (isMobileDevice ? 'MOBILE_WEB' : 'PC'));
    setGlobalsVariableBy('profile', profile);
  });

  headerEl?.addEventListener('click', clickEventListener);

  const searchParams = new URLSearchParams(location.search);
  const trackingKey = searchParams.get('trackingKey');
  const channelType = searchParams.get('channelType');

  const { setTrackingKey, setChannelType } = ShopbySkin.utils;
  setTrackingKey(trackingKey);
  setChannelType(channelType);
})();
