/**
 * M. Shahul Hameed - Portfolio Scripts
 * Vanilla JavaScript for Theme Toggle, Navigation, and Interactive UI
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initScrollSpy();
  initContactForm();
  initEmailCopy();
  initBackToTop();
  initSkillBarAnimation();
});

/* ==========================================================================
   THEME TOGGLE (LIGHT / DARK MODE)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  // Retrieve saved preference or check OS preference
  const savedTheme = localStorage.getItem('shahul-portfolio-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const initialTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('shahul-portfolio-theme', newTheme);
  });

  // Listen to system preference changes if user hasn't explicitly set preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('shahul-portfolio-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', 'Switch to light mode');
      themeBtn.setAttribute('title', 'Switch to light mode');
    }
  } else {
    document.documentElement.removeAttribute('data-theme');
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', 'Switch to dark mode');
      themeBtn.setAttribute('title', 'Switch to dark mode');
    }
  }
}

/* ==========================================================================
   MOBILE MENU NAVIGATION
   ========================================================================== */
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!mobileToggle || !mobileMenu) return;

  mobileToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileToggle.classList.add('open');
    mobileToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileToggle.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
  }

  // Close menu when clicking any nav link
  const navLinks = mobileMenu.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !mobileToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });
}

/* ==========================================================================
   SCROLL SPY & ACTIVE NAVIGATION
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

/* ==========================================================================
   SKILL BAR ANIMATION (INTERSECTION OBSERVER)
   ========================================================================== */
function initSkillBarAnimation() {
  const skillBars = document.querySelectorAll('.skill-bar-progress');
  if (!skillBars.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const targetWidth = bar.getAttribute('data-width') || '85%';
          bar.style.width = targetWidth;
          obs.unobserve(bar);
        }
      });
    },
    { threshold: 0.2 }
  );

  skillBars.forEach((bar) => {
    bar.style.width = '0%';
    observer.observe(bar);
  });
}

/* ==========================================================================
   EMAIL COPY TO CLIPBOARD
   ========================================================================== */
function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const email = 'mohammedarshaf3@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      const originalTitle = copyBtn.getAttribute('title');
      copyBtn.setAttribute('title', 'Copied to clipboard!');
      copyBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      setTimeout(() => {
        copyBtn.setAttribute('title', originalTitle);
        copyBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        `;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  });
}

/* ==========================================================================
   CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('portfolio-contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form || !feedback) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('sender-name');
    const emailInput = document.getElementById('sender-email');
    const messageInput = document.getElementById('sender-message');

    if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
      feedback.textContent = 'Please fill out all fields before submitting.';
      feedback.className = 'form-feedback';
      feedback.style.display = 'block';
      feedback.style.color = '#ef4444';
      feedback.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      feedback.style.border = '1px solid #ef4444';
      return;
    }

    // Success response
    feedback.textContent = `Thank you, ${nameInput.value.trim()}! Your message has been received. I will respond to ${emailInput.value.trim()} shortly.`;
    feedback.className = 'form-feedback success';
    feedback.style.display = 'block';

    form.reset();

    setTimeout(() => {
      feedback.style.display = 'none';
    }, 6000);
  });
}

/* ==========================================================================
   BACK TO TOP SMOOTH SCROLLER
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (!backToTopBtn) return;

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}
