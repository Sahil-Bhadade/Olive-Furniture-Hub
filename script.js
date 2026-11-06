/* =========================================================
   OLIVE FURNITURE HUB — SCRIPT
   1. Header shadow on scroll
   2. Mobile nav toggle
   3. Scroll-reveal
   4. Animated stat counter
   5. Prefill furniture type from URL (?type=kitchen)
   6. Material swatch picker
   7. Enquiry + Contact forms -> WhatsApp
   8. Gallery lightbox (keyboard + prev/next)
   9. Footer year
   10. Broken-image fallback
   ========================================================= */

   document.addEventListener('DOMContentLoaded', () => {

    const WHATSAPP_NUMBER = '919881415152';
  
    /* ---------- 1. Header shadow on scroll ---------- */
    const header = document.getElementById('siteHeader');
    if (header) {
      const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  
    /* ---------- 2. Mobile nav ---------- */
    const navToggle = document.getElementById('navToggle');
    const mainNav = document.getElementById('mainNav');
    if (navToggle && mainNav) {
      const setNav = (open) => {
        mainNav.classList.toggle('is-open', open);
        navToggle.classList.toggle('is-open', open);
        navToggle.setAttribute('aria-expanded', String(open));
      };
      navToggle.addEventListener('click', () => setNav(!mainNav.classList.contains('is-open')));
      mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setNav(false)));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });
    }
  
    /* ---------- 3. Scroll-reveal ---------- */
    const revealTargets = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealTargets.forEach(el => revealObserver.observe(el));
    } else {
      revealTargets.forEach(el => el.classList.add('in-view'));
    }
  
    /* ---------- 4. Animated stat counter ---------- */
    const statEl = document.querySelector('.stat-number[data-count]');
    if (statEl) {
      const target = parseInt(statEl.getAttribute('data-count'), 10);
      let started = false;
  
      const runCount = () => {
        if (started) return;
        started = true;
        const duration = 1400;
        const startTime = performance.now();
        const step = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          statEl.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
  
      if ('IntersectionObserver' in window) {
        const statObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) { runCount(); statObserver.disconnect(); }
          });
        }, { threshold: 0.5 });
        statObserver.observe(statEl);
      } else {
        statEl.textContent = target;
      }
    }
  
    /* ---------- 5. Prefill furniture type from URL ---------- */
    const typeSelect = document.getElementById('cf-type');
    if (typeSelect) {
      const wanted = new URLSearchParams(window.location.search).get('type');
      if (wanted && Array.from(typeSelect.options).some(o => o.value === wanted)) {
        typeSelect.value = wanted;
      }
    }
  
    /* ---------- 6. Material swatch picker ---------- */
    const woodInput = document.getElementById('cf-wood');
    const fabricInput = document.getElementById('cf-fabric');
    const pickerSelection = document.getElementById('pickerSelection');
  
    function updateSelectionText() {
      if (pickerSelection && woodInput && fabricInput) {
        pickerSelection.textContent = `Selected: ${woodInput.value} wood, ${fabricInput.value} fabric`;
      }
    }
  
    function wireSwatchGroup(selector, hiddenInput, dataAttr) {
      if (!hiddenInput) return;
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => { b.classList.remove('is-selected'); b.setAttribute('aria-pressed', 'false'); });
          btn.classList.add('is-selected');
          btn.setAttribute('aria-pressed', 'true');
          hiddenInput.value = btn.getAttribute(dataAttr);
          updateSelectionText();
        });
      });
    }
    wireSwatchGroup('[data-wood]', woodInput, 'data-wood');
    wireSwatchGroup('[data-fabric]', fabricInput, 'data-fabric');
  
    function resetSwatches() {
      if (!woodInput || !fabricInput) return;
      document.querySelectorAll('[data-wood]').forEach(b => {
        const on = b.getAttribute('data-wood') === 'Teak';
        b.classList.toggle('is-selected', on);
        b.setAttribute('aria-pressed', String(on));
      });
      document.querySelectorAll('[data-fabric]').forEach(b => {
        const on = b.getAttribute('data-fabric') === 'Olive Linen';
        b.classList.toggle('is-selected', on);
        b.setAttribute('aria-pressed', String(on));
      });
      woodInput.value = 'Teak';
      fabricInput.value = 'Olive Linen';
      updateSelectionText();
    }
  
    /* ---------- 7. Forms -> WhatsApp ---------- */
    function openWhatsApp(text) {
      const a = document.createElement('a');
      a.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  
    function setupForm(form, note, successMsg, buildText, onDone) {
      if (!form || !note) return;
      let timer;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
  
        if (!form.checkValidity()) {
          form.reportValidity();
          note.textContent = 'Please fill in all required fields correctly.';
          note.classList.add('is-error');
          return;
        }
  
        const data = new FormData(form);
        const text = buildText(data, form);
  
        note.classList.remove('is-error');
        note.textContent = successMsg;
        openWhatsApp(text);
        form.reset();
        if (onDone) onDone();
  
        clearTimeout(timer);
        timer = setTimeout(() => { note.textContent = ''; }, 9000);
      });
    }
  
    setupForm(
      document.getElementById('enquiryForm'),
      document.getElementById('enquiryNote'),
      'Opening WhatsApp with your details — just press Send to complete your enquiry.',
      (fd, form) => {
        const select = form.querySelector('#cf-type');
        const typeLabel = select && select.selectedOptions[0] ? select.selectedOptions[0].text : '';
        return [
          'Hello Olive Furniture Hub, I would like a free quote.',
          '',
          `Name: ${fd.get('name')}`,
          `Phone: ${fd.get('phone')}`,
          fd.get('email') ? `Email: ${fd.get('email')}` : null,
          `Furniture: ${typeLabel}`,
          `Wood: ${fd.get('woodFinish')}`,
          `Fabric: ${fd.get('fabric')}`
        ].filter(line => line !== null).join('\n');
      },
      resetSwatches
    );
  
    setupForm(
      document.getElementById('contactForm'),
      document.getElementById('contactNote'),
      'Opening WhatsApp with your message — just press Send.',
      (fd) => [
        'Hello Olive Furniture Hub,',
        '',
        `Name: ${fd.get('name')}`,
        `Phone: ${fd.get('phone')}`,
        `Message: ${fd.get('message')}`
      ].join('\n')
    );
  
    /* ---------- 8. Gallery lightbox ---------- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  
    if (lightbox && lightboxImg && lightboxCaption && lightboxClose && galleryItems.length) {
      let current = 0;
      let lastFocus = null;
  
      const show = (i) => {
        current = (i + galleryItems.length) % galleryItems.length;
        const item = galleryItems[current];
        const img = item.querySelector('img');
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = item.getAttribute('data-caption') || '';
      };
  
      const openLightbox = (i) => {
        lastFocus = document.activeElement;
        show(i);
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lightboxClose.focus();
      };
  
      const closeLightbox = () => {
        if (!lightbox.classList.contains('is-open')) return;
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
      };
  
      galleryItems.forEach((item, i) => {
        const caption = item.getAttribute('data-caption') || 'photo';
        item.setAttribute('aria-label', `View larger: ${caption}`);
        item.addEventListener('click', () => openLightbox(i));
      });
  
      lightboxClose.addEventListener('click', closeLightbox);
      if (lightboxPrev) lightboxPrev.addEventListener('click', () => show(current - 1));
      if (lightboxNext) lightboxNext.addEventListener('click', () => show(current + 1));
      lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  
      document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') show(current - 1);
        else if (e.key === 'ArrowRight') show(current + 1);
        else if (e.key === 'Tab') {
          // keep keyboard focus inside the lightbox
          const focusable = Array.from(lightbox.querySelectorAll('button'));
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
    }
  
    /* ---------- 9. Footer year ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  
    /* ---------- 10. Broken-image fallback ---------- */
    const markBroken = (img) => {
      if (img.parentElement) img.parentElement.classList.add('img-failed');
    };
    document.addEventListener('error', (e) => {
      if (e.target && e.target.tagName === 'IMG') markBroken(e.target);
    }, true);
    document.querySelectorAll('img').forEach(img => {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) markBroken(img);
    });
  
  });