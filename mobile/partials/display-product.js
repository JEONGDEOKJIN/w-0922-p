(() => {
  const initialize = (params) => {
    const { actions } = ShopbySkin;

    actions?.getDisplayProductSectionById?.({
      sectionsId: params?.sectionId,
      ...params?.apiOption?.displayProductSectionByIdQueryParams,
    });
  };

  const { EventManager, utils, constants } = ShopbySkin;

  const sectionId = document.currentScript.getAttribute('shopby-section-id');
  const containerEl = document.querySelector(`[shopby-section-id="${sectionId}"]`);

  const displayProductActionMap = {
    // NOTE: 좋아요버튼 클릭
    PRODUCT_LIKE_BTN: ({ sectionId, event }) => {
      event?.preventDefault?.();

      const btn = event.target.closest('[shopby-product-no]');
      const productNo = Number(btn.getAttribute('shopby-product-no') ?? 0);

      utils.isSignIn()
        ? EventManager.fire('MUTATE_LIKE_PRODUCT', {
            productNo,
            sectionId,
            onSuccess: (like) => {
              const likeBtns = document.querySelectorAll(`[shopby-product-no="${productNo}"]`);

              likeBtns?.forEach((btn) => {
                like ? btn.classList.add('is-active') : btn.classList.remove('is-active');
              });
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

  const clickEventListener = (e) => {
    const btn = e.target.closest('[shopby-action]') || e.target.parentElement.closest('[shopby-action]');
    const action = btn?.getAttribute('shopby-action');

    displayProductActionMap[action]?.({
      sectionId,
      event: e,
    });
  };

  initialize({
    sectionId,
  });

  containerEl.addEventListener('click', clickEventListener);
  containerEl.removeEventListener('unload', clickEventListener);
})();
