(() => {
  const { pageHelper, EventManager, utils, constants } = ShopbySkin;
  const { initialize } = pageHelper.productListHelper();

  const urlQueryParams = utils.getQueryParams();

  initialize({
    ...urlQueryParams,
  });

  const productListEl = document.querySelector('product-list-items');

  const displayProductActionMap = {
    // NOTE: 좋아요버튼 클릭
    PRODUCT_LIKE_BTN: ({ event, btn }) => {
      event?.preventDefault?.();

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
    // NOTE: 더보기
    SEARCH_MORE_PRODUCT: () => {
      EventManager.fire('SEARCH_MORE_PRODUCT');
    },
    // NOTE: 상품터치시 상품상세로 이동전 성인상품인지 확인을 위한 이벤트
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

  const clickEventListener = (event) => {
    if (!event?.target) {
      return;
    }

    const btn =
      event?.target?.closest?.('[shopby-action]') || event?.target?.parentElement?.closest?.('[shopby-action]');
    const action = btn?.getAttribute('shopby-action');

    if (!btn) {
      return;
    }

    displayProductActionMap[action]?.({
      btn,
      event,
    });
  };

  EventManager.fire('INIT_CATEGORY_SLIDER', {
    direction: 'horizontal',
    effect: 'slide',
    slidesPerView: 'auto',
    spaceBetween: 15,
    slidesOffsetBefore: 15,
    slidesOffsetAfter: 15,
  });

  productListEl.addEventListener('click', clickEventListener);
})();
