(() => {
  const isSuccess = new URLSearchParams(location.search).get('result') === 'SUCCESS';
  const url = isSuccess
    ? `/pages/order/order-complete.html${location.search}`
    : `/pages/order/order-fail.html${location.search}`;

  if (opener) {
    opener.location.href = url;

    window.close();
  } else {
    location.replace(url);
  }
})();
