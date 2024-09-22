(() => {
  const { EventManager } = ShopbySkin;
  let _pageScripts = null;
  let _commonData = null;
  let _titleTag = null;

  const META_PATTERN = /<meta\s+[^>]*\/?>/g;
  const TITLE_PATTERN = /<title[^>]*>[^<]*<\/title>/g;

  const getMetaMap = ({ title, image, type }) => {
    const { mallName } = _commonData;

    return {
      author: {
        attr: 'name',
        content: mallName,
      },
      description: {
        attr: 'name',
        content: mallName,
      },
      keywords: {
        attr: 'name',
        content: mallName,
      },
      'twitter:card': {
        attr: 'name',
        content: 'summary',
      },
      'twitter:title': {
        attr: 'name',
        content: title,
      },
      'twitter:description': {
        attr: 'name',
        content: '여기를 눌러 링크를 확인하세요.',
      },
      'twitter:image': {
        attr: 'name',
        content: image,
      },
      'og:site_name': {
        attr: 'property',
        content: mallName,
      },
      'og:type': {
        attr: 'property',
        content: type,
      },
      'og:title': {
        attr: 'property',
        content: title,
      },
      'og:image': {
        attr: 'property',
        content: image,
      },
      'og:url': {
        attr: 'property',
        content: location.href,
      },
      'og:description': {
        attr: 'property',
        content: '여기를 눌러 링크를 확인하세요.',
      },
      'og:image:width': {
        attr: 'property',
        content: '436',
      },
      'og:image:height': {
        attr: 'property',
        content: '134',
      },
    };
  };

  const convertStrToTag = (str) => {
    const range = document.createRange();
    return range.createContextualFragment(str).children[0];
  };

  const getMetaTags = () =>
    _pageScripts.reduce((acc, { pageType, content }) => {
      if (pageType !== 'COMMON_HEAD') {
        return acc;
      }

      const parsed = content.match(META_PATTERN)?.map(convertStrToTag) ?? [];
      _titleTag = content.match(TITLE_PATTERN)?.map(convertStrToTag)?.at(0);

      return [...acc, ...parsed];
    }, []);

  const getAdminMetaAttributes = () =>
    getMetaTags().flatMap((tag) => {
      const name = tag.getAttribute('name');
      const property = tag.getAttribute('property');

      return [name, property].filter(Boolean);
    });

  const removeDuplicateMeta = (metaInfo) => {
    const adminMetaAttributes = getAdminMetaAttributes();
    let title = '';

    const metas = Object.entries(metaInfo).reduce((acc, [value, { attr, ...info }]) => {
      if (!adminMetaAttributes.includes(value)) {
        acc.push({
          ...info,
          [attr]: value,
        });
      }

      if (value?.includes('title')) {
        title = info.content;
      }

      return acc;
    }, []);

    return {
      metas,
      title,
    };
  };

  const generateMeta = (metaInfo) => {
    try {
      const { metas, title } = removeDuplicateMeta(metaInfo);

      const headEl = document.querySelector('head');
      const templateEl = headEl.querySelector('[shopby-meta]');

      if (!templateEl) {
        return;
      }

      const clonedTemplate = templateEl.content;

      if (!_titleTag) {
        const titleEl = document.createElement('title');
        titleEl.textContent = title;
        clonedTemplate.append(titleEl);
      }

      metas?.forEach(({ content, name, property }) => {
        const metaEl = document.createElement('meta');

        name && metaEl.setAttribute('name', name);
        property && metaEl.setAttribute('property', property);

        if (name?.includes('title') || property?.includes('title')) {
          metaEl.setAttribute('content', _titleTag?.textContent ?? content);
        } else {
          metaEl.setAttribute('content', content);
        }

        clonedTemplate.append(metaEl);
      });

      headEl.removeChild(templateEl);
      clonedTemplate?.children && headEl.append(...clonedTemplate.children);
    } catch (e) {
      console.error(e);
    }
  };

  const metaInfoHandlerMap = {
    PRODUCT_DETAIL: () => {
      EventManager.on('QUERY_PRODUCT_DETAIL', ({ baseInfo }) => {
        generateMeta(
          getMetaMap({
            type: 'product',
            title: baseInfo.productName,
            image: baseInfo.imageUrls?.at(0),
          })
        );
      });
    },
    EVENT_DETAIL: () => {
      EventManager.on('QUERY_DISPLAY_EVENTS_EVENT_NO', (data) => {
        generateMeta(
          getMetaMap({
            type: 'product',
            title: data.label,
            image: data.pcImageUrl,
          })
        );
      });
    },
  };

  const setCommonData = (commonData) => {
    _commonData = commonData;
    _commonData.mallName = commonData.mallConfig.mall.mallName;
  };

  const executeMetaInfoHandler = (commonData) => {
    const pageType = document.querySelector('[shopby-page-type]')?.getAttribute('shopby-page-type');
    const metaInfoHandler = metaInfoHandlerMap[pageType];

    EventManager.on('QUERY_PAGE_SCRIPTS', (data) => {
      _pageScripts = data;

      if (metaInfoHandler) {
        metaInfoHandler(commonData);
      } else {
        const banner = commonData.bannerConfig?.bannerMap?.get?.('LOGO') ?? {};

        generateMeta(
          getMetaMap({
            type: 'website',
            title: _commonData.mallName,
            image: banner?.banners?.[0].bannerImages?.[0].imageUrl,
          })
        );
      }
    });
  };

  EventManager.on('PAGE_LOAD_COMPLETED', (commonData) => {
    setCommonData(commonData);
    executeMetaInfoHandler(commonData);
  });
})();
