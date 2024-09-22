(() => {
  const { EventManager, pageHelper } = ShopbySkin;
  const { initialize } = pageHelper.myOrdersHelper();
  const { withdrawClaimByOrderOptionNo } = pageHelper.orderDetailHelper();

  const searchParams = new URLSearchParams(location.search);
  const queryParams = Object.fromEntries(searchParams.entries());
  initialize(queryParams);

  const openWithdrawClaimModal = (orderOptionNo, claimStatusLabel) => {
    EventManager.fire('MODAL_CONFIRM_OPEN', {
      noticeType: 'WARNING',
      message: `<em>${claimStatusLabel} 신청을 철회하시겠습니까?</em>`,
      onConfirm: async () => {
        const { isSuccess } = await withdrawClaimByOrderOptionNo(orderOptionNo);
        if (isSuccess) {
          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'SUCCESS',
            message: `<em>${claimStatusLabel}신청 철회가 완료되었습니다.</em>`,
            onClose: () => location.reload(),
          });
        }
      },
    });
  };

  const validateWithdrawClaim = ({ claimNo, claimNos, claimStatusLabel, orderOptionNo }) => {
    const hasAfterClaim = claimNos.split(',').some((no) => Number(no) > Number(claimNo));
    if (!hasAfterClaim) {
      return true;
    }

    EventManager.fire('MODAL_CONFIRM_OPEN', {
      noticeType: 'WARNING',
      message: '<em>철회 시 후순위 클레임의 결제/환불 금액이 변동됩니다.<br>클레임을 철회하시겠습니까?</em>',
      onConfirm: () => openWithdrawClaimModal(orderOptionNo, claimStatusLabel),
    });

    return false;
  };

  const moduleActionHandler = {
    WITHDRAW_CANCEL: ({ orderOptionNo, claimNo, claimNos }) => {
      const claimStatusLabel = '취소';
      if (!validateWithdrawClaim({ claimNo, claimNos, claimStatusLabel, orderOptionNo })) {
        return;
      }
      openWithdrawClaimModal(orderOptionNo, claimStatusLabel);
    },
    WITHDRAW_EXCHANGE: ({ orderOptionNo, claimNo, claimNos }) => {
      const claimStatusLabel = '교환';
      if (!validateWithdrawClaim({ claimNo, claimNos, claimStatusLabel, orderOptionNo })) {
        return;
      }
      openWithdrawClaimModal(orderOptionNo, claimStatusLabel);
    },
    WITHDRAW_RETURN: ({ orderOptionNo, claimNo, claimNos }) => {
      const claimStatusLabel = '반품';
      if (!validateWithdrawClaim({ claimNo, claimNos, claimStatusLabel, orderOptionNo })) {
        return;
      }
      openWithdrawClaimModal(orderOptionNo, claimStatusLabel);
    },
    VIEW_CLAIM_DETAIL: ({ claimNo, modalTitlePrefix }) => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'claim-detail',
        title: `${modalTitlePrefix ?? '클레임'} 상세 정보`,
        data: {
          claimNo,
        },
      });
    },
  };

  const orderProductOptionsModule = document.querySelector('my-orders');
  const clickEventListener = ({ target }) => {
    const actionTarget = target.getAttribute('shopby-action');
    if (!actionTarget) {
      return;
    }

    const orderOptionNo = target.closest('[shopby-order-option-no]')?.getAttribute('shopby-order-option-no');
    const claimNo = target.closest('[shopby-claim-no]')?.getAttribute('shopby-claim-no');
    const modalTitlePrefix = target.getAttribute('shopby-modal-title-prefix');
    const claimNos = target.closest('[shopby-claim-nos]')?.getAttribute('shopby-claim-nos');

    moduleActionHandler[actionTarget]({ orderOptionNo, claimNo, modalTitlePrefix, claimNos });
  };

  orderProductOptionsModule.addEventListener('click', clickEventListener);
})();
