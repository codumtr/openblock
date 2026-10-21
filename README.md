# 🛡️ OpenBlock - Ultra Hızlı & Açık Kaynak AdBlocker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/)

> **Piyasadaki hantal, ücretli veya gizlice reklam geçiren eklentilere son.**  
> Google Chrome **Manifest V3** standartlarına uygun, sıfır bellek sızıntılı, bağımsız ve topluluk odaklı yeni nesil reklam engelleyici.

---

## ✨ Neden Piyasadan Daha İyi?

1. **🚀 0 RAM / CPU Sızıntısı (declarativeNetRequest):**  
   Geleneksel reklam engelleyiciler arka planda ağır kuralları bellek üzerinde tararken tarayıcınızı yavaşlatır. OpenBlock, Chrome'un yerel C++ ağ motorunu kullanarak sıfır gecikmeyle çalışır.
2. **🛡️ Dürüst ve Şeffaf (Sıfır Rüşvet/Kabul Edilebilir Reklam):**  
   AdBlock Plus gibi şirketlerin yaptığı gibi büyük teknoloji şirketlerinden para alıp onların reklamlarına izin verme (Acceptable Ads) politikası **kesinlikle yoktur**.
3. **🇹🇷 Yerel + Küresel Filtreler:**  
   Google AdSense, DoubleClick, Criteo, Taboola gibi küresel devlerin yanı sıra Türkiye pazarındaki popüler yerel reklam ağlarını da varsayılan olarak engeller.
4. **🚫 Anti-AdBlock Kalkanı (Defuser):**  
   Haber ve içerik sitelerindeki *"Lütfen reklam engelleyicinizi kapatın"* şeklindeki can sıkıcı modal ve karartmaları otomatik temizler, kaydırma çubuğunu açar.
5. **🎨 Kozmetik Filtreleme:**  
   Sayfada boş ve çirkin kalan gri reklam kutularını DOM üzerinden tamamen kaldırarak temiz bir okuma deneyimi sunar.

---

## 📂 Proje Yapısı

```text
openblock-adblocker/
├── manifest.json              # Chrome Manifest V3 konfigürasyonu
├── background/
│   └── service-worker.js      # Arka plan servisi, sayaç ve dinamik kural yönetimi
├── content/
│   ├── content.js             # Kozmetik filtreleme ve Anti-Adblock kalkanı
│   └── cosmetic.css           # CSS tabanlı anlık reklam gizleme kuralları
├── popup/
│   ├── popup.html             # Modern cam tasarımlı (glassmorphic) açılır pencere
│   ├── popup.css              # Neon/koyu tema arayüz stilleri
│   └── popup.js               # Canlı istatistikler ve güç butonu denetleyicisi
├── options/
│   ├── options.html           # Beyaz liste ve özel kural yönetim paneli
│   ├── options.css            # Gelişmiş ayarlar sayfası stilleri
│   └── options.js             # Ayarlar ve dinamik kural senkronizasyonu
├── rules/
│   └── rules.json             # 90+ çekirdek reklam ve izleyici ağı engelleme kuralı
├── icons/                     # 16, 32, 48, 128 px SVG/PNG ikonlar
├── LICENSE                    # MIT Lisansı
└── README.md                  # Proje dokümantasyonu
```

---

## 🛠️ Kurulum ve Test (Tarayıcınıza Yükleyin)

Eklentiyi Chrome tarayıcınızda hemen çalıştırmak için:

1. Bu depoyu indirin veya klonlayın.
2. Google Chrome'u açın ve adres çubuğuna şunu yazın:  
   `chrome://extensions/`
3. Sağ üst köşedeki **"Geliştirici modu" (Developer mode)** anahtarını açın.
4. Sol üstte beliren **"Paketlenmemiş öge yükle" (Load unpacked)** butonuna tıklayın.
5. Bu projenin klasörünü (`openblock-adblocker`) seçin.
6. 🎉 **OpenBlock hazır!** Herhangi bir haber veya video sitesine girip test edebilirsiniz.

---

## 🤝 Katkıda Bulunma (Contributing)

Bu proje tamamen açık kaynaklıdır ve topluluk katkılarına açıktır:
1. Depoyu forklayın (`Fork`).
2. Yeni özellik veya kural eklemek için bir dal oluşturun (`git checkout -b feature/yeni-kural`).
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni reklam ağı engellendi'`).
4. Dalınıza push yapın (`git push origin feature/yeni-kural`).
5. Bir **Pull Request (PR)** açın!

---

## 📄 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına göz atabilirsiniz.
