// pwa-register.js — registers the service worker for installable app behavior
(function registerWeightLensPWA(){
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/sw.js').catch(function(error){
      console.warn('WeightLens service worker registration failed:', error);
    });
  });
})();
