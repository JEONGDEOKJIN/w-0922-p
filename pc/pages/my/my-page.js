(() => {
  const { actions, EventManager } = ShopbySkin;

  let shopbyCommonData = {};
  EventManager.on('PAGE_LOAD_COMPLETED', (commonData) => {
    shopbyCommonData = commonData;
  });

  const containerEl = document.querySelector('[shopby-helper-key="my-page-helper-key"]');

  const clickEventListener = (event) => {
    const actionType = event.target.closest('[shopby-action]')?.getAttribute('shopby-action');

    const CLICK_EVENT_HANDLER_MAP = {
      LOGOUT: async () => {
        await actions.postSignOut();
        location.href = '/';
      },
      GRADE_BENEFIT: () => {
        EventManager.fire('OPEN_LAYER_MODAL', {
          name: 'grade-benefit-guide',
          title: '등급혜택 안내',
          isFull: false,
          data: {
            commonData: shopbyCommonData,
          },
        });
      },
      PRODUCT_LIKE_BTN: ({ event }) => {
        event?.preventDefault?.();

        const btn = event.target.closest('[shopby-product-no]');
        const productNo = Number(btn.getAttribute('shopby-product-no') ?? 0);

        actions.toggleLikeStatus({
          productNo,
          onSuccess: (isLiked) => {
            if (isLiked) {
              btn.classList.add('is-active');

              return;
            }

            btn.classList.remove('is-active');
          },
        });
      },
      INQUIRY_REGISTER: () => {
        EventManager.fire('OPEN_LAYER_MODAL', {
          name: 'personal-inquiry-form',
          title: `1:1문의 등록`,
          modalAddClass: 'personal-inquiry-form-modal',
          isFull: false,
          data: {
            isModify: false,
            commonData: shopbyCommonData,
          },
          onClose: ({ reason }) => {
            if (reason === 'DID_SUBMIT') {
              EventManager.fire('MODAL_ALERT_OPEN', {
                noticeType: 'SUCCESS',
                message: '<em>게시글이 저장되었습니다.</em>',
                onClose: () => {
                  location.reload();
                },
              });
            }
          },
        });
      },
      PRODUCT_INQUIRY_REGISTER: () => {
        EventManager.fire('OPEN_LAYER_MODAL', {
          name: 'product-inquiry-form',
          title: '상품문의',
          modalAddClass: 'product-inquiry-form-modal',
          isFull: false,
          data: {
            isSelectProduct: true,
            commonData: shopbyCommonData,
          },
          onClose: ({ reason }) => {
            if (reason === 'DID_SUBMIT') {
              EventManager.fire('MODAL_ALERT_OPEN', {
                noticeType: 'SUCCESS',
                message: '<em>상품문의가 등록됐습니다.</em>',
                onClose: () => {
                  location.reload();
                },
              });
            }
          },
        });
      },
      PRODUCT_REVIEW_REGISTER: () => {
        EventManager.fire('OPEN_LAYER_MODAL', {
          name: 'product-review-form',
          title: '상품후기',
          modalAddClass: 'product-review-form-modal',
          isFull: false,
          data: {
            isSelectProduct: true,
          },
          onClose: ({ reason }) => {
            if (reason === 'DID_SUBMIT') {
              EventManager.fire('MODAL_ALERT_OPEN', {
                noticeType: 'success',
                message: '<em>상품후기가 등록되었습니다.</em>',
                onClose: () => {
                  location.reload();
                },
              });
            }
          },
        });
      },
    };

    CLICK_EVENT_HANDLER_MAP[actionType]?.({ event });
  };

  containerEl.addEventListener('click', clickEventListener);
})();
