(() => {
  const {
    pageHelper,
    EventManager,
    utils: { getLocalStorage, removeLocalStorage, isSignedIn },
  } = ShopbySkin;

  if (isSignedIn() && !getLocalStorage('OPEN_ID_CALLBACK')) {
    if (!document.referrer || location.href === document.referrer) {
      history.back();

      return;
    }
    location.href = document.referrer;
  }

  const openIdHelper = pageHelper.openIdHelper();
  const containerEl = document.querySelector('[shopby-helper-key="open-id"]');

  openIdHelper.initialize({
    helperKey: 'open-id',
  });

  // eslint-disable-next-line complexity
  const clickEventListener = async ({ target }) => {
    const action = target.getAttribute('shopby-action');

    if (action === 'SIGN_UP') {
      const { termsInformation } = openIdHelper.getState();

      const requiredTermsId = termsInformation.terms.filter((term) => term.required).map((term) => term.id);

      const checkedDefaultTermsId = termsInformation.terms.filter((term) => term.checked).map((term) => term.id);
      const checkedCustomTermsId = termsInformation.customTerms.filter((term) => term.checked).map((term) => term.id);

      const checkedTermsId = [...checkedDefaultTermsId, ...checkedCustomTermsId];

      const isRequiredTermsChecked = requiredTermsId.every((requiredTermId) => checkedTermsId.includes(requiredTermId));

      if (!termsInformation || !isRequiredTermsChecked) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>필수 항목을 체크해 주세요.</em>',
        });

        return;
      }

      await openIdHelper.submit({
        payload: {
          joinTermsAgreements: checkedDefaultTermsId,
          customTermsNos: checkedCustomTermsId,
        },
      });

      removeLocalStorage('OPEN_ID_CALLBACK');
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'SUCCESS',
        message: '<em>회원가입이 완료되었습니다.</em>',
        onClose: async () => {
          await openIdHelper.signOut();
          location.replace('/pages/sign-up/sign-up-complete.html');
        },
      });

      return;
    }
    if (action === 'SHOW_TERM_DETAIL') {
      const { termsInformation } = openIdHelper.getState();

      if (!termsInformation) {
        return;
      }

      const mergedTerms = [...termsInformation.terms, ...termsInformation.customTerms];

      const selectedTerm = mergedTerms.find((term) => target.getAttribute('shopby-term-id') === term.id.toString());
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'term-detail',
        data: selectedTerm,
      });

      return;
    }

    if (action === 'CANCEL') {
      location.replace('/pages/sign-in/sign-in.html');
    }
  };
  containerEl.addEventListener('click', clickEventListener);
})();
