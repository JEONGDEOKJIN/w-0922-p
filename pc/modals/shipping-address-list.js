(() => {
  const { pageHelper, EventManager } = ShopbySkin;

  const containerEl = document.querySelector('[shopby-layer-modal-helper-key="shipping-address-list"]');
  const addressListComponent = containerEl.querySelector('my-shipping-address-list');
  const shippingAddressesLayerModalHelper = pageHelper.shippingAddressesLayerModalHelper();

  shippingAddressesLayerModalHelper.initialize({
    layerModalHelperKey: 'shipping-address-list',
  });

  const CLICK_EVENT_HANDLER_MAP = {
    SELECT_ADDRESS: ({ event, helper }) => {
      event.preventDefault();

      const { myShippingAddressList } = helper.getState();

      if (!myShippingAddressList?.address?.addressNo) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>배송지를 선택해주세요.</em>',
        });

        return;
      }

      helper.closeLayerModal({
        reason: 'DID_SUBMIT',
        state: {
          address: myShippingAddressList.address,
        },
      });
    },
    REGISTER_SHIPPING_ADDRESS: ({ event: { target } }) => {
      const totalCount = Number(target.getAttribute('shopby-total-count') || 0);

      const afterRegisterForm = ({ reason }) => {
        if (reason === 'DID_SUBMIT') {
          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'SUCCESS',
            message: '<em>배송지가 등록되었습니다.</em>',
            onClose: () => {
              addressListComponent.fetchList({
                refresh: true,
              });
            },
          });
        }
      };

      EventManager.fire('OPEN_LAYER_MODAL', {
        isFull: false,
        modalAddClass: 'address-form',
        name: 'shipping-address-form',
        title: '배송지 등록',
        onClose: afterRegisterForm,
        data: {
          totalCount,
        },
      });
    },
    MODIFY_SHIPPING_ADDRESS: ({ event: { target } }) => {
      const addressNo = Number(target.getAttribute('shopby-address-no') || 0);
      const totalCount = Number(target.getAttribute('shopby-total-count') || 0);

      addressNo &&
        EventManager.fire('OPEN_LAYER_MODAL', {
          isFull: false,
          modalAddClass: 'address-form',
          name: 'shipping-address-form',
          title: '배송지 수정',
          data: {
            addressNo,
            totalCount,
          },
          onClose: ({ reason }) => {
            if (reason === 'DID_MODIFY') {
              EventManager.fire('MODAL_ALERT_OPEN', {
                noticeType: 'SUCCESS',
                message: '<em>수정이 완료되었습니다.</em>',
                onClose: () => {
                  addressListComponent.fetchList({
                    refresh: true,
                  });
                },
              });
            }
          },
        });
    },
    DELETE_SHIPPING_ADDRESS: ({ event: { target } }) => {
      const addressNo = Number(target.getAttribute('shopby-address-no') || 0);
      const isDefault = target.getAttribute('shopby-default-yn') === 'Y';
      const addressName = target.getAttribute('shopby-address-name');

      if (!addressNo) {
        return;
      }

      if (isDefault) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>기본 배송지는 삭제할 수 없습니다.<br />변경 후에 삭제해 주세요.</em>',
        });

        return;
      }

      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: `<em>${addressName}${addressName ? ' ' : ''}배송지를 삭제하시겠습니까?</em>`,
        confirmLabel: '삭제',
        onConfirm: async () => {
          await addressListComponent.deleteProfileShippingAddress(addressNo);

          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'SUCCESS',
            message: '<em>배송지가 삭제되었습니다.</em>',
            onClose: () => {
              addressListComponent.fetchList({
                refresh: true,
              });
            },
          });
        },
      });
    },
  };

  const clickEventListener = (event) => {
    const action = event.target.getAttribute('shopby-action');

    CLICK_EVENT_HANDLER_MAP[action]?.({
      event,
      helper: shippingAddressesLayerModalHelper,
    });
  };

  containerEl.addEventListener('click', clickEventListener);

  addressListComponent.fetchList({
    refresh: true,
  });
})();
