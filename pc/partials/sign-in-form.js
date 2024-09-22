(() => {
  const {
    EventManager,
    pageHelper,
    utils: { handleFocusEvent, setLocalStorage, getLocalStorage, removeLocalStorage },
  } = ShopbySkin;

  const signInHelper = pageHelper.signInHelper();

  signInHelper.initialize({
    helperKey: 'sign-in-form',
  });

  const containerEl = document.querySelector('sign-in-form');
  const getFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);

    const from = searchParams.get('from');

    const mainUrl = '/';
    return decodeURIComponent(from || mainUrl);
  };

  if (getLocalStorage('OPEN_ID_DORMANT_CALLBACK')) {
    const openIdDormantInformation = JSON.parse(getLocalStorage('OPEN_ID_DORMANT_CALLBACK') ?? '{}');

    EventManager.fire('OPEN_LAYER_MODAL', {
      name: 'dormant-sign-in',
      modalAddClass: 'dormant-sign-in-modal',
      isFull: false,
      data: {
        ...openIdDormantInformation?.dormantMemberResponse,
        accessToken: openIdDormantInformation?.accessToken,
        expireIn: openIdDormantInformation?.expireIn,
      },
      onClose: ({ reason }) => {
        if (reason === 'DID_SUBMIT') {
          location.replace(getFromUrl());
          removeLocalStorage('OPEN_ID_DORMANT_CALLBACK');

          return;
        }

        signInHelper.signOut();
      },
    });
  }

  const checkSignInValid = (params) => {
    if (!params || !params.memberId) {
      return {
        field: 'memberId',
        message: '아이디를 입력하세요.',
      };
    }

    if (!params.password) {
      return {
        field: 'password',
        message: '비밀번호를 입력하세요.',
      };
    }

    return {
      field: '',
      message: '',
    };
  };

  const showInvalidModal = (validResult) => {
    if (validResult.message) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: validResult.message,
        onClose: () => {
          handleFocusEvent({ containerEl, fields: validResult.field });
        },
      });

      return false;
    }

    return true;
  };

  // eslint-disable-next-line complexity
  const handleSignInSubmit = async (params) => {
    const memberIdEl = containerEl?.querySelector('input[slot="memberId"]');
    const passwordEl = containerEl?.querySelector('input[slot="password"]');

    const memberId = params?.memberId ?? memberIdEl.value.trim();
    const password = params?.password ?? passwordEl.value.trim();

    const validationResult = checkSignInValid({ memberId, password });
    if (!showInvalidModal(validationResult)) {
      return;
    }

    const { data } = await signInHelper.signIn({
      payload: {
        memberId,
        password,
      },
    });

    const saveIdCheckedEl = containerEl.querySelector('input[slot="saveIdChecked"]');

    const saveIdChecked = params?.saveIdChecked ?? saveIdCheckedEl.checked;

    if (saveIdChecked) {
      setLocalStorage('SAVE_MEMBER_ID', memberId);
    }

    if (data.dormantMemberResponse) {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'dormant-sign-in',
        modalAddClass: 'dormant-sign-in-modal',
        isFull: false,
        data: data.dormantMemberResponse,
        onClose: ({ reason }) => {
          if (reason === 'DID_SUBMIT') {
            location.replace(getFromUrl());

            return;
          }

          signInHelper.signOut();
        },
      });

      return;
    }

    if (data.daysFromLastPasswordChange > 90) {
      const nextUrl = `${location.origin}/pages/sign-in/expired-password-change-form.html`;
      location.replace(`${nextUrl}?from=${getFromUrl()}`);

      return;
    }

    location.replace(getFromUrl());
  };

  const clickEventListener = ({ target }) => {
    const action = target.getAttribute('shopby-action');

    if (action === 'SIGN_IN') {
      const { signInForm } = signInHelper.getState();

      handleSignInSubmit(signInForm);
    }
  };

  const keypressEventListener = ({ target, key }) => {
    const action = target.getAttribute('shopby-action');

    if (key === 'Enter' && action === 'PASSWORD_KEYPRESS') {
      const { signInForm } = signInHelper.getState();
      handleSignInSubmit({ ...signInForm, password: target.value.trim() });
    }
  };

  containerEl.addEventListener('click', clickEventListener);
  containerEl.addEventListener('keypress', keypressEventListener);
})();
