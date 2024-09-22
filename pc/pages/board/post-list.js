(() => {
  const { EventManager, utils } = ShopbySkin;
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);

  const boardId = searchParams.get('boardId');
  const boardNo = searchParams.get('boardNo');

  let shopbyCommonData = {};
  EventManager.on('PAGE_LOAD_COMPLETED', (commonData) => {
    shopbyCommonData = commonData;
  });

  const getActionNameWithPairKey = ({ action, target }) => {
    const pairKey = target.closest('[pair-key]')?.getAttribute('pair-key');
    const actionKeySuffix = pairKey ? `:${pairKey}` : '';

    return `${action}${actionKeySuffix}`;
  };

  const moduleActionHandler = {
    WRITE: ({ target }) => {
      const boardName = document.querySelector('[shopby-board-name]')?.getAttribute('shopby-board-name');
      const canPostByMember = target.closest('[shopby-can-post-by-member]')?.getAttribute('shopby-can-post-by-member');
      const canPostByGuest = target.closest('[shopby-can-post-by-guest]')?.getAttribute('shopby-can-post-by-guest');
      const canSecretPosting = target.closest('[shopby-can-secret-posting]')?.getAttribute('shopby-can-secret-posting');
      const usesAttachment = target.closest('[shopby-uses-attachment]')?.getAttribute('shopby-uses-attachment');

      const isCanPostByMember = canPostByMember === 'true';
      const isCanPostByGuest = canPostByGuest === 'true';

      if (isCanPostByMember && !utils.isSignedIn()) {
        if (!isCanPostByGuest) {
          EventManager.fire('MODAL_CONFIRM_OPEN', {
            noticeType: 'WARNING',
            message: '<em>로그인 하셔야 본 서비스를 <br/> 이용하실 수 있습니다.</em>',
            onConfirm: () => {
              const nextUrl = `${location.origin}/pages/sign-in/sign-in.html`;
              location.href = `${nextUrl}?from=${encodeURIComponent(location.href)}`;
            },
          });

          return;
        }
      }

      if (!isCanPostByMember && utils.isSignedIn()) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>비회원 전용 게시판 입니다.</em>',
        });

        return;
      }

      const { boardConfigs = [] } = shopbyCommonData.allBoardConfig;

      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'article-write-form',
        title: boardName,
        isFull: false,
        data: {
          boardId,
          boardNo,
          canSecretPosting,
          usesAttachment,
          boardConfigs,
          isModify: false,
        },
        onClose: ({ reason }) => {
          if (reason === 'DID_SUBMIT') {
            location.reload();
          }
        },
      });
    },

    MOVE_TO_FIRST_PAGE: ({ target }) => {
      const actionName = getActionNameWithPairKey({ action: 'MOVE_TO_FIRST_PAGE', target });

      EventManager.fire(actionName);
    },
    MOVE_TO_PREV_PAGE: ({ target }) => {
      const actionName = getActionNameWithPairKey({ action: 'MOVE_TO_PREV_PAGE', target });

      EventManager.fire(actionName);
    },
    MOVE_TO_PAGE: ({ target }) => {
      const actionName = getActionNameWithPairKey({ action: 'MOVE_TO_PAGE', target });
      const page = target.closest('[shopby-page]')?.getAttribute('shopby-page');

      EventManager.fire(actionName, { page });
    },
    MOVE_TO_NEXT_PAGE: ({ target }) => {
      const actionName = getActionNameWithPairKey({ action: 'MOVE_TO_NEXT_PAGE', target });

      EventManager.fire(actionName);
    },
    MOVE_TO_LAST_PAGE: ({ target }) => {
      const actionName = getActionNameWithPairKey({ action: 'MOVE_TO_LAST_PAGE', target });

      EventManager.fire(actionName);
    },
  };

  document.querySelector('article-list-info')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');
    const boardName = document.querySelector('[shopby-board-name]')?.getAttribute('shopby-board-name');

    moduleActionHandler[action]?.({ boardName });
  });

  document.querySelector('article-total-count')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.({ target });
  });

  document.querySelector('article-list')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.({ target });
  });
})();
