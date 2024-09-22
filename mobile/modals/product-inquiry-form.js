(() => {
  const { EventManager, pageHelper } = ShopbySkin;

  const productInquiryFormLayerModalHelper = pageHelper.productInquiryFormLayerModalHelper();
  productInquiryFormLayerModalHelper.initialize({
    layerModalHelperKey: 'product-inquiry-form',
  });

  const checkInvalidProductInquiryForm = (productInquiryForm) => {
    const { title, content, productNo } = productInquiryForm;

    if (!productNo) {
      return { message: '상품을 선택해주세요.', invalid: true };
    }

    if (!title) {
      return { message: '상품문의 제목을 입력해주세요', invalid: true };
    }

    if (!content) {
      return { message: '상품문의 내용을 입력해주세요', invalid: true };
    }

    return { message: '', invalid: false };
  };

  const moduleActionHandler = {
    CANCEL: (helper) => {
      const { productInquiryForm = {} } = helper.getState();
      const { isChangedContent } = productInquiryForm;

      if (isChangedContent) {
        EventManager.fire('MODAL_CONFIRM_OPEN', {
          noticeType: 'WARNING',
          message: '<em>변경된 정보를 저장하지 않고 이동하시겠습니까?</em>',
          confirmLabel: '확인',
          onConfirm: () => {
            helper.closeLayerModal();
          },
        });

        return;
      }

      helper.closeLayerModal();
    },
    MODIFY: (helper) => {
      const { productInquiryForm = {} } = helper.getState();

      const { message, invalid } = checkInvalidProductInquiryForm(productInquiryForm);
      if (invalid) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'WARNING',
          message: `<em>${message}</em>`,
        });

        return;
      }

      const { inquiryNo, type, title, content, secreted } = productInquiryForm;

      helper.modify({
        inquiryNo,
        type,
        title,
        content,
        isSecreted: secreted,
      });
    },
    REGISTER: (helper) => {
      const { productInquiryForm = {} } = helper.getState();

      const { message, invalid } = checkInvalidProductInquiryForm(productInquiryForm);

      if (invalid) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'WARNING',
          message: `<em>${message}</em>`,
        });

        return;
      }

      const { productNo, type, title, content, secreted } = productInquiryForm;

      helper.submit({
        content,
        productNo,
        secreted,
        title,
        type,
      });
    },
    SELECT_PRODUCT: (helper) => {
      const { productInquiryForm = {} } = helper.getState();

      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'select-product',
        classModifier: 'select-product-modal',
        data: {
          order: 'POPULAR',
          pageSize: 20,
          mallConfig: productInquiryForm.mallConfig,
        },
        title: '상품 선택',
      });
    },
  };

  document.querySelector('product-inquiry-form')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');
    moduleActionHandler[action]?.(productInquiryFormLayerModalHelper);
  });
})();
