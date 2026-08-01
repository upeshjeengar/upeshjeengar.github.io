const projects = [
  {
    title: "VLM from Scratch",
    description:
      "Built a BLIP-2 style vision-language model by contrastively training a Q-Former to align ViT image embeddings with text, then finetuned SmolLM-135M.",
    tags: ["Python", "LLMs", "Computer Vision", "PyTorch"],
    links: [{ label: "GitHub", url: "https://github.com/Upeshjeengar/vlm" }],
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
    title: "CompliFlow Lite",
    description:
      "Built a governed multi-agent enterprise workflow automation system that turns employee requests into auditable workflows or grounded policy answers, using RAG, deterministic guardrails, human approvals, and mocked Jira, ServiceNow, SAP Ariba, DocuSign, Okta, and Slack integrations.",
    tags: ["Multi-Agent Systems", "RAG", "NVIDIA NIM", "Guardrails", "Enterprise Automation"],
    links: [],
    featured: true,
  },
  {
    title: "Open Source Contribution: fast-rlm",
    description:
      "Contributed a merged robustness fix to fast-rlm so step-cost display handles missing usage cost safely for local, free, or unknown-cost runs instead of assuming every backend returns billable cost data.",
    tags: ["Open Source", "TypeScript", "CLI", "LLM Tooling"],
    links: [{ label: "Merged PR", url: "https://github.com/avbiswas/fast-rlm/pull/3" }],
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

function renderProjects() {
  const grid = document.querySelector("#projectGrid");
  grid.innerHTML = projects
    .map(
      (project) => `
        <article class="project-card ${project.featured ? "featured" : ""}">
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
  }).format(new Date(value));
}

function renderBlogs(blogs) {
  const grid = document.querySelector("#blogGrid");

  if (!blogs.length) {
    grid.innerHTML = `<article class="blog-card"><h3>No blogs yet</h3><p>Add a blog entry to blogs/blogs.json and it will appear here.</p></article>`;
    return;
  }

  grid.innerHTML = blogs
    .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
    .map(
      (blog) => `
        <article class="blog-card">
          <time datetime="${blog.dateCreated}">${formatDate(blog.dateCreated)}</time>
          <h3>${blog.title}</h3>
          <p>${blog.summary}</p>
          <a class="text-link" href="${blog.link}" ${
        blog.external ? 'target="_blank" rel="noreferrer"' : ""
      }>Read blog</a>
        </article>
      `
    )
    .join("");
}

async function loadBlogs() {
  try {
    const response = await fetch("blogs/blogs.json");
    if (!response.ok) {
      throw new Error(`Could not load blogs: ${response.status}`);
    }
    const blogs = await response.json();
    renderBlogs(blogs);
  } catch (error) {
    renderBlogs([
      {
        title: "Getting Started With the Portfolio Blog",
        dateCreated: "2026-06-02",
        link: "blogs/getting-started.html",
        summary:
          "A starter post showing the HTML blog format and how the JSON-driven blog section works.",
      },
    ]);
  }
}

renderProjects();
loadBlogs();
