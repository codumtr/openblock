// OpenBlock - Popup Controller
document.addEventListener('DOMContentLoaded', async () => {
  const powerBtn = document.getElementById('powerBtn');
  const statusIndicator = document.getElementById('statusIndicator');
  const domainName = document.getElementById('domainName');
  const pageBlockedCount = document.getElementById('pageBlockedCount');
  const totalBlockedCount = document.getElementById('totalBlockedCount');
  const toggleCosmetic = document.getElementById('toggleCosmetic');
  const toggleAntiAdblock = document.getElementById('toggleAntiAdblock');
  const reloadTip = document.getElementById('reloadTip');

  let currentTab = null;
  let currentHostname = '';
  let isSiteEnabled = true;

  // Aktif sekmeyi ve alan adını al
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      if (url.protocol.startsWith('http')) {
        currentHostname = url.hostname;
        domainName.textContent = currentHostname;
      } else {
        domainName.textContent = 'Tarayıcı Sayfası';
        disableForInternalPages();
        return;
      }
    } catch (e) {
      domainName.textContent = 'Geçersiz Adres';
      disableForInternalPages();
      return;
    }
  }

  // Verileri yükle
  await loadState();

  // Güç butonuna tıklama (Site bazlı açma/kapatma)
  powerBtn.addEventListener('click', async () => {
    if (!currentHostname) return;

    isSiteEnabled = !isSiteEnabled;
    updatePowerButtonUI(isSiteEnabled);

    // Arka plan çalışanına bildir
    await chrome.runtime.sendMessage({
      action: 'toggleDomain',
      domain: currentHostname,
      enable: isSiteEnabled
    });

    reloadTip.classList.add('visible');
  });

  // Kozmetik filtre değişimi
  toggleCosmetic.addEventListener('change', async (e) => {
    const { settings = {} } = await chrome.storage.local.get('settings');
    settings.cosmeticFiltering = e.target.checked;
    await chrome.storage.local.set({ settings });
    reloadTip.classList.add('visible');
  });

  // Anti-adblock değişimi
  toggleAntiAdblock.addEventListener('change', async (e) => {
    const { settings = {} } = await chrome.storage.local.get('settings');
    settings.antiAdblock = e.target.checked;
    await chrome.storage.local.set({ settings });
    reloadTip.classList.add('visible');
  });

  // Durum ve sayaçları yükle
  async function loadState() {
    const { disabledDomains = [], totalBlocked = 0, settings = {} } = await chrome.storage.local.get([
      'disabledDomains',
      'totalBlocked',
      'settings'
    ]);

    isSiteEnabled = !disabledDomains.includes(currentHostname);
    updatePowerButtonUI(isSiteEnabled);

    // Anahtarları senkronize et
    toggleCosmetic.checked = settings.cosmeticFiltering !== false;
    toggleAntiAdblock.checked = settings.antiAdblock !== false;

    // Toplam engellenen
    totalBlockedCount.textContent = formatNumber(totalBlocked);

    // Bu sekmedeki engellenen
    if (currentTab && currentTab.id) {
      chrome.runtime.sendMessage({ action: 'getTabStats', tabId: currentTab.id }, (response) => {
        const count = response ? response.count : 0;
        pageBlockedCount.textContent = formatNumber(count);
      });
    }
  }

  function updatePowerButtonUI(enabled) {
    if (enabled) {
      powerBtn.classList.add('active');
      statusIndicator.textContent = 'KORUMA AKTİF';
      statusIndicator.classList.remove('disabled');
    } else {
      powerBtn.classList.remove('active');
      statusIndicator.textContent = 'BU SİTEDE DEVRE DIŞI';
      statusIndicator.classList.add('disabled');
    }
  }

  function disableForInternalPages() {
    powerBtn.style.opacity = '0.4';
    powerBtn.style.pointerEvents = 'none';
    statusIndicator.textContent = 'SİSTEM SAYFASI';
    statusIndicator.classList.add('disabled');
    pageBlockedCount.textContent = '-';
  }

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
  }
});
