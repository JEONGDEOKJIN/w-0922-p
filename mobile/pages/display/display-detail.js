(() => {
  const { EventManager, pageHelper, utils, constants } = ShopbySkin;

  const { initialize } = pageHelper.displayDetailHelper();

  const param = utils.getQueryParams();

  initialize({
    sectionsId: param.sectionId,
    by: param.sortType,
  });

  const displayDetailItemsEl = document.querySelector('display-detail-items');

  const displayDetailActionMap = {
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
      EventManager.fire('SEARCH_MORE_PRODUCT', {});
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
    const btn = event.target.closest('[shopby-action]') || event.target.parentElement.closest('[shopby-action]');
    const action = btn?.getAttribute('shopby-action');

    displayDetailActionMap[action]?.({
      btn,
      event,
    });
  };

  const setHeading = (data) => {
    EventManager.fire('CHANGE_SUB_TITLE', {
      subTitle: data.label,
    });
  };

  EventManager.on('QUERY_DISPLAY_SECTIONS_IDS_SECTIONID', setHeading);

  displayDetailItemsEl.addEventListener('click', clickEventListener);
})();
