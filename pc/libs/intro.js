(() => {
  const exceptPaths = [
    '/adult-certification',
    '/no-access',
    '/member-only',
    '/sign-up-form',
    '/sign-up-method',
    '/sign-up-complete',
    '/sign-up-pending',
    '/sign-in',
    '/expired-password-change-form',
    'change-password',
    '/open-id',
    '/find-id',
    '/find-password',
    '/change-password',
    '/order-complete',
    '/not-found',
    '/service-check',
    '/expired-mall',
  ];

  const INTRO_PAGE_TYPE_MAP = {
    NONE: 'NONE',
    NO_ACCESS: 'NO_ACCESS',
    ONLY_MEMBER: 'ONLY_MEMBER',
    ONLY_ADULT: 'ONLY_ADULT',
  };

  const { utils, pageHelper, EventManager } = ShopbySkin;
  const { isAgeVerified, isSignIn, isPreview } = utils;

  const introHelper = pageHelper.introHelper();

  const INTRO_PAGE_ROUTING_MAP = {
    [INTRO_PAGE_TYPE_MAP.ONLY_ADULT]: {
      next: `/pages/intro/adult-certification.html`,
      shouldGoToOwnPage: () => isAgeVerified(),
    },
    [INTRO_PAGE_TYPE_MAP.NO_ACCESS]: {
      next: `/pages/intro/no-access.html`,
      shouldGoToOwnPage: () => false,
    },
    [INTRO_PAGE_TYPE_MAP.ONLY_MEMBER]: {
      next: `/pages/intro/member-only.html`,
      shouldGoToOwnPage: () => isSignIn(),
    },
  };

  const platformType = 'pc';

  EventManager.on('PAGE_LOAD_COMPLETED', async () => {
    const {
      mall: { introRedirection },
    } = await introHelper.getMalls();

    const condition = INTRO_PAGE_ROUTING_MAP[introRedirection[platformType]];
    const isExceptPath = exceptPaths.some((path) => location.pathname.includes(path));
    const shouldAcceptIntroPage = !isExceptPath && !isPreview();

    if (condition && !condition.shouldGoToOwnPage() && shouldAcceptIntroPage) {
      utils.replaceHistory({
        state: {
          from: `${location.pathname}${location.search}`,
          isIntroPage: true,
        },
        url: `${location.origin}${condition.next}`,
      });

      location.reload();
    }
  });
})();
