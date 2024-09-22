(() => {
  const { EventManager, actions } = ShopbySkin;

  let shopbyCommonData = {};
  EventManager.on('PAGE_LOAD_COMPLETED', (commonData) => {
    shopbyCommonData = commonData;
  });

  const moveToList = () => {
    location.href = '/pages/my/inquiry-list.html';
  };

  const moduleActionHandler = {
    MODIFY: ({ inquiryNo, name, usesAttachment }) => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'personal-inquiry-form',
        title: `${name ?? '1:1문의'} 수정`,
        modalAddClass: 'personal-inquiry-form-modal',
        isFull: false,
        data: {
          isModify: true,
          inquiryNo,
          usesAttachment,
          commonData: shopbyCommonData,
        },
        onClose: ({ reason }) => {
          if (reason === 'DID_MODIFY') {
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'SUCCESS',
              message: '<em>저장되었습니다.</em>',
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },
    DELETE: ({ inquiryNo }) => {
      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: '<em>삭제 시 복구가 불가능합니다.<br>정말 삭제하시겠습니까?</em>',
        onConfirm: async () => {
          await actions.deleteInquiryByInquiryNo({ inquiryNo });

          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'SUCCESS',
            message: '<em>삭제되었습니다.</em>',
            onClose: () => {
              moveToList();
            },
          });
        },
      });
    },
    LIST: () => {
      moveToList();
    },
  };

  const inquiryDetailModuleEl = document.querySelector('inquiry-detail');
  inquiryDetailModuleEl?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');
    const inquiryNo = target.closest('[shopby-inquiry-no]')?.getAttribute('shopby-inquiry-no');
    const name = target.closest('[shopby-inquiry-board-name]')?.getAttribute('shopby-inquiry-board-name');
    const usesAttachment = target.closest('[shopby-uses-attachment]')?.getAttribute('shopby-uses-attachment');

    moduleActionHandler[action]?.({ inquiryNo, name, usesAttachment });
  });
})();
