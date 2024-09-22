(() => {
  const { pageHelper, EventManager, utils, actions } = ShopbySkin;

  const searchParams = new URLSearchParams(location.search);
  const productNo = searchParams.get("productNo");
  const channelType = searchParams.get("channelType");
  const sortType = searchParams.get("sortType");
  const cartAction = actions.getCartAction();

  const { productDetailHelper } = pageHelper;

  const { initialize, deleteProductInquiryBy, searchReviews } =
    productDetailHelper();

  EventManager.on("PRODUCT_DETAIL_CONTENT_LOADED", () => {
    const imgs = document
      .querySelector("product-detail")
      .querySelectorAll("img");

    utils.lazyLoad({ imgEls: imgs });
  });

  initialize({
    productNo,
    channelType,
    sortType,
    cartAction,
  });

  const redirectLoginPage = () => {
    const nextUrl = `${location.origin}/pages/sign-in/sign-in.html`;

    location.href = `${nextUrl}?from=${encodeURIComponent(location.href)}`;
  };

  const productLike = (productNo, { onSuccess }) => {
    if (!utils.isSignIn()) {
      EventManager.fire("MODAL_CONFIRM_OPEN", {
        message: "로그인 후 이용할 수 있습니다.",
        onConfirm: redirectLoginPage,
      });

      return;
    }

    ShopbySkin.actions.toggleLikeStatus({
      productNo,
      onSuccess,
    });
  };

  let shopbyCommonData = {};
  EventManager.on("PAGE_LOAD_COMPLETED", (commonData) => {
    shopbyCommonData = commonData;
  });

  const ACTION_HANDLER_MAP = {
    COUPON_DOWNLOAD: () => {
      if (!utils.isSignIn()) {
        ShopbySkin.EventManager.fire("MODAL_ALERT_OPEN", {
          message: "로그인하셔야 본 서비스를 이용하실 수 있습니다",
          onClose: redirectLoginPage,
        });
      }

      ShopbySkin.EventManager.fire("OPEN_LAYER_MODAL", {
        title: "쿠폰 다운받기",
        name: "coupon-download",
        data: {
          productNo,
          channelType: utils.getChannelType(),
        },
        isFull: false,
        onClose: () => null,
      });
    },

    INQUIRY_DETAIL: (target) => {
      const readable = target.getAttribute("shopby-readable") === "true";

      if (!readable) {
        EventManager.fire("MODAL_ALERT_OPEN", {
          message: "비밀글 조회 권한이 없습니다.",
        });

        return;
      }

      target.closest("[shopby-active]").classList.toggle("active");
    },

    PRODUCT_INQUIRY_WRITE: (target) => {
      if (!utils.isSignIn()) {
        EventManager.fire("MODAL_ALERT_OPEN", {
          message: "먼저 로그인을 해주세요.",
          onClose: redirectLoginPage,
        });

        return;
      }

      const productName = target
        .closest("[shopby-product-name]")
        ?.getAttribute("shopby-product-name");
      const imageUrl = target
        .closest("[shopby-image-url]")
        ?.getAttribute("shopby-image-url");
      const imageType = target
        .closest("[shopby-image-type]")
        ?.getAttribute("shopby-image-type");

      EventManager.fire("OPEN_LAYER_MODAL", {
        name: "product-inquiry-form",
        title: "상품문의",
        modalAddClass: "product-inquiry-form-modal",
        isFull: false,
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
          if (reason === "DID_SUBMIT") {
            EventManager.fire("MODAL_ALERT_OPEN", {
              message: "상품문의가 등록됐습니다.",
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },

    INQUIRY_DELETE: (target) => {
      const inquiryNo = target.getAttribute("shopby-inquiry-no");

      EventManager.fire("MODAL_CONFIRM_OPEN", {
        message:
          "<p>삭제 시 복구가 불가능합니다.<br>정말 삭제하시겠습니까?</p>",
        onConfirm: async () => {
          await deleteProductInquiryBy({ inquiryNo });

          EventManager.fire("MODAL_ALERT_OPEN", {
            message: "삭제되었습니다.",
            onClose: () => {
              location.reload();
            },
          });
        },
      });
    },

    INQUIRY_MODIFY: (target) => {
      const inquiryNo = target.getAttribute("shopby-inquiry-no");

      EventManager.fire("OPEN_LAYER_MODAL", {
        name: "product-inquiry-form",
        title: "상품문의",
        modalAddClass: "product-inquiry-form-modal",
        isFull: false,
        data: {
          productNo,
          inquiryNo,
          isModify: true,
          commonData: shopbyCommonData,
        },
        onClose: ({ reason }) => {
          if (reason === "DID_MODIFY") {
            EventManager.fire("MODAL_ALERT_OPEN", {
              message: "상품문의가 수정되었습니다.",
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },

    WRITE_REVIEW: (target) => {
      const reviewableCount = Number(
        target.getAttribute("shopby-reviewable-count"),
      );
      const usesAttachment =
        target.getAttribute("shopby-uses-attachment") === "true";

      EventManager.fire("OPEN_LAYER_MODAL", {
        name: "product-review-form",
        title: "상품후기",
        modalAddClass: "product-review-form-modal",
        isFull: false,
        data: {
          productNo,
          isModify: false,
          useSelectOrderProduct: reviewableCount > 1,
          usesAttachment,
        },
        onClose: ({ reason, state }) => {
          if (reason === "DID_SUBMIT") {
            EventManager.fire("MODAL_ALERT_OPEN", {
              message: "상품후기가 작성되었습니다.",
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },

    REVIEW_DETAIL: (target) => {
      const reviewNo = target
        .closest("[shopby-review-no]")
        ?.getAttribute("shopby-review-no");
      const targetEl = document.querySelector(
        `[shopby-target="REVIEW-OPEN-${reviewNo}"]`,
      );

      targetEl.classList.toggle("is-open");
    },

    REVIEW_DETAIL_POPUP: (target) => {
      const reviewNo = target
        .closest("[shopby-review-no]")
        ?.getAttribute("shopby-review-no");

      ShopbySkin.EventManager.fire("OPEN_LAYER_MODAL", {
        name: "product-review-detail",
        title: "상품후기 상세",
        data: {
          productNo,
          reviewNo,
          queryParams: {
            boardType: "ALL",
          },
        },
      });
    },
    PHOTO_REVIEW_MORE: async () => {
      const { data } = await searchReviews({
        productNo,
        channelType,
        sortType: "RECOMMEND",
        hasAttachmentFile: true,
        pageSize: 20,
      });

      const photoCollections = data.reviews.map(({ images, reviewNo }) => ({
        urls: images,
        attachedFileCount: images.length,
        productNo,
        reviewNo,
      }));

      EventManager.fire("OPEN_LAYER_MODAL", {
        name: "product-review-photos",
        title: `포토(${photoCollections.length})`,
        isFull: true,
        data: {
          images: photoCollections,
        },
      });
    },

    REVIEW_MODIFY: (target) => {
      const reviewNo = target
        .closest("[shopby-review-no]")
        ?.getAttribute("shopby-review-no");
      const boardName = target
        .closest("[shopby-board-name]")
        ?.getAttribute("shopby-board-name");
      const usesAttachment =
        target
          .closest("[shopby-uses-attachment]")
          ?.getAttribute("shopby-uses-attachment") === "true";

      EventManager.fire("OPEN_LAYER_MODAL", {
        name: "product-review-form",
        title: boardName,
        modalAddClass: "product-review-form-modal",
        isFull: false,
        data: { productNo, reviewNo, isModify: true, usesAttachment },
        onClose: ({ reason, state }) => {
          if (reason === "DID_MODIFY") {
            EventManager.fire("MODAL_ALERT_OPEN", {
              message: "상품후기가 수정되었습니다.",
              onClose: () => {
                location.reload();
              },
            });
          }
        },
      });
    },
    REVIEW_DELETE: (target) => {
      const reviewNo = target
        .closest("[shopby-review-no]")
        ?.getAttribute("shopby-review-no");
      const givenAccumulation = target.getAttribute(
        "shopby-given-accumulation",
      );

      const confirmMessage =
        givenAccumulation.toUpperCase() === "Y"
          ? "<p>삭제 시 복구가 불가하며,<br>지급된 적립금이 차감됩니다.<br>정말 삭제하시겠습니까?</p>"
          : "<p>삭제 시 복구가 불가능합니다.<br>정말 삭제하시겠습니까?</p>";

      const myProductReviewListHelper = pageHelper.myProductReviewListHelper();
      myProductReviewListHelper.initialize();

      EventManager.fire("MODAL_CONFIRM_OPEN", {
        message: confirmMessage,
        onConfirm: async () => {
          await myProductReviewListHelper.deleteReview({ productNo, reviewNo });
          location.reload();
        },
      });
    },

    ADD_CART: async () => {
      const { addCart } = pageHelper.productDetailHelper();
      await addCart();

      EventManager.fire("MODAL_CONFIRM_OPEN", {
        message: "<p>장바구니에 담았습니다.</p>",
        cancelLabel: "쇼핑계속하기",
        confirmLabel: "장바구니 가기",
        onConfirm: () => {
          location.href = "/pages/order/cart.html";
        },
      });
    },

    PRODUCT_ORDER: async () => {
      const { isSignedIn } = utils;
      const { requestOrderSheet } = pageHelper.productDetailHelper();

      const { orderSheetNo } = await requestOrderSheet();

      const orderSheetNoURL = `${location.origin}/pages/order/order-sheet-form.html?ordersheetNo=${orderSheetNo}`;

      const nextUrl = isSignedIn()
        ? orderSheetNoURL
        : `${location.origin}/pages/sign-in/sign-in.html?from=${orderSheetNoURL}`;

      window.location.href = nextUrl;
    },

    SORT_TAB: (target) => {
      const sortType = target.getAttribute("shopby-sort-type");
      const params = new URLSearchParams({
        productNo,
        sortType,
      });

      EventManager.fire("CHANGE_SORT_REVIEWS", { value: sortType });
      history.pushState(null, null, `?${params.toString()}#PRODUCT_REVIEW`);
    },

    REVIEW_CONTENT_TEXT: (target) => {
      target.closest("[shopby-element]").classList.toggle("open");
    },

    TOGGLE_DISCOUNT_DETAIL: () => {
      document
        .querySelector("[shopby-element='discount-tooltip']")
        .classList.toggle("active");
    },

    RECOMMEND: () => {
      if (!utils.isSignIn()) {
        ShopbySkin.EventManager.fire("MODAL_ALERT_OPEN", {
          message: "로그인 후 이용할 수 있습니다.",
          onClose: redirectLoginPage,
        });
      }
    },

    PRODUCT_LIKE: (event) => {
      event.preventDefault();
      const { target } = event;

      productLike(productNo, {
        onSuccess: (isLiked) => {
          const el = target.closest("[type=button]");
          const messageEl = document.querySelector(
            '[shopby-element="like-action-message"]',
          );

          messageEl.classList.remove("like-message");

          // 페이드 아웃 메시지
          setTimeout(() => {
            const actionMessage = isLiked
              ? "상품이 좋아요 리스트에 추가되었습니다."
              : "상품이 좋아요 리스트에 제거되었습니다.";

            messageEl.innerText = actionMessage;
            messageEl.classList.add("like-message");
          }, 20);

          if (isLiked) {
            el.classList.add("is-active");

            return;
          }

          el.classList.remove("is-active");
        },
      });
    },

    RELATED_PRODUCT_LIKE: (event) => {
      event.preventDefault();
      const { target } = event;

      const productNo = target
        .closest("[shopby-product-no]")
        ?.getAttribute("shopby-product-no");
      if (!productNo) {
        return;
      }

      productLike(productNo, {
        onSuccess: (isLiked) => {
          const el = target.closest("[type=button]");
          if (isLiked) {
            el.classList.add("is-active");

            return;
          }

          el.classList.remove("is-active");
        },
      });
    },
  };

  document
    .querySelector("product-summary")
    ?.addEventListener("click", ({ target }) => {
      ACTION_HANDLER_MAP[target.getAttribute("shopby-action")]?.();
    });

  document
    .querySelector("product-purchase")
    ?.addEventListener("click", (event) => {
      ACTION_HANDLER_MAP[event.target.getAttribute("shopby-action")]?.(event);
    });

  document
    .querySelector("product-detail-review-list")
    ?.addEventListener("click", ({ target }) => {
      ACTION_HANDLER_MAP[target.getAttribute("shopby-action")]?.(target);
    });

  document
    .querySelector("product-detail-board-button")
    ?.addEventListener("click", ({ target }) => {
      ACTION_HANDLER_MAP[target.getAttribute("shopby-action")]?.(target);
    });

  document
    .querySelector("product-detail-inquiry-list")
    ?.addEventListener("click", ({ target }) => {
      ACTION_HANDLER_MAP[target.getAttribute("shopby-action")]?.(target);
    });

  document
    .querySelector("related-product")
    ?.addEventListener("click", (event) => {
      ACTION_HANDLER_MAP[event.target.getAttribute("shopby-action")]?.(event);
    });
})();

// module 확장
class CustomProductDetail extends ShopbySkin.modules.ProductDetail {
  setup() {
    super.setup();
    this.store.attach("shippingInfo", (state) =>
      this.updateSlot(state, "shippingInfo"),
    );
    this.store.attach("stock", (state) => this.updateSlot(state, "stock"));

    this.eventManager.on("QUERY_PRODUCT_DETAIL", ({ shippingInfo, stock }) => {
      this.store.setState((prev) => ({
        ...prev,
        shippingInfo,
        stock,
      }));
    });
  }
}
customElements.define("custom-product-detail", CustomProductDetail);
