/* ==========================================================================
   RAJPAL NISHAD — PORTFOLIO
   Vanilla JS: theme, nav, scroll reveals, counters, meters, form
   ========================================================================== */

(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeToggle = document.getElementById('themeToggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const toTop = document.getElementById('toTop');
  const progress = document.getElementById('scrollProgress');
  const yearEl = document.getElementById('year');
  const profileCard = document.getElementById('profileCard');
  const heroVisual = document.querySelector('.hero__visual');
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  const THEME_KEY = 'rn-theme';
  const MOBILE_QUERY = window.matchMedia('(max-width: 960px)');

  /* ------------------------------------------------------------------
     Theme: light / dark
     The inline <head> script applies the saved theme before paint; this
     module keeps the switch UI and meta color in sync. Default is dark.
  ------------------------------------------------------------------ */
  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);

    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (error) {
        /* storage can be unavailable in private mode — ignore */
      }
    }

    if (themeToggle) {
      themeToggle.setAttribute('aria-checked', String(theme === 'dark'));
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }

    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#08090a' : '#f2f0e9');
    }
  }

  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark', false);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
    });
  }

  /* Press T anywhere outside a form field to flip the theme. */
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;

    const target = event.target;
    const tag = target && target.tagName ? target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || (target && target.isContentEditable)) return;

    if (event.key.toLowerCase() === 't') {
      event.preventDefault();
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    }
  });

  /* ------------------------------------------------------------------
     Navbar: scrolled state, mobile menu, active link, progress bar
  ------------------------------------------------------------------ */
  function closeMenu() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('no-scroll');
  }

  function onScroll() {
    const y = window.scrollY;

    if (nav) {
      nav.classList.toggle('is-scrolled', y > 16);
    }

    if (toTop) {
      toTop.classList.toggle('is-visible', y > 640);
    }

    if (progress) {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = height > 0 ? Math.min(y / height, 1) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    }
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('no-scroll', open);
    });
  }

  if (navLinks) {
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  if (typeof MOBILE_QUERY.addEventListener === 'function') {
    MOBILE_QUERY.addEventListener('change', (event) => {
      if (!event.matches) closeMenu();
    });
  }

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  }

  /* Active nav link */
  const sectionLinks = new Map();
  if (navLinks) {
    navLinks.querySelectorAll('a[href^="#"]').forEach((link) => {
      sectionLinks.set(link.getAttribute('href').slice(1), link);
    });
  }

  const sections = Array.from(document.querySelectorAll('main section[id]'));

  if ('IntersectionObserver' in window && sections.length && sectionLinks.size) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          sectionLinks.forEach((link, id) => {
            link.classList.toggle('is-active', id === entry.target.id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => spy.observe(section));
  }

  /* ------------------------------------------------------------------
     Scroll reveals
  ------------------------------------------------------------------ */
  const revealEls = Array.from(document.querySelectorAll('.reveal'));

  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------
     Animated counters
  ------------------------------------------------------------------ */
  const counters = Array.from(document.querySelectorAll('[data-count]'));

  function animateCount(el) {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;

    const pad = Number(el.dataset.pad || 0);
    const render = (value) => {
      el.textContent = String(value).padStart(pad, '0');
    };

    if (reduceMotion.matches) {
      render(target);
      return;
    }

    const duration = 1200;
    let startedAt = null;

    const tick = (now) => {
      if (startedAt === null) startedAt = now;
      const progressValue = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      render(Math.round(target * eased));
      if (progressValue < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCount);
  }

  /* ------------------------------------------------------------------
     Profile-card skill meters
  ------------------------------------------------------------------ */
  const meters = Array.from(document.querySelectorAll('.meter'));

  if ('IntersectionObserver' in window) {
    const meterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-filled');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    meters.forEach((meter) => meterObserver.observe(meter));
  } else {
    meters.forEach((meter) => meter.classList.add('is-filled'));
  }

  /* ------------------------------------------------------------------
     Subtle 3D tilt on the profile card (pointer devices only)
  ------------------------------------------------------------------ */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (profileCard && heroVisual && finePointer.matches && !reduceMotion.matches) {
    let frame = null;

    heroVisual.addEventListener('mousemove', (event) => {
      const rect = profileCard.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        profileCard.style.transform = `rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
      });
    });

    heroVisual.addEventListener('mouseleave', () => {
      if (frame) cancelAnimationFrame(frame);
      profileCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

  /* ------------------------------------------------------------------
     Interactive terminal (skills section)
     A small command interpreter — a working example of the JS behind
     the site, not a screenshot of source code.
  ------------------------------------------------------------------ */
  const terminal = document.getElementById('terminal');
  const terminalBody = document.getElementById('terminalBody');
  const terminalOutput = document.getElementById('terminalOutput');
  const terminalForm = document.getElementById('terminalForm');
  const terminalInput = document.getElementById('terminalInput');

  if (terminal && terminalBody && terminalOutput && terminalForm && terminalInput) {
    const history = [];
    let historyIndex = 0;

    const scrollOutput = () => {
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const print = (text, className) => {
      const line = document.createElement('p');
      line.className = 'terminal__line' + (className ? ` ${className}` : '');
      line.textContent = text;
      terminalOutput.appendChild(line);
      scrollOutput();
      return line;
    };

    const printCommand = (command) => {
      const line = document.createElement('p');
      line.className = 'terminal__line';
      const prompt = document.createElement('span');
      prompt.className = 'terminal__prompt-label';
      const user = document.createElement('span');
      user.className = 'terminal__user';
      user.textContent = 'rajpal@portfolio';
      const path = document.createElement('span');
      path.className = 'terminal__path';
      path.textContent = ':~$';
      prompt.append(user, path);
      line.append(prompt, document.createTextNode(` ${command}`));
      terminalOutput.appendChild(line);
    };

    const printLink = (label, href, suffix) => {
      const line = document.createElement('p');
      line.className = 'terminal__line terminal__line--out';
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;

      if (href.startsWith('http')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      if (href.endsWith('.pdf')) {
        link.setAttribute('download', '');
      }

      line.append(link);
      if (suffix) line.append(document.createTextNode(suffix));
      terminalOutput.appendChild(line);
      scrollOutput();
    };

    const commands = {
      help() {
        print('Available commands:', 'terminal__line--accent');
        print('  whoami      who I am');
        print('  about       short bio');
        print('  stack       languages, frameworks, tools');
        print('  projects    featured work + links');
        print('  experience  internships');
        print('  contact     email, phone, socials');
        print('  resume      download the CV');
        print('  theme       toggle light / dark');
        print('  clear       clear the terminal');
      },
      whoami() {
        print('Rajpal Nishad — Full Stack Developer · AI & LLM', 'terminal__line--accent');
        print('New Delhi, India · B.Tech CSE 2026 · open to work', 'terminal__line--muted');
      },
      about() {
        print('Full-stack developer who owns features from database and API design', 'terminal__line--out');
        print('through UI, testing, and deployment. Currently building BGMI Cup,', 'terminal__line--out');
        print('an esports tournament platform, and AI tools for interview prep.', 'terminal__line--out');
      },
      stack() {
        print('languages   Python · JavaScript · TypeScript · C · C++ · Java · SQL', 'terminal__line--out');
        print('frontend    React · Next.js · HTML · CSS · Tailwind CSS', 'terminal__line--out');
        print('backend     Node.js · Express · REST APIs · Flask', 'terminal__line--out');
        print('data        SQLite · MongoDB · Firebase', 'terminal__line--out');
        print('ai / llm    Gemini · OpenAI · LangChain · ChromaDB · RAG · Ollama', 'terminal__line--out');
      },
      projects() {
        print('Featured projects:', 'terminal__line--accent');
        printLink('BGMI Cup — Tournament Platform', 'https://bgmi-cup-platform-production.up.railway.app/', '  [live]');
        printLink('AI MockPrep — Interview Coach', 'https://interview-ai-agent-zeta.vercel.app', '  [live]');
        printLink('LLM Engineering — RAG experiments', 'https://github.com/FoXDev-404/llm_engineering', '  [github]');
        print('More at github.com/FoXDev-404', 'terminal__line--muted');
      },
      experience() {
        print('2025  Full Stack Development Intern — IBM SkillBuild (remote)', 'terminal__line--out');
        print('2025  Intern, Passenger Reservation System — CRIS, New Delhi', 'terminal__line--out');
      },
      contact() {
        printLink('rajpal010304@gmail.com', 'mailto:rajpal010304@gmail.com');
        printLink('linkedin.com/in/rajpalnishad', 'https://linkedin.com/in/rajpalnishad');
        printLink('github.com/FoXDev-404', 'https://github.com/FoXDev-404');
        print('+91 96673 26927', 'terminal__line--out');
      },
      resume() {
        printLink('Rajpal_Nishad_Resume.pdf', 'Rajpal_Nishad_Resume.pdf', '  [download]');
      },
      theme() {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
        print(`theme → ${next}`, 'terminal__line--accent');
      },
      clear() {
        terminalOutput.replaceChildren();
      },
      date() {
        print(new Date().toString(), 'terminal__line--out');
      },
      pwd() {
        print('/home/rajpal/portfolio', 'terminal__line--out');
      },
      ls() {
        print('about  skills  projects  experience  contact  resume.pdf', 'terminal__line--out');
      },
      sudo() {
        print('Nice try — permission denied.', 'terminal__line--error');
      },
      coffee() {
        print('☕ brewing... done. Now shipping.', 'terminal__line--accent');
      }
    };

    const run = (raw) => {
      const command = raw.trim();
      if (!command) return;

      printCommand(command);
      history.push(command);
      historyIndex = history.length;

      const [name] = command.toLowerCase().split(/\s+/);
      const handler = commands[name];

      if (handler) {
        handler();
      } else {
        print(`command not found: ${name}`, 'terminal__line--error');
        print('Type "help" to see what this terminal can do.', 'terminal__line--hint');
      }

      terminalInput.value = '';
      scrollOutput();
    };

    terminalForm.addEventListener('submit', (event) => {
      event.preventDefault();
      run(terminalInput.value);
      terminalInput.focus();
    });

    terminalInput.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp') {
        if (!history.length) return;
        event.preventDefault();
        historyIndex = Math.max(0, historyIndex - 1);
        terminalInput.value = history[historyIndex] || '';
        terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
      } else if (event.key === 'ArrowDown') {
        if (!history.length) return;
        event.preventDefault();
        historyIndex = Math.min(history.length, historyIndex + 1);
        terminalInput.value = history[historyIndex] || '';
        terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
      }
    });

    terminal.querySelectorAll('[data-cmd]').forEach((button) => {
      button.addEventListener('click', () => {
        run(button.dataset.cmd || '');
        if (finePointer.matches) terminalInput.focus();
      });
    });

    if (finePointer.matches) {
      terminalBody.addEventListener('click', (event) => {
        if (event.target.closest('a, button, input')) return;
        const selection = window.getSelection();
        if (selection && selection.toString()) return;
        terminalInput.focus();
      });
    }
  }

  /* ------------------------------------------------------------------
     Contact form
     Posts to /api/contact when the Node server is running. On a static
     host (or file://), it falls back to opening the visitor's mail app.
  ------------------------------------------------------------------ */
  if (form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonMarkup = submitButton ? submitButton.innerHTML : '';

    const setStatus = (message, state) => {
      if (!formStatus) return;
      formStatus.textContent = message;
      formStatus.classList.remove('is-ok', 'is-err');
      if (state) formStatus.classList.add(state);
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = Object.fromEntries(new FormData(form).entries());

      // Honeypot — silently accept bot submissions.
      if (data.company) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus('Please add your name, a valid email, and a message.', 'is-err');
        return;
      }

      setStatus('');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
      }

      try {
        if (window.location.protocol === 'file:') {
          throw new Error('Static preview');
        }

        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: String(data.name || '').trim(),
            email: String(data.email || '').trim(),
            message: String(data.message || '').trim(),
            company: ''
          })
        });

        if (!response.ok) throw new Error('Request failed');

        form.reset();
        setStatus('Message received — I’ll get back to you within 24 hours.', 'is-ok');
      } catch (error) {
        const subject = encodeURIComponent(`Portfolio enquiry from ${data.name || 'a visitor'}`);
        const body = encodeURIComponent(`${data.message || ''}\n\n— ${data.name || ''} (${data.email || ''})`);
        window.location.href = `mailto:rajpal010304@gmail.com?subject=${subject}&body=${body}`;
        setStatus('Opening your email app so the message reaches me directly.', 'is-ok');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonMarkup;
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     Footer year
  ------------------------------------------------------------------ */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------
     Live page weight for the "Built from scratch" panel
  ------------------------------------------------------------------ */
  const pageWeight = document.getElementById('pageWeight');

  if (pageWeight && 'performance' in window) {
    const updatePageWeight = () => {
      const navEntry = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      const sameOrigin = (url) => {
        try {
          return new URL(url, window.location.href).origin === window.location.origin;
        } catch (error) {
          return false;
        }
      };

      let bytes = navEntry
        ? (navEntry.decodedBodySize || navEntry.encodedBodySize || navEntry.transferSize || 0)
        : 0;

      resources.forEach((entry) => {
        if (!sameOrigin(entry.name)) return;
        bytes += entry.decodedBodySize || entry.encodedBodySize || entry.transferSize || 0;
      });

      if (bytes > 0) {
        pageWeight.textContent = `~${Math.max(1, Math.round(bytes / 1024))} KB`;
      }
    };

    if (document.readyState === 'complete') updatePageWeight();
    else window.addEventListener('load', updatePageWeight);
  }

  /* Console note for anyone who opens devtools. */
  console.log(
    '%c RAJPAL NISHAD %c Full Stack Developer · AI & LLM\n%cYou found the console — source: https://github.com/FoXDev-404/FoXDev-404.github.io',
    'background:#c8ff3d;color:#0a0b00;font:700 13px monospace;padding:4px 8px',
    'color:#ff2e43;font:600 12px monospace',
    'color:#8f9189;font:11px monospace'
  );
})();
