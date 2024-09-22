(() => {
  const { EventManager, pageHelper } = ShopbySkin;

  const articlePasswordFormLayerModalHelper = pageHelper.articlePasswordFormLayerModalHelper();
  articlePasswordFormLayerModalHelper.initialize({
    layerModalHelperKey: 'check-post-password-form',
  });

  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);

  const boardId = searchParams.get('boardId');
  const boardNo = searchParams.get('boardNo');
  const articleNo = Number(searchParams.get('articleNo'));

  const moduleActionHandler = {
    SEND_PASSWORD: async (helper) => {
      const { passwordForm } = helper.getState();
      const { password } = passwordForm;

      const isArticleEditable = await helper.checkIsArticleEditable({
        password,
        boardNo: boardId || boardNo,
        articleNo,
      });

      if (isArticleEditable) {
        helper.sendPassword(password);
        helper.closeLayerModal({
          reason: 'DID_SUBMIT',
          state: { password },
        });
      } else {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>비밀번호가 틀렸습니다.</em>',
        });
      }
    },
  };

  document.querySelector('password-form')?.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    moduleActionHandler[action]?.(articlePasswordFormLayerModalHelper);
  });
})();
