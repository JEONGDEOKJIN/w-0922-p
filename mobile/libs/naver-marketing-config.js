/* eslint-disable complexity */
/* eslint-disable camelcase */
(() => {
  /**
   * !!주의!!
   * naverMarketing 명을 임의로 변경하지 마세요.
   * 프리미엄 로그 분석이 정상적으로 동작하지 않을 수 있습니다.
   */
  globalThis.naverMarketing = {
    useNaverMarketing: false,
    useCPA: false,
    authenticationKey: null,
    setCommonScript: () => {
      if (!globalThis.naverMarketing.authenticationKey) {
        return;
      }

      const scriptTag = `
      <script type="text/javascript">
      
      // na_account_id(네이버공통키) 세팅
      if(!globalThis.wcs_add) {
        globalThis.wcs_add = {}
      };

      globalThis.wcs_add["wa"] = "${globalThis.naverMarketing.authenticationKey}";
      
      if (!globalThis._nasa) {
        globalThis._nasa = {};
      }

      globalThis.wcs?.inflow?.(); 
      globalThis.wcs_do?.(_nasa);
      </script>
      `;

      const scriptTagRange = document.createRange().createContextualFragment(scriptTag);

      if (!document.querySelector('[shopby-wcs-log]')) {
        const logTag = '<script shopby-wcs-log type="text/javascript" src="https://wcs.naver.net/wcslog.js"></script>';
        const logTagRange = document.createRange().createContextualFragment(logTag);

        document.body.appendChild(logTagRange);
      }

      document.body.append(scriptTagRange);
    },
    // CPA주문수집 동의한 경우 주문완료 시 실행
    wcsDoCPA: ({ cpaOrder, price }) => {
      if (!globalThis.naverMarketing.useCPA) {
        return;
      }

      if (!globalThis.wcs_add) {
        globalThis.wcs_add = {};
      }

      globalThis.wcs_add.wa = globalThis.naverMarketing.authenticationKey;

      const naverOrder = {};
      if (globalThis.wcs?.isCPA && globalThis.naverMarketing.useCPA) {
        naverOrder.chn = 'AD';
        naverOrder.order = JSON.stringify(cpaOrder);
        globalThis.wcs?.CPAOrder?.(naverOrder);
      }

      if (!globalThis._nasa) {
        globalThis._nasa = {};
      }

      // 기본 전환코드는 1로 설정. 이외 다른 전환코드 설정을 원하는 경우 외부 스크립트를 통해 cnvNo 값을 추가하세요.
      globalThis._nasa.cnv = globalThis.wcs?.cnv?.(globalThis?.cnvNo ?? '1', price);
    },
  };

  ShopbySkin.EventManager.on('PAGE_LOAD_COMPLETED', async () => {
    const usePageScript = !!document.querySelector('[shopby-use-page-script]');
    const { data } = await ShopbySkin.actions.queryNaverShoppingConfiguration();

    globalThis.naverMarketing.useNaverMarketing = data?.supportsNaverShopping;
    globalThis.naverMarketing.useCPA = data?.agreedToCollectingCPAOrder;
    globalThis.naverMarketing.authenticationKey = data?.authenticationKey;

    if (!globalThis.wcs_add) {
      globalThis.wcs_add = {};
    }

    globalThis.wcs_add.wa = data?.authenticationKey;

    if (!data?.supportsNaverShopping) {
      return;
    }

    !usePageScript && globalThis.naverMarketing.setCommonScript();
  });
})();
