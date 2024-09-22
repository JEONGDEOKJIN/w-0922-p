/* eslint-disable camelcase */
(() => {
  const { EventManager, utils } = ShopbySkin;
  const { createPageScriptInstance } = utils;
  const pageScriptInstance = createPageScriptInstance('MOBILE');

  const containerEl = document.querySelector('[shopby-footer-container]');

  const shortcut = {
    async initialize(commonData) {
      await this.replaceManifestWith(this.generateManifestUrl(commonData));

      this.executeServiceWorker();
    },

    replaceManifestWith(manifestURL) {
      const manifestPlaceholderEl = document.querySelector('[shopby-manifest-placeholder]');
      manifestPlaceholderEl?.setAttribute('href', manifestURL);
    },

    generateManifestUrl(commonData) {
      const mallName = commonData.mallConfig.mall?.mallName;
      const manifest = {
        name: mallName,
        short_name: mallName,
        description: mallName,
        start_url: location.origin,
        display: 'standalone',
        orientation: 'portrait',
        incognito: 'split',
        icons: [
          {
            src: `https:${commonData.bannerConfig?.appIcon}`,
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      };

      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      return URL.createObjectURL(blob);
    },

    executeServiceWorker() {
      this.deferPromptEvent();
    },

    deferPromptEvent() {
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();

        window.deferredPrompt = event;
      });

      window.addEventListener('appinstalled', (event) => {
        event.preventDefault();

        window.deferredPrompt = null;
      });
    },
  };

  const CLICK_EVENT_HANDLER_MAP = {
    HANDLE_ADD_TO_HOME_BTN_CLICK: async () => {
      const promptEvent = window.deferredPrompt;
      if (!promptEvent) return;

      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        // eslint-disable-next-line require-atomic-updates
        window.deferredPrompt = null;
        window.close();
      }
    },
  };

  const clickEventListener = (e) => {
    const action = e.target.getAttribute('shopby-action');

    CLICK_EVENT_HANDLER_MAP[action]?.(e);
  };

  containerEl?.addEventListener('click', clickEventListener);

  EventManager.on('PAGE_LOAD_COMPLETED', (commonData) => {
    shortcut.initialize(commonData);

    pageScriptInstance.appendPageScript('COMMON_FOOTER');
  });
})();
