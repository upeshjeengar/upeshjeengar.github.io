const projects = [
  {
    title: "VLM from Scratch",
    description:
      "Trained a Q-Former to align ViT image embeddings with text, then fine-tuned SmolLM-135M. The BLIP-2-style model achieved 90% Recall@5 in a 50,000-pair Conceptual Captions experiment.",
    tags: ["Python", "LLMs", "Computer Vision", "PyTorch"],
    links: [{ label: "GitHub", url: "https://github.com/Upeshjeengar/vlm" }],
    featured: true,
  },
  {
    title: "fast-rlm",
    description:
      "Contributed a merged robustness fix to fast-rlm so step-cost display handles missing usage cost safely for local, free, or unknown-cost runs instead of assuming every backend returns billable cost data.",
    tags: ["Open Source", "TypeScript", "CLI", "LLM Tooling"],
    links: [{ label: "Merged PR", url: "https://github.com/avbiswas/fast-rlm/pull/3" }],
    featured: true,
  },
  {
    title: "CompliFlow Lite",
    description:
      "Built a governed multi-agent enterprise workflow automation system that turns employee requests into auditable workflows or grounded policy answers, using RAG, deterministic guardrails, human approvals, and mocked Jira, ServiceNow, SAP Ariba, DocuSign, Okta, and Slack integrations.",
    tags: ["Multi-Agent Systems", "RAG", "NVIDIA NIM", "Guardrails", "Enterprise Automation"],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/upeshjeengar/enterprise-ai-automation",
      },
    ],
    featured: true,
  },
  {
    title: "Solving PDEs Using Deep Learning",
    description:
      "B.Tech Project applying deep learning methods to partial differential equations, including Burgers' equation, the wave equation with external disturbances, and the Euler beam equation.",
    tags: ["BTP", "Deep Learning", "PDEs", "Jupyter Notebook"],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/upeshjeengar/Solving-Partial-Differntial-Equations-using-Deep-Learning",
      },
    ],
    featured: true,
  },
  {
    title: "NGMA Synthetic Data Generation",
    description:
      "Configurable Python pipeline that generates realistic hierarchical product datasets with spatial-temporal behaviors, seasonality, and Pareto-driven distributions.",
    tags: ["Python", "Synthetic Data", "Analytics", "ML Testing"],
    links: [],
    featured: true,
  },
  {
    title: "Explainable Loan Approval System",
    description:
      "Integrated logistic regression into a Spring application with feature engineering, TF-IDF, recursive feature elimination, and LLM-powered explainability.",
    tags: ["Java", "Spring", "ML", "Explainability"],
    links: [],
    featured: true,
  },
  {
    title: "Flight Price Prediction",
    description:
      "End-to-end Random Forest flight fare predictor deployed through Flask, AWS EC2, Gunicorn, and Nginx with MLflow-backed model monitoring.",
    tags: ["Python", "Flask", "AWS", "MLflow"],
    links: [{ label: "GitHub", url: "https://github.com/Upeshjeengar/flight-price-prediction-flask" }],
  },
  {
    title: "Emotion Detection and Image Enhancement",
    description:
      "Improved emotion detection accuracy with augmentation and transfer learning, then integrated MIRNet-based image enhancement workflows using OpenCV.",
    tags: ["Computer Vision", "ResNet-50", "MIRNet", "OpenCV"],
    links: [{ label: "GitHub", url: "https://github.com/Upeshjeengar/Emotion-Detection-Deployement" }],
  },
  {
    title: "Movie Recommender",
    description:
      "Recommendation system project from GitHub focused on turning user-item signals into practical movie suggestions.",
    tags: ["Machine Learning", "Recommenders", "Python"],
    links: [{ label: "GitHub", url: "https://github.com/Upeshjeengar/Movie-Recommender" }],
  },
  {
    title: "MLOps",
    description:
      "Repository for machine learning operations workflows, tooling, and production-minded experimentation.",
    tags: ["MLOps", "Python", "Automation"],
    links: [{ label: "GitHub", url: "https://github.com/Upeshjeengar/MLOps" }],
  },
  {
    title: "GreentechEnergy",
    description:
      "Business website for Greentech Energy Rajsamand",
    tags: ["Web", "SCSS", "Business Site"],
    links: [{ label: "GitHub", url: "https://github.com/Upeshjeengar/GreentechEnergy" }],
  },
];

function createTagList(tags) {
  return tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
}

function renderProjects(grid, entries) {
  grid.innerHTML = entries
    .map(
      (project) => `
        <article class="project-card">
          <h3>${project.title}</h3>
          <div class="tag-list">${createTagList(project.tags)}</div>
          <p>${project.description}</p>
          <div class="project-links">
            ${
              project.links.length
                ? project.links
                    .map(
                      (link) =>
                        `<a href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`
                    )
                    .join("")
                : "<span>Professional project</span>"
            }
          </div>
        </article>
      `
    )
    .join("");
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

function initWorkflow() {
  const list = document.querySelector(".workflow-tabs");
  const tabs = Array.from(list.querySelectorAll("button"));
  const panels = tabs.map((tab) => document.getElementById(tab.dataset.panel));

  function selectTab(index) {
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
  }

  list.setAttribute("role", "tablist");
  list.setAttribute("aria-label", "Ticket workflows");
  tabs.forEach((tab, index) => {
    const panel = panels[index];
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panel.id);
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    panel.tabIndex = 0;
    tab.addEventListener("click", () => selectTab(index));
    tab.addEventListener("keydown", (event) => {
      let next;
      switch (event.key) {
        case "ArrowLeft": next = (index + tabs.length - 1) % tabs.length; break;
        case "ArrowRight": next = (index + 1) % tabs.length; break;
        case "Home": next = 0; break;
        case "End": next = tabs.length - 1; break;
        default: return;
      }
      event.preventDefault();
      selectTab(next);
      tabs[next].focus();
    });
  });

  selectTab(0);
  list.hidden = false;
}

const featuredProjects = projects.filter((project) => project.featured).slice(0, 4);
renderProjects(document.querySelector("#projectGrid"), featuredProjects);
const extraProjects = projects.filter((project) => !featuredProjects.includes(project));
renderProjects(document.querySelector("#extraProjectGrid"), extraProjects);
document.querySelector("#moreProjects").hidden = extraProjects.length === 0;
initWorkflow();
loadBlogs();
