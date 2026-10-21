// OpenBlock - Background Service Worker (Manifest V3)

// Bellek içi sekme istatistikleri (Sekme kapandığında otomatik silinir)
const tabStats = {};

// Varsayılan ayarları yükle
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['totalBlocked', 'disabledDomains', 'settings']);
  
  if (data.totalBlocked === undefined) {
    await chrome.storage.local.set({ totalBlocked: 0 });
  }

  if (!data.disabledDomains) {
    await chrome.storage.local.set({ disabledDomains: [] });
  }

  if (!data.settings) {
    await chrome.storage.local.set({
      settings: {
        networkBlocking: true,
        cosmeticFiltering: true,
        antiAdblock: true,
        showBadge: true
      }
    });
  }

  console.log('[OpenBlock] Servis çalışanı başarıyla başlatıldı.');
});

// declarativeNetRequest kuralları eşleştiğinde sayacı artır
if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    const tabId = info.request.tabId;
    if (tabId && tabId > 0) {
      incrementTabCount(tabId, 1);
    }
  });
}

// Sekme bazında sayaç güncelleme
async function incrementTabCount(tabId, count = 1) {
  if (!tabStats[tabId]) {
    tabStats[tabId] = 0;
  }
  tabStats[tabId] += count;

  // Rozet (Badge) güncelle
  const { settings } = await chrome.storage.local.get('settings');
  if (settings && settings.showBadge !== false) {
    const text = tabStats[tabId] > 999 ? '999+' : String(tabStats[tabId]);
    chrome.action.setBadgeText({ text: text, tabId: tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#0ea5e9', tabId: tabId }); // Neon mavi
  }

  // Toplam engellenen sayısını güncelle
  const data = await chrome.storage.local.get('totalBlocked');
  const newTotal = (data.totalBlocked || 0) + count;
  await chrome.storage.local.set({ totalBlocked: newTotal });
}

// Sekme kapandığında RAM temizliği
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabStats[tabId];
});

// Sekme güncellendiğinde (yeni sayfa yüklendiğinde) sayacı sıfırla
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    tabStats[tabId] = 0;
    chrome.action.setBadgeText({ text: '', tabId: tabId });
  }
});

// İletişim mesajlarını dinle (Content script veya Popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateCosmeticCount') {
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId) {
      incrementTabCount(tabId, request.count || 1);
    }
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'getTabStats') {
    const tabId = request.tabId;
    const count = tabStats[tabId] || 0;
    sendResponse({ count });
    return true;
  }

  if (request.action === 'toggleDomain') {
    handleToggleDomain(request.domain, request.enable).then((res) => {
      sendResponse(res);
    });
    return true; // Asenkron yanıt için
  }
});

// Beyaz Liste / Dinamik Kural Yönetimi
async function handleToggleDomain(domain, enable) {
  const { disabledDomains = [] } = await chrome.storage.local.get('disabledDomains');
  let updatedDomains = [...disabledDomains];

  if (!enable) {
    // Siteyi devre dışı listesine ekle
    if (!updatedDomains.includes(domain)) {
      updatedDomains.push(domain);
    }
  } else {
    // Sitede korumayı tekrar aç (listeden çıkar)
    updatedDomains = updatedDomains.filter(d => d !== domain);
  }

  await chrome.storage.local.set({ disabledDomains: updatedDomains });

  // declarativeNetRequest dynamic allow kuralı güncelle
  // Devre dışı bırakılan sitelere öncelikli "allow" kuralı atanır
  const dynamicRules = updatedDomains.map((d, idx) => ({
    id: 10000 + idx,
    priority: 100, // Engelleme kurallarından daha yüksek öncelik
    action: { type: 'allow' },
    condition: {
      initiatorDomains: [d]
    }
  }));

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map(r => r.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeRuleIds,
    addRules: dynamicRules
  });

  return { success: true, disabledDomains: updatedDomains };
}
