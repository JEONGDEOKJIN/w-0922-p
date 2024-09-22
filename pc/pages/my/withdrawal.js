(() => {
  const { pageHelper, EventManager } = ShopbySkin;

  const withdrawalHelper = pageHelper.withdrawalHelper();
  const containerEl = document.querySelector('[shopby-helper-key="withdrawal"]');

  withdrawalHelper.initialize({
    helperKey: 'withdrawal',
    platform: 'PC',
  });

  const fetchConfirmMessage = (helper) => {
    const { couponCnt, hasOrder, accumulationAmount: accumulation } = helper.getState().helperState;

    const accumulationAmount = Number(accumulation ?? 0).toLocaleString();

    if (hasOrder) {
      return !!couponCnt || !!accumulationAmount
        ? `진행중인 주문 건이 있습니다. <br>탈퇴 시 쇼핑몰에 접속 및 주문내역 확인이 불가하며 보유중인 적립금 및 쿠폰은 모두 삭제됩니다.<br>탈퇴하시겠습니까?<br>사용가능한 쿠폰 ${couponCnt}장 / 적립금 ${accumulationAmount}원`
        : '진행중인 주문 건이 있습니다. <br>탈퇴 시 쇼핑몰에 접속 및 주문내역 확인이 불가합니다. <br>탈퇴하시겠습니까?';
    }

    return `탈퇴 시 쇼핑몰에 접속 불가하며 보유중인 적립금 및 쿠폰은 모두 삭제됩니다.<br>탈퇴하시겠습니까?<br>사용가능한 쿠폰 ${couponCnt}장 / 적립금 ${accumulationAmount}원`;
  };

  const handleWithdrawal = (helper) => {
    const { withdrawalProfileForm } = helper.getState();

    if (!withdrawalProfileForm.reason) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>탈퇴 사유를 입력해주세요.</em>',
      });

      return;
    }

    if (!withdrawalProfileForm.termAgreed) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'CAUTION',
        message: '<em>회원탈퇴 동의 후 탈퇴가 가능합니다.</em>',
      });

      return;
    }

    EventManager.fire('MODAL_CONFIRM_OPEN', {
      noticeType: 'WARNING',
      message: `<em>${fetchConfirmMessage(helper)}</em>`,
      onConfirm: async () => {
        await helper.withdrawal({
          reason: withdrawalProfileForm.reason,
        });

        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'SUCCESS',
          message: '<em>회원 탈퇴가 완료되었습니다.</em>',
          onClose: () => {
            location.replace('/');
          },
        });
      },
    });
  };

  const clickEventListener = ({ target }) => {
    const action = target.getAttribute('shopby-action');

    if (action === 'CLICK_WITHDRAWAL') {
      handleWithdrawal(withdrawalHelper);
    }
  };
  containerEl.addEventListener('click', clickEventListener);
})();
