(() => {
  const { EventManager, pageHelper } = ShopbySkin;
  const productReviewLayerModalHelper = pageHelper.productReviewLayerModalHelper();

  productReviewLayerModalHelper.initialize({
    layerModalHelperKey: 'product-review-form',
  });

  EventManager.fire('USE_SELECT_ORDER_PRODUCT', productReviewLayerModalHelper.store.state.data.useSelectOrderProduct);

  const checkInvalidProductReviewForm = (productReviewForm) => {
    const { content, productNo } = productReviewForm;

    if (!productNo) {
      return { message: '상품을 선택해주세요.', invalid: true };
    }

    if (!content) {
      return { message: '상품후기 내용을 입력해주세요', invalid: true };
    }

    return { message: '', invalid: false };
  };

  const getAccumulationRewardNoticeTextByPhotoReviewConstraints = (reviewConfig, reviewDetail) => {
    const {
      reviewAccumulationInfo: { photoReviewsLength, reviewsLength },
      expandedReviewConfig: { accumulationRewardNoticeText },
    } = reviewConfig;

    const {
      urls: { length: contentLength },
      content: { length: urlsLength },
    } = reviewDetail;

    const usePhotoAccumulation = photoReviewsLength > 0;

    if (!usePhotoAccumulation || !urlsLength) {
      return reviewsLength > contentLength ? accumulationRewardNoticeText : '';
    }

    if (photoReviewsLength > contentLength) {
      return accumulationRewardNoticeText;
    }

    return '';
  };

  const getAccumulationRewardNoticeText = (reviewConfig, reviewDetail) => {
    if (!reviewConfig) return '';

    const { expandedReviewConfig, reviewAccumulationInfo } = reviewConfig;

    if (!expandedReviewConfig?.accumulationRewardNoticeText || !reviewAccumulationInfo) return '';

    if (reviewAccumulationInfo.useYn === 'N') return '';

    return getAccumulationRewardNoticeTextByPhotoReviewConstraints(reviewConfig, reviewDetail);
  };

  const checkConditionsForAccumulation = (action, { reviewDetail, reviewConfig }) => {
    const text = getAccumulationRewardNoticeText(reviewConfig, reviewDetail);

    if (text) {
      EventManager.fire('MODAL_CONFIRM_OPEN', {
        message: text,
        onConfirm: () => {
          action();
        },
      });
    } else {
      action();
    }
  };

  const checkValidation = (action, { content, images, score, reviewConfig, isRegisterMode, orderStatusType }) => {
    if (!content) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'WARNING',
        message: '상품후기 내용을 입력해주세요.',
      });

      return false;
    }

    const reviewDetail = {
      content,
      urls: images.map(({ imageUrl }) => imageUrl),
      rate: score,
    };

    if (!isRegisterMode || orderStatusType === 'BUY_CONFIRM') {
      checkConditionsForAccumulation(action, { reviewDetail, reviewConfig });

      return false;
    }

    if (['DELIVERY_ING', 'DELIVERY_DONE'].includes(orderStatusType)) {
      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'SUCCESS',
        message: '<em>후기 작성과 함께 구매확정 처리하시겠습니까?</em>',
        onConfirm: () => {
          checkConditionsForAccumulation(action, { reviewDetail, reviewConfig });
        },
      });

      return false;
    }

    return true;
  };

  const moduleActionHandler = {
    CANCEL: (helper) => {
      const { productReviewForm = {} } = helper.getState();
      const { isChangedContent } = productReviewForm;

      if (isChangedContent) {
        EventManager.fire('MODAL_CONFIRM_OPEN', {
          noticeType: 'WARNING',
          message: '<em>변경된 정보를 저장하지 않고 이동하시겠습니까?</em>',
          confirmLabel: '확인',
          onConfirm: () => {
            helper.closeLayerModal();
          },
        });
      } else {
        helper.closeLayerModal();
      }
    },
    SUBMIT: (helper) => {
      const { productReviewForm = {}, fileAttach = {} } = helper.getState();
      const { message, invalid } = checkInvalidProductReviewForm(productReviewForm);

      if (invalid) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'WARNING',
          message: `<em>${message}</em>`,
        });

        return;
      }

      const { content, rate, productNo, optionNo, orderOptionNo, isRegisterMode, reviewConfig, orderStatusType } =
        productReviewForm;
      const { imagesList = [] } = fileAttach;

      const images = imagesList.map(({ imageUrl }) => imageUrl);
      const submitRequest = {
        content,
        urls: images,
        rate,
        productNo,
        optionNo,
        orderOptionNo,
        isRegisterMode,
      };
      const action = () => {
        helper.submit(submitRequest);
      };

      const result = checkValidation(action, { ...submitRequest, score: rate, images, reviewConfig, orderStatusType });
      result && action();
    },
    MODIFY: (helper) => {
      const { productReviewForm, fileAttach = {} } = helper.getState();
      const { content, rate, productNo, reviewNo, isRegisterMode, reviewConfig, orderStatusType } = productReviewForm;
      const { imagesList } = fileAttach;

      const images = imagesList.map(({ imageUrl }) => imageUrl);
      const modifyRequest = {
        content,
        rate,
        urls: images,
        reviewNo,
        productNo,
        isRegisterMode,
      };

      const action = () => {
        helper.modify(modifyRequest);
      };

      const result = checkValidation(action, { ...modifyRequest, score: rate, images, reviewConfig, orderStatusType });
      if (result) {
        action();
      }
    },
    SELECT_ORDER_PRODUCT: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'select-order-product',
        isFull: true,
        data: {
          pageSize: 20,
        },
        title: '주문상품 선택',
      });
    },
    DELETE_IMAGE_IN_LIST: ({ target }) => {
      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: '<em>첨부파일을 삭제하시겠습니까?</em>',
        confirmLabel: '확인',
        onConfirm: () => {
          const imageUrl = target.closest('[shopby-image-url]').getAttribute('shopby-image-url');
          EventManager.fire('DELETE_IMAGE_IN_LIST', { imageUrl });
        },
      });
    },
  };

  document.querySelector('product-review-form')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.(productReviewLayerModalHelper);
  });

  document.querySelector('board-form-button-group')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.(productReviewLayerModalHelper);
  });
  document.querySelector('file-attach').addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.({ target });
  });
})();
