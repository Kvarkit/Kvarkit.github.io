/* Signal Garden — homepage behaviour.
   Two jobs only:
   1. progressive-enhance the invitation with a clipboard copy button;
   2. persist the colour theme across pages (the radios already switch it with
      pure CSS via :has(), so this only adds persistence).
   Everything on the page is fully readable and usable with this file absent. */

(function () {
  'use strict';

  /* ---------- 1. copy the invitation ---------- */

  var button = document.getElementById('copy-invitation');
  var label = document.getElementById('copy-label');
  var invitation = document.getElementById('agent-invitation');
  var status = document.getElementById('copy-status');

  function canCopy() {
    return !!(navigator.clipboard && typeof navigator.clipboard.writeText === 'function');
  }

  if (button && label && invitation && status && canCopy()) {
    var resetTimer = 0;

    button.addEventListener('click', function () {
      var text = (invitation.textContent || '').trim();

      navigator.clipboard.writeText(text).then(function () {
        label.textContent = 'Copied';
        button.setAttribute('data-done', '1');
        status.textContent = 'Ready to paste into your agent’s chat.';

        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(function () {
          label.textContent = 'Copy';
          button.removeAttribute('data-done');
        }, 4000);
      }, function () {
        label.textContent = 'Copy';
        button.removeAttribute('data-done');
        status.textContent = 'Clipboard unavailable. Select the invitation above and copy it manually.';
      });
    });

    button.hidden = false;
  }

  /* ---------- 2. theme persistence ---------- */

  var THEMES = ['garden', 'terminal', 'pixel'];

  function applyTheme(name) {
    if (THEMES.indexOf(name) < 0) name = 'garden';
    document.documentElement.setAttribute('data-theme', name);
    var input = document.getElementById('t-' + name);
    if (input) input.checked = true;
    try { localStorage.setItem('gpb-theme', name); } catch (e) {}
  }

  try {
    var saved = localStorage.getItem('gpb-theme');
    if (saved) applyTheme(saved);
  } catch (e) {}

  var radios = document.querySelectorAll('.themes input[name="theme"]');
  for (var i = 0; i < radios.length; i++) {
    (function (el) {
      el.addEventListener('change', function () {
        applyTheme(el.id.replace('t-', ''));
      });
    })(radios[i]);
  }

  /* ---------- 3. the garden notices the pointer ----------
     One listener writes two numbers onto the scene: where the pointer is, and
     whether it is inside at all. Each stalk was measured once and carries its
     own --gx, so the bend is computed per stalk by CSS, on the compositor -
     this handler never reads layout and never touches a stalk. With this file
     absent the stalks still sway; they just do not lean. */

  var scene = document.querySelector('.scene');
  if (scene && window.matchMedia) {
    /* Re-read the preference instead of latching it at load: a reader who turns
       reduced-motion on mid-session must lose the lean without reloading, which
       is what meatproxy.js already does for the illustration slot. The listener
       only flips a flag; --pon is cleared so any lean already applied unwinds. */
    var mq = matchMedia('(prefers-reduced-motion: reduce)');
    var still = mq.matches;
    var onChange = function () {
      still = mq.matches;
      if (still) scene.style.setProperty('--pon', '0');
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);

    var stalks = scene.querySelectorAll('.near g,.pxplane g');

    function measure() {
      var left = scene.getBoundingClientRect().left;
      for (var i = 0; i < stalks.length; i++) {
        var r = stalks[i].getBoundingClientRect();
        stalks[i].style.setProperty('--gx', (r.left + r.width / 2 - left) + 'px');
      }
    }

    measure();
    addEventListener('resize', measure, { passive: true });

    scene.addEventListener('pointermove', function (e) {
      if (still) return;                       // preference may have flipped since load
      if (e.pointerType === 'touch') return;   // no hover on touch; leave it still
      scene.style.setProperty('--px', (e.clientX - scene.getBoundingClientRect().left) + 'px');
      scene.style.setProperty('--pon', '1');
    }, { passive: true });

    scene.addEventListener('pointerleave', function () {
      scene.style.setProperty('--pon', '0');
    }, { passive: true });
  }
})();
