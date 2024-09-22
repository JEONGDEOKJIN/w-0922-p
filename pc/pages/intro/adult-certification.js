(() => {
  const { EventManager, actions, utils } = ShopbySkin;
  const { isSignedIn, isAgeVerified } = utils;

  const moveToMainPage = () => {
    window.location.replace(location.state?.from ?? '/', {
      state: {
        ...location.state,
      },
    });
  };

  const moduleActionHandler = {
    EXIT_ADULT_CERTIFICATION: () => {
      const backPath = history.state?.isIntroPage ? -1 : '/index.html';

      if (backPath === -1) {
        history.go(backPath);
      } else {
        location.replace(backPath);
      }
    },
    SMS_AUTHENTICATION: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'kcp-sms-authentication',
        data: { type: 'JOIN_TIME' },
        onClose: async ({ reason, state }) => {
          if (reason === 'DID_SUBMIT') {
            const { isSuccess } = await actions.postKcpAgeVerification({ key: state.key });

            if (isSuccess) {
              moveToMainPage();
            }
          }
        },
      });
    },
  };

  const clickEventListener = ({ target }) => {
    const actionType = target.getAttribute('shopby-action');

    moduleActionHandler[actionType]?.({
      target,
    });
  };

  document.querySelector('adult-certification').addEventListener('click', clickEventListener);

  EventManager.on('PAGE_LOAD_COMPLETED', () => {
    if (isSignedIn() && isAgeVerified()) {
      moveToMainPage();
    }
  });
})();
