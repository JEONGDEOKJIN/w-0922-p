(() => {
  const { pageHelper, EventManager, actions } = ShopbySkin;

  const containerEl = document.querySelector('[shopby-helper-key="event-list-helper-key"]');
  const eventListHelper = pageHelper.eventListHelper();

  eventListHelper.initialize({
    helperKey: 'event-list-helper-key',
    eventAction: actions.getEventAction(),
  });

  const CLICK_EVENT_HANDLER_MAP = {
    GO_EVENT_DETAIL: ({ target }) => {
      const _target = target.closest('[shopby-link]');

      const url = _target.getAttribute('shopby-url');
      const progressStatus = _target.getAttribute('shopby-progress-status');
      const eventNo = _target.getAttribute('shopby-event-no');
      const eventId = _target.getAttribute('shopby-event-id');

      if (progressStatus !== 'ING') {
        EventManager.fire('MODAL_ALERT_OPEN', {
          noticeType: 'CAUTION',
          message: '<em>현재 진행중인 기획전이 아닙니다.</em>',
        });

        return;
      }

      const getUrl = ({ url, eventNo, eventId }) => {
        if (url) {
          return url;
        }

        return `/pages/event/event-detail.html?event=${eventId || eventNo}`;
      };

      location.href = getUrl({
        url,
        eventNo,
        eventId,
      });
    },
  };

  const CHANGE_EVENT_HANDLER_MAP = {
    HANDLE_SORT_TYPE_CHANGE: ({ target }) => {
      EventManager.fire('HANDLE_EVENT_LIST_SORT_TYPE_CHANGE', target.value);
    },
  };

  const clickEventListener = (event) => {
    event.preventDefault();

    const actionType =
      event.target?.getAttribute('shopby-action') ??
      event.target.closest('[shopby-action]')?.getAttribute('shopby-action');
    CLICK_EVENT_HANDLER_MAP[actionType]?.({
      helper: eventListHelper,
      target: event.target,
    });
  };

  const changeEventListener = ({ target }) => {
    const actionType = target.getAttribute('shopby-action');

    CHANGE_EVENT_HANDLER_MAP[actionType]?.({
      helper: eventListHelper,
      target,
    });
  };

  containerEl.addEventListener('click', clickEventListener);
  containerEl.addEventListener('change', changeEventListener);

  EventManager.on('PAGE_LOAD_COMPLETED', () => {
    EventManager.fire('INIT_EVENTS');
  });
})();
