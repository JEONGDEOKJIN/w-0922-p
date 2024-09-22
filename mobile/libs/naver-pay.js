(() => {
  const platform = 'mobile';
  const devHostKeywords = ['alpha-', 'localhost', '127.0.0.1', 'devfe', 'gej0308'];
  const environment = devHostKeywords.some((hostKeyword) => location.hostname.includes(hostKeyword)) ? 'alpha' : 'real';

  const naverPayScript = {
    real: {
      pc: 'https://pay.naver.com/customer/js/naverPayButton.js',
      mobile: 'https://pay.naver.com/customer/js/mobile/naverPayButton.js',
    },
    alpha: {
      pc: 'https://test-pay.naver.com/customer/js/naverPayButton.js',
      mobile: 'https://test-pay.naver.com/customer/js/mobile/naverPayButton.js',
    },
  };

  document.write(`<script type="text/javascript" src="${naverPayScript[environment][platform]}"></script>`);
})();
