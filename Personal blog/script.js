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
     7. BLOG DATA
        NOTE: sample posts — swap in your real writing here. `content` is
        an array of simple blocks ({type:'p'|'h2'|'ul', ...}) rendered into
        the in-page article view. Reading time is computed automatically
        from word count, so you never need to update it by hand.
  ---------------------------------------------------------------------- */
  const posts = [
    {
      id: "local-llm-ollama",
      title: "Running a Local LLM Chatbot with Ollama, FastAPI and LangChain",
      category: "AI Tools",
      date: "2026-06-20",
      excerpt:
        "Notes from building Ollama Chat — a fully local AI chatbot with no API keys and nothing sent to the cloud. What made local inference worth the setup.",
      content: [
        {
          type: "p",
          text: "Every hosted LLM API works fine until you want to run something offline, keep data private, or just stop watching a token meter. That is what pushed me to build a chatbot on top of Ollama instead of a cloud API.",
        },
        { type: "h2", text: "The stack" },
        {
          type: "ul",
          items: [
            "Ollama to pull and serve open models locally, no API key required",
            "FastAPI as a thin backend routing chat requests to the local model",
            "LangChain to manage prompt templates and conversation memory",
            "A lightweight HTML front end so the whole thing runs from one machine",
          ],
        },
        {
          type: "p",
          text: 'The biggest surprise was how usable a mid-sized open model is for everyday chat once you stop comparing it to a frontier hosted model and start comparing it to "nothing, because I do not want my data leaving this machine."',
        },
        { type: "h2", text: "What I would change next" },
        {
          type: "p",
          text: "Streaming responses token-by-token instead of waiting for the full reply, and adding a simple retrieval step so the bot can answer questions about local documents, not just general chat.",
        },
      ],
    },
    {
      id: "clean-data-for-ai",
      title: "Why Clean Data Still Decides Whether Your AI Model Works",
      category: "Applied AI",
      date: "2026-05-14",
      excerpt:
        "Generative AI has not made data cleaning optional — if anything, a language model will confidently paper over messy inputs in ways a simple model never could.",
      content: [
        {
          type: "p",
          text: "It is tempting to assume a large model is smart enough to handle messy input. In practice, garbage in still means garbage out — it is just harder to notice, because the output reads fluently either way.",
        },
        { type: "h2", text: "The checklist I still run" },
        {
          type: "ul",
          items: [
            "Check for duplicate rows and near-duplicate records before they are embedded or fine-tuned on",
            "Profile missing values by column, not just by overall count",
            "Look for impossible values — negative ages, future dates",
            "Confirm categorical columns actually mean what the schema says they mean",
            "Sanity-check units before joining tables from different sources",
          ],
        },
        {
          type: "p",
          text: "On a recent classification task, fixing one mislabelled category improved validation accuracy more than switching models did. The data is still the ceiling.",
        },
      ],
    },
    {
      id: "generative-ai-entry-level",
      title: "What Generative AI Actually Means for an Entry-Level Analyst",
      category: "AI Careers",
      date: "2026-04-21",
      excerpt:
        "Less about prompting a chatbot well, more about knowing when a language model is the wrong tool for a structured-data problem.",
      content: [
        {
          type: "p",
          text: "A lot of the noise around generative AI does not apply to day-to-day analyst work — most business questions are still answered with SQL, a join, and a well-chosen chart.",
        },
        { type: "h2", text: "Where it genuinely helps" },
        {
          type: "ul",
          items: [
            "Summarising long, unstructured feedback into themes",
            "Drafting a first pass at documentation for a pipeline",
            "Explaining an unfamiliar codebase quickly",
            "Generating synthetic edge cases to stress-test a model",
          ],
        },
        {
          type: "p",
          text: "Knowing when to reach for a language model — and when a simple aggregation query is the better answer — is turning out to be its own skill.",
        },
      ],
    },
    {
      id: "rag-vs-fine-tuning",
      title: "RAG vs Fine-Tuning: The Question I Get Asked Most",
      category: "LLMs & Agents",
      date: "2026-03-30",
      excerpt:
        "A practical way to decide between retrieval-augmented generation and fine-tuning, based on what actually changes in your data over time.",
      content: [
        {
          type: "p",
          text: "The honest answer is: start with retrieval-augmented generation (RAG), and only reach for fine-tuning once you have a very specific reason to.",
        },
        { type: "h2", text: "A simple way to decide" },
        {
          type: "ul",
          items: [
            "If the underlying facts change often — use RAG, so the model always reads current information",
            "If you need the model to reliably follow a narrow output format or tone — fine-tuning helps",
            "If you are not sure yet — RAG is cheaper to iterate on and easier to debug",
          ],
        },
        {
          type: "p",
          text: 'Most of the "fine-tuning" problems I have seen were actually retrieval problems wearing a disguise — the model did not need new weights, it needed better context.',
        },
      ],
    },
    {
      id: "internship-lessons",
      title:
        "Six Months Building AI Models as an Intern: What Actually Surprised Me",
      category: "AI Careers",
      date: "2026-02-10",
      excerpt:
        'Not the modelling — the amount of time spent on communication, and how often "done" meant something different than I expected.',
      content: [
        {
          type: "p",
          text: "Coming in, I assumed most of my time would be spent building models. In practice, a large share went into understanding exactly what a stakeholder meant by their question in the first place.",
        },
        { type: "h2", text: "Three things I would tell my past self" },
        {
          type: "ul",
          items: [
            "Ask what decision this analysis is meant to support, before writing code",
            "A model that is trusted at 80% accuracy beats a 92% model nobody uses",
            "Write down assumptions — someone will ask about them in three weeks",
          ],
        },
        {
          type: "p",
          text: "None of this shows up in a course syllabus, but it shaped how I approach every AI project since.",
        },
      ],
    },
    {
      id: "ai-agents-notes",
      title: "What I Learned Giving an LLM Access to Tools",
      category: "LLMs & Agents",
      date: "2026-01-18",
      excerpt:
        "The difference between a chatbot and an agent is smaller than it sounds, and the failure modes are stranger than you expect.",
      content: [
        {
          type: "p",
          text: "Wiring an LLM up to call functions — search a database, hit an API, run a calculation — sounds like a small step from a chat interface. In practice, it changes how carefully you need to think about every tool you expose.",
        },
        { type: "h2", text: "Lessons from a first agent build" },
        {
          type: "ul",
          items: [
            'Narrow, well-named tools beat one giant "do anything" function every time',
            "Always validate a tool's output before feeding it back into the model",
            "Log every tool call — agent failures are much easier to debug with a trace",
            "Assume the model will eventually call a tool with the wrong arguments, and design for that",
          ],
        },
        {
          type: "p",
          text: 'The local chatbot I built with Ollama started as a simple Q&A tool; adding even one retrieval "tool" to it changed how I thought about the whole architecture.',
        },
      ],
    },
  ];

  /* ----------------------------------------------------------------------
     8. READING TIME CALCULATOR — average adult reading speed ~200 wpm
  ---------------------------------------------------------------------- */
  function calcReadingTime(contentBlocks) {
    const words = contentBlocks
      .map((block) =>
        block.type === "ul" ? block.items.join(" ") : block.text,
      )
      .join(" ")
      .trim()
      .split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
  }

  function formatDate(iso) {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  /* ----------------------------------------------------------------------
     9. BLOG HUB — render, filter, search
  ---------------------------------------------------------------------- */
  const blogGrid = document.getElementById("blogGrid");
  const blogEmpty = document.getElementById("blogEmpty");
  const filterGroup = document.getElementById("filterGroup");
  const searchInput = document.getElementById("blogSearch");

  let activeFilter = "all";
  let searchTerm = "";

  function renderBlogGrid() {
    const filtered = posts.filter((post) => {
      const matchesFilter =
        activeFilter === "all" || post.category === activeFilter;
      const haystack = (post.title + " " + post.excerpt).toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    blogGrid.innerHTML = "";
    blogEmpty.hidden = filtered.length !== 0;

    filtered.forEach((post, i) => {
      const card = document.createElement("article");
      card.className = "blog-card";
      card.style.animationDelay = `${i * 60}ms`;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Read: ${post.title}`);

      card.innerHTML = `
        <div class="card-top">
          <span class="card-category">${post.category}</span>
          <span class="card-readtime">${calcReadingTime(post.content)}</span>
        </div>
        <h3 class="card-title">${post.title}</h3>
        <p class="card-excerpt">${post.excerpt}</p>
        <div class="card-footer">
          <span class="card-date">${formatDate(post.date)}</span>
          <span class="card-link">Read post →</span>
        </div>
      `;

      card.addEventListener("click", () => openArticle(post));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openArticle(post);
        }
      });

      blogGrid.appendChild(card);
    });
  }

  filterGroup.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-pill");
    if (!btn) return;
    filterGroup
      .querySelectorAll(".filter-pill")
      .forEach((p) => p.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeFilter = btn.dataset.filter;
    renderBlogGrid();
  });

  searchInput.addEventListener(
    "input",
    debounce((e) => {
      searchTerm = e.target.value;
      renderBlogGrid();
    }, 150),
  );

  renderBlogGrid();

  /* ----------------------------------------------------------------------
     10. ARTICLE VIEW — opens in-page, drives the reading progress bar
  ---------------------------------------------------------------------- */
  const articleView = document.getElementById("articleView");
  const articleBody = document.getElementById("articleBody");
  const articleClose = document.getElementById("articleClose");
  const progressBar = document.getElementById("progressBar");
  const blogSection = document.getElementById("blog");

  function renderBlockHTML(block) {
    if (block.type === "p") return `<p>${block.text}</p>`;
    if (block.type === "h2") return `<h2>${block.text}</h2>`;
    if (block.type === "ul")
      return `<ul>${block.items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
    return "";
  }

  function openArticle(post) {
    articleBody.innerHTML = `
      <p class="article-eyebrow">${post.category}</p>
      <h1>${post.title}</h1>
      <div class="article-meta">
        <span>${formatDate(post.date)}</span>
        <span>${calcReadingTime(post.content)}</span>
        <span>By Shyam Saran</span>
      </div>
      <div class="article-content">
        ${post.content.map(renderBlockHTML).join("")}
      </div>
    `;

    blogSection.style.display = "none";
    articleView.classList.add("is-open");
    articleView.setAttribute("aria-hidden", "false");
    window.scrollTo({
      top: 0,
      behavior: "instant" in window ? "instant" : "auto",
    });
    updateProgressBar();
  }

  function closeArticle() {
    articleView.classList.remove("is-open");
    articleView.setAttribute("aria-hidden", "true");
    blogSection.style.display = "";
    progressBar.style.width = "0%";
    document.getElementById("blog").scrollIntoView({ behavior: "smooth" });
  }

  articleClose.addEventListener("click", closeArticle);

  function updateProgressBar() {
    if (!articleView.classList.contains("is-open")) return;
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  window.addEventListener("scroll", updateProgressBar, { passive: true });

  /* ----------------------------------------------------------------------
     11. PROJECTS — rendered from data so cards stay consistent
  ---------------------------------------------------------------------- */
  const projects = [
    {
      title: "Ollama Chat",
      description:
        "A fully local AI chatbot built with FastAPI, LangChain and Ollama. Runs entirely on your machine — no API keys, no data sent to the cloud.",
      tags: ["FastAPI", "LangChain", "Ollama"],
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
     12. CONTACT FORM — client-side validation only (wire up a real
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
     13. FOOTER YEAR
  ---------------------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
