(() => {
  const { pageHelper, EventManager, utils, actions } = ShopbySkin;

  EventManager.on('PRODUCT_DETAIL_CONTENT_LOADED', () => {
    const imgs = document.querySelector('product-detail').querySelectorAll('img');

    utils.lazyLoad({ imgEls: imgs });
  });

  EventManager.on('CHECK_PRODUCT_CONTENT_SIZE', () => {
    // 상품 펼쳐보기 버튼 생성, hidden 처리
    const getProductDetailContentElement = () => document.querySelector('[shopby-element="product-content-detail"]');

    const observer = new ResizeObserver(() => {
      const contentEl = getProductDetailContentElement();
      const images = contentEl.querySelectorAll('img');

      const imageLoadProcess = [];
      if (images.length > 0) {
        images.forEach((image) => {
          const result = new Promise((resolve) => {
            image.onload = resolve;
          });
          imageLoadProcess.push(result);
        });
      }

      Promise.allSettled(imageLoadProcess).then(() => {
        if (contentEl.offsetHeight > 500) {
          const target = document.querySelector('[shopby-element="product-content"]');
          target.classList.add('hidden');

          const moreBtnTarget = document.querySelector('[shopby-element="TOGGLE_SHOW_MORE"]');
          moreBtnTarget.classList.remove('hidden');
        }
      });
    });

    const observerTarget = getProductDetailContentElement();
    observerTarget && observer.observe(observerTarget);
    // 상품 펼쳐보기 버튼 생성, hidden 처리 END
  });

  const searchParams = new URLSearchParams(location.search);
  const productNo = searchParams.get('productNo');
  const channelType = searchParams.get('channelType');
  const cartAction = actions.getCartAction();
  utils.setChannelType(channelType);

  const { productDetailHelper } = pageHelper;
  const { initialize, deleteProductInquiryBy, searchReviews } = productDetailHelper();

  initialize({
    productNo,
    channelType,
    cartAction,
  });

  EventManager.on('QUERY_PRODUCT_DETAIL', (data) => {
    EventManager.fire('CHANGE_SUB_TITLE', {
      subTitle: data?.baseInfo?.productName,
    });
  });

  const redirectLoginPage = () => {
    const nextUrl = `${location.origin}/pages/sign-in/sign-in.html`;

    location.href = `${nextUrl}?from=${encodeURIComponent(location.href)}`;
  };

  let shopbyCommonData = {};
  EventManager.on('PAGE_LOAD_COMPLETED', (commonData) => {
    shopbyCommonData = commonData;
  });

  const ACTION_HANDLER_MAP = {
    DISCOUNT_DETAIL: () => {
      EventManager.fire('OPEN_LAYER_MODAL', {
        title: '할인내역',
        name: 'discount-guide',
        data: {
          DISCOUNT_LABEL_MAP: {
            additionDiscountAmt: '추가할인',
            immediateDiscountAmt: '즉시할인',
          },
        },
        modalAddClass: 'no-full',
        classModifier: 'discount-price-information',
        onClose: () => null,
      });
    },

    COUPON_DOWNLOAD: () => {
      if (!utils.isSignIn()) {
        ShopbySkin.EventManager.fire('MODAL_ALERT_OPEN', {
          message: '로그인하셔야 본 서비스를 이용하실 수 있습니다',
          onClose: redirectLoginPage,
        });

        return;
      }

      ShopbySkin.EventManager.fire('OPEN_LAYER_MODAL', {
        title: '쿠폰받기',
        name: 'coupon-download',
        data: {
          productNo,
          channelType,
        },
        isFull: true,
        onClose: () => null,
      });
    },

    PRODUCT_INQUIRY_WRITE: (target) => {
      const guestWriteable = target.getAttribute('shopby-guest-writeable') === 'true';

      if (!utils.isSignIn() && !guestWriteable) {
        ShopbySkin.EventManager.fire('MODAL_ALERT_OPEN', {
          message: '로그인하셔야 본 서비스를 이용하실 수 있습니다.',
          onClose: redirectLoginPage,
        });

        return;
      }

      const productName = target.closest('[shopby-product-name]')?.getAttribute('shopby-product-name');
      const imageUrl = target.closest('[shopby-image-url]')?.getAttribute('shopby-image-url');
      const imageType = target.closest('[shopby-image-type]')?.getAttribute('shopby-image-type');

      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-inquiry-form',
        title: '상품 문의',
        data: {
          productNo,
          productName,
          imageUrl,
          imageType,
          isModify: false,
          commonData: shopbyCommonData,
          useSelectProduct: false,
        },
        onClose: ({ reason }) => {
          if (reason === 'DID_SUBMIT') {
            EventManager.fire('MODAL_ALERT_OPEN', {
              message: '상품문의가 등록됐습니다.',
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },

    INQUIRY_DETAIL: (target) => {
      const readable = target.closest('[shopby-readable]')?.getAttribute('shopby-readable') === 'true';

      if (!readable) {
        EventManager.fire('MODAL_ALERT_OPEN', {
          message: '비밀글 조회 권한이 없습니다.',
        });
      }
    },

    INQUIRY_DELETE: (target) => {
      const inquiryNo = target.getAttribute('shopby-inquiry-no');

      EventManager.fire('MODAL_CONFIRM_OPEN', {
        message: '<p>삭제 시 복구가 불가능합니다.<br>정말 삭제하시겠습니까?</p>',
        onConfirm: async () => {
          await deleteProductInquiryBy({ inquiryNo });

          EventManager.fire('MODAL_ALERT_OPEN', {
            message: '삭제되었습니다.',
            onClose: () => {
              location.reload();
            },
          });
        },
      });
    },

    INQUIRY_MODIFY: (target) => {
      const inquiryNo = target.getAttribute('shopby-inquiry-no');

      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-inquiry-form',
        title: '상품문의',
        data: {
          productNo,
          inquiryNo,
          isModify: true,
          commonData: shopbyCommonData,
        },
        onClose: ({ reason }) => {
          if (reason === 'DID_MODIFY') {
            EventManager.fire('MODAL_ALERT_OPEN', {
              message: '상품문의가 수정되었습니다.',
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },

    WRITE_REVIEW: (target) => {
      const reviewableCount = Number(target.getAttribute('shopby-reviewable-count'));
      const usesAttachment = target.getAttribute('shopby-uses-attachment') === 'true';

      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-review-form',
        title: '상품후기',
        isFull: true,
        data: {
          productNo,
          isModify: false,
          useSelectOrderProduct: reviewableCount > 1,
          usesAttachment,
        },
      });
    },

    REVIEW_DETAIL: (target) => {
      target.classList.toggle('open');
    },

    REVIEW_DETAIL_POPUP: (target) => {
      const reviewNo = target.closest('[shopby-review-no]')?.getAttribute('shopby-review-no');

      ShopbySkin.EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-review-detail',
        title: '상품후기 상세',
        isFull: true,
        data: {
          productNo,
          reviewNo,
          queryParams: {
            boardType: 'ALL',
          },
        },
      });
    },

    PHOTO_REVIEW_MORE: async () => {
      const { data } = await searchReviews({
        productNo,
        channelType,
        sortType: 'RECOMMEND',
        hasAttachmentFile: true,
        pageSize: 20,
      });

      const photoCollections = data.reviews.map(({ images, reviewNo }) => ({
        urls: images,
        attachedFileCount: images.length,
        productNo,
        reviewNo,
      }));

      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-review-photos',
        title: `포토(${photoCollections.length})`,
        isFull: true,
        data: {
          images: photoCollections,
        },
      });
    },

    REVIEW_MODIFY: (target) => {
      const reviewNo = target.closest('[shopby-review-no]')?.getAttribute('shopby-review-no');
      const boardName = target.closest('[shopby-board-name]')?.getAttribute('shopby-board-name');
      const usesAttachment =
        target.closest('[shopby-uses-attachment]')?.getAttribute('shopby-uses-attachment') === 'true';

      EventManager.fire('OPEN_LAYER_MODAL', {
        name: 'product-review-form',
        title: boardName,
        isFull: true,
        data: {
          productNo,
          reviewNo,
          isModify: true,
          usesAttachment,
        },
        onClose: ({ reason }) => {
          if (reason === 'DID_MODIFY') {
            EventManager.fire('MODAL_ALERT_OPEN', {
              message: '상품후기가 수정되었습니다.',
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },
    REVIEW_DELETE: (target) => {
      const reviewNo = target.closest('[shopby-review-no]')?.getAttribute('shopby-review-no');
      const givenAccumulation = target.getAttribute('shopby-given-accumulation');

      const confirmMessage =
        givenAccumulation.toUpperCase() === 'Y'
          ? '<p>삭제 시 복구가 불가하며,<br>지급된 적립금이 차감됩니다.<br>정말 삭제하시겠습니까?</p>'
          : '<p>삭제 시 복구가 불가능합니다.<br>정말 삭제하시겠습니까?</p>';

      const myProductReviewListHelper = pageHelper.myProductReviewListHelper();
      myProductReviewListHelper.initialize();

      EventManager.fire('MODAL_CONFIRM_OPEN', {
        message: confirmMessage,
        onConfirm: async () => {
          await myProductReviewListHelper.deleteReview({ productNo, reviewNo });
          location.reload();
        },
      });
    },

    RECOMMEND: () => {
      if (!utils.isSignIn()) {
        ShopbySkin.EventManager.fire('MODAL_ALERT_OPEN', {
          message: '로그인 후 이용할 수 있습니다.',
          onClose: redirectLoginPage,
        });
      }
    },

    ADD_CART: async () => {
      const { addCart } = pageHelper.productDetailHelper();
      await addCart();

      EventManager.fire('MODAL_CONFIRM_OPEN', {
        message: '<p>상품이 장바구니에 담겼습니다. 바로 확인하시겠습니까?</p>',
        cancelLabel: '쇼핑계속하기',
        confirmLabel: '장바구니 가기',
        onConfirm: () => {
          location.href = '/pages/order/cart.html';
        },
      });
    },

    PRODUCT_LIKE: (target) => {
      const productNo = target.closest('[shopby-product-no]').getAttribute('shopby-product-no');
      if (!productNo) {
        return;
      }

      ShopbySkin.actions.toggleLikeStatus({
        productNo,

        onSuccess: (isLiked) => {
          const el = target.closest('[type=button]');
          if (isLiked) {
            el.classList.add('is-active');

            return;
          }

          el.classList.remove('is-active');
        },
      });
    },

    TOGGLE_SHOW_MORE: (target) => {
      const toggleTarget = document.querySelector('[shopby-element="product-content"]');
      const status = toggleTarget.classList.toggle('hidden');

      target.innerText = status ? '상세정보 펼쳐보기' : '상세정보 접기';
    },
  };

  const ACTION_CHANGE_HANDLER_MAP = {
    SORT_REVIEWS: (target) => {
      const { value } = target;
      EventManager.fire('CHANGE_SORT_REVIEWS', { value });
    },
  };

  // CLICK
  document.querySelector('product-summary')?.addEventListener('click', ({ target }) => {
    ACTION_HANDLER_MAP[target.getAttribute('shopby-action')]?.();
  });

  document.querySelector('product-detail')?.addEventListener('click', ({ target }) => {
    ACTION_HANDLER_MAP[target.getAttribute('shopby-action')]?.(target);
  });

  document.querySelector('product-detail-review-summary')?.addEventListener('click', ({ target }) => {
    ACTION_HANDLER_MAP[target.getAttribute('shopby-action')]?.(target);
  });

  document.querySelector('product-detail-review-list')?.addEventListener('click', ({ target }) => {
    ACTION_HANDLER_MAP[target.getAttribute('shopby-action')]?.(target);
  });

  document.querySelector('product-detail-board-button')?.addEventListener('click', ({ target }) => {
    ACTION_HANDLER_MAP[target.getAttribute('shopby-action')]?.(target);
  });

  document.querySelector('[shopby-tab-element="PRODUCT_INQUIRY"]')?.addEventListener('click', ({ target }) => {
    ACTION_HANDLER_MAP[target.getAttribute('shopby-action')]?.(target);
  });

  document.querySelector('product-purchase')?.addEventListener('click', ({ target }) => {
    ACTION_HANDLER_MAP[target.getAttribute('shopby-action')]?.(target);
  });

  document.querySelector('related-product')?.addEventListener('click', ({ target }) => {
    ACTION_HANDLER_MAP[target.getAttribute('shopby-action')]?.(target);
  });

  document.querySelector('product-detail-review-photo-collect')?.addEventListener('click', ({ target }) => {
    ACTION_HANDLER_MAP[target.getAttribute('shopby-action')]?.(target);
  });

  // CHANGE
  document.querySelector('product-detail-review-list')?.addEventListener('change', ({ target }) => {
    ACTION_CHANGE_HANDLER_MAP[target.getAttribute('shopby-action')]?.(target);
  });
})();
