(() => {
  const { pageHelper, EventManager, utils } = ShopbySkin;

  const articleWriteFormLayerModalHelper = pageHelper.articleWriteFormLayerModalHelper();
  articleWriteFormLayerModalHelper.initialize({
    layerModalHelperKey: 'article-write-form',
  });

  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);

  const boardId = searchParams.get('boardId');
  const boardNo = searchParams.get('boardNo');
  const articleNo = searchParams.get('articleNo');

  const checkInvalidPostFormByGuest = (postForm, articleFormTerms) => {
    const { title, content, name, password, passwordIsValid } = postForm;
    const { agreeGuestTerms } = articleFormTerms;

    if (!name) {
      return { message: '작성자를 입력해주세요', invalid: true };
    }

    if (!password) {
      return { message: '비밀번호를 입력해주세요', invalid: true };
    }

    if (!passwordIsValid) {
      return { message: '비밀번호를 확인해주세요', invalid: true };
    }

    if (!title) {
      return { message: '제목을 입력해주세요', invalid: true };
    }

    if (!content) {
      return { message: '내용을 입력해주세요', invalid: true };
    }

    if (!agreeGuestTerms) {
      return { message: '비회원 글 작성에 대한 개인정보 수집 이용에 동의해주세요.', invalid: true };
    }

    return { message: '', invalid: false };
  };

  const checkInvalidPostForm = (postForm) => {
    const { title, content } = postForm;

    if (!title) {
      return { message: '제목을 입력해주세요', invalid: true };
    }

    if (!content) {
      return { message: '내용을 입력해주세요', invalid: true };
    }

    return { message: '', invalid: false };
  };

  const moduleActionHandler = {
    CANCEL: () => {
      articleWriteFormLayerModalHelper.closeLayerModal();
    },
    MODIFY: async () => {
      try {
        const { articleForm, fileAttach = {} } = articleWriteFormLayerModalHelper.getState();
        const { title, content, name, password, willBeSecretArticle, categoryNo } = articleForm;
        const { imagesList = [], files = [] } = fileAttach;

        const images = imagesList.map(({ imageUrl, originName }) => ({
          originalFileName: originName,
          uploadedFileName: imageUrl,
        }));

        const { isSuccess } = await articleWriteFormLayerModalHelper.saveArticle({
          ...articleForm,
          articleNo,
          boardNo: boardId ?? boardNo,
          boardCategoryNo: categoryNo,
          articleTitle: title,
          articleContent: content,
          guestName: name,
          password,
          secreted: willBeSecretArticle,
          images: [...images, ...files],
          isModify: true,
        });

        if (isSuccess) {
          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'SUCCESS',
            message: '<em>수정이 완료되었습니다.</em>',
            onClose: () => {
              EventManager.fire('CLOSE_TITLE_MODAL');
              window.location.reload();
            },
          });
        }
      } catch (e) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          message: e.error.description ?? e.description,
        });
      }
    },
    SUBMIT: async () => {
      try {
        const {
          articleForm = {},
          fileAttach = {},
          articleFormTerms = {},
        } = articleWriteFormLayerModalHelper.getState();

        const checkInvalidPostFormFn = utils.isSignIn() ? checkInvalidPostForm : checkInvalidPostFormByGuest;
        const { message, invalid } = checkInvalidPostFormFn(articleForm, articleFormTerms);

        if (invalid) {
          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'WARNING',
            message: `<em>${message}</em>`,
          });

          return;
        }

        const { title, content, name, password, willBeSecretArticle, categoryNo } = articleForm;
        const { imagesList = [], files = [] } = fileAttach;

        const images = imagesList.map(({ imageUrl, originName }) => ({
          originalFileName: originName,
          uploadedFileName: imageUrl,
        }));

        const { isSuccess } = await articleWriteFormLayerModalHelper.saveArticle({
          boardCategoryNo: categoryNo,
          articleNo,
          boardNo: boardId ?? boardNo,
          articleTitle: title,
          articleContent: content,
          guestName: name,
          password,
          secreted: willBeSecretArticle,
          images: [...images, ...files],
          isModify: false,
        });

        if (isSuccess) {
          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'SUCCESS',
            message: '<em>작성이 완료되었습니다.</em>',
            onClose: () => {
              EventManager.fire('CLOSE_TITLE_MODAL');
              window.location.reload();
            },
          });
        }
      } catch (e) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          message: e.error.description ?? e.description,
        });
      }
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
    DELETE_FILE: ({ target }) => {
      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: '<em>첨부파일을 삭제하시겠습니까?</em>',
        confirmLabel: '확인',
        onConfirm: () => {
          const fileName = target.closest('[shopby-file-name]').getAttribute('shopby-file-name');
          EventManager.fire('DELETE_FILE', { fileName });
        },
      });
    },
  };

  document.querySelector('board-form-button-group')?.addEventListener('click', ({ target }) => {
    const action = target.closest('[shopby-action]')?.getAttribute('shopby-action');

    moduleActionHandler[action]?.();
  });
  document.querySelector('file-attach').addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.({ target });
  });
})();
