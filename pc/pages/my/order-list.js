(() => {
  const { EventManager, pageHelper } = ShopbySkin;
  const { withdrawClaimByOrderOptionNo, confirmOrder, cancelOrder } = pageHelper.orderDetailHelper();
  const { initialize } = pageHelper.myOrdersHelper();

  const datePickerHelper = pageHelper.datePickerHelper();
  datePickerHelper.initialize();

  const searchParams = new URLSearchParams(location.search);
  const queryParams = Object.fromEntries(searchParams.entries());
  initialize(queryParams);

  const openNaverPayAlertModal = (nextActionType, orderStatusType) => {
    const ACTION_TYPE_LABEL = {
      CANCEL: '취소신청',
      EXCHANGE: '교환신청',
      RETURN: '반품신청',
      CONFIRM_ORDER: '구매확정',
    };

    if (
      nextActionType === 'WRITE_REVIEW' &&
      ['DELIVERY_ING', 'DELIVERY_DONE', 'BUY_CONFIRM'].includes(orderStatusType)
    ) {
      EventManager.fire('MODAL_ALERT_OPEN', {
        noticeType: 'WARNING',
        message: '<em>네이버페이 주문은 네이버페이에서 구매확정 이후 후기작성이 가능합니다.</em>',
      });

      return;
    }

    EventManager.fire('MODAL_ALERT_OPEN', {
      noticeType: 'WARNING',
      message: `<em>네이버페이지 주문은 네이버페이에서 ${ACTION_TYPE_LABEL[nextActionType]} 하실 수 있습니다.</em>`,
    });
  };

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

  const MODULE_ACTION_HANDLER = {
    SEARCH_ORDERS: () => {
      const params = new URLSearchParams(location.search);
      location.href = `${location.origin}${location.pathname}?${params.toString()}`;
    },
    CANCEL: ({ orderOptionNo, orderNo, orderOptionCount, payType, orderStatusType, orderNextActionType }) => {
      const canCancelAll = orderNextActionType.split(',').includes('CANCEL_ALL');

      if (payType === 'NAVER_PAY') {
        openNaverPayAlertModal('CANCEL');

        return;
      }

      if (['VIRTUAL_ACCOUNT', 'ESCROW_VIRTUAL_ACCOUNT', 'ESCROW_REALTIME_ACCOUNT_TRANSFER'].includes(payType)) {
        const payTypeLabel = {
          VIRTUAL_ACCOUNT: '가상계좌',
          ESCROW_VIRTUAL_ACCOUNT: '에스크로',
          ESCROW_REALTIME_ACCOUNT_TRANSFER: '에스크로',
        };

        if (canCancelAll) {
          EventManager.fire('MODAL_CONFIRM_OPEN', {
            noticeType: 'WARNING',
            message: `<em>${payTypeLabel[payType]} 결제 건은 전체 취소신청만 가능합니다.<br>모두 취소신청 하시겠습니까?</em>`,
            onConfirm: async () => {
              const { isSuccess } = await cancelOrder(orderNo);
              if (isSuccess) {
                EventManager.fire('MODAL_ALERT_OPEN', {
                  noticeType: 'SUCCESS',
                  message: '<em>전체 주문 취소가 완료되었습니다.</em>',
                  onClose: () => location.reload(),
                });
              }
            },
          });

          return;
        }

        if (
          orderStatusType !== 'DEPOSIT_WAIT' &&
          ['ESCROW_VIRTUAL_ACCOUNT', 'ESCROW_REALTIME_ACCOUNT_TRANSFER'].includes(payType)
        ) {
          EventManager.fire('MODAL_ALERT_OPEN', {
            noticeType: 'WARNING',
            message:
              '<em>에스크로 결제 건은 모든 상품이 결제완료 상태에서만 취소신청이 가능합니다.<br>취소신청은 1:1문의를 통해 문의해주세요.</em>',
          });

          return;
        }

        return;
      }

      if (canCancelAll && orderOptionCount >= 2) {
        EventManager.fire('MODAL_CONFIRM_OPEN', {
          hasHeader: true,
          noticeType: 'WARNING',
          cancelLabel: '선택 부분 취소',
          confirmLabel: '즉시 전체 취소',
          message: '<em>주문에 포함된 상품을 즉시 전체취소 하시겠습니까?<br>일부 상품만 부분취소 하시겠습니까?</em>',
          onCancel: () => {
            location.href = `./claim-form.html?orderOptionNo=${orderOptionNo}&claimType=CANCEL`;
          },
          onConfirm: async () => {
            const { isSuccess } = await cancelOrder(orderNo);
            if (isSuccess) {
              EventManager.fire('MODAL_ALERT_OPEN', {
                noticeType: 'SUCCESS',
                message: '<em>전체 주문 취소가 완료되었습니다.</em>',
                onClose: () => location.reload(),
              });
            }
          },
        });
      } else {
        location.href = `./claim-form.html?orderOptionNo=${orderOptionNo}&claimType=CANCEL`;
      }
    },
    EXCHANGE: ({ orderOptionNo, deliverable, payType }) => {
      if (payType === 'NAVER_PAY') {
        openNaverPayAlertModal('EXCHANGE');

        return;
      }
      if (['ESCROW_VIRTUAL_ACCOUNT', 'ESCROW_REALTIME_ACCOUNT_TRANSFER'].includes(payType)) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'WARNING',
          message: '<em>에스크로 결제 건은 교환 신청이 불가합니다.<br>취소/반품 후 재주문으로 처리해 주세요.</em>',
        });

        return;
      }
      location.href = `./claim-form.html?orderOptionNo=${orderOptionNo}&claimType=EXCHANGE&deliverable=${deliverable}`;
    },
    RETURN: ({ orderOptionNo, deliverable, payType }) => {
      if (payType === 'NAVER_PAY') {
        openNaverPayAlertModal('RETURN');

        return;
      }

      if (['ESCROW_VIRTUAL_ACCOUNT', 'ESCROW_REALTIME_ACCOUNT_TRANSFER'].includes(payType)) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'WARNING',
          message:
            '<em>에스크로 결제 건은 결제업체에서 발송한 이메일에서만 반품신청이 가능합니다.<br>이메일 수신함을 확인해주세요.</em>',
        });

        return;
      }
      location.href = `./claim-form.html?orderOptionNo=${orderOptionNo}&claimType=RETURN&deliverable=${deliverable}`;
    },
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
    VIEW_DELIVERY: ({ deliveryUri, deliveryType }) => {
      if (deliveryType === 'DIRECT_DELIVERY') {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'WARNING',
          message: '<em>직접배송의 경우 배송조회를 지원하지 않습니다. <br>판매자에게 문의해주세요.</em>',
        });

        return;
      }
      window.open(deliveryUri);
    },
    CONFIRM_ORDER: async ({ orderOptionNo, payType, orderStatusType }) => {
      if (payType === 'NAVER_PAY') {
        openNaverPayAlertModal('CONFIRM_ORDER', orderStatusType);

        return;
      }
      const { isSuccess } = await confirmOrder(orderOptionNo);
      if (isSuccess) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'SUCCESS',
          message: '<em>구매확정 처리되었습니다.</em>',
          onClose: () => location.reload(),
        });
      }
    },
    WRITE_REVIEW: ({ payType, productNo, orderStatusType }) => {
      if (payType === 'NAVER_PAY') {
        openNaverPayAlertModal('WRITE_REVIEW', orderStatusType);

        return;
      }

      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-review-form',
        title: '상품후기',
        modalAddClass: 'product-review-form-modal',
        isFull: false,
        data: {
          productNo,
          isModify: false,
        },
        onClose: ({ reason }) => {
          if (reason === 'DID_SUBMIT') {
            EventManager.fire('MODAL_ALERT_OPEN', {
              noticeType: 'success',
              message: '<em>상품후기가 등록되었습니다.</em>',
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },
    VIEW_CLAIM_DETAIL: ({ claimNo, modalTitlePrefix }) => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'claim-detail',
        title: `${modalTitlePrefix ?? '클레임'} 내역 상세`,
        isFull: false,
        data: {
          claimNo,
        },
      });
    },
  };

  const dateSearchModule = document.querySelector('date-search');
  const dateSearchClickEventListener = ({ target }) => {
    const actionTarget = target.getAttribute('shopby-action');

    if (!actionTarget) {
      return;
    }

    MODULE_ACTION_HANDLER[actionTarget]();
  };
  dateSearchModule?.addEventListener('click', dateSearchClickEventListener);

  const orderProductOptionsModule = document.querySelector('my-orders');
  const orderProductOptionsClickEventListener = ({ target }) => {
    const actionTarget = target.getAttribute('shopby-action');
    if (!actionTarget) {
      return;
    }
    const orderOptionCount = target.closest('[shopby-order-option-count]')?.getAttribute('shopby-order-option-count');
    const orderOptionNo = target.closest('[shopby-order-option-no]')?.getAttribute('shopby-order-option-no');
    const payType = target.closest('[shopby-pay-type]')?.getAttribute('shopby-pay-type');
    const orderStatusType = target.closest('[shopby-order-status]')?.getAttribute('shopby-order-status');
    const deliverable = target.getAttribute('shopby-deliverable');
    const deliveryUri = target.getAttribute('shopby-delivery-uri');
    const claimNo = target.getAttribute('shopby-claim-no');
    const modalTitlePrefix = target.getAttribute('shopby-modal-title-prefix');
    const productNo = target.getAttribute('shopby-product-no');
    const orderNo = target.getAttribute('shopby-order-no');
    const deliveryType = target.getAttribute('shopby-delivery-type');
    const claimNos = target.closest('[shopby-claim-nos]')?.getAttribute('shopby-claim-nos');
    const orderNextActionType = target
      .closest('[shopby-order-next-action-type]')
      ?.getAttribute('shopby-order-next-action-type');

    MODULE_ACTION_HANDLER[actionTarget]({
      orderOptionCount,
      orderOptionNo,
      deliverable,
      deliveryUri,
      claimNo,
      modalTitlePrefix,
      productNo,
      orderNo,
      payType,
      orderStatusType,
      deliveryType,
      claimNos,
      orderNextActionType,
    });
  };

  orderProductOptionsModule.addEventListener('click', orderProductOptionsClickEventListener);
})();
