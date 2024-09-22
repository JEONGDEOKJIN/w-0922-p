(() => {
  const { EventManager, utils } = ShopbySkin;
  const { setGlobalsVariableBy, isMobileDevice } = utils;

  EventManager.on('PAGE_LOAD_COMPLETED', ({ profile }) => {
    setGlobalsVariableBy('getPlatform', () => (isMobileDevice ? 'MOBILE_WEB' : 'PC'));
    setGlobalsVariableBy('profile', profile);
  });

  const searchParams = new URLSearchParams(location.search);
  const trackingKey = searchParams.get('trackingKey');
  const channelType = searchParams.get('channelType');

  const { setTrackingKey, setChannelType } = ShopbySkin.utils;
  setTrackingKey(trackingKey);
  setChannelType(channelType);
})();
