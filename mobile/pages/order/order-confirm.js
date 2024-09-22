(() => {
  const isSuccess = new URLSearchParams(location.search).get('result') === 'SUCCESS';

  location.replace(
    isSuccess ? `/pages/order/order-complete.html${location.search}` : `/pages/order/order-fail.html${location.search}`
  );
})();
