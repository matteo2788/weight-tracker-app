// landing-auth-fix.js — final runtime fix for landing page auth input dark-fill/autofill artifacts
(function fixLandingAuthInputs(){
  const LANDING_PLACEHOLDERS = new Set([
    'your@email.com',
    'Password',
    'Your name'
  ]);

  function isLandingAuthInput(el){
    return el &&
      el.tagName === 'INPUT' &&
      LANDING_PLACEHOLDERS.has(el.getAttribute('placeholder'));
  }

  function applyCleanInputStyle(input){
    if (!isLandingAuthInput(input)) return;

    input.style.setProperty('background', '#F7F7F4', 'important');
    input.style.setProperty('background-color', '#F7F7F4', 'important');
    input.style.setProperty('color', '#11141B', 'important');
    input.style.setProperty('-webkit-text-fill-color', '#11141B', 'important');
    input.style.setProperty('box-shadow', 'none', 'important');
    input.style.setProperty('-webkit-box-shadow', 'none', 'important');
    input.style.setProperty('outline', 'none', 'important');
    input.style.setProperty('border-radius', '0', 'important');
    input.style.setProperty('border-top', '0', 'important');
    input.style.setProperty('border-left', '0', 'important');
    input.style.setProperty('border-right', '0', 'important');
    input.style.setProperty('border-bottom', '1px solid rgba(17,20,27,0.22)', 'important');
    input.style.setProperty('padding-left', '0', 'important');
    input.style.setProperty('padding-right', '0', 'important');
    input.style.setProperty('appearance', 'none', 'important');
    input.style.setProperty('-webkit-appearance', 'none', 'important');
    input.style.setProperty('caret-color', '#11141B', 'important');
  }

  function run(){
    document.querySelectorAll('input').forEach(applyCleanInputStyle);
  }

  function injectAutofillStyle(){
    if (document.getElementById('weightlens-landing-auth-final-fix')) return;

    const style = document.createElement('style');
    style.id = 'weightlens-landing-auth-final-fix';
    style.textContent = `
      input[placeholder="your@email.com"],
      input[placeholder="Password"],
      input[placeholder="Your name"] {
        background: #F7F7F4 !important;
        background-color: #F7F7F4 !important;
        color: #11141B !important;
        -webkit-text-fill-color: #11141B !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
        outline: none !important;
        border-radius: 0 !important;
        border-top: 0 !important;
        border-left: 0 !important;
        border-right: 0 !important;
        border-bottom: 1px solid rgba(17,20,27,0.22) !important;
        caret-color: #11141B !important;
        appearance: none !important;
        -webkit-appearance: none !important;
      }

      input[placeholder="your@email.com"]:-webkit-autofill,
      input[placeholder="Password"]:-webkit-autofill,
      input[placeholder="Your name"]:-webkit-autofill,
      input[placeholder="your@email.com"]:-webkit-autofill:hover,
      input[placeholder="Password"]:-webkit-autofill:hover,
      input[placeholder="Your name"]:-webkit-autofill:hover,
      input[placeholder="your@email.com"]:-webkit-autofill:focus,
      input[placeholder="Password"]:-webkit-autofill:focus,
      input[placeholder="Your name"]:-webkit-autofill:focus {
        -webkit-text-fill-color: #11141B !important;
        caret-color: #11141B !important;
        box-shadow: 0 0 0 1000px #F7F7F4 inset !important;
        -webkit-box-shadow: 0 0 0 1000px #F7F7F4 inset !important;
        border-bottom-color: rgba(17,20,27,0.22) !important;
        transition: background-color 999999s ease-in-out 0s !important;
      }
    `;
    document.head.appendChild(style);
  }

  injectAutofillStyle();
  run();

  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('input', run, true);
  document.addEventListener('focusin', run, true);
  window.addEventListener('pageshow', run);
  setTimeout(run, 100);
  setTimeout(run, 500);
  setTimeout(run, 1500);
})();
