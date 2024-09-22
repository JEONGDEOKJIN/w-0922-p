(() => {
  const claimDetailLayerModalHelper = ShopbySkin.pageHelper.claimDetailLayerModalHelper();

  claimDetailLayerModalHelper.initialize({ layerModalHelperKey: 'claim-detail' });

  const claimDetailModule = document.querySelector('claim-detail');
  claimDetailModule.addEventListener('click', ({ target }) => {
    const action = target.getAttribute('shopby-action');

    if (action === 'CONFIRM') {
      claimDetailLayerModalHelper.closeLayerModal();
    }
  });
})();
