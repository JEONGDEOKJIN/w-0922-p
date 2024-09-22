(() => {
  const externalServiceConfig = {
    naverWebmaster: (id) => {
      if (!id) {
        return;
      }

      const webmasterTag = `<meta id="naverSiteVerification" name="naver-site-verification" content="${id}"></meta>`;
      const webmasterRange = document.createRange().createContextualFragment(webmasterTag);

      document.querySelector('head').append(webmasterRange);
    },
    googleAnalytics: (id) => {
      if (!id) {
        return;
      }

      const gtagScript = `<script src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>`;
      const gtagExecuterScript = `
      <script>
        globalThis.dataLayer = globalThis.dataLayer || [];

        function gtag() {
          dataLayer.push(arguments);
        }
        
        gtag("js", new Date());
    
        gtag("config", "${id}"); // GA4, Stream ID
      </script>
      `;

      const gtagScriptRange = document.createRange().createContextualFragment(gtagScript);
      const gtagExecuterScriptRange = document.createRange().createContextualFragment(gtagExecuterScript);

      document.querySelector('head').append(gtagScriptRange, gtagExecuterScriptRange);
    },
  };

  ShopbySkin.EventManager.on('PAGE_LOAD_COMPLETED', (commonData) => {
    const { googleAnalytics, naverWebmaster } = commonData?.mallConfig?.externalServiceConfig ?? {};

    externalServiceConfig.naverWebmaster(naverWebmaster);
    externalServiceConfig.googleAnalytics(googleAnalytics);
  });
})();
