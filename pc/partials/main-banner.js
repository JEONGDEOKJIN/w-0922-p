(() => {
  const { actions } = ShopbySkin;

  const bannerId = document.currentScript.getAttribute("shopby-banner-id");

  if (bannerId) {
    actions?.getBannerById?.({ bannerId });
  }
})();

// MutationObserver를 이용해 DOM 변경을 감지하여 스크립트 실행
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      const sliderWrapper = document.querySelector(".slider-wrapper");
      const sliderItems = document.querySelectorAll(".slider-item");
      const prevButton = document.querySelector(".slider-prev");
      const nextButton = document.querySelector(".slider-next");
      const currentSlideElem = document.querySelector(".current-slide");
      const totalSlidesElem = document.querySelector(".total-slides");

      let currentIndex = 0;
      const totalItems = sliderItems.length;
      const itemWidth = sliderItems[0].offsetWidth;
      const visibleSlides = 3; // 한번에 보이는 슬라이드 개수
      const totalVisibleWidth = visibleSlides * itemWidth;

      // 슬라이더 초기화
      function updateSlider(transition = true) {
        if (transition) {
          sliderWrapper.style.transition = "transform 0.5s ease";
        } else {
          sliderWrapper.style.transition = "none";
        }
        const offset = -(currentIndex * itemWidth) - itemWidth / 2; // 슬라이드의 절반이 보이도록 이동
        sliderWrapper.style.transform = `translateX(${offset}px)`;
      }

      // 슬라이더 정보 업데이트
      function updateSlideInfo() {
        if (currentSlideElem && totalSlidesElem) {
          currentSlideElem.textContent = currentIndex + 1;
          totalSlidesElem.textContent = totalItems;
        }
      }

      // 무한 루프 슬라이드 처리
      function checkLoop() {
        if (currentIndex >= totalItems - visibleSlides) {
          setTimeout(() => {
            sliderWrapper.style.transition = "none";
            currentIndex = 0; // 첫 슬라이드로 이동
            updateSlider();
          }, 500); // 애니메이션 시간 후 위치 조정
        }
        if (currentIndex < 0) {
          setTimeout(() => {
            sliderWrapper.style.transition = "none";
            currentIndex = totalItems - visibleSlides; // 마지막 슬라이드로 이동
            updateSlider();
          }, 500);
        }
      }

      // "다음" 버튼 클릭 이벤트 처리
      nextButton.addEventListener("click", () => {
        if (currentIndex < totalItems - visibleSlides) {
          currentIndex++;
          updateSlider();
        } else {
          checkLoop();
        }
      });

      // "이전" 버튼 클릭 이벤트 처리
      prevButton.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateSlider();
        } else {
          checkLoop();
        }
      });

      // 초기화 시 첫 슬라이드를 왼쪽에서 절반만 보이게 설정
      currentIndex = 0;
      updateSlider(false); // 애니메이션 없이 초기 위치 설정
    }
  });
});

const targetNode = document.querySelector("skin-banner");
const config = { childList: true, subtree: true };

observer.observe(targetNode, config);
