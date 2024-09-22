(() => {
  const { EventManager, pageHelper } = ShopbySkin;

  const inquiryFormLayerModalHelper = pageHelper.inquiryFormLayerModalHelper();
  inquiryFormLayerModalHelper.initialize({
    layerModalHelperKey: 'personal-inquiry-form',
  });

  const checkInvalidInquiryForm = (inquiryForm) => {
    const { inquiryDetail = {} } = inquiryForm;

    if (!inquiryDetail.inquiryTitle) {
      return { message: '제목을 입력해주세요', invalid: true };
    }

    if (!inquiryDetail.inquiryContent) {
      return { message: '내용을 입력해주세요', invalid: true };
    }

    return { message: '', invalid: false };
  };

  const moduleActionHandler = {
    CANCEL: (helper) => {
      const { inquiryForm = {} } = helper.getState();
      const { isChangedContent } = inquiryForm;

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
      const { inquiryForm = {}, fileAttach = {} } = helper.getState();

      const { inquiryDetail } = inquiryForm;
      const { imagesList = [] } = fileAttach;

      helper.modify({
        inquiryNo: inquiryDetail.inquiryNo,
        inquiryTitle: inquiryDetail.inquiryTitle,
        inquiryContent: inquiryDetail.inquiryContent,
        originalFileName: imagesList.map(({ originName }) => originName),
        uploadedFileName: imagesList.map(({ imageUrl }) => imageUrl),
        usesEmailNotificationWhenRegisteringAnswer: inquiryDetail.usesEmailNotificationWhenRegisteringAnswer,
        usesSmsNotificationWhenRegisteringAnswer: inquiryDetail.usesSmsNotificationWhenRegisteringAnswer,
      });
    },
    SUBMIT: (helper) => {
      const { inquiryForm = {}, fileAttach = {}, boardNoticeReply = {} } = helper.getState();
      const { inquiryTypeSelectOption, inquiryDetail } = inquiryForm;
      const { imagesList = [] } = fileAttach;
      const { answerEmailSendYn = false, answerSmsSendYn = false } = boardNoticeReply;

      const { message, invalid } = checkInvalidInquiryForm(inquiryForm);

      if (invalid) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'WARNING',
          message: `<em>${message}</em>`,
        });

        return;
      }

      const inquiryTypeNo = inquiryTypeSelectOption.value ?? inquiryTypeSelectOption?.options?.at(0)?.value;

      helper.submit({
        inquiryTypeNo,
        inquiryTitle: inquiryDetail.inquiryTitle,
        inquiryContent: inquiryDetail.inquiryContent,
        originalFileName: imagesList.map(({ originName }) => originName),
        uploadedFileName: imagesList.map(({ imageUrl }) => imageUrl),
        usesEmailNotificationWhenRegisteringAnswer: answerSmsSendYn,
        usesSmsNotificationWhenRegisteringAnswer: answerEmailSendYn,
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

  document.querySelector('board-form-button-group')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.(inquiryFormLayerModalHelper);
  });
  document.querySelector('file-attach').addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.({ target });
  });
})();
