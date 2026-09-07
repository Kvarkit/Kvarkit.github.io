/* Signal Garden — homepage behaviour.
   Two jobs only:
   1. progressive-enhance the invitation with a clipboard copy button;
   2. an ambient, reduced-motion-gated reveal for content below the fold.
   Everything on the page is fully readable and usable with this file absent. */

(function () {
  'use strict';

  var reduceMotion = false;
  try {
    reduceMotion = !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) { /* no matchMedia: assume motion is unwelcome */ reduceMotion = true; }

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

  /* ---------- 2. ambient reveal (motion-gated) ---------- */

  if (reduceMotion || typeof window.IntersectionObserver !== 'function') return;

  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  // Only opt the page into the hidden start-state once we know we can undo it.
  document.documentElement.classList.add('js');

  var observer = new window.IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add('in');
        observer.unobserve(entries[i].target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });

  for (var i = 0; i < targets.length; i++) {
    targets[i].style.transitionDelay = Math.min(i, 6) * 70 + 'ms';
    observer.observe(targets[i]);
  }

  // Safety net: if anything goes wrong, show everything.
  window.setTimeout(function () {
    for (var j = 0; j < targets.length; j++) targets[j].classList.add('in');
  }, 4000);
})();
