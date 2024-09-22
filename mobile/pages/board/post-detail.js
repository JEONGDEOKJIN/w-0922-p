(() => {
  const { EventManager } = ShopbySkin;
  const { deleteArticle, checkIsArticleEditable } = ShopbySkin.pageHelper.articleViewHelper();

  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);

  const boardId = searchParams.get('boardId');
  const boardNo = searchParams.get('boardNo');
  const articleNo = Number(searchParams.get('articleNo'));

  let shopbyCommonData = {};
  EventManager.on('PAGE_LOAD_COMPLETED', (commonData) => {
    shopbyCommonData = commonData;
  });

  const moveToList = () => {
    let queryString = '';

    if (boardId) {
      queryString += `boardId=${boardId}`;
    } else if (boardNo) {
      queryString += `boardNo=${boardNo}`;
    }

    location.href = `/pages/board/post-list.html${queryString && `?${queryString}`}`;
  };

  const openPasswordFormModal = (nextAction) => {
    EventManager.fire('OPEN_LAYER_MODAL', {
      name: 'check-post-password-form',
      title: '비밀번호 인증',
      modalAddClass: 'password-form-modal',
      isFull: false,
      onClose: ({ reason, state = {} }) => {
        if (reason === 'DID_SUBMIT' && nextAction) {
          nextAction(state);
        }
      },
    });
  };

  const openPostFormModal = ({ boardName, password = '' }) => {
    const { boardConfigs = [] } = shopbyCommonData.allBoardConfig;

    EventManager.fire('OPEN_LAYER_MODAL', {
      title: boardName,
      name: 'article-write-form',
      data: {
        boardId,
        boardNo,
        articleNo,
        password,
        boardConfigs,
        isModify: true,
      },
      onClose: ({ reason }) => {
        if (reason === 'DID_SUBMIT') {
          location.reload();
        }
      },
    });
  };

  const postFormModal = ({ registerType, boardName }) => {
    if (registerType === 'GUEST') {
      openPasswordFormModal(({ password }) => {
        if (password) {
          openPostFormModal({ boardName, password });
        }
      });
    } else {
      openPostFormModal({ boardName });
    }
  };

  const deleteAction = async (state) => {
    const { password = '' } = state ?? {};

    const param = {
      boardNo: boardId || boardNo,
      articleNo,
      password,
    };

    await deleteArticle(param);

    EventManager.fire('MODAL_ALERT_OPEN', {
      noticeType: 'SUCCESS',
      message: '<em>삭제가 완료되었습니다.</em>',
      onClose: () => {
        moveToList();
      },
    });
  };

  const moduleActionHandler = {
    LIST: moveToList,
    MODIFY: async ({ target }) => {
      const boardName = document.querySelector('[shopby-board-name]')?.getAttribute('shopby-board-name');
      const registerType = target.closest('[shopby-register-type]')?.getAttribute('shopby-register-type');

      if (registerType !== 'GUEST') {
        const isArticleEditable = await checkIsArticleEditable({
          boardNo: boardId || boardNo,
          articleNo,
        });

        if (!isArticleEditable) {
          EventManager.fire('MODAL_ALERT_OPEN', {
            message: '권한이 없습니다.',
          });

          return;
        }
      }

      postFormModal({ registerType, boardName });
    },
    DELETE: ({ target }) => {
      const registerType = target.closest('[shopby-register-type]')?.getAttribute('shopby-register-type');

      EventManager.fire('MODAL_CONFIRM_OPEN', {
        noticeType: 'WARNING',
        message: '<em>게시글을 삭제하시겠습니까?</em>',
        onConfirm: () => {
          if (registerType === 'GUEST') {
            openPasswordFormModal((state) => {
              deleteAction(state);
            });
          } else {
            deleteAction();
          }
        },
      });
    },

    DOWNLOAD_FILE: async ({ target }) => {
      const fileName = target.getAttribute('shopby-file-name');
      const originFileName = target.getAttribute('shopby-origin-file-name');

      const blob = await ShopbySkin.utils.downloadFile(fileName);

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = originFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
  };

  // 비밀번호 인증이 필요한 경우
  EventManager.on('NEED_PASSWORD_FORM', () => {
    EventManager.fire('OPEN_LAYER_MODAL', {
      name: 'check-post-password-form',
      title: '비밀번호 인증',
      modalAddClass: 'password-form-modal',
      isFull: false,
      onClose: ({ reason }) => {
        if (reason === 'DID_CLOSE') {
          if (!document.referrer || location.href === document.referrer) {
            history.back();

            return;
          }
          location.href = document.referrer;
        }
      },
    });
  });

  // 해당 게시글에 접근할 권한이 없는 경우
  EventManager.on('FORBIDDEN_ARTICLE', () => {
    EventManager.fire('MODAL_ALERT_OPEN', {
      noticeType: 'WARNING',
      message: '<em>비밀글 조회 권한이 없습니다.</em>',
      onClose: () => {
        if (!document.referrer || location.href === document.referrer) {
          history.back();

          return;
        }
        location.href = document.referrer;
      },
    });
  });

  document.querySelector('article-view-btns')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.({ target });
  });

  document.querySelector('article-view')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.({ target });
  });
})();
