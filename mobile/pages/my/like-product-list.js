(() => {
  const { EventManager, pageHelper, actions } = ShopbySkin;
  const myLikeProductListHelper = pageHelper.myLikeProductListHelper();

  myLikeProductListHelper.initialize({});

  const moduleActionHandler = {
    INQUIRE_PRODUCT: (_, target) => {
      const productNo = target.closest('[shopby-product-no]')?.getAttribute('shopby-product-no');
      const productName = target.closest('[shopby-product-name]')?.getAttribute('shopby-product-name');
      const imageUrl = target.closest('[shopby-image-url]')?.getAttribute('shopby-image-url');

      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-inquiry-form',
        title: '상품문의',
        data: {
          productNo,
          productName,
          imageUrl,
          isModify: false,
          commonData: myLikeProductListHelper.commonData,
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
    DELETE_LIKE_PRODUCT: (_, target) => {
      const productNo = target.closest('[shopby-product-no]')?.getAttribute('shopby-product-no');

      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: '<em>선택하신 상품을 삭제하시겠습니까?</em>',
        onConfirm: async () => {
          await actions.postProfileLikeByProductNos({ productNos: [productNo] });

          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'SUCCESS',
            message: '<em>삭제되었습니다.</em>',
            onClose: () => {
              location.reload();
            },
          });
        },
      });
    },

    DELETE_SELECTED_LIKE_PRODUCTS: (_, target) => {
      const selectedCount = target.getAttribute('shopby-selected-count');
      const checkedProductNosAsString = target.getAttribute('shopby-checked-product-nos-as-string');

      if (!Number(selectedCount)) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>선택하신 상품이 없습니다.</em>',
        });

        return;
      }

      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: `<em>선택하신 ${selectedCount}개의 상품을 삭제하시겠습니까?</em>`,
        onConfirm: async () => {
          const productNos = checkedProductNosAsString.split(',');

          await actions.postProfileLikeByProductNos({ productNos });

          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'SUCCESS',
            message: '<em>삭제되었습니다.</em>',
            onClose: () => {
              location.reload();
            },
          });
        },
      });
    },
  };

  document.querySelector('like-product-total-count')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.(myLikeProductListHelper, target);
  });

  document.querySelector('like-product-list')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.(myLikeProductListHelper, target);
  });
})();
