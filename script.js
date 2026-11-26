const projects = [
  {
    title: "Digital twin on AWS",
    category: "applied",
    description: "I deployed a personal chatbot on Lambda and API Gateway, stored its frontend and conversation memory in S3, and defined the setup in Terraform.",
    tags: ["AWS", "Terraform", "LLMs"],
    url: "https://github.com/upeshjeengar/twin",
  },
  {
    title: "fast-rlm",
    category: "open",
    description: "My merged fix lets the CLI show a useful message when a model provider leaves the cost field empty.",
    tags: ["TypeScript", "CLI"],
    url: "https://github.com/avbiswas/fast-rlm/pull/3",
    linkLabel: "Merged pull request",
  },
  {
    title: "Flight fare prediction",
    category: "ml",
    description: "I trained a random forest on flight data, tracked experiments in MLflow, and served predictions through a Flask API.",
    tags: ["scikit-learn", "MLflow", "Flask"],
    url: "https://github.com/upeshjeengar/flight-price-prediction-flask",
  },
  {
    title: "Emotion detection and image enhancement",
    category: "ml",
    description: "A computer vision project that uses a ResNet-50 classifier and explores how image enhancement affects predictions.",
    tags: ["ResNet-50", "OpenCV", "MIRNet"],
    url: "https://github.com/upeshjeengar/Emotion-Detection-Deployement",
  },
  {
    title: "MLOps notebooks",
    category: "ml",
    description: "My working notes on experiment tracking, data versioning, and building repeatable training pipelines.",
    tags: ["MLflow", "DVC", "Python"],
    url: "https://github.com/upeshjeengar/MLOps",
  },
  {
    title: "ML models from scratch",
    category: "ml",
    description: "Implementations I wrote while studying the algorithms behind common machine learning models.",
    tags: ["Python", "Machine learning"],
    url: "https://github.com/upeshjeengar/ML-Models-from-scratch",
  },
  {
    title: "Movie recommender",
    category: "ml",
    description: "A small project exploring how to turn movie data into a list of suggestions.",
    tags: ["Recommender systems", "Python"],
    url: "https://github.com/upeshjeengar/Movie-Recommender",
  },
  {
    title: "Greentech Energy",
    category: "applied",
    description: "An early web project for a local solar energy business in Rajsamand.",
    tags: ["Web", "SCSS"],
    url: "https://github.com/upeshjeengar/GreentechEnergy",
  },
];

const traceScenarios = {
  access: {
    request: "Can I get access to the analytics workspace?",
    steps: [
      ["Classify request", "Software access request detected."],
      ["Find policy", "The sample access policy covers this workspace."],
      ["Check approval", "The workspace owner needs to approve the request."],
      ["Record decision", "Request drafted and marked as pending review."],
    ],
  },
  vendor: {
    request: "We need to onboard a new design vendor.",
    steps: [
      ["Classify request", "Vendor onboarding request detected."],
      ["Find policy", "Loaded the sample vendor onboarding checklist."],
      ["Check approval", "Route the proposal to procurement for review."],
      ["Record decision", "Onboarding draft saved for a human reviewer."],
    ],
  },
  policy: {
    request: "Who can approve an analytics workspace request?",
    steps: [
      ["Classify request", "This is a policy question."],
      ["Find policy", "Found the relevant section of the sample access policy."],
      ["Draft answer", "The workspace owner reviews and approves access."],
      ["Cite policy", "Answer returned with its source. No request was created."],
    ],
  },
};

function initTrace() {
  const frame = document.querySelector(".trace-frame");
  const scenarioSelect = document.querySelector("#traceScenario");
  const playButton = document.querySelector("#tracePlay");
  const playLabel = document.querySelector("#tracePlayLabel");
  const request = document.querySelector("#traceRequest");
  const stage = document.querySelector("#traceDecision");
  const result = document.querySelector("#traceResult");
  const status = document.querySelector("#traceStatus");
  const steps = Array.from(frame.querySelectorAll("[data-step]"));
  let index = 0;
  let timer;

  function render(state) {
    const scenario = traceScenarios[scenarioSelect.value];
    frame.dataset.state = state;
    frame.style.setProperty("--trace-progress", (index + Number(state === "playing" || state === "done")) / steps.length);
    request.textContent = scenario.request;
    [stage.textContent, result.textContent] = scenario.steps[index];
    steps.forEach((button, position) => {
      button.querySelector(".trace-stage").textContent = scenario.steps[position][0];
      button.classList.toggle("is-complete", position < index || state === "done");
      if (position === index) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    const progress = `Step ${index + 1} of ${steps.length}`;
    if (state === "playing") {
      playLabel.textContent = "Pause";
      status.textContent = progress;
    } else if (state === "done") {
      playLabel.textContent = "Replay";
      status.textContent = "Trace complete";
    } else if (state === "paused") {
      playLabel.textContent = index === steps.length - 1 ? "Replay" : "Resume";
      status.textContent = progress + " · Paused";
    } else {
      playLabel.textContent = "Run trace";
      status.textContent = "Ready";
    }
  }

  function advance() {
    timer = window.setTimeout(() => {
      if (index === steps.length - 1) {
        render("done");
        return;
      }
      index += 1;
      render("playing");
      advance();
    }, 950);
  }

  function play() {
    if (index === steps.length - 1) index = 0;
    render("playing");
    advance();
  }

  let autoplayObserver;
  function stopAutoplay() {
    autoplayObserver?.disconnect();
  }

  scenarioSelect.addEventListener("change", () => {
    stopAutoplay();
    window.clearTimeout(timer);
    index = 0;
    render("idle");
  });
  playButton.addEventListener("click", () => {
    stopAutoplay();
    if (frame.dataset.state === "playing") {
      window.clearTimeout(timer);
      render("paused");
    } else {
      play();
    }
  });
  steps.forEach((button, position) => {
    button.disabled = false;
    button.addEventListener("click", () => {
      stopAutoplay();
      window.clearTimeout(timer);
      index = position;
      render("paused");
    });
  });
  scenarioSelect.disabled = false;
  playButton.disabled = false;
  render("idle");

  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    autoplayObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || document.hidden) return;
      stopAutoplay();
      play();
    }, { threshold: 0.33 });
    autoplayObserver.observe(frame);
  }
}

initTrace();

function renderProjects(category) {
  const grid = document.querySelector("#projectGrid");
  const entries = category === "all"
    ? projects
    : projects.filter((project) => project.category === category);
  grid.innerHTML = entries.map((project) => `
    <article class="project-card">
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="tag-list">${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      <div class="project-links">
        <a href="${project.url}" target="_blank" rel="noopener noreferrer" aria-label="${project.linkLabel || "GitHub repository"} for ${project.title}">${project.linkLabel || "GitHub"}</a>
      </div>
    </article>
  `).join("");
}

const projectFilters = document.querySelector(".project-filters");
projectFilters.addEventListener("click", (event) => {
  const filter = event.target.closest("button[data-category]");
  if (!filter) return;
  projectFilters.querySelector("[aria-pressed='true']").setAttribute("aria-pressed", "false");
  filter.setAttribute("aria-pressed", "true");
  renderProjects(filter.dataset.category);
});
renderProjects("all");
projectFilters.hidden = false;

const workTabs = document.querySelector(".work-tabs");
const workButtons = Array.from(workTabs.querySelectorAll("button"));
const workPanels = workButtons.map((button) => document.getElementById(button.getAttribute("aria-controls")));

function selectWork(index) {
  workButtons.forEach((button, position) => {
    const selected = position === index;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
    workPanels[position].hidden = !selected;
  });
}

workTabs.setAttribute("role", "tablist");
workTabs.setAttribute("aria-label", "Featured projects");
workButtons.forEach((button, index) => {
  const panel = workPanels[index];
  button.setAttribute("role", "tab");
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", button.id);
  panel.tabIndex = 0;
  button.addEventListener("click", () => selectWork(index));
  button.addEventListener("keydown", (event) => {
    let next;
    switch (event.key) {
      case "ArrowLeft": next = (index + workButtons.length - 1) % workButtons.length; break;
      case "ArrowRight": next = (index + 1) % workButtons.length; break;
      case "Home": next = 0; break;
      case "End": next = workButtons.length - 1; break;
      default: return;
    }
    event.preventDefault();
    selectWork(next);
    workButtons[next].focus();
  });
});
selectWork(0);
workTabs.hidden = false;

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-in-view");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.15 });
  document.querySelectorAll("[data-animate]").forEach((element) => observer.observe(element));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function renderBlogs(grid, blogs) {
  grid.replaceChildren(...blogs.map((blog) => {
    const article = document.createElement("article");
    article.className = "blog-card";
    const date = document.createElement("time");
    date.dateTime = blog.dateCreated;
    date.textContent = formatDate(blog.dateCreated);
    const body = document.createElement("div");
    const title = document.createElement("h3");
    const link = document.createElement("a");
    link.href = blog.link;
    link.textContent = blog.title;
    if (blog.external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    const summary = document.createElement("p");
    summary.textContent = blog.summary;
    const type = document.createElement("span");
    type.className = "blog-type";
    type.textContent = blog.external ? "External" : "Article";
    title.append(link);
    body.append(title, summary);
    article.append(date, body, type);
    return article;
  }));
}

async function loadBlogs() {
  const grid = document.querySelector("#blogGrid");
  try {
    const response = await fetch("blogs/blogs.json", { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Could not load blogs: ${response.status}`);
    }
    const blogs = await response.json();
    blogs.sort((a, b) => b.dateCreated.localeCompare(a.dateCreated));
    if (!blogs.length) {
      grid.textContent = "No articles yet.";
      return;
    }
    renderBlogs(grid, blogs.slice(0, 4));
    if (blogs.length > 4) {
      renderBlogs(document.querySelector("#extraBlogGrid"), blogs.slice(4));
      document.querySelector("#moreBlogs").hidden = false;
    }
  } catch (error) {
    const link = document.createElement("a");
    link.href = "blogs/ml-system-design-part-1.html";
    link.textContent = "Browse the ML System Design series";
    grid.replaceChildren("The article list could not load. ", link);
  }
}

loadBlogs();
