(() => {
  const searchParams = new URLSearchParams(decodeURIComponent(location.search));
  const type = searchParams.get('type');
  const resultCode = searchParams.get('resultCode');
  const resultMsg = searchParams.get('resultMsg');

  if (window.opener) {
    window.opener.postMessage({ isSuccess: !resultCode, type });
    setTimeout(() => {
      window.close();
    }, 500);
  }

  const message = document.body.querySelector('[shopby-message="message"]');

  if (resultMsg.length) {
    message.innerHTML = resultMsg;
  }
})();
