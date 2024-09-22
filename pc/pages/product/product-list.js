(() => {
  const { pageHelper, utils, EventManager, constants } = ShopbySkin;
  const { initialize } = pageHelper.productListHelper();

  const urlQueryParams = utils.getQueryParams();

  initialize({
    ...urlQueryParams,
  });

  const productListActionMap = {
    // NOTE: 좋아요버튼 클릭
    PRODUCT_LIKE_BTN: ({ event }) => {
      event?.preventDefault?.();

      const btn = event.target.closest('[shopby-product-no]');
      const productNo = Number(btn.getAttribute('shopby-product-no') ?? 0);

      utils.isSignIn()
        ? EventManager.fire('MUTATE_LIKE_PRODUCT', {
            productNo,
            onSuccess: (like) => {
              like ? btn.classList.add('is-active') : btn.classList.remove('is-active');
            },
          })
        : EventManager.fire('MODAL_CONFIRM_OPEN', {
            message: `로그인하셔야 본 서비스를 이용하실 수 있습니다.`,
            noticeType: constants.NOTICE_MODAL_TYPE.WARNING,
            onConfirm: () => {
              const nextUrl = `${location.origin}/pages/sign-in/sign-in.html`;

              location.href = `${nextUrl}?from=${encodeURIComponent(location.href)}`;
            },
          });
    },
    MOVE_PRODUCT_DETAIL: ({ event }) => {
      if (!utils.isAdultVerified(event)) {
        EventManager.fire('MODAL_CONFIRM_OPEN', {
          message: '성인인증이 필요한 상품입니다.',
          noticeType: 'CAUTION',
          onConfirm: () => {
            location.href = '/pages/intro/adult-certification.html';
          },
        });
      }
    },
  };

  const clickEventListener = (e) => {
    if (!e?.target) {
      return;
    }

    const btn = e?.target?.closest?.('[shopby-action]') || e?.target?.parentElement?.closest?.('[shopby-action]');
    const action = btn?.getAttribute('shopby-action');

    if (!btn) {
      return;
    }

    productListActionMap[action]?.({
      event: e,
    });
  };

  document.addEventListener('click', clickEventListener);
})();
