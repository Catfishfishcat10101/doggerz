if (!self.define) {
  let s,
    e = {};
  const l = (l, n) => (
    (l = new URL(l + ".js", n).href),
    e[l] ||
      new Promise((e) => {
        if ("document" in self) {
          const s = document.createElement("script");
          ((s.src = l), (s.onload = e), document.head.appendChild(s));
        } else ((s = l), importScripts(l), e());
      }).then(() => {
        let s = e[l];
        if (!s) throw new Error(`Module ${l} didn’t register its module`);
        return s;
      })
  );
  self.define = (n, i) => {
    const r =
      s ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (e[r]) return;
    let u = {};
    const t = (s) => l(s, r),
      o = { module: { uri: r }, exports: u, require: t };
    e[r] = Promise.all(n.map((s) => o[s] || t(s))).then((s) => (i(...s), u));
  };
}
define(["./workbox-58bd4dca"], function (s) {
  "use strict";
  (self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: "registerSW.js", revision: "1872c500de691dce40960bb85481de07" },
        { url: "index.html", revision: "318bcb3e0c687c179319eb4368ce4f32" },
        { url: "favicon.ico", revision: "49427e688296a710df995ce2163083b4" },
        { url: "assets/Splash-CuDJ3zkC.js", revision: null },
        { url: "assets/Signup-BI7okwUl.js", revision: null },
        { url: "assets/Settings-DPKp_jlK.js", revision: null },
        { url: "assets/settings-BW652Eiz.js", revision: null },
        { url: "assets/Potty-J2lfuw4P.js", revision: null },
        { url: "assets/NotFound-BsnPWOGQ.js", revision: null },
        { url: "assets/Memory-ZSVFxocC.js", revision: null },
        { url: "assets/Login-DEndXJkp.js", revision: null },
        { url: "assets/Legal-Cd8UB1l3.js", revision: null },
        { url: "assets/Landing-ut81j_EI.js", revision: null },
        {
          url: "assets/jack_russell_senior_mange-61PrjIeQ.png",
          revision: null,
        },
        { url: "assets/jack_russell_senior_hd-Cx1USs4w.svg", revision: null },
        {
          url: "assets/jack_russell_senior_fleas-NDgBOe2m.png",
          revision: null,
        },
        {
          url: "assets/jack_russell_senior_dirty-CNZlPyw-.png",
          revision: null,
        },
        { url: "assets/jack_russell_senior-BtqTXpZp.svg", revision: null },
        { url: "assets/jack_russell_puppy_mange-DFl_zxjR.png", revision: null },
        { url: "assets/jack_russell_puppy_hd-mFC3nHYE.svg", revision: null },
        { url: "assets/jack_russell_puppy_fleas-BEJpCiVH.png", revision: null },
        { url: "assets/jack_russell_puppy_dirty-Dx9FgLWm.png", revision: null },
        { url: "assets/jack_russell_puppy-GA4cHuBT.png", revision: null },
        { url: "assets/jack_russell_puppy-DPjjvR9G.svg", revision: null },
        { url: "assets/jack_russell_adult_mange-8xGPx0Ns.png", revision: null },
        { url: "assets/jack_russell_adult_fleas-DHcCCrgL.png", revision: null },
        { url: "assets/jack_russell_adult_dirty-BS6U00N_.png", revision: null },
        { url: "assets/jack_russell_adult-E8VsjF-i.png", revision: null },
        { url: "assets/jack_russell_adult-D2zl0Hic.svg", revision: null },
        { url: "assets/index-ClZwlZUg.js", revision: null },
        { url: "assets/index-C3SB5zge.css", revision: null },
        { url: "assets/Game-DWmq8r5b.js", revision: null },
        { url: "assets/dogSlice-VptOyUWJ.js", revision: null },
        { url: "assets/Contact-B6HrMc2q.js", revision: null },
        { url: "assets/backyard-night-CfWBTpM2.png", revision: null },
        { url: "assets/backyard-day-CWIBoNbF.png", revision: null },
        { url: "assets/Adopt-CIkprTGu.js", revision: null },
        { url: "assets/About-Bl8Vf5Sj.js", revision: null },
        { url: "favicon.ico", revision: "49427e688296a710df995ce2163083b4" },
        {
          url: "manifest.webmanifest",
          revision: "3bae77c8349d4d4a83cd3fe43e4203ca",
        },
      ],
      {},
    ),
    s.cleanupOutdatedCaches(),
    s.registerRoute(
      new s.NavigationRoute(s.createHandlerBoundToURL("/index.html")),
    ),
    s.registerRoute(
      /^https:\/\/fonts\.googleapis\.com\/.*/i,
      new s.CacheFirst({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536e3 }),
          new s.CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
      "GET",
    ),
    s.registerRoute(
      /^https:\/\/fonts\.gstatic\.com\/.*/i,
      new s.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new s.ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 31536e3 }),
          new s.CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
      "GET",
    ),
    s.registerRoute(
      /^https:\/\/firestore\.googleapis\.com\/.*/i,
      new s.NetworkFirst({
        cacheName: "firestore-cache",
        networkTimeoutSeconds: 10,
        plugins: [],
      }),
      "GET",
    ));
});
