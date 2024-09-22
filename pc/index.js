(() => {
  const { utils, EventManager } = ShopbySkin;

  const { createPageScriptInstance } = utils;
  const pageScriptInstance = createPageScriptInstance("PC");
  pageScriptInstance.appendPageScript("PAGE_SCRIPT", "MAIN");

  EventManager.on("ON_API", (data) => {
    const { mallName = "" } = data?.mallConfig?.mall || {};

    const titleEl = document.head.querySelector("title");

    if (titleEl instanceof HTMLElement) {
      titleEl.innerText = mallName;
    }
  });
})();

// class CustomCategoryTabs extends Tabs {
//   setup() {
//     this.store.attach("tabs", () => this.updateSlot(this.store.state, "tabs"));

//     this.store.attach("products", () =>
//       this.updateSlot(this.store.state, "content"),
//     );

//     this.store.attach("currentTab", [
//       () => this.updateSlot(this.store.state, "content"),
//       () => this.initCategoryTabsSwiper(),
//     ]); // 최초 탭 설정

//     this.commonStore.attach("currentTab", [
//       () => this.updateSlot(this.commonStore.state, "content"),
//       () => this.initCategoryTabsSwiper(),
//     ]); // 탭 변경

//     this.initState();

//     this.eventManager.on(EVENT_ACTION.INIT_CATEGORY_TABS_SLIDER, (option) => {
//       this.store.setState({
//         swiperOption: option,
//       });
//     });
//   }

//   initState = () => {
//     this.store.setState({
//       sliderId: this.propsAsString.sliderId ?? "",
//       swiperOption: {
//         direction: "horizontal",
//         effect: "slide",
//         slidesPerView: 4,
//         spaceBetween: 24,
//         scrollbar: {
//           el: `.swiper-scrollbar[shopby-slider-scroll-id="${this.propsAsString.sliderId}"]`,
//         },
//       },
//     });
//   };
// }
// customElements.define("custom-category-tabs", CustomCategoryTabs);
