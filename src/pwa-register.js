// pwa-register.js — simple PWA registration and safe mobile chrome
(function registerWeightLensPWA(){
  function setMeta(name, content){
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }

  function setPwaChrome(){
    setMeta('theme-color', '#F6F4EF');
    setMeta('msapplication-TileColor', '#F6F4EF');

    const appleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleStatus) appleStatus.setAttribute('content', 'default');
  }

  setPwaChrome();
  window.addEventListener('pageshow', setPwaChrome);
  document.addEventListener('visibilitychange', setPwaChrome);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('/sw.js').catch(function(error){
        console.warn('WeightLens service worker registration failed:', error);
      });
    });
  }

  const style = document.createElement('style');
  style.id = 'weightlens-basic-mobile-polish';
  style.textContent = `
    html,
    body,
    #root {
      width: 100% !important;
      min-width: 100% !important;
      overflow-x: hidden !important;
    }

    body {
      margin: 0 !important;
      overscroll-behavior-x: none !important;
      -webkit-text-size-adjust: 100% !important;
    }

    input,
    select,
    textarea,
    button {
      font-size: 16px;
    }
  `;

  document.head.appendChild(style);
})();
