const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

async function loadIncludes() {
  const includes = $$("[data-include]");
  await Promise.all(includes.map(async include => {
    try {
      const response = await fetch(include.dataset.include);
      if (!response.ok) return;
      include.innerHTML = await response.text();
    } catch (error) {
      // Keep fallback content for local file previews or offline reading.
    }
  }));
  markCurrentSeriesLink();
}

function markCurrentSeriesLink() {
  const currentFile = window.location.pathname.split("/").pop() || "ml-system-design-part-1.html";
  $$("#seriesLinks a").forEach(link => {
    const linkFile = link.getAttribute("href")?.split("/").pop();
    if (linkFile === currentFile) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

loadIncludes();
markCurrentSeriesLink();

const progress = $("#progress");
if (progress) {
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}

const themeToggle = $("#themeToggle");
const savedTheme = localStorage.getItem("mlsd-theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
if (themeToggle) {
  const setThemeLabel = () => {
    themeToggle.textContent = document.documentElement.dataset.theme === "dark" ? "Light theme" : "Dark theme";
  };
  themeToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("mlsd-theme", next);
    setThemeLabel();
  });
  setThemeLabel();
}

const tocLinks = $$(".toc a");
if (tocLinks.length) {
  const sections = tocLinks.map(a => $(a.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: "-22% 0px -65% 0px", threshold: 0.01 });
  sections.forEach(section => observer.observe(section));
}

const fitInputs = $$("#fitChecks input");
const fitScore = $("#fitScore");
const fitMeter = $("#fitMeter");
const fitTitle = $("#fitTitle");
const fitAdvice = $("#fitAdvice");
function updateFit() {
  const score = fitInputs.reduce((sum, input) => sum + (input.checked ? Number(input.dataset.weight) : 0), 0);
  fitScore.textContent = score;
  fitMeter.style.width = `${score}%`;
  if (score >= 78) {
    fitTitle.textContent = "ML is likely justified - design the system, not just the model.";
    fitAdvice.textContent = "Move into scoping: define labels, metrics, latency budgets, monitoring, model ownership, and a safe launch plan.";
  } else if (score >= 55) {
    fitTitle.textContent = "Promising, but de-risk first.";
    fitAdvice.textContent = "Start with a baseline or rules-plus-human workflow. Collect data and prove that ML improves the business or user outcome.";
  } else if (score >= 30) {
    fitTitle.textContent = "Probably not a first ML project.";
    fitAdvice.textContent = "Clarify the prediction target, data source, and cost of mistakes. A simpler automation may deliver value faster.";
  } else {
    fitTitle.textContent = "Start with the problem, not the model.";
    fitAdvice.textContent = "Select conditions to see whether ML is justified. A low score does not mean the idea is bad; it may mean a simpler system should come first.";
  }
}
if (fitInputs.length && fitScore && fitMeter && fitTitle && fitAdvice) {
  fitInputs.forEach(input => input.addEventListener("change", updateFit));
  updateFit();
}

const copyChecklist = $("#copyChecklist");
if (copyChecklist) {
  copyChecklist.addEventListener("click", async () => {
    const text = $$("#fitChecks .check-item").map(item => "- " + item.innerText.trim().replace(/\s+/g, " ")).join("\n");
    try {
      await navigator.clipboard.writeText("Should this be an ML project?\n" + text);
      $("#copyStatus")?.classList.add("show");
      setTimeout(() => $("#copyStatus")?.classList.remove("show"), 1400);
    } catch (error) {
      alert("Copy failed. You can still select and copy the checklist manually.");
    }
  });
}

$$(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    $$(".use-case").forEach(card => {
      const visible = filter === "all" || card.dataset.type.split(" ").includes(filter);
      card.classList.toggle("hide", !visible);
    });
  });
});

const compareData = {
  requirements: {
    research: ["Often optimizes a single benchmark metric.", "Stakeholders are usually aligned around model performance.", "Complexity is tolerated when it improves leaderboard results."],
    production: ["Multiple stakeholders care about different outcomes.", "Product, sales, platform, legal, and users can have conflicting requirements.", "A slightly worse but simpler model may win."]
  },
  compute: {
    research: ["Training speed and experimental throughput dominate.", "Batching is usually a feature, not a user-facing problem.", "Offline scores are reported after inference on fixed test sets."],
    production: ["Inference latency, reliability, and cost dominate.", "Batching can improve throughput but hurt user latency.", "Service-level objectives and tail latency matter."]
  },
  data: {
    research: ["Datasets are often static, clean, and widely studied.", "Labels are available and benchmark quirks are known.", "Historical data is usually enough for evaluation."],
    production: ["Data is messy, drifting, biased, sparse, delayed, or incorrect.", "Streaming data, privacy, and regulatory constraints enter the design.", "Test data can become stale quickly."]
  },
  fairness: {
    research: ["Too often treated as optional or separate from the main metric.", "Benchmark gains can hide subgroup failures.", "Fairness metrics may not be part of the leaderboard."],
    production: ["Bias can affect real users at scale.", "Risk mitigation must be designed before launch.", "Fairness, appeal processes, and human review can be product requirements."]
  },
  interpretability: {
    research: ["Explanations are often nice-to-have unless the paper studies them.", "A black-box model may be accepted if it improves accuracy.", "Debugging may rely on benchmark-level metrics."],
    production: ["Users, regulators, and operators may need explanations.", "Interpretability helps debugging and trust.", "Opaque behavior increases launch and incident risk."]
  }
};
function renderCompare(tab) {
  const researchList = $("#researchList");
  const productionList = $("#productionList");
  if (!researchList || !productionList || !compareData[tab]) return;
  researchList.innerHTML = compareData[tab].research.map(x => `<li>${x}</li>`).join("");
  productionList.innerHTML = compareData[tab].production.map(x => `<li>${x}</li>`).join("");
}
if ($$(".tab-btn").length) {
  $$(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderCompare(btn.dataset.tab);
    });
  });
  renderCompare("requirements");
}

const batchSize = $("#batchSize");
const batchLatency = $("#batchLatency");
const queueWait = $("#queueWait");
function updateCalc() {
  const b = Number(batchSize.value);
  const l = Number(batchLatency.value);
  const q = Number(queueWait.value);
  const latency = l + q;
  const throughput = Math.round((b / l) * 1000);
  const perItem = (l / b).toFixed(1);
  const p99 = Math.round(latency * 2 + Math.max(0, q * 1.4));
  $("#batchSizeVal").textContent = b;
  $("#batchLatencyVal").textContent = l;
  $("#queueWaitVal").textContent = q;
  $("#latencyOut").textContent = latency;
  $("#throughputOut").textContent = throughput.toLocaleString();
  $("#perItemOut").textContent = perItem;
  $("#p99Out").textContent = p99;
  const advice = latency <= 80
    ? "Healthy for many interactive use cases. Keep watching tail latency."
    : latency <= 180
      ? "Usable for some products, risky for tight user interactions. Consider smaller batches, caching, or model optimization."
      : "Too slow for many interactive experiences. Revisit batching, architecture, hardware, or product requirements.";
  $("#latencyAdvice").textContent = advice;
}
if (batchSize && batchLatency && queueWait) {
  [batchSize, batchLatency, queueWait].forEach(input => input.addEventListener("input", updateCalc));
  updateCalc();
}

const priorities = ["acc", "lat", "fair", "maint"];
function updatePriorities() {
  const values = Object.fromEntries(priorities.map(k => [k, Number($(`#${k}Slider`).value)]));
  priorities.forEach(k => $(`#${k}Val`).textContent = values[k]);
  let advice = "Balance is key: start with a simple model, add monitoring, and only pay for complexity when it clears a business or risk threshold.";
  if (values.lat >= 8 && values.acc >= 8) advice = "High accuracy and low latency conflict. Explore two-stage ranking, distillation, caching, feature precomputation, or hardware-aware model selection.";
  if (values.fair >= 8 && values.acc >= 7) advice = "Make fairness part of evaluation, not a post-launch patch. Slice metrics by affected groups and plan human review for high-impact decisions.";
  if (values.maint >= 8 && values.acc <= 6) advice = "Prefer simple baselines, strong data contracts, reproducible pipelines, and clear ownership. Operational simplicity is a feature.";
  if (values.lat <= 4 && values.acc >= 9) advice = "If latency is flexible, heavier models or ensembles may be acceptable - but still account for cost, monitoring, and interpretability.";
  $("#priorityAdvice").textContent = advice;
}
if (priorities.every(k => $(`#${k}Slider`) && $(`#${k}Val`)) && $("#priorityAdvice")) {
  priorities.forEach(k => $(`#${k}Slider`).addEventListener("input", updatePriorities));
  updatePriorities();
}

const processData = {
  scope: ["Project scoping", "Define goals, objectives, constraints, stakeholders, risks, resources, and success metrics. Decide whether the problem should be ML at all."],
  data: ["Data engineering", "Collect, ingest, validate, sample, label, store, and transform data. Most future model behavior is constrained by this step."],
  model: ["ML model development", "Build baselines, engineer features, train models, evaluate offline, perform error analysis, and choose what is good enough for launch."],
  deploy: ["Deployment", "Expose the model to users or downstream systems through batch jobs, services, edge deployments, or embedded application logic."],
  monitor: ["Monitoring & continual learning", "Watch data quality, drift, performance decay, latency, costs, fairness slices, and incidents. Update models when signals justify it."],
  business: ["Business analysis", "Compare model behavior to product and business goals. Insights can stop a project, re-scope it, or start the next iteration."]
};
function renderProcess(step) {
  const [title, body] = processData[step];
  $("#processDetail").innerHTML = `<h3>${title}</h3><p>${body}</p><div class="callout"><span class="icon">↻</span><div><strong>The loop continues.</strong><p>New errors, new labels, new traffic, or new business goals can send the team back to any earlier step.</p></div></div>`;
}
if ($("#processDetail") && $$(".process-step").length) {
  $$(".process-step").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".process-step").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProcess(btn.dataset.step);
    });
  });
  renderProcess("scope");
}
