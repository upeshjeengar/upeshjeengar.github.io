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

const personalScenarios = {
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

const insuranceScenarios = {
  routine: {
    request: "Where can I find my policy schedule?",
    steps: [
      ["Read ticket", "The customer is looking for a policy document."],
      ["Find guidance", "The assistant finds help material about locating documents."],
      ["Draft answer", "The assistant drafts a reply using the help material."],
      ["Resolve ticket", "The reply is sent and this sample ticket is resolved."],
    ],
  },
  investigate: {
    request: "My updated policy details still look wrong.",
    steps: [
      ["Read ticket", "The customer reports a mismatch after a policy update."],
      ["Gather context", "The assistant organizes what the customer expected and what they saw."],
      ["Prepare handoff", "The assistant summarizes the issue and flags what still needs checking."],
      ["Engineer review", "An engineer receives the summary and continues the investigation."],
    ],
  },
};

function initTrace(frame, scenarios) {
  const scenarioSelect = frame.querySelector("[data-trace-input]");
  const playButton = frame.querySelector("[data-trace-play]");
  const playLabel = frame.querySelector("[data-trace-play-label]");
  const request = frame.querySelector("[data-trace-request]");
  const stage = frame.querySelector("[data-trace-stage]");
  const result = frame.querySelector("[data-trace-result]");
  const status = frame.querySelector("[data-trace-status]");
  const steps = Array.from(frame.querySelectorAll("[data-step]"));
  let index = 0;
  let timer;

  function render(state) {
    const scenario = scenarios[scenarioSelect.value];
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

initTrace(document.querySelector('[data-trace="insurance"]'), insuranceScenarios);
initTrace(document.querySelector('[data-trace="personal"]'), personalScenarios);

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
  document.dispatchEvent(new CustomEvent("workchange", { detail: index }));
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

const motion = matchMedia("(prefers-reduced-motion: no-preference)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const desktop = matchMedia("(min-width: 769px)");
const { gsap, ScrollTrigger, Lenis, Typed } = window;
let lenis;
let refreshFrame;
const refreshScroll = () => {
  if (!ScrollTrigger || !gsap) return;
  cancelAnimationFrame(refreshFrame);
  refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
};

function goToSection(hash, { historyEntry = true, instant = false, focus = false } = {}) {
  const target = document.getElementById(hash.slice(1));
  if (!target) return;
  const index = workPanels.indexOf(target);
  if (index >= 0) selectWork(index);
  if (historyEntry && location.hash !== hash) history.pushState(null, "", hash);
  if (focus) {
    if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
  if (lenis && !instant) {
    lenis.scrollTo(target, { offset: -document.querySelector(".site-header").offsetHeight - 18 });
  } else {
    target.scrollIntoView({ behavior: !instant && motion.matches ? "smooth" : "instant" });
  }
}

function initNavigation() {
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".reading-progress");
  let previous = scrollY;
  let frame = 0;
  addEventListener("scroll", () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const y = Math.max(0, scrollY);
      if (!motion.matches || y < 120) header.classList.remove("is-hidden");
      else if (Math.abs(y - previous) > 4) header.classList.toggle("is-hidden", y > previous);
      previous = y;
      if (!gsap || !ScrollTrigger || !motion.matches) {
        const distance = document.documentElement.scrollHeight - innerHeight;
        progress.style.transform = "scaleX(" + (distance > 0 ? y / distance : 0) + ")";
      }
    });
  }, { passive: true });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link || link.closest(".command-dialog") || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute("href");
    if (!document.getElementById(hash.slice(1))) return;
    event.preventDefault();
    goToSection(hash, { focus: event.detail === 0 || link.matches(".skip-link"), instant: link.matches(".skip-link") });
  });
  addEventListener("hashchange", () => goToSection(location.hash || "#home", { historyEntry: false, instant: true }));
  if (location.hash && workPanels.some((panel) => "#" + panel.id === location.hash)) {
    requestAnimationFrame(() => goToSection(location.hash, { historyEntry: false, instant: true }));
  }
  document.addEventListener("workchange", refreshScroll);
  document.querySelector("#moreBlogs").addEventListener("toggle", refreshScroll);
  new ResizeObserver(refreshScroll).observe(document.querySelector("main"));
}

function initPalette() {
  const dialog = document.querySelector(".command-dialog");
  if (typeof dialog.showModal !== "function") return;
  const trigger = document.querySelector(".palette-button");
  const input = dialog.querySelector("input");
  const list = dialog.querySelector(".command-results");
  const empty = dialog.querySelector(".command-empty");
  const sections = [
    ["home", "Upesh Jeengar"], ["azentio", "Building at Azentio"], ["projects", "Personal projects"],
    ["trace", "CompliFlow Lite trace"], ["case-vlm", "Vision-language model"],
    ["case-physics", "Solving PDEs with deep learning"], ["case-agents", "CompliFlow Lite"],
    ["work", "My background"], ["about", "Outside work"], ["skills", "Tools I use"],
    ["blogs", "Writing"], ["contact", "Get in touch"],
  ];
  let active = 0;
  let links = [];
  function select(index) {
    if (!links.length) return;
    active = (index + links.length) % links.length;
    links.forEach((link, i) => link.classList.toggle("is-active", i === active));
    links[active].scrollIntoView({ block: "nearest", behavior: "instant" });
  }
  function render() {
    const search = input.value.trim().toLowerCase();
    links = sections.filter(([id, name]) => (id + " " + name.toLowerCase()).includes(search)).map(([id, name]) => {
      const link = document.createElement("a");
      link.href = "#" + id;
      link.textContent = name;
      return link;
    });
    list.replaceChildren(...links.map((link) => {
      const item = document.createElement("li");
      item.append(link);
      return item;
    }));
    empty.hidden = links.length > 0;
    select(0);
  }
  function open() {
    if (dialog.open) return dialog.close();
    dialog.showModal();
    lenis?.stop();
    input.value = "";
    render();
    input.focus();
  }
  trigger.hidden = false;
  trigger.addEventListener("click", open);
  dialog.querySelector(".command-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (!dialog.open) lenis?.start();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const { left, right, top, bottom } = dialog.getBoundingClientRect();
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
  });
  document.addEventListener("keydown", (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k" || event.repeat) return;
    event.preventDefault();
    open();
  });
  input.addEventListener("input", render);
  input.addEventListener("keydown", (event) => {
    if (!links.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      select(active + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      links[active].click();
    }
  });
  list.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    event.preventDefault();
    dialog.close();
    lenis?.start();
    goToSection(link.hash, { focus: true });
  });
}

const demoGuidance = [
  [/\b(schedule|document|certificate|download|copy)\b/i, "In this sample, sign in and open My Policies. Select the policy, then open Documents to find the policy schedule. If it isn't listed, ask the support team to check whether the document was issued."],
  [/\b(update|wrong|mismatch|incorrect|address|details|change)\b/i, "For this sample, check the most recent policy document against the confirmed change. If they differ, give support the date of the update and the field that looks wrong so an engineer can investigate. Leave private details out of this demo."],
  [/\b(claim|claims|accident|damage)\b/i, "For this sample, open Claims, select the relevant policy, and look for an existing claim before starting a new one. A support representative can explain the required documents and next steps for your policy."],
  [/\b(premium|payment|billing|receipt|invoice|renew)\b/i, "In this sample, check Billing for the payment status and receipt. If the portal and your receipt disagree, share the transaction date with support through the official channel. Don't enter payment details here."],
];
function initTicket() {
  const form = document.querySelector("#ticketDemo");
  const input = document.querySelector("#demoQuestion");
  const panel = form.querySelector(".demo-answer");
  const state = form.querySelector(".demo-state");
  const stream = form.querySelector(".demo-stream");
  const announcement = form.querySelector(".demo-announcement");
  let timer;
  form.hidden = false;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    clearTimeout(timer);
    const answer = demoGuidance.find(([pattern]) => pattern.test(question))?.[1]
      || "I couldn't match that question to this demo's sample guidance. I can respond to questions about policy documents, changes, claims, or billing. For anything else, this sample ticket would go to a support engineer.";
    panel.hidden = false;
    state.classList.toggle("thinking", motion.matches);
    state.textContent = motion.matches ? "Thinking" : "Demo response";
    stream.textContent = "";
    announcement.textContent = "";
    function finish() {
      state.classList.remove("thinking");
      state.textContent = "Demo response";
      stream.textContent = answer;
      announcement.textContent = answer;
    }
    if (!motion.matches) return finish();
    timer = setTimeout(() => {
      state.classList.remove("thinking");
      state.textContent = "Responding";
      let index = 0;
      function type() {
        if (!motion.matches || index >= answer.length) return finish();
        index += 2;
        stream.textContent = answer.slice(0, index);
        timer = setTimeout(type, 15);
      }
      type();
    }, 560);
  });
}

function initRetrieval() {
  const chart = document.querySelector(".retrieval");
  const controls = chart.querySelector(".retrieval-toggle");
  const table = chart.querySelector("table");
  const rows = Array.from(table.tBodies[0].rows);
  const values = rows.map((row) => Array.from(row.querySelectorAll("td span"), (cell) => cell.textContent));
  const headers = Array.from(table.tHead.rows[0].cells).slice(1);
  const directions = headers.map((cell) => cell.textContent);
  const bars = rows.map((row) => row.cells[1].firstElementChild);
  const buttons = Array.from(controls.querySelectorAll("button"));
  let tween;
  let direction = 0;
  controls.hidden = false;
  headers[1].hidden = true;
  rows.forEach((row) => { row.cells[2].hidden = true; });
  function render(index, flip) {
    direction = index;
    tween?.kill();
    buttons.forEach((button, position) => button.setAttribute("aria-pressed", String(position === index)));
    function update() {
      headers[0].textContent = directions[index];
      chart.dataset.direction = buttons[index].dataset.direction;
      bars.forEach((bar, i) => {
        bar.textContent = values[i][index];
        bar.style.setProperty("--score", values[i][index]);
      });
    }
    if (!gsap || !motion.matches || !flip) { update(); return; }
    tween = gsap.timeline().to(bars, { rotateX: -88, duration: .16, stagger: .025 })
      .add(update).set(bars, { rotateX: 86 })
      .to(bars, { rotateX: 0, duration: .26, stagger: .025, clearProps: "transform" });
  }
  buttons.forEach((button, index) => button.addEventListener("click", () => {
    if (direction !== index) render(index, true);
  }));
}


function canvasSize(canvas, context) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const ratio = Math.min(devicePixelRatio || 1, 1.65);
  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return [width, height];
}

function initWave() {
  const lab = document.querySelector(".wave-lab");
  const canvas = lab.querySelector("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;
  const slider = lab.querySelector("input");
  const output = lab.querySelector("output");
  const play = lab.querySelector(".wave-play");
  const duration = Number(slider.max);
  let time = 0;
  let playing = motion.matches;
  let inView = false;
  let frame = 0;
  let previous = 0;
  let lastDisturbance;
  let impulses = [{ x: .34, t: 0, amplitude: .72 }];
  lab.hidden = false;

  // D'Alembert's solution on a periodic domain: each displacement splits into two traveling waves.
  function pulse(x) {
    const distance = x - Math.round(x);
    return Math.exp(-distance * distance * 560);
  }
  function heightAt(x) {
    let value = 0;
    for (const { x: center, t, amplitude } of impulses) {
      if (t > time) continue;
      const travel = (time - t) / duration;
      value += amplitude * .5 * (pulse(x - center - travel) + pulse(x - center + travel));
    }
    return value;
  }
  function draw() {
    const [width, height] = canvasSize(canvas, context);
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    const mid = height / 2;
    context.strokeStyle = "#25415d";
    context.lineWidth = 1;
    context.beginPath();
    for (let x = 0; x <= width; x += 24) { context.moveTo(x, 0); context.lineTo(x, height); }
    for (let y = mid % 24; y <= height; y += 24) { context.moveTo(0, y); context.lineTo(width, y); }
    context.stroke();
    const shade = context.createLinearGradient(0, 0, width, 0);
    shade.addColorStop(0, "#79f0ff");
    shade.addColorStop(.5, "#b9f7ff");
    shade.addColorStop(1, "#b49bff");
    const wave = new Path2D();
    for (let i = 0; i <= 192; i++) {
      const x = i / 192;
      const y = mid - heightAt(x) * height * .33;
      if (i === 0) wave.moveTo(0, y);
      else wave.lineTo(x * width, y);
    }
    const fill = new Path2D(wave);
    fill.lineTo(width, mid);
    fill.lineTo(0, mid);
    fill.closePath();
    context.fillStyle = "#58caff26";
    context.fill(fill);
    context.strokeStyle = shade;
    context.lineWidth = 2;
    context.stroke(wave);
    slider.value = time.toFixed(2);
    output.value = time.toFixed(2) + " s";
  }
  function shouldPlay() { return playing && inView && !document.hidden && !lab.closest("[hidden]"); }
  function tick(now) {
    frame = 0;
    if (!shouldPlay()) return;
    if (previous) {
      time += Math.min((now - previous) / 1000, .04);
      if (time >= duration) {
        time %= duration;
        impulses = [{ x: .34, t: 0, amplitude: .72 }];
      }
    }
    previous = now;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    play.textContent = playing ? "Pause" : "Play";
    play.setAttribute("aria-pressed", String(playing));
    if (shouldPlay() && !frame) {
      previous = 0;
      frame = requestAnimationFrame(tick);
    } else if (!shouldPlay() && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }
  function addImpulse(x, amplitude) {
    if (time >= duration - .05) time = 0;
    impulses = impulses.filter((impulse) => impulse.t <= time).slice(-7);
    impulses.push({ x, t: time, amplitude });
    draw();
  }
  function disturb(event) {
    const box = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
    if (lastDisturbance !== undefined && Math.abs(x - lastDisturbance) < .085) return;
    lastDisturbance = x;
    const sign = event.clientY > box.top + box.height / 2 ? -1 : 1;
    addImpulse(x, sign * .53);
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    canvas.setPointerCapture(event.pointerId);
    lastDisturbance = undefined;
    disturb(event);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (canvas.hasPointerCapture(event.pointerId)) disturb(event);
  });
  lab.querySelector(".wave-disturb").addEventListener("click", () => addImpulse(.5, .62));
  lab.querySelector(".wave-reset").addEventListener("click", () => {
    time = 0;
    impulses = [{ x: .34, t: 0, amplitude: .72 }];
    draw();
  });
  play.addEventListener("click", () => { playing = !playing; sync(); });
  slider.addEventListener("input", () => {
    playing = false;
    time = Number(slider.value);
    draw();
    sync();
  });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(lab);
  new ResizeObserver(draw).observe(canvas);
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", () => { playing = motion.matches; sync(); });
  sync();
}

function initPipeline() {
  const figure = document.querySelector(".pipeline");
  const canvas = figure.querySelector("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;
  const steps = Array.from(figure.querySelectorAll("li"));
  let coords = [];
  let size = [0, 0];
  let visible = false;
  let frame = 0;
  let active = -1;
  const activate = (index) => {
    if (active === index) return;
    active = index;
    steps.forEach((step, i) => step.classList.toggle("is-active", i === index || index < 0));
  };
  function draw(now) {
    frame = 0;
    if (!visible || document.hidden || !motion.matches || !coords.length) return;
    const phase = (now / 1450) % 3;
    activate(Math.floor(phase));
    const y = coords[0] + (coords.at(-1) - coords[0]) * phase / 3;
    context.clearRect(0, 0, ...size);
    context.fillStyle = "#c9b5ff";
    context.shadowColor = "#b49bff";
    context.shadowBlur = 9;
    for (let i = 0; i < 3; i++) {
      context.globalAlpha = 1 - i * .23;
      context.fillRect(3.5, y - i * 6, 3, 5 - i);
    }
    context.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    if (visible && motion.matches && !document.hidden && !frame) frame = requestAnimationFrame(draw);
    if ((!motion.matches || !visible || document.hidden) && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      context.clearRect(0, 0, ...size);
    }
    if (!motion.matches) activate(-2);
  }
  new ResizeObserver(() => {
    size = canvasSize(canvas, context);
    const top = figure.getBoundingClientRect().top;
    coords = size[0] ? steps.map((step) => {
      const box = step.getBoundingClientRect();
      return box.top - top + box.height / 2;
    }) : [];
    sync();
  }).observe(figure);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(figure);
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", sync);
  if (!motion.matches) activate(-2);
}

function initSkills() {
  const original = document.querySelector("#skills dl");
  const interactive = document.querySelector(".skill-interactive");
  const filters = interactive.querySelector(".skill-filters");
  const map = interactive.querySelector(".skill-map");
  const svg = map.querySelector("svg");
  const ns = "http://www.w3.org/2000/svg";
  const groups = Array.from(original.children, (group) => ({
    label: group.querySelector("dt").textContent,
    names: group.querySelector("dd").textContent.split(", "),
  }));
  const nodes = [];
  const edges = [];
  let selected = -1;
  let hovered = -1;
  function highlight() {
    const current = hovered < 0 ? selected : hovered;
    for (const { element, group } of [...nodes, ...edges]) {
      element.classList.toggle("is-active", current === group);
      element.classList.toggle("is-dimmed", current >= 0 && group !== current);
    }
    Array.from(filters.children).forEach((button, index) => button.setAttribute("aria-pressed", String(index === selected + 1)));
    nodes.forEach(({ element, group }) => element.setAttribute("aria-pressed", String(group === selected)));
  }
  const choose = (group) => { selected = selected === group ? -1 : group; highlight(); };
  ["All", ...groups.map(({ label }) => label)].forEach((label, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => choose(index - 1));
    filters.append(button);
  });
  groups.forEach(({ label, names }, group) => {
    names.forEach((name, index) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = "skill-node";
      element.textContent = name;
      element.title = label;
      element.style.setProperty("--column", 1 + (group % 2) * 2 + (index % 2));
      element.style.setProperty("--row", 1 + Math.floor(group / 2) * 2 + Math.floor(index / 2));
      element.addEventListener("pointerenter", () => { hovered = group; highlight(); });
      element.addEventListener("pointerleave", () => { hovered = -1; highlight(); });
      element.addEventListener("focus", () => { hovered = group; highlight(); });
      element.addEventListener("blur", () => { hovered = -1; highlight(); });
      element.addEventListener("click", () => choose(group));
      map.append(element);
      nodes.push({ element, group });
    });
    [[0, 1], [0, 2], [1, 3], [2, 3], [0, 3]].forEach(([first, second]) => {
      const element = document.createElementNS(ns, "line");
      svg.append(element);
      edges.push({ element, group, first: group * 4 + first, second: group * 4 + second });
    });
  });
  function drawEdges() {
    const bounds = map.getBoundingClientRect();
    const centers = nodes.map(({ element }) => {
      const rect = element.getBoundingClientRect();
      return [rect.left - bounds.left + rect.width / 2, rect.top - bounds.top + rect.height / 2];
    });
    edges.forEach(({ element, first, second }) => {
      const [x1, y1] = centers[first];
      const [x2, y2] = centers[second];
      Object.entries({ x1, y1, x2, y2 }).forEach(([key, value]) => element.setAttribute(key, value));
    });
  }
  original.hidden = true;
  interactive.hidden = false;
  const resize = new ResizeObserver(drawEdges);
  resize.observe(map);
  nodes.forEach(({ element }) => resize.observe(element));
  highlight();
}


function initPointer() {
  const cursor = document.querySelector(".lab-cursor");
  const hero = document.querySelector(".hero");
  const root = document.body;
  let lastButton;
  let lastCard;
  let pointer;
  let frame = 0;
  function clearTargets() {
    if (lastButton) lastButton.style.removeProperty("transform");
    if (lastCard) ["--rx", "--ry", "--gx", "--gy"].forEach((key) => lastCard.style.removeProperty(key));
    lastButton = lastCard = null;
  }
  function update() {
    frame = 0;
    if (!pointer || !motion.matches || !finePointer.matches) return;
    const { clientX: x, clientY: y, target } = pointer;
    const native = target.closest("input, textarea, select, dialog, .wave-canvas");
    root.classList.add("has-cursor");
    cursor.classList.toggle("is-visible", !native);
    cursor.classList.toggle("is-over", Boolean(target.closest("a,button,summary")));
    cursor.style.transform = "translate3d(" + x + "px," + y + "px,0)";
    const button = target.closest(".hero-actions .button");
    const card = target.closest(".company-project");
    if (button !== lastButton || card !== lastCard) clearTargets();
    if (button) {
      const box = button.getBoundingClientRect();
      const parent = button.offsetParent.getBoundingClientRect();
      const dx = x - parent.left - button.offsetLeft - box.width / 2;
      const dy = y - parent.top - button.offsetTop - box.height / 2;
      button.style.transform = "translate3d(" + dx * .16 + "px," + dy * .2 + "px,0)";
      lastButton = button;
    }
    if (card) {
      const box = card.getBoundingClientRect();
      const fx = (x - box.left) / box.width;
      const fy = (y - box.top) / box.height;
      card.style.setProperty("--rx", (.5 - fy) * 9 + "deg");
      card.style.setProperty("--ry", (fx - .5) * 9 + "deg");
      card.style.setProperty("--gx", fx * 100 + "%");
      card.style.setProperty("--gy", fy * 100 + "%");
      lastCard = card;
    }
    if (hero.contains(target)) {
      const rect = hero.getBoundingClientRect();
      heroPointer.x = (x - rect.left) / rect.width * 2 - 1;
      heroPointer.y = (y - rect.top) / rect.height * 2 - 1;
    } else {
      heroPointer.x = heroPointer.y = 0;
    }
  }
  function reset() {
    pointer = undefined;
    heroPointer.x = heroPointer.y = 0;
    cancelAnimationFrame(frame);
    frame = 0;
    clearTargets();
    root.classList.remove("has-cursor");
    cursor.classList.remove("is-visible", "is-down");
  }
  addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || !motion.matches || !finePointer.matches) return;
    pointer = event;
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
  addEventListener("pointerdown", () => cursor.classList.add("is-down"), { passive: true });
  addEventListener("pointerup", () => cursor.classList.remove("is-down"), { passive: true });
  document.documentElement.addEventListener("pointerleave", reset);
  addEventListener("blur", reset);
  motion.addEventListener("change", reset);
  finePointer.addEventListener("change", reset);
}

const heroPointer = { x: 0, y: 0 };
function initNeuralField() {
  const field = document.querySelector(".hero-field");
  let running = false;
  let starting = false;
  let visible = false;
  let failed = false;
  let renderer, scene, camera, network, particles, raf = 0;
  async function setup() {
    if (starting || renderer || failed || !visible || !desktop.matches || !motion.matches) return;
    starting = true;
    const canvas = document.createElement("canvas");
    try {
      const context = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, powerPreference: "low-power" });
      if (!context) { failed = true; return; }
      const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js");
      renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.45));
      renderer.setClearColor(0x000000, 0);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(42, 1, .1, 40);
      camera.position.z = 9;
      network = new THREE.Group();
      scene.add(network);
      const seeds = [];
      const positions = [];
      const colors = [];
      const strength = [];
      let seed = 76291;
      const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
      const palette = [new THREE.Color("#8cf4ff"), new THREE.Color("#679fff"), new THREE.Color("#b292ff")];
      function add(x, y, z, code, light) {
        positions.push(x, y, z);
        const color = palette[code];
        colors.push(color.r, color.g, color.b);
        strength.push(light);
      }
      for (let i = 0; i < 275; i++) {
        const y = 1 - 2 * (i + .5) / 275;
        const phi = i * Math.PI * (3 - Math.sqrt(5));
        const radius = Math.sqrt(1 - y * y);
        const wobble = 1 + Math.sin(3 * phi + y * 7) * .16 + random() * .26;
        const x = Math.cos(phi) * radius * wobble * 2;
        const z = Math.sin(phi) * radius * wobble * 1.75;
        const p = [x, y * wobble * 1.85, z];
        seeds.push(p);
        add(...p, x + y * .45 < -.33 ? 0 : x > .9 ? 2 : 1, .23 + random() ** 2 * .9);
      }
      const links = [];
      seeds.forEach(([x, y, z], i) => {
        const closest = [];
        for (let j = i + 1; j < seeds.length; j++) {
          const point = seeds[j];
          const distance = (x - point[0]) ** 2 + (y - point[1]) ** 2 + (z - point[2]) ** 2;
          if (distance < .58) closest.push([distance, point]);
        }
        closest.sort((a, b) => a[0] - b[0]).slice(0, 4).forEach(([, point]) => links.push(x, y, z, ...point));
      });
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(links, 3));
      network.add(new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({
        color: "#89aafb", transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending,
      })));
      for (let i = 0; i < 490; i++) {
        const a = random() * Math.PI * 2;
        const radius = 2.1 + random() * 1.5;
        add(Math.cos(a) * radius, Math.sin(a) * radius * .63 + (random() - .5) * 1.7, (random() - .5) * 4.7, i % 3, .1 + random() ** 3 * .35);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("tint", new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute("energy", new THREE.Float32BufferAttribute(strength, 1));
      particles = new THREE.ShaderMaterial({
        uniforms: { tick: { value: 0 }, resolutionScale: { value: renderer.getPixelRatio() } },
        vertexShader: [
          "uniform float tick, resolutionScale; attribute float energy; attribute vec3 tint; varying vec3 hue; varying float power;",
          "void main() { vec4 eye = modelViewMatrix * vec4(position,1.);",
          "gl_Position=projectionMatrix*eye; power=energy*(.85+.15*sin(tick*1.8+position.x*7.+position.z*4.));",
          "hue=tint; gl_PointSize=resolutionScale*(1.8+power*7.)*8.0/-eye.z; }",
        ].join("\n"),
        fragmentShader: [
          "varying vec3 hue; varying float power;",
          "void main() { float r=length(gl_PointCoord-.5);",
          "float a=(exp(-r*r*25.)*.72+1.-smoothstep(.04,.18,r))*(1.-smoothstep(.34,.50,r));",
          "gl_FragColor=vec4(hue,a*power); }",
        ].join("\n"),
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      network.add(new THREE.Points(geometry, particles));
      for (let i = 0; i < 2; i++) {
        const vertices = Array.from({ length: 128 }, (_, j) => {
          const a = j / 128 * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a) * (2.8 + i * .28), Math.sin(a) * (.9 + i * .15), 0);
        });
        const orbit = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(vertices), new THREE.LineBasicMaterial({
          color: i ? "#bd9bff" : "#64d6fc", transparent: true, opacity: .23, depthWrite: false,
        }));
        orbit.rotation.set(.45 + i * .8, .29, i ? -.56 : .48);
        network.add(orbit);
      }
      field.append(canvas);
      canvas.addEventListener("webglcontextlost", () => { failed = true; sync(); canvas.hidden = true; });
      new ResizeObserver(resize).observe(field);
      resize();
    } catch {
      failed = true;
    } finally {
      starting = false;
      sync();
    }
  }
  function resize() {
    if (!renderer) return;
    const width = field.clientWidth;
    const height = field.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const span = 2 * camera.position.z * Math.tan(Math.PI * camera.fov / 360);
    network.scale.setScalar(Math.min(1.12, camera.aspect * .63));
    network.position.x = span * camera.aspect * .222;
    network.position.y = -.05;
    renderer.setSize(width, height, false);
  }
  function draw(now) {
    if (!running) return;
    const seconds = now / 1000;
    network.rotation.x += ((.19 + heroPointer.y * .36) - network.rotation.x) * .06;
    network.rotation.y += ((Math.sin(seconds * .23) * .38 + heroPointer.x * .7) - network.rotation.y) * .055;
    network.rotation.z = -.14 + Math.sin(seconds * .28) * .1;
    particles.uniforms.tick.value = seconds;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(draw);
  }
  function sync() {
    const enabled = desktop.matches && motion.matches && !failed;
    if (renderer) renderer.domElement.hidden = !enabled;
    const shouldRun = enabled && visible && !document.hidden;
    if (shouldRun && !renderer) { setup(); return; }
    if (shouldRun && !running) {
      running = true;
      raf = requestAnimationFrame(draw);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(field);
  motion.addEventListener("change", sync);
  desktop.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
}


function splitHeroName() {
  const name = document.querySelector("#name");
  const full = name.textContent;
  const words = full.split(" ");
  const visual = document.createElement("span");
  visual.className = "hero-name-visual";
  visual.setAttribute("aria-hidden", "true");
  name.setAttribute("aria-label", full);
  let index = 0;
  words.forEach((word, position) => {
    if (position) visual.append(" ");
    const group = document.createElement("span");
    group.className = "hero-word";
    for (const char of word) {
      const glyph = document.createElement("span");
      glyph.className = "hero-letter";
      const hue = 192 + (index++ / (full.length - 2)) * 62;
      glyph.style.setProperty("--glyph", "hsl(" + hue + " 92% " + (index < 4 ? 91 : 80) + "%)");
      glyph.textContent = char;
      group.append(glyph);
    }
    visual.append(group);
  });
  name.replaceChildren(visual);
  return name.querySelectorAll(".hero-letter");
}

function initMotion() {
  const name = document.querySelector("#name");
  const originalName = Array.from(name.childNodes);
  const hero = document.querySelector(".hero");
  const boot = document.querySelector(".boot-screen");
  const role = document.querySelector("#heroRole");
  const terminal = hero.querySelector(".terminal-command");
  const terminalResult = hero.querySelector(".terminal-output");
  const header = document.querySelector(".site-header");
  const metric = document.querySelector(".impact-metric strong span");
  const dialog = document.querySelector(".command-dialog");

  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const getHome = () => !location.hash || location.hash === "#home";
  let hasEntered = false;
  let hasBooted = false;
  function animate() {
    if (motion.matches && Lenis) {
      lenis = new Lenis({ lerp: .105, autoRaf: !gsap, prevent: (node) => node === dialog });
      const updateLenis = (time) => lenis?.raf(time * 1000);
      if (gsap) gsap.ticker.add(updateLenis);
      if (gsap && ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
      if (dialog.open) lenis.stop();
      return () => { gsap?.ticker.remove(updateLenis); lenis.destroy(); lenis = undefined; };
    }
    return () => {};
  }
  let stopSmooth = animate();
  motion.addEventListener("change", () => {
    stopSmooth();
    stopSmooth = animate();
    if (!motion.matches) header.classList.remove("is-hidden");
  });
  if (!gsap) return;

  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const letters = splitHeroName();
    const intro = gsap.timeline({ paused: true });
    const roleTyper = Typed ? new Typed(role, {
      strings: ["AI Engineer", "Agent Builder", "ML Researcher"], typeSpeed: 53, backSpeed: 32,
      backDelay: 1880, loop: true, contentType: null,
    }) : null;
    let commandTyper;
    function showTerminal() {
      if (!Typed) return;
      terminalResult.style.visibility = "hidden";
      terminal.textContent = "";
      commandTyper = new Typed(terminal, {
        strings: ["> whoami"], typeSpeed: 73, showCursor: false, contentType: null,
        onComplete() { terminalResult.style.visibility = "visible"; },
      });
    }
    if (!hasEntered && getHome()) {
      intro.from(letters, { opacity: 0, y: 36, rotateX: -54, duration: .63, stagger: .044, ease: "power3.out" })
        .from(".hero-role, .hero-lede, .hero-actions", { opacity: 0, y: 13, duration: .42, stagger: .08, ease: "power2.out" }, .25)
        .add(showTerminal, .22);
      let seenBoot = false;
      try { seenBoot = sessionStorage.getItem("portfolio-boot") === "1"; } catch { /* Storage is optional. */ }
      if (!hasBooted && !seenBoot) {
        hasBooted = true;
        try { sessionStorage.setItem("portfolio-boot", "1"); } catch { /* Storage is optional. */ }
        boot.hidden = false;
        gsap.timeline({ onComplete: () => { boot.hidden = true; } })
          .to(".boot-fill", { scaleX: 1, duration: .52, ease: "power2.inOut" })
          .add(() => intro.play())
          .to(boot, { opacity: 0, duration: .25 });
      } else {
        intro.play();
      }
      hasEntered = true;
    }
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !document.hidden) roleTyper?.start();
      else roleTyper?.stop();
    });
    visibility.observe(hero);

    if (ScrollTrigger) {
      gsap.fromTo(".reading-progress", { scaleX: 0 }, {
        scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .18 },
      });
      gsap.to(".hero-image", {
        y: 65, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
      document.querySelectorAll("[data-animate], .about-copy, .stack, .contact-inner").forEach((element) => {
        if (element.matches(".company-project, .workbench")) return;
        const children = Array.from(element.children);
        if (!children.length) return;
        gsap.from(children, {
          opacity: .45, y: 16, filter: "blur(2px)", duration: .51, stagger: .065,
          clearProps: "transform,opacity,filter", ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 97%", once: true },
        });
      });
      document.querySelectorAll(".company-grid, .workbench, .project-browser, .blog-grid").forEach((element) => {
        if (element.id === "extraBlogGrid") return;
        ScrollTrigger.create({
          trigger: element, start: "top 91%", once: true,
          onEnter: () => gsap.fromTo(Array.from(element.children).filter((child) => !child.hidden), {
            opacity: .4, y: 17,
          }, { opacity: 1, y: 0, duration: .45, stagger: .07, clearProps: "transform,opacity" }),
        });
      });
      const count = { value: 0 };
      const finalMetric = Number.parseInt(metric.textContent, 10);
      ScrollTrigger.create({
        trigger: ".impact-metric", start: "top 92%", once: true,
        onEnter: () => gsap.to(count, { value: finalMetric, duration: .92, ease: "power2.out",
          onUpdate: () => { metric.textContent = Math.round(count.value) + "%"; },
          onComplete: () => { metric.textContent = finalMetric + "%"; },
        }),
      });
      gsap.fromTo(".retrieval td span", { "--bar-fill": 0 }, {
        "--bar-fill": 1, stagger: .1, duration: .68, ease: "power2.out",
        scrollTrigger: { trigger: ".retrieval", start: "top 90%", once: true },
      });
      gsap.fromTo(".experience-list", { "--timeline-progress": 0 }, {
        "--timeline-progress": 1, ease: "none",
        scrollTrigger: { trigger: ".experience-list", start: "top 82%", end: "bottom 68%", scrub: .25 },
      });
      gsap.utils.toArray(".experience-row").forEach((row, index) => gsap.from(row, {
        x: index % 2 ? 12 : -12, opacity: .35, duration: .58, ease: "power2.out", clearProps: "transform,opacity",
        scrollTrigger: { trigger: row, start: "top 92%", once: true },
      }));
    }
    return () => {
      visibility.disconnect();
      roleTyper?.destroy();
      commandTyper?.destroy();
      terminal.textContent = "> whoami";
      terminalResult.style.removeProperty("visibility");
      role.textContent = "AI Engineer";
      name.replaceChildren(...originalName);
      name.removeAttribute("aria-label");
      metric.textContent = "52%";
      boot.hidden = true;
    };
  });
  if (ScrollTrigger) media.add("(min-width: 941px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)", () => {
    const heading = document.querySelector(".timeline-heading");
    ScrollTrigger.create({
      trigger: heading, pin: true, pinSpacing: false, start: "top 128px",
      endTrigger: ".experience-list", end: () => "bottom " + (heading.offsetHeight + 128) + "px",
    });
  });
  document.addEventListener("workchange", (event) => {
    if (!motion.matches) return;
    const panel = workPanels[event.detail];
    gsap.fromTo(panel, { opacity: .52 }, { opacity: 1, duration: .29, clearProps: "opacity", overwrite: true });
  });
  refreshScroll();
}

initNavigation();
initPalette();
initTicket();
initRetrieval();
initWave();
initPipeline();
initSkills();
initPointer();
initNeuralField();
initMotion();
