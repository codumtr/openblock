const fs = require('fs');
const path = require('path');

const adDomains = [
  // Global Major Ad Networks & Exchanges
  "doubleclick.net",
  "googleadservices.com",
  "googlesyndication.com",
  "adservice.google.com",
  "pagead2.googlesyndication.com",
  "tpc.googlesyndication.com",
  "adnxs.com",
  "criteo.com",
  "criteo.net",
  "taboola.com",
  "outbrain.com",
  "rubiconproject.com",
  "pubmatic.com",
  "openx.net",
  "casalemedia.com",
  "adroll.com",
  "advertising.com",
  "amazon-adsystem.com",
  "media.net",
  "sovrn.com",
  "lijit.com",
  "sharethrough.com",
  "yieldmo.com",
  "inmobi.com",
  "smaato.net",
  "smartadserver.com",
  "applovin.com",
  "unityads.unity3d.com",
  "ironsrc.com",
  "vungle.com",
  "chartboost.com",
  "flurry.com",
  "mgid.com",
  "zergnet.com",
  "revcontent.com",
  "adblade.com",

  // Popups, Redirects & Aggressive Ad Networks
  "popads.net",
  "popcash.net",
  "propellerads.com",
  "propellerclick.com",
  "adsterra.com",
  "exoclick.com",
  "adcash.com",
  "trafficjunky.com",
  "juicyads.com",
  "hilltopads.com",
  "clickadu.com",
  "bidvertiser.com",
  "yllix.com",
  "admaven.com",
  "ad-maven.com",
  "monetag.com",
  "clicksor.com",
  "infolinks.com",
  "chitika.net",

  // Trackers & Telemetry
  "google-analytics.com",
  "googletagmanager.com/gtag/js",
  "hotjar.com",
  "static.hotjar.com",
  "mouseflow.com",
  "crazyegg.com",
  "scorecardresearch.com",
  "quantserve.com",
  "chartbeat.com",
  "statcounter.com",
  "mc.yandex.ru",
  "an.yandex.ru",
  "clarity.ms",
  "newrelic.com/nr-loader",
  "fullstory.com",
  "mixpanel.com",
  "segment.io",
  "amplitude.com",

  // Turkish Ad Networks & Portals
  "reklamstore.com",
  "admatic.com.tr",
  "virgul.com",
  "medyanet.net",
  "gelirortaklari.com",
  "bilsenmedia.com",
  "tooplay.com",
  "reklamport.com",
  "intermax.com.tr",
  "dogantv.com.tr/ad",
  "netadservice.com",
  "adlook.com.tr",

  // Crypto Web Miners
  "coinhive.com",
  "coin-have.com",
  "crypto-loot.com",
  "jsecoin.com",
  "minr.pw",
  "cryptoloot.pro",
  "coinnebula.com"
];

const allResourceTypes = [
  "main_frame",
  "sub_frame",
  "stylesheet",
  "script",
  "image",
  "font",
  "object",
  "xmlhttprequest",
  "ping",
  "csp_report",
  "media",
  "websocket",
  "other"
];

const rules = adDomains.map((domain, index) => {
  return {
    id: index + 1,
    priority: 1,
    action: {
      type: "block"
    },
    condition: {
      urlFilter: `||${domain}`,
      resourceTypes: allResourceTypes
    }
  };
});

const outputPath = path.join(__dirname, 'rules', 'rules.json');
fs.writeFileSync(outputPath, JSON.stringify(rules, null, 2), 'utf-8');
console.log(`Generated ${rules.length} declarativeNetRequest rules at ${outputPath}`);
