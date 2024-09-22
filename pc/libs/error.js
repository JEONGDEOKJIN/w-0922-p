(() => {
  // 오류 핸들링

  const handler = {
    authCodes: ['CECO003', 'CECO005', 'O0020', 'CECA003', 'CEDI001'],
    orderAuthCodes: ['O3336', 'O3338'],
    adultCodes: ['CEPR006'],
    adultConfirmCodes: ['O0037'],
    homeCodes: ['CEST008', 'CEST006', 'CEST007'],
    mallExpiredCodes: ['M0009'],
    redirectUrl: {
      HOME: '/',
      AUTH: '/pages/sign-in/sign-in.html',
      AUTH_AGE: '/pages/intro/adult-certification.html',
      EXPIRED_MALL: '/pages/error/expired-mall.html',
      SERVICE_CHECK: '/pages/error/service-check.html',
      ORDER_AUTH: '/pages/sign-in/member-authentication.html',
    },
    getServiceErrorKey: ({ status, error }) => {
      if (!error?.code) return null;

      if (status === 402 || handler.mallExpiredCodes.includes(error.code)) return 'EXPIRED_MALL';

      if (status === 503) return 'SERVICE_CHECK';

      return null;
    },
    getHandlerKey: ({ error, payload }) => {
      if (!error?.code) return null;

      if (handler.authCodes.includes(error.code)) return 'AUTH';

      if (handler.orderAuthCodes.includes(error.code)) {
        ShopbySkin.utils.setLocalStorage('REGISTER_ORDER_AFTER_AUTHENTICATION', JSON.stringify(payload));

        return 'ORDER_AUTH';
      }

      if (handler.adultCodes.includes(error.code)) return 'AUTH_AGE';

      if (handler.homeCodes.includes(error.code)) return 'HOME';

      return null;
    },
    getHandlerConfirmKey: (error) => {
      if (!error?.code) return null;

      if (handler.adultConfirmCodes.includes(error.code))
        return {
          message: '해당 상품은 성인전용 상품입니다.<br/>성인인증 후 상품을 구매하시겠습니까?',
          onConfirm: () => {
            handler.redirect('AUTH_AGE');
          },
        };

      return null;
    },
    redirect: (handlerKey) => {
      location.replace(`${handler.redirectUrl[handlerKey]}?from=${encodeURIComponent(location.href)}`);
    },
  };

  const locationHandler = {
    map: {
      '/display/events': {
        next: -1,
      },
      '/claims': {
        next: -1,
        exceptCodes: ['CL0058'],
      },
      '/product-detail': {
        next: '/',
      },
      '/products': {
        next: '/',
      },
    },
    getLocationInfo: (reason) => {
      const locationMap = locationHandler.map;
      const { path } = reason.error?.serverError ?? {};
      return locationMap[Object.keys(locationMap).find((key) => path?.includes(key))] ?? {};
    },
    isExceptError: (reason) => {
      const { code } = reason.error?.serverError ?? {};
      const { exceptCodes } = locationHandler.getLocationInfo(reason);

      return exceptCodes?.includes?.(code);
    },
    getNextPath: (reason) => {
      const { next } = locationHandler.getLocationInfo(reason);

      return next ?? null;
    },
  };

  const unexpectedHandler = {
    getMessage: (reason) => reason?.error?.description ?? reason?.message,
    isServerError: (reason) => {
      const isClientError = reason?.error?.code && reason.error.code !== reason?.serverError?.code;
      if (isClientError) {
        return !isClientError;
      }

      return Boolean(reason?.error?.serverError?.code);
    },
  };

  const goNext = (next) => {
    if (next !== -1) {
      location.href = next;

      return;
    }

    if (history.state && history.state.idx === 0) {
      location.href = '/';

      return;
    }

    if (!document.referrer || location.href === document.referrer) {
      history.back();

      return;
    }

    if (ShopbySkin.utils.isSignedIn() && document.referrer.includes('sign-in.html?from=')) {
      location.href = '/';

      return;
    }

    location.href = document.referrer;
  };

  const goHome = (reason) => {
    const isServerError = unexpectedHandler.isServerError(reason);

    if (!isServerError) {
      return;
    }

    location.href = '/';
  };

  const handleRejection = ({ reason }) => {
    const serviceErrorKey = handler.getServiceErrorKey(reason);
    if (serviceErrorKey) {
      handler.redirect(serviceErrorKey);

      return;
    }

    const handlerKey = handler.getHandlerKey(reason);

    if (handlerKey) {
      ShopbySkin.EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: `<em>${reason.error.description}</em>`,
        onClose: () => {
          handler.redirect(handlerKey);
        },
      });

      return;
    }

    const handlerConfirm = handler.getHandlerConfirmKey(reason);

    if (handlerConfirm) {
      ShopbySkin.EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'CAUTION',
        message: `<em>${handlerConfirm?.message}</em>`,
        confirmLabel: handlerConfirm.confirmLabel,
        cancelLabel: handlerConfirm.cancelLabel,
        onConfirm: handlerConfirm.onConfirm,
      });

      return;
    }

    const next = locationHandler.getNextPath(reason);
    const errorMessage = unexpectedHandler.getMessage(reason);

    if (errorMessage) {
      ShopbySkin.EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: `<em>${errorMessage}</em>`,
        label: '확인',
        onClose: () => {
          if (locationHandler.isExceptError(reason)) {
            return;
          }

          if (next) {
            goNext(next);
          } else {
            goHome(reason);
          }
        },
      });
    } else {
      console.error(reason);
    }
  };

  const handleError = ({ error }) => {
    if (error?.code && error?.message) {
      ShopbySkin.EventManager.fire('MODAL_ALERT_OPEN', {
        message: error?.message,
        label: '확인',
      });
    } else {
      console.error(error?.message);
    }
  };

  window.addEventListener('unhandledrejection', handleRejection);

  window.addEventListener('error', handleError);
})();
