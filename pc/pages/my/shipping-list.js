(() => {
  const { EventManager } = ShopbySkin;

  const containerEl = document.querySelector('[shopby-helper-key="profile-shipping-address"]');
  const addressListComponent = containerEl.querySelector('my-shipping-address-list');

  const CLICK_EVENT_HANDLER_MAP = {
    REGISTER_SHIPPING_ADDRESS: ({ totalCount }) => {
      const afterRegisterForm = ({ reason }) => {
        if (reason === 'DID_SUBMIT') {
          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'SUCCESS',
            message: '<em>배송지가 등록되었습니다.</em>',
            data: {
              totalCount,
            },
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
    DELETE_SHIPPING_ADDRESS: ({ addressNo, isDefault, addressName }) => {
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
    MODIFY_SHIPPING_ADDRESS: ({ addressNo, totalCount }) => {
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
  };

  const clickEventListener = ({ target }) => {
    const actionType = target.getAttribute('shopby-action');

    const addressNo = Number(target.closest('[shopby-address-no]')?.getAttribute?.('shopby-address-no') ?? 0);
    const addressName = target.closest('[shopby-address-name]')?.getAttribute?.('shopby-address-name');
    const isDefault = target.closest('[shopby-default-yn]')?.getAttribute?.('shopby-default-yn') === 'Y';
    const totalCount = Number(target.getAttribute('shopby-total-count') || 0);

    CLICK_EVENT_HANDLER_MAP[actionType]?.({
      addressNo,
      isDefault,
      totalCount,
      addressName,
    });
  };

  containerEl.addEventListener('click', clickEventListener);

  EventManager.on('PAGE_LOAD_COMPLETED', () => {
    addressListComponent.fetchList();
  });
})();
