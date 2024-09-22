(() => {
  const ELEMENT_SELECTOR = {
    HELPER_KEY: '[shopby-helper-key="cart-helper-key"]',
    ACTION: 'shopby-action',
    SELECTED_COUNT: 'shopby-selected-count',
    CHECKED_CART_NOS_AS_STRING: 'shopby-checked-cart-nos-as-string',
    DELIVERY_GROUP_IDX: 'shopby-delivery-group-idx',
    IS_INVALID_PRODUCT: 'shopby-is-invalid-product',
    CART_NO: 'shopby-cart-no',
    CART_PRODUCTS: 'cart-products',
    CHECKBOX_PER_DELIVERY_GROUP_SLOT: '[slot="checkboxPerDeliveryGroup"]',
    CHECKBOX_PER_CART_NO_SLOT: '[slot="checkboxPerCartNo"]',
  };

  const { pageHelper, EventManager, actions, utils } = ShopbySkin;

  const containerEl = document.querySelector(ELEMENT_SELECTOR.HELPER_KEY);
  const cartProductsEl = containerEl.querySelector(ELEMENT_SELECTOR.CART_PRODUCTS);
  const cartHelper = pageHelper.cartHelper();

  cartHelper.initialize({
    helperKey: 'cart-helper-key',
  });

  const handleOrder = async ({ helper, cartNos, products }) => {
    const {
      data: { orderSheetNo },
    } = await helper.orderSheetAction.makeOrderSheet({
      cartNos,
      products,
    });

    const ordersheetUri = `/pages/order/order-sheet-form.html?ordersheetNo=${orderSheetNo}`;

    if (utils.isSignedIn()) {
      location.href = ordersheetUri;
    } else {
      const url = new URL(location.href);
      url.pathname = '/pages/sign-in/sign-in.html';
      url.searchParams.set('from', encodeURIComponent(ordersheetUri));

      location.href = url.toString();
    }
  };

  const CLICK_EVENT_HANDLER_MAP = {
    TOGGLE_ALL: ({ helper, target }) => {
      helper.cartAction.updateIsAllChecked(target.checked);
    },
    TOGGLE_CHECKBOX_PER_DELIVERY_GROUP: ({ helper, target }) => {
      const labelEl = target.closest(ELEMENT_SELECTOR.CHECKBOX_PER_DELIVERY_GROUP_SLOT);
      const deliveryGroupIdx = Number(labelEl.getAttribute(ELEMENT_SELECTOR.DELIVERY_GROUP_IDX) ?? -1);

      const isInvalidProduct = labelEl.getAttribute(ELEMENT_SELECTOR.IS_INVALID_PRODUCT) === 'true';

      helper.cartAction.updateIsDeliveryGroupChecked({
        deliveryGroupIdx: isInvalidProduct ? -1 : deliveryGroupIdx,
        isChecked: target.checked,
      });
    },
    TOGGLE_CHECKBOX_PER_CART_NO: ({ helper, target }) => {
      const labelEl = target.closest(ELEMENT_SELECTOR.CHECKBOX_PER_CART_NO_SLOT);

      helper.cartAction.updateIsCartNoChecked({
        cartNo: Number(labelEl.getAttribute(ELEMENT_SELECTOR.CART_NO) ?? 0),
        isChecked: target.checked,
      });
    },
    DELETE_SELECTED_ITEMS: ({ helper, target }) => {
      const selectedCount = Number(target.getAttribute(ELEMENT_SELECTOR.SELECTED_COUNT));
      const checkedCartNos =
        target.getAttribute(ELEMENT_SELECTOR.CHECKED_CART_NOS_AS_STRING)?.split?.(',')?.map(Number) ?? [];

      if (!selectedCount) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>선택하신 상품이 없습니다.</em>`,
        });

        return;
      }

      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: `<em>선택하신 ${selectedCount}개의 상품을 삭제하시겠습니까?</em>`,
        confirmLabel: '삭제',
        onConfirm: async () => {
          EventManager.fire('UPDATE_CART_PRODUCT');

          await helper.cartAction.deleteCartNos(checkedCartNos);
          helper.cartAction.fetchCartDetail();
        },
      });
    },
    ORDER: ({ helper }) => {
      const { data: checkedCartNos } = helper.cartAction.fetchCheckedCartNos();
      const { data: checkedProducts } = helper.cartAction.fetchCheckedProducts();

      const invalidCartNos = Array.from(
        containerEl.querySelectorAll('[slot="deliveryGroup"][shopby-delivery-group-idx="-1"]')
      ).flatMap((el) => {
        const cartNoEls = el.querySelectorAll('[shopby-cart-no]');
        return Array.from(cartNoEls).flatMap((el) => Number(el.getAttribute('shopby-cart-no')));
      });

      const hasInvalidCartNo = invalidCartNos.some((no) => checkedCartNos.includes(no));

      const editingEl = containerEl.querySelector('[shopby-status="EDITING"]');

      if (editingEl) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>변경중인 옵션이 있습니다.</em>`,
          onClose: () => {
            editingEl?.focus?.();
          },
        });

        return;
      }

      if (!checkedCartNos.length) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>선택된 상품이 없습니다.</em>`,
        });

        return;
      }

      if (hasInvalidCartNo) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>선택하신 상품에 구매불가한 상품이 있습니다.</em>`,
        });

        return;
      }

      handleOrder({
        cartNos: checkedCartNos,
        products: checkedProducts,
        helper,
      });
    },
    ORDER_ALL: async ({ helper }) => {
      const editingEl = containerEl.querySelector('[shopby-status="EDITING"]');

      if (editingEl) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: `<em>변경중인 옵션이 있습니다.</em>`,
          onClose: () => {
            editingEl?.focus?.();
          },
        });

        return;
      }

      const { data } = await helper.cartAction.fetchAllValidProducts();
      const cartNos = data.map(({ cartNo }) => cartNo);

      handleOrder({
        cartNos,
        products: data,
        helper,
      });
    },
  };

  const clickEventListener = ({ target }) => {
    const actionType = target.getAttribute(ELEMENT_SELECTOR.ACTION);

    CLICK_EVENT_HANDLER_MAP[actionType]?.({
      target,
      helper: cartHelper,
    });
  };

  containerEl.addEventListener('click', clickEventListener);

  // 네이버 주문
  const naverPay = {
    action: null,
    usable: false,
    el: document.querySelector('#naver-pay'),
    getVisibility: (visible) => (visible ? 'visible' : 'hidden'),
    getTotalCount: (data) => Object.keys(data)?.length || 0,
    handleReceiverCheckingStatus: (data) => {
      const { el, action, getTotalCount, getVisibility, usable } = naverPay;
      const totalCount = getTotalCount(data);
      const showsNaverPayButton = usable && totalCount > 0;
      const visibility = getVisibility(showsNaverPayButton);

      if (el) {
        el.style.visibility = visibility;

        return;
      }

      if (!showsNaverPayButton) {
        return;
      }

      action.showNaverPayButton({
        containerElementId: 'naver-pay',
        isCartPage: true,
      });
    },
    handleReceiverCheckedProducts: (data) => {
      const items = data.map(({ productNo, optionNo, orderCnt, optionInputs, channelType }) => ({
        productNo,
        optionNo,
        orderCnt,
        optionInputs,
        channelType: channelType || utils.getQueryParams()?.channelType,
      }));

      naverPay.action.prepareNaverPay({ items });
    },
    setNaverPayAction: async ({ env, clientId }) => {
      naverPay.action = await actions.getNaverPayAction({
        mallProfile: env,
        clientId,
        platform: utils.isMobileDevice ? 'MOBILE_WEB' : 'PC',
      });

      // eslint-disable-next-line require-atomic-updates
      naverPay.usable = await naverPay.action.checkUsesNaverPayOrder();
    },
  };

  EventManager.on('UPDATE_CART_PRODUCT', cartProductsEl?.showLoadingSpinner);
  EventManager.on('ON_UPDATED_CART_PRODUCT', cartProductsEl?.hideLoadingSpinner);

  EventManager.on('QUERY_CART_CHECKED_PRODUCTS', naverPay.handleReceiverCheckedProducts);

  EventManager.on('QUERY_CART_CHECKING_STATUS_PER_CART_NO', naverPay.handleReceiverCheckingStatus);

  EventManager.on('PAGE_LOAD_COMPLETED', (commonData) => {
    cartHelper.cartAction.fetchCartDetail();
    naverPay.setNaverPayAction(commonData);
  });
})();
