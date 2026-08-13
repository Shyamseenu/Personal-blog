/* =========================================================================
   SHYAM SARAN — PERSONAL SITE
   Vanilla JS only. Organised by feature; each block is self-contained so
   sections can be lifted out independently if reused elsewhere.
   ========================================================================= */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     1. THEME TOGGLE (persisted in localStorage, respects OS preference
        the first time a visitor arrives with no saved choice)
  ---------------------------------------------------------------------- */
  const THEME_KEY = "ss-theme";
  const themeToggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeToggle.setAttribute("aria-pressed", theme === "dark");
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      applyTheme(prefersDark ? "dark" : "light");
    }
  }

  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  initTheme();

  /* ----------------------------------------------------------------------
     2. MOBILE NAV (hamburger)
  ---------------------------------------------------------------------- */
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  function closeMobileNav() {
    mobileNav.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open menu");
  }

  hamburger.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("is-open");
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  mobileNav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  /* ----------------------------------------------------------------------
     3. TYPING EFFECT — cycles through job titles inside the terminal chip
  ---------------------------------------------------------------------- */
  const titles = [
    "Data Science Graduate",
    "AI & ML Enthusiast",
    "Data Analyst",
    "Aspiring Data Scientist",
    "Python Developer",
  ];
  const typingTarget = document.getElementById("typingTarget");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeLoop() {
    const current = titles[titleIndex];

    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }

    typingTarget.textContent = current.slice(0, charIndex);

    let delay = isDeleting ? 45 : 90;

    if (!isDeleting && charIndex === current.length) {
      delay = 1400; // pause at full word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
      delay = 300;
    }

    setTimeout(typeLoop, delay);
  }

  if (prefersReducedMotion) {
    typingTarget.textContent = titles[0];
  } else {
    typeLoop();
  }

  /* ----------------------------------------------------------------------
     4. HERO CANVAS — a quiet scatter-plot of "data points" that drift,
        standing in for the dataset every project here starts from.
  ---------------------------------------------------------------------- */
  const canvas = document.getElementById("heroCanvas");
  const ctx = canvas.getContext("2d");
  let points = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    const hero = document.getElementById("hero");
    const { width, height } = hero.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedPoints(width, height);
  }

  function seedPoints(width, height) {
    const count = Math.round((width * height) / 26000);
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.6,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      highlight: Math.random() < 0.08,
    }));
  }

  function getCSSVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function drawPoints() {
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.clearRect(0, 0, width, height);

    const dim = getCSSVar("--text-muted");
    const accent = getCSSVar("--accent-2");

    points.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.highlight ? accent : dim;
      ctx.globalAlpha = p.highlight ? 0.55 : 0.28;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (!prefersReducedMotion) requestAnimationFrame(drawPoints);
  }

  if (canvas) {
    resizeCanvas();
    drawPoints();
    window.addEventListener("resize", debounce(resizeCanvas, 200));
  }

  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  /* ----------------------------------------------------------------------
     5. SCROLL REVEAL — fade-in elements as they enter the viewport
  ---------------------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(".fade-in");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  revealTargets.forEach((el) => revealObserver.observe(el));

  /* ----------------------------------------------------------------------
     6. HEADER SHADOW ON SCROLL (subtle, purely visual)
  ---------------------------------------------------------------------- */
  const header = document.getElementById("siteHeader");
  window.addEventListener(
    "scroll",
    () => {
      header.style.boxShadow = window.scrollY > 8 ? "var(--shadow-sm)" : "none";
    },
    { passive: true },
  );

  /* ----------------------------------------------------------------------
     7. PROJECTS — rendered from data so cards stay consistent
  ---------------------------------------------------------------------- */
  const projects = [
    {
      title: "OllamaChat",
      description:
        "A fully local AI chatbot built with FastAPI, LangChain and Ollama. Runs entirely on your machine — no API keys, no data sent to the cloud.",
      tags: ["FastAPI", "LangChain", "Ollama", "RAG"],
      repo: "https://github.com/Shyamseenu/ollamachat",
      demo: null,
      icon: "chat",
    },
    {
      title: "InsightAura",
      description:
        "An AI-powered business insight platform that turns raw operational data into insight a stakeholder can act on.",
      tags: ["Python", "AI", "Analytics"],
      repo: "https://github.com/Shyamseenu/InsightAura",
      demo: null,
      icon: "chart",
    },
    {
      title: "Platepal",
      description:
        "A patented application built in the third year of my Bachelor's — from concept validation through to filing.",
      tags: ["Python", "Patent", "Product"],
      repo: "https://github.com/Shyamseenu/Platepal",
      demo: null,
      icon: "award",
    },
    {
      title: "UPI Transaction Dashboard",
      description:
        "A Power BI dashboard analysing UPI transaction data from 2024, surfacing trends across volume, value and payment behaviour.",
      tags: ["Power BI", "Data Viz", "Finance"],
      repo: "https://github.com/Shyamseenu/upi-transaction-dashboard",
      demo: null,
      icon: "dashboard",
    },
    {
      title: "Forest Fire Weather Index Prediction",
      description:
        "Predicts the Fire Weather Index from Algerian meteorological data using four regression models — Linear, Ridge, Lasso and ElasticNet — with cross-validated hyperparameter tuning.",
      tags: ["Python", "Regression", "scikit-learn"],
      repo: "https://github.com/Shyamseenu/ML_ForestFirePrediction_Project",
      demo: null,
      icon: "flame",
    },
  ];

  const icons = {
    award:
      '<path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/><path d="M8.2 14.2L6 22l6-3 6 3-2.2-7.8"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-6 3 3 5-7"/>',
    dashboard:
      '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/>',
    pipeline:
      '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="19" r="2"/><path d="M7 11l3-4M14 5.5h2M17 10l0 4M14 18.5h-2M10 15l-3 4"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
    flame:
      '<path d="M12 2c1.2 3.6-2.4 5-2.4 8.4a2.4 2.4 0 0 0 4.8 0c0-.9-.6-1.7-.6-2.6 1.8 1 2.8 2.8 2.8 4.6a4.6 4.6 0 0 1-9.2 0C7.4 7.6 10.8 6 12 2z"/>',
  };

  const projectGrid = document.getElementById("projectGrid");
  projects.forEach((proj, i) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.style.animationDelay = `${i * 70}ms`;
    card.innerHTML = `
      <div class="project-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${icons[proj.icon]}</svg></div>
      <h3 class="project-title">${proj.title}</h3>
      <p class="project-desc">${proj.description}</p>
      <div class="project-tags">${proj.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
      <div class="project-links">
        <a href="${proj.repo}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-1-2.6c3 0 6-2 6-5.5.1-1.3-.4-2.6-1.2-3.6a4.6 4.6 0 0 0-.1-3.5s-1-.3-3.2 1.3a11.4 11.4 0 0 0-6 0C6.2 1.5 5.2 1.8 5.2 1.8a4.6 4.6 0 0 0-.1 3.5A5.4 5.4 0 0 0 4 8.9c0 3.5 3 5.5 6 5.5a3.4 3.4 0 0 0-1 2.6V21"/></svg>
          Source code
        </a>
        ${proj.demo ? `<a href="${proj.demo}" target="_blank" rel="noopener">Live demo</a>` : ""}
      </div>
    `;
    projectGrid.appendChild(card);
  });

  /* ----------------------------------------------------------------------
     8. LIVE PROJECTS — deployed builds people can actually open and use.
        NOTE: swap the `url` values below for your real live links (e.g.
        Streamlit Cloud, Vercel, Render, Hugging Face Spaces).
  ---------------------------------------------------------------------- */
  const liveProjects = [
    {
      title: "OllamaChat",
      description:
        "A RAG-powered AI chatbot using FastAPI, LangChain, Google Gemini, and ChromaDB with secure user authentication, YAML-configurable personas, document upload, semantic search, conversation memory, and real-time streaming responses via Server-Sent Events (SSE).",
      tags: ["FastAPI", "LangChain", "Google Gemini"],
      url: "https://ollamachat-9wny.onrender.com",
      repo: "https://github.com/Shyamseenu/ollamachat",
      icon: "chat",
    },
  ];

  const liveIcons = {
    ...icons,
    globe:
      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  };

  const liveProjectGrid = document.getElementById("liveProjectGrid");
  if (liveProjectGrid) {
    liveProjects.forEach((proj, i) => {
      const card = document.createElement("article");
      card.className = "project-card";
      card.style.animationDelay = `${i * 70}ms`;
      card.innerHTML = `
        <div class="project-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${liveIcons[proj.icon] || liveIcons.globe}</svg></div>
        <span class="live-badge">Live</span>
        <h3 class="project-title">${proj.title}</h3>
        <p class="project-desc">${proj.description}</p>
        <div class="project-tags">${proj.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
        <div class="project-links">
          <a href="${proj.url}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${liveIcons.globe}</svg>
            Visit live
          </a>
          <a href="${proj.repo}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-1-2.6c3 0 6-2 6-5.5.1-1.3-.4-2.6-1.2-3.6a4.6 4.6 0 0 0-.1-3.5s-1-.3-3.2 1.3a11.4 11.4 0 0 0-6 0C6.2 1.5 5.2 1.8 5.2 1.8a4.6 4.6 0 0 0-.1 3.5A5.4 5.4 0 0 0 4 8.9c0 3.5 3 5.5 6 5.5a3.4 3.4 0 0 0-1 2.6V21"/></svg>
            Source
          </a>
        </div>
      `;
      liveProjectGrid.appendChild(card);
    });
  }

  /* ----------------------------------------------------------------------
     9. CONTACT FORM — client-side validation only (wire up a real
         endpoint, e.g. Formspree or your own API, at the fetch() below)
  ---------------------------------------------------------------------- */
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  const validators = {
    name: (v) => v.trim().length >= 2 || "Please enter your name.",
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address.",
    subject: (v) => v.trim().length >= 3 || "Subject looks a little short.",
    message: (v) =>
      v.trim().length >= 15 || "Message should be at least 15 characters.",
  };

  function setFieldError(field, message) {
    const row = field.closest(".form-row");
    const errorEl = row.querySelector(".form-error");
    if (message) {
      row.classList.add("has-error");
      errorEl.textContent = message;
    } else {
      row.classList.remove("has-error");
      errorEl.textContent = "";
    }
  }

  function validateField(field) {
    const rule = validators[field.name];
    if (!rule) return true;
    const result = rule(field.value);
    setFieldError(field, result === true ? "" : result);
    return result === true;
  }

  contactForm.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".form-row").classList.contains("has-error"))
        validateField(field);
    });
  });

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = [...contactForm.querySelectorAll("input, textarea")];
    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid) {
      formStatus.textContent = "Please fix the highlighted fields.";
      formStatus.className = "form-status is-error";
      return;
    }

    // Placeholder "send" — replace with a real request, e.g.:
    // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(contactForm) })
    formStatus.textContent = "Sending…";
    formStatus.className = "form-status";

    setTimeout(() => {
      formStatus.textContent = `Thanks — your message is on its way to the.shyamsaran@gmail.com.`;
      formStatus.className = "form-status is-success";
      contactForm.reset();
    }, 700);
  });

  /* ----------------------------------------------------------------------
     10. BACK TO TOP — floating button, bottom-right; appears after the
         visitor scrolls past the hero, scrolls smoothly back to #home
  ---------------------------------------------------------------------- */
  const backToTop = document.getElementById("backToTop");

  window.addEventListener(
    "scroll",
    () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 480);
    },
    { passive: true },
  );

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ----------------------------------------------------------------------
     11. FOOTER YEAR
  ---------------------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
