// OpenBlock - Options Controller
document.addEventListener('DOMContentLoaded', async () => {
  // Sekme geçişleri
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.tab;
      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const pane = document.getElementById(`pane-${target}`);
      if (pane) pane.classList.add('active');
    });
  });

  // Elemanlar
  const optNetwork = document.getElementById('optNetwork');
  const optCosmetic = document.getElementById('optCosmetic');
  const optAntiAdblock = document.getElementById('optAntiAdblock');
  const optBadge = document.getElementById('optBadge');
  const btnResetStats = document.getElementById('btnResetStats');

  const whitelistInput = document.getElementById('whitelistInput');
  const btnAddWhitelist = document.getElementById('btnAddWhitelist');
  const whitelistItems = document.getElementById('whitelistItems');

  const customRuleInput = document.getElementById('customRuleInput');
  const btnAddCustomRule = document.getElementById('btnAddCustomRule');
  const customRuleItems = document.getElementById('customRuleItems');

  // Mevcut verileri yükle
  const { settings = {}, disabledDomains = [], customBlockRules = [] } = await chrome.storage.local.get([
    'settings',
    'disabledDomains',
    'customBlockRules'
  ]);

  // Ayar anahtarları
  optNetwork.checked = settings.networkBlocking !== false;
  optCosmetic.checked = settings.cosmeticFiltering !== false;
  optAntiAdblock.checked = settings.antiAdblock !== false;
  optBadge.checked = settings.showBadge !== false;

  renderDomainList(whitelistItems, disabledDomains, removeWhitelistDomain);
  renderDomainList(customRuleItems, customBlockRules, removeCustomRule);

  // Ayar değişikliklerini kaydet
  const saveSettings = async () => {
    const updatedSettings = {
      networkBlocking: optNetwork.checked,
      cosmeticFiltering: optCosmetic.checked,
      antiAdblock: optAntiAdblock.checked,
      showBadge: optBadge.checked
    };
    await chrome.storage.local.set({ settings: updatedSettings });
  };

  optNetwork.addEventListener('change', saveSettings);
  optCosmetic.addEventListener('change', saveSettings);
  optAntiAdblock.addEventListener('change', saveSettings);
  optBadge.addEventListener('change', saveSettings);

  // İstatistikleri sıfırla
  btnResetStats.addEventListener('click', async () => {
    if (confirm('Engellenen reklam sayacını sıfırlamak istediğinize emin misiniz?')) {
      await chrome.storage.local.set({ totalBlocked: 0 });
      alert('İstatistikler başarıyla sıfırlandı.');
    }
  });

  // Beyaz Listeye Site Ekle
  btnAddWhitelist.addEventListener('click', async () => {
    const rawVal = whitelistInput.value.trim().toLowerCase();
    const cleanDomain = cleanInputDomain(rawVal);
    if (!cleanDomain) return;

    const data = await chrome.storage.local.get('disabledDomains');
    const list = data.disabledDomains || [];

    if (!list.includes(cleanDomain)) {
      list.push(cleanDomain);
      await chrome.storage.local.set({ disabledDomains: list });
      whitelistInput.value = '';
      renderDomainList(whitelistItems, list, removeWhitelistDomain);

      // dynamic rule sync
      await chrome.runtime.sendMessage({
        action: 'toggleDomain',
        domain: cleanDomain,
        enable: false
      });
    }
  });

  async function removeWhitelistDomain(domain) {
    const data = await chrome.storage.local.get('disabledDomains');
    let list = data.disabledDomains || [];
    list = list.filter(d => d !== domain);
    await chrome.storage.local.set({ disabledDomains: list });
    renderDomainList(whitelistItems, list, removeWhitelistDomain);

    await chrome.runtime.sendMessage({
      action: 'toggleDomain',
      domain: domain,
      enable: true
    });
  }

  // Özel Kural Ekle
  btnAddCustomRule.addEventListener('click', async () => {
    const rawVal = customRuleInput.value.trim().toLowerCase();
    const cleanDomain = cleanInputDomain(rawVal);
    if (!cleanDomain) return;

    const data = await chrome.storage.local.get('customBlockRules');
    const list = data.customBlockRules || [];

    if (!list.includes(cleanDomain)) {
      list.push(cleanDomain);
      await chrome.storage.local.set({ customBlockRules: list });
      customRuleInput.value = '';
      renderDomainList(customRuleItems, list, removeCustomRule);

      // dynamic declarative rule add
      addDynamicBlockRule(cleanDomain, list.indexOf(cleanDomain) + 20000);
    }
  });

  async function removeCustomRule(domain) {
    const data = await chrome.storage.local.get('customBlockRules');
    let list = data.customBlockRules || [];
    const index = list.indexOf(domain);
    list = list.filter(d => d !== domain);
    await chrome.storage.local.set({ customBlockRules: list });
    renderDomainList(customRuleItems, list, removeCustomRule);

    if (index >= 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [index + 20000]
      });
    }
  }

  async function addDynamicBlockRule(domain, ruleId) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [{
        id: ruleId,
        priority: 2,
        action: { type: 'block' },
        condition: {
          urlFilter: `||${domain}`,
          resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "xmlhttprequest", "ping", "other"]
        }
      }]
    });
  }

  function cleanInputDomain(str) {
    try {
      if (str.startsWith('http://') || str.startsWith('https://')) {
        return new URL(str).hostname;
      }
      return str.replace(/^\/+/, '').split('/')[0];
    } catch (e) {
      return str;
    }
  }

  function renderDomainList(container, list, onRemove) {
    container.innerHTML = '';
    if (!list || list.length === 0) {
      container.innerHTML = '<li style="color: #64748b; font-size: 13px; padding: 8px 0;">Henüz kayıtlı bir alan adı bulunmuyor.</li>';
      return;
    }

    list.forEach(domain => {
      const li = document.createElement('li');
      li.className = 'domain-item';
      li.innerHTML = `
        <span>${domain}</span>
        <button class="delete-btn">Kaldır</button>
      `;
      li.querySelector('.delete-btn').addEventListener('click', () => onRemove(domain));
      container.appendChild(li);
    });
  }
});
