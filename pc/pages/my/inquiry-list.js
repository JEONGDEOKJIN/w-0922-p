(() => {
  const { EventManager, pageHelper } = ShopbySkin;
  const myInquiryListHelper = pageHelper.myInquiryListHelper();

  myInquiryListHelper.initialize();

  const moduleActionHandler = {
    REGISTER: ({ name = '', usesAttachment }) => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'personal-inquiry-form',
        title: `${name ?? '1:1문의'} 등록`,
        modalAddClass: 'personal-inquiry-form-modal',
        isFull: false,
        data: {
          isModify: false,
          usesAttachment,
          commonData: myInquiryListHelper.commonData,
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
  };

  const inquiryFormModuleEl = document.querySelector('inquiry-register');
  inquiryFormModuleEl?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');
    const name = target.closest('[shopby-inquiry-board-name]')?.getAttribute('shopby-inquiry-board-name');
    const usesAttachment = target.closest('[shopby-uses-attachment]')?.getAttribute('shopby-uses-attachment');

    moduleActionHandler[action]?.({ name, usesAttachment });
  });

  const inquiryListModuleEl = document.querySelector('inquiry-list');
  inquiryListModuleEl?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');
    const inquiryNo = target.closest('[shopby-inquiry-no]')?.getAttribute('shopby-inquiry-no');
    const name = target.closest('[shopby-inquiry-board-name]')?.getAttribute('shopby-inquiry-board-name');

    moduleActionHandler[action]?.({ inquiryNo, name });
  });
})();
