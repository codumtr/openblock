// OpenBlock - Content Script & Anti-AdBlock Defuser
(() => {
  'use strict';

  const hostname = window.location.hostname;
  let isEnabled = true;
  let cosmeticEnabled = true;
  let antiAdblockEnabled = true;
  let hiddenElementsCount = 0;

  // Reklam seçicileri listesi
  const AD_SELECTORS = [
    'ins.adsbygoogle',
    '[id^="google_ads_"]',
    '[id^="div-gpt-ad"]',
    '[class*="adsbygoogle"]',
    '[class*="ad-banner"]',
    '[class*="ad_banner"]',
    '[class*="banner-ad"]',
    '[class*="advertisement"]',
    '[class*="sponsor-post"]',
    '[class*="ad-slot"]',
    '[class*="ad-container"]',
    '[data-ad-client]',
    '.taboola-placeholder',
    '.outbrain-placeholder',
    '.reklam-alani',
    '.reklam_alani',
    '.reklam-kutusu',
    '#reklam'
  ];

  // Anti-adblock uyarı metinleri kalıpları
  const ANTI_ADBLOCK_PATTERNS = [
    /adblock/i,
    /ad blocker/i,
    /reklam engelleyici/i,
    /disable your ad blocker/i,
    /adblocker detected/i,
    /reklamları engellemeyin/i,
    /lütfen reklam/i
  ];

  // Ayarları yükle ve başlat
  chrome.storage.local.get(['disabledDomains', 'settings'], (res) => {
    const disabledDomains = res.disabledDomains || [];
    if (disabledDomains.includes(hostname)) {
      isEnabled = false;
      return;
    }

    const settings = res.settings || {};
    cosmeticEnabled = settings.cosmeticFiltering !== false;
    antiAdblockEnabled = settings.antiAdblock !== false;

    if (isEnabled) {
      init();
    }
  });

  function init() {
    // İlk tarama
    scanAndHideAds();
    if (antiAdblockEnabled) {
      defuseAntiAdblock();
    }

    // Dinamik yüklenen öğeleri yakala (MutationObserver)
    const observer = new MutationObserver(debounce(() => {
      scanAndHideAds();
      if (antiAdblockEnabled) {
        defuseAntiAdblock();
      }
    }, 250));

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Reklam öğelerini gizle ve sayacı güncelle
  function scanAndHideAds() {
    if (!cosmeticEnabled) return;

    let newlyFound = 0;
    try {
      const elements = document.querySelectorAll(AD_SELECTORS.join(', '));
      elements.forEach((el) => {
        if (!el.dataset.openblockHidden) {
          el.dataset.openblockHidden = 'true';
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('height', '0px', 'important');
          newlyFound++;
        }
      });

      if (newlyFound > 0) {
        hiddenElementsCount += newlyFound;
        chrome.runtime.sendMessage({
          action: 'updateCosmeticCount',
          count: newlyFound,
          hostname: hostname
        }).catch(() => {});
      }
    } catch (e) {
      // Hata durumunda sessizce devam et
    }
  }

  // Sitedeki "Lütfen Reklam Engelleyiciyi Kapatın" kilitlerini temizle
  function defuseAntiAdblock() {
    const overlays = document.querySelectorAll('div, section, aside, dialog');
    overlays.forEach((el) => {
      // Çok büyük veya sayfanın tümünü kaplayan modal pencereleri kontrol et
      const style = window.getComputedStyle(el);
      const isFixedOrAbsolute = style.position === 'fixed' || style.position === 'absolute';
      const highZIndex = parseInt(style.zIndex, 10) > 100;

      if (isFixedOrAbsolute && highZIndex) {
        const text = el.innerText || '';
        const isMatch = ANTI_ADBLOCK_PATTERNS.some(regex => regex.test(text));

        // Eğer modal anti-adblock uyarısı içeriyorsa ve çok uzun bir sayfa içeriği değilse
        if (isMatch && text.length < 1500) {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('pointer-events', 'none', 'important');

          // Sayfa kaydırmasını (scroll kilidi) geri aç
          document.body.classList.add('openblock-anti-adblock-defused');
          document.documentElement.classList.add('openblock-anti-adblock-defused');
          document.body.style.setProperty('overflow', 'auto', 'important');
          document.documentElement.style.setProperty('overflow', 'auto', 'important');
        }
      }
    });
  }

  // Performans için debounce fonksiyonu
  function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Popup'tan gelen canlı mesajları dinle
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageStats') {
      sendResponse({
        hiddenElementsCount: hiddenElementsCount,
        isEnabled: isEnabled
      });
    }
  });

})();
