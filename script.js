const ARTICLE_STORAGE_KEY = "geohub_articles";
const SITE_STORAGE_KEY = "geohub_site_state";
const ADMIN_STORAGE_KEY = "geohub_admin_users";
const SESSION_STORAGE_KEY = "geohub_admin_session";
const SITE_SCHEMA_VERSION = 2;
const TEAM_PLACEHOLDER_IMAGE = "assets/member.png";

const SITE_PERMISSIONS = [
  { key: "manageArticles", label: "Articles" },
  { key: "manageStats", label: "Statistics" },
  { key: "manageTeam", label: "Team hierarchy" },
  { key: "managePartners", label: "Partners" },
];

const DEFAULT_SITE_STATE = {
  version: SITE_SCHEMA_VERSION,
  stats: [
    { id: "students", label: "Students Enrolled", value: "640+" },
    { id: "courses", label: "Courses Provided", value: "9" },
    { id: "trainees", label: "Trainees Completed Tracks", value: "480+" },
    { id: "events", label: "Events, Labs, And Workshops", value: "22" },
  ],
  team: [
    {
      id: "president",
      role: "President",
      name: "Abdelfattah Sabry",
      imagePath: TEAM_PLACEHOLDER_IMAGE,
    },
    {
      id: "vice-president",
      role: "Vice President",
      name: "Sara",
      imagePath: TEAM_PLACEHOLDER_IMAGE,
    },
    {
      id: "head-pr",
      role: "Head PR",
      name: "Mohamed Yahya",
      imagePath: TEAM_PLACEHOLDER_IMAGE,
    },
    {
      id: "head-it",
      role: "Head IT",
      name: "Bahaa Ahmed",
      imagePath: TEAM_PLACEHOLDER_IMAGE,
    },
    {
      id: "head-hr",
      role: "Head HR",
      name: "Open Position",
      imagePath: TEAM_PLACEHOLDER_IMAGE,
    },
    {
      id: "head-media-marketing",
      role: "Head Media and Marketing",
      name: "Ayman Magdy",
      imagePath: TEAM_PLACEHOLDER_IMAGE,
    },
  ],
  partners: [
    "EarthScan Solutions",
    "GeoVision Academy",
    "Nile Stratigraphy Center",
    "Desert Data Labs",
    "PetroCore Training Hub",
  ],
};

const DEFAULT_ARTICLES = [
  {
    id: crypto.randomUUID(),
    title: "How GeoHub Prepared 400+ Students For Field Mapping",
    author: "GeoHub Training Team",
    summary:
      "A season recap of training paths, field exercises, and mentorship sessions.",
    content:
      "Last season, GeoHub introduced a full mapping track that blended map interpretation, field observations, and reporting standards. Students moved from short practical sessions to simulation projects and ended with team presentations reviewed by experienced mentors.",
    createdAt: new Date("2026-01-21").toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Mineralogy Bootcamp: Lessons Learned",
    author: "Academic Affairs",
    summary:
      "Key outcomes from the bootcamp and what students can expect next season.",
    content:
      "The Mineralogy Bootcamp focused on optical mineral properties, practical classification, and sample analysis. Students completed mini assessments and hands-on activities designed to make laboratory interpretation more accurate and faster.",
    createdAt: new Date("2026-02-09").toISOString(),
  },
];

const DEFAULT_ADMINS = [
  {
    id: crypto.randomUUID(),
    name: "Sabry GeoHub",
    email: "geohub883@gmail.com",
    password: "Sabry.GeoHub!1",
    isMain: true,
    permissions: {
      manageArticles: true,
      manageStats: true,
      manageTeam: true,
      managePartners: true,
    },
  },
  {
    id: crypto.randomUUID(),
    name: "Bahaa GeoHub",
    email: "bahaaahmedofficial@gmail.com",
    password: "Bahaa.GeoHub!2",
    isMain: true,
    permissions: {
      manageArticles: true,
      manageStats: true,
      manageTeam: true,
      managePartners: true,
    },
  },
];

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getDefaultTeamMembers() {
  return DEFAULT_SITE_STATE.team.map((member) => ({ ...member }));
}

function normalizeTeamMember(member, fallbackMember) {
  const fallback = fallbackMember || {};
  return {
    id: member.id || fallback.id || crypto.randomUUID(),
    role: member.role || fallback.role || "Open Role",
    name: member.name || fallback.name || "Open Position",
    imagePath:
      typeof member.imagePath === "string" && member.imagePath.trim()
        ? member.imagePath.trim()
        : fallback.imagePath || "",
  };
}

function cloneSiteState(state) {
  return {
    version: SITE_SCHEMA_VERSION,
    stats: state.stats.map((item) => ({ ...item })),
    team: state.team.map((item, index) =>
      normalizeTeamMember(item, getDefaultTeamMembers()[index]),
    ),
    partners: [...state.partners],
  };
}

function migrateSiteState(rawState) {
  const defaults = cloneSiteState(DEFAULT_SITE_STATE);

  if (!rawState || typeof rawState !== "object") {
    return defaults;
  }

  const migrated = {
    version: SITE_SCHEMA_VERSION,
    stats: Array.isArray(rawState.stats) ? rawState.stats : defaults.stats,
    team: defaults.team.map((member, index) =>
      normalizeTeamMember(
        Array.isArray(rawState.team) ? rawState.team[index] || {} : {},
        member,
      ),
    ),
    partners: Array.isArray(rawState.partners)
      ? rawState.partners.filter((partner) => typeof partner === "string")
      : defaults.partners,
  };

  return migrated;
}

function getSiteState() {
  const raw = localStorage.getItem(SITE_STORAGE_KEY);
  if (!raw) {
    const defaults = cloneSiteState(DEFAULT_SITE_STATE);
    localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.stats) &&
      Array.isArray(parsed.team) &&
      Array.isArray(parsed.partners)
    ) {
      if (parsed.version === SITE_SCHEMA_VERSION) {
        return {
          version: SITE_SCHEMA_VERSION,
          stats: parsed.stats,
          team: parsed.team.map((member, index) =>
            normalizeTeamMember(member, getDefaultTeamMembers()[index]),
          ),
          partners: parsed.partners,
        };
      }

      const migrated = migrateSiteState(parsed);
      localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch (error) {
    console.error("Failed to parse saved site state", error);
  }

  const defaults = cloneSiteState(DEFAULT_SITE_STATE);
  localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveSiteState(siteState) {
  localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(siteState));
}

function getArticles() {
  const raw = localStorage.getItem(ARTICLE_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(ARTICLE_STORAGE_KEY, JSON.stringify(DEFAULT_ARTICLES));
    return [...DEFAULT_ARTICLES];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error("Failed to parse saved articles", error);
  }

  localStorage.setItem(ARTICLE_STORAGE_KEY, JSON.stringify(DEFAULT_ARTICLES));
  return [...DEFAULT_ARTICLES];
}

function saveArticles(articles) {
  localStorage.setItem(ARTICLE_STORAGE_KEY, JSON.stringify(articles));
}

function getDefaultAdmins() {
  return DEFAULT_ADMINS.map((admin) => ({
    ...admin,
    permissions: { ...admin.permissions },
  }));
}

function normalizeAdmin(admin) {
  return {
    id: admin.id || crypto.randomUUID(),
    name: typeof admin.name === "string" ? admin.name.trim() : "",
    email: normalizeEmail(admin.email || ""),
    password: typeof admin.password === "string" ? admin.password : "",
    isMain: Boolean(admin.isMain),
    permissions: {
      manageArticles: Boolean(
        admin.permissions && admin.permissions.manageArticles,
      ),
      manageStats: Boolean(admin.permissions && admin.permissions.manageStats),
      manageTeam: Boolean(admin.permissions && admin.permissions.manageTeam),
      managePartners: Boolean(
        admin.permissions && admin.permissions.managePartners,
      ),
    },
  };
}

function getAdmins() {
  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) {
    const defaults = getDefaultAdmins().map(normalizeAdmin);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const normalized = parsed.map(normalizeAdmin);
      const knownEmails = new Set(normalized.map((admin) => admin.email));
      for (const defaultAdmin of getDefaultAdmins()) {
        if (!knownEmails.has(defaultAdmin.email)) {
          normalized.push(normalizeAdmin(defaultAdmin));
        }
      }
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    }
  } catch (error) {
    console.error("Failed to parse saved admins", error);
  }

  const defaults = getDefaultAdmins().map(normalizeAdmin);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveAdmins(admins) {
  localStorage.setItem(
    ADMIN_STORAGE_KEY,
    JSON.stringify(admins.map(normalizeAdmin)),
  );
}

function getCurrentAdmin() {
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.email !== "string") return null;

    const admins = getAdmins();
    return (
      admins.find((admin) => admin.email === normalizeEmail(parsed.email)) ||
      null
    );
  } catch (error) {
    console.error("Failed to parse admin session", error);
    return null;
  }
}

function setCurrentAdmin(email) {
  sessionStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({ email: normalizeEmail(email) }),
  );
}

function clearCurrentAdmin() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function canManage(admin, permissionKey) {
  return Boolean(admin && (admin.isMain || admin.permissions[permissionKey]));
}

function renderArticles() {
  const list = document.getElementById("articles-list");
  const emptyState = document.getElementById("no-articles");
  if (!list || !emptyState) return;

  const articles = getArticles().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  list.innerHTML = "";
  if (articles.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  for (const article of articles) {
    const card = document.createElement("article");
    card.className = "article-card";

    const title = document.createElement("h3");
    title.textContent = article.title;

    const meta = document.createElement("p");
    meta.className = "article-meta";
    meta.textContent = `By ${article.author} | ${formatDate(article.createdAt)}`;

    const summary = document.createElement("p");
    summary.textContent = article.summary;

    const link = document.createElement("a");
    link.className = "read-more";
    link.href = `article.html?id=${encodeURIComponent(article.id)}`;
    link.textContent = "Read Article";

    card.append(title, meta, summary, link);
    list.appendChild(card);
  }
}

function renderStats() {
  const grid = document.getElementById("stats-grid");
  if (!grid) return;

  const siteState = getSiteState();
  grid.innerHTML = "";

  for (const item of siteState.stats) {
    const card = document.createElement("article");
    card.className = "stat-card";

    const value = document.createElement("h3");
    value.textContent = item.value;

    const label = document.createElement("p");
    label.textContent = item.label;

    card.append(value, label);
    grid.appendChild(card);
  }
}

function renderTeam() {
  const grid = document.getElementById("team-grid");
  if (!grid) return;

  const siteState = getSiteState();
  grid.innerHTML = "";

  siteState.team.forEach((member, index) => {
    const card = document.createElement("article");
    card.className = "team-card";

    if (index < 2) {
      card.classList.add("team-card-lead");
    }

    const avatar = document.createElement("div");
    avatar.className = "team-avatar";

    if (member.imagePath) {
      const image = document.createElement("img");
      image.src = member.imagePath;
      image.alt = member.name || member.role;
      image.loading = "lazy";
      image.addEventListener("error", () => {
        image.remove();
        avatar.classList.add("team-avatar-empty");
        avatar.textContent = "No Photo";
      });
      avatar.appendChild(image);
    } else {
      avatar.classList.add("team-avatar-empty");
      avatar.textContent = "No Photo";
    }

    const role = document.createElement("p");
    role.className = "member-role";
    role.textContent = member.role || "Open Role";

    const name = document.createElement("p");
    name.className = "member-name";
    name.textContent = member.name || "Open Position";

    card.append(avatar, role, name);
    grid.appendChild(card);
  });
}

function renderPartners() {
  const list = document.getElementById("partners-list");
  if (!list) return;

  const siteState = getSiteState();
  list.innerHTML = "";

  for (const partner of siteState.partners) {
    const item = document.createElement("li");
    item.textContent = partner;
    list.appendChild(item);
  }
}

function clearArticleForm() {
  const form = document.getElementById("article-form");
  if (form) {
    form.reset();
  }

  const idField = document.getElementById("article-id");
  if (idField) {
    idField.value = "";
  }
}

function renderAdminArticlesList() {
  const list = document.getElementById("admin-article-list");
  if (!list) return;

  const currentAdmin = getCurrentAdmin();
  if (!canManage(currentAdmin, "manageArticles")) {
    list.innerHTML = "";
    return;
  }

  const articles = getArticles().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  list.innerHTML = "";
  for (const article of articles) {
    const item = document.createElement("li");
    item.className = "admin-list-item";

    const details = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = article.title;
    const meta = document.createElement("p");
    meta.className = "muted";
    meta.textContent = `${article.author} | ${formatDate(article.createdAt)}`;
    details.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "admin-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn btn-outline btn-small";
    editButton.dataset.editArticle = article.id;
    editButton.textContent = "Edit";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-solid btn-small";
    deleteButton.dataset.deleteArticle = article.id;
    deleteButton.textContent = "Delete";

    actions.append(editButton, deleteButton);
    item.append(details, actions);
    list.appendChild(item);
  }
}

function renderPermissionBadges(admin) {
  const container = document.getElementById("admin-permissions");
  if (!container) return;

  container.innerHTML = "";
  const roleBadge = document.createElement("span");
  roleBadge.className = "permission-badge permission-badge-main";
  roleBadge.textContent = admin.isMain
    ? "Main Administrator"
    : "Restricted Administrator";
  container.appendChild(roleBadge);

  for (const permission of SITE_PERMISSIONS) {
    if (admin.isMain || admin.permissions[permission.key]) {
      const badge = document.createElement("span");
      badge.className = "permission-badge";
      badge.textContent = permission.label;
      container.appendChild(badge);
    }
  }
}

function setSectionVisibility(sectionId, isVisible) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.hidden = !isVisible;
  }
}

function renderAdminWorkspace() {
  const currentAdmin = getCurrentAdmin();
  const panel = document.getElementById("admin-panel");
  const loginForm = document.getElementById("admin-login");
  const summary = document.getElementById("admin-session-summary");
  const adminList = document.getElementById("admin-list");

  if (!panel || !loginForm) return;

  if (!currentAdmin) {
    panel.hidden = true;
    loginForm.hidden = false;
    return;
  }

  panel.hidden = false;
  loginForm.hidden = true;

  if (summary) {
    summary.textContent = `${currentAdmin.name} | ${currentAdmin.email}`;
  }

  renderPermissionBadges(currentAdmin);

  setSectionVisibility("admin-admins-section", currentAdmin.isMain);
  setSectionVisibility(
    "admin-articles-section",
    canManage(currentAdmin, "manageArticles"),
  );
  setSectionVisibility(
    "admin-stats-section",
    canManage(currentAdmin, "manageStats"),
  );
  setSectionVisibility("admin-team-section", Boolean(currentAdmin.isMain));
  setSectionVisibility(
    "admin-partners-section",
    canManage(currentAdmin, "managePartners"),
  );

  if (adminList) {
    renderAdminList();
  }

  renderAdminArticlesList();
  renderStatsEditor();
  renderTeamEditor();
  renderPartnersEditor();
}

function renderAdminList() {
  const list = document.getElementById("admin-list");
  if (!list) return;

  const currentAdmin = getCurrentAdmin();
  if (!currentAdmin || !currentAdmin.isMain) {
    list.innerHTML = "";
    return;
  }

  const admins = getAdmins().sort(
    (a, b) =>
      Number(b.isMain) - Number(a.isMain) || a.name.localeCompare(b.name),
  );
  list.innerHTML = "";

  for (const admin of admins) {
    const item = document.createElement("li");
    item.className = "admin-list-item admin-list-item-stack";

    const details = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = admin.name || admin.email;
    const email = document.createElement("p");
    email.className = "muted";
    email.textContent = admin.email;

    const permissions = document.createElement("div");
    permissions.className = "permission-badges permission-badges-inline";
    const roleBadge = document.createElement("span");
    roleBadge.className = "permission-badge permission-badge-main";
    roleBadge.textContent = admin.isMain ? "Main" : "Restricted";
    permissions.appendChild(roleBadge);

    for (const permission of SITE_PERMISSIONS) {
      if (admin.isMain || admin.permissions[permission.key]) {
        const badge = document.createElement("span");
        badge.className = "permission-badge";
        badge.textContent = permission.label;
        permissions.appendChild(badge);
      }
    }

    details.append(name, email, permissions);

    const actions = document.createElement("div");
    actions.className = "admin-actions";

    if (!admin.isMain) {
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "btn btn-outline btn-small";
      editButton.dataset.editAdmin = admin.id;
      editButton.textContent = "Edit";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "btn btn-solid btn-small";
      deleteButton.dataset.deleteAdmin = admin.id;
      deleteButton.textContent = "Delete";

      actions.append(editButton, deleteButton);
    } else {
      const locked = document.createElement("span");
      locked.className = "muted";
      locked.textContent = "Locked";
      actions.appendChild(locked);
    }

    item.append(details, actions);
    list.appendChild(item);
  }
}

function getAdminFormElements() {
  return {
    form: document.getElementById("admin-form"),
    message: document.getElementById("admin-form-message"),
    idField: document.getElementById("admin-record-id"),
    nameField: document.getElementById("admin-name"),
    emailField: document.getElementById("admin-email-input"),
    passwordField: document.getElementById("admin-new-password"),
    permissions: {
      manageArticles: document.getElementById("perm-articles"),
      manageStats: document.getElementById("perm-stats"),
      manageTeam: document.getElementById("perm-team"),
      managePartners: document.getElementById("perm-partners"),
    },
  };
}

function clearAdminForm() {
  const elements = getAdminFormElements();
  if (elements.form) {
    elements.form.reset();
  }
  if (elements.idField) {
    elements.idField.value = "";
  }
  if (elements.message) {
    elements.message.textContent = "";
  }
}

function renderAdminFormFromAdmin(admin) {
  const elements = getAdminFormElements();
  if (
    !elements.form ||
    !elements.idField ||
    !elements.nameField ||
    !elements.emailField ||
    !elements.passwordField
  ) {
    return;
  }

  elements.idField.value = admin.id;
  elements.nameField.value = admin.name;
  elements.emailField.value = admin.email;
  elements.passwordField.value = "";
  elements.permissions.manageArticles.checked = Boolean(
    admin.permissions.manageArticles,
  );
  elements.permissions.manageStats.checked = Boolean(
    admin.permissions.manageStats,
  );
  elements.permissions.manageTeam.checked = Boolean(
    admin.permissions.manageTeam,
  );
  elements.permissions.managePartners.checked = Boolean(
    admin.permissions.managePartners,
  );

  if (elements.message) {
    elements.message.textContent = `Editing ${admin.email}`;
  }
}

function renderStatsEditor() {
  const currentAdmin = getCurrentAdmin();
  if (!canManage(currentAdmin, "manageStats")) return;

  const siteState = getSiteState();
  const map = new Map(siteState.stats.map((item) => [item.id, item]));

  const students = document.getElementById("stat-students");
  const courses = document.getElementById("stat-courses");
  const trainees = document.getElementById("stat-trainees");
  const events = document.getElementById("stat-events");

  if (students && map.has("students"))
    students.value = map.get("students").value;
  if (courses && map.has("courses")) courses.value = map.get("courses").value;
  if (trainees && map.has("trainees"))
    trainees.value = map.get("trainees").value;
  if (events && map.has("events")) events.value = map.get("events").value;
}

function renderTeamEditor() {
  const currentAdmin = getCurrentAdmin();
  const list = document.getElementById("team-editor-list");
  if (!list || !currentAdmin || !currentAdmin.isMain) return;

  const siteState = getSiteState();
  list.innerHTML = "";

  for (const member of siteState.team) {
    const row = document.createElement("div");
    row.className = "editor-row editor-row-team";

    const roleLabel = document.createElement("label");
    roleLabel.textContent = "Role";
    const roleValue = document.createElement("span");
    roleValue.className = "editor-static-value";
    roleValue.textContent = member.role || "Open Role";
    roleLabel.appendChild(roleValue);

    const previewWrap = document.createElement("div");
    previewWrap.className = "team-preview";
    const previewImage = document.createElement("img");
    previewImage.className = "team-preview-image";
    previewImage.alt = member.name || member.role || "Team member";
    previewImage.src = member.imagePath || TEAM_PLACEHOLDER_IMAGE;
    previewImage.addEventListener("error", () => {
      previewImage.src = TEAM_PLACEHOLDER_IMAGE;
    });
    previewWrap.appendChild(previewImage);

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Name";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = member.name || "";
    nameInput.className = "team-name-input";
    nameLabel.appendChild(nameInput);

    const imageLabel = document.createElement("label");
    imageLabel.textContent = "Picture Path";
    const imageInput = document.createElement("input");
    imageInput.type = "text";
    imageInput.value = member.imagePath || "";
    imageInput.className = "team-image-input";
    imageLabel.appendChild(imageInput);

    const actions = document.createElement("div");
    actions.className = "editor-row-actions";

    const placeholderButton = document.createElement("button");
    placeholderButton.type = "button";
    placeholderButton.className = "btn btn-outline btn-small";
    placeholderButton.textContent = "Use Placeholder";
    placeholderButton.dataset.usePlaceholder = TEAM_PLACEHOLDER_IMAGE;

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "btn btn-outline btn-small";
    clearButton.textContent = "Remove Picture";
    clearButton.dataset.clearPicture = "true";

    actions.append(placeholderButton, clearButton);

    row.append(previewWrap, roleLabel, nameLabel, imageLabel, actions);
    list.appendChild(row);
  }
}

function renderPartnersEditor() {
  const currentAdmin = getCurrentAdmin();
  const list = document.getElementById("partners-editor-list");
  if (!list || !canManage(currentAdmin, "managePartners")) return;

  const siteState = getSiteState();
  list.innerHTML = "";

  for (const partner of siteState.partners) {
    const row = document.createElement("div");
    row.className = "editor-row";

    const label = document.createElement("label");
    label.textContent = "Partner Name";
    const input = document.createElement("input");
    input.type = "text";
    input.value = partner;
    label.appendChild(input);

    const actions = document.createElement("div");
    actions.className = "editor-row-actions";
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn-outline btn-small";
    removeButton.textContent = "Remove";
    removeButton.dataset.removeRow = "true";
    actions.appendChild(removeButton);

    row.append(label, actions);
    list.appendChild(row);
  }

  if (siteState.partners.length === 0) {
    const row = document.createElement("div");
    row.className = "editor-row";
    const label = document.createElement("label");
    label.textContent = "Partner Name";
    const input = document.createElement("input");
    input.type = "text";
    label.appendChild(input);
    row.append(label);
    list.appendChild(row);
  }
}

function initPartnersToggle() {
  const toggle = document.getElementById("partners-toggle");
  const list = document.getElementById("partners-list");
  if (!toggle || !list) return;

  toggle.addEventListener("click", () => {
    const open = !list.hidden;
    list.hidden = open;
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.textContent = open
      ? "Show Previous Partners"
      : "Hide Previous Partners";
  });
}

function initAdminLogin() {
  const loginForm = document.getElementById("admin-login");
  const message = document.getElementById("login-message");
  const logoutBtn = document.getElementById("logout-admin");
  if (!loginForm || !message || !logoutBtn) return;

  renderAdminWorkspace();

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailField = document.getElementById("admin-email");
    const passwordField = document.getElementById("admin-password");
    if (!emailField || !passwordField) return;

    const email = normalizeEmail(emailField.value);
    const password = passwordField.value;
    const admin = getAdmins().find(
      (item) => item.email === email && item.password === password,
    );

    if (admin) {
      setCurrentAdmin(admin.email);
      message.textContent = "";
      emailField.value = "";
      passwordField.value = "";
      renderAdminWorkspace();
      return;
    }

    message.textContent = "Invalid email or password.";
  });

  logoutBtn.addEventListener("click", () => {
    clearCurrentAdmin();
    clearArticleForm();
    clearAdminForm();
    renderAdminWorkspace();
    const loginMessage = document.getElementById("login-message");
    if (loginMessage) {
      loginMessage.textContent = "";
    }
  });
}

function initAdminForm() {
  const form = document.getElementById("admin-form");
  const list = document.getElementById("admin-list");
  const resetButton = document.getElementById("reset-admin-form");
  if (!form || !list || !resetButton) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const currentAdmin = getCurrentAdmin();
    const message = document.getElementById("admin-form-message");
    if (!currentAdmin || !currentAdmin.isMain) {
      if (message) {
        message.textContent =
          "Only the main administrators can manage administrator accounts.";
      }
      return;
    }

    const idField = document.getElementById("admin-record-id");
    const nameField = document.getElementById("admin-name");
    const emailField = document.getElementById("admin-email-input");
    const passwordField = document.getElementById("admin-new-password");

    if (!idField || !nameField || !emailField || !passwordField) return;

    const name = nameField.value.trim();
    const email = normalizeEmail(emailField.value);
    const password = passwordField.value.trim();
    const existingId = idField.value;

    if (!name || !email) {
      if (message) {
        message.textContent = "Name and email are required.";
      }
      return;
    }

    const admins = getAdmins();
    const duplicate = admins.find(
      (admin) => admin.email === email && admin.id !== existingId,
    );
    if (duplicate) {
      if (message) {
        message.textContent =
          "That email is already assigned to another administrator.";
      }
      return;
    }

    const permissions = {
      manageArticles: Boolean(
        document.getElementById("perm-articles")?.checked,
      ),
      manageStats: Boolean(document.getElementById("perm-stats")?.checked),
      manageTeam: Boolean(document.getElementById("perm-team")?.checked),
      managePartners: Boolean(
        document.getElementById("perm-partners")?.checked,
      ),
    };

    let updated = false;
    const nextAdmins = admins.map((admin) => {
      if (admin.id !== existingId) {
        return admin;
      }

      updated = true;
      return {
        ...admin,
        name,
        email,
        password: password || admin.password,
        permissions,
      };
    });

    if (!updated) {
      if (!password) {
        if (message) {
          message.textContent = "Password is required for a new administrator.";
        }
        return;
      }

      nextAdmins.push({
        id: crypto.randomUUID(),
        name,
        email,
        password,
        isMain: false,
        permissions,
      });
    }

    saveAdmins(nextAdmins);
    clearAdminForm();
    renderAdminList();
    renderAdminWorkspace();
    if (message) {
      message.textContent = "Administrator saved.";
    }
  });

  list.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const editId = target.dataset.editAdmin;
    const deleteId = target.dataset.deleteAdmin;

    if (editId) {
      const admin = getAdmins().find((item) => item.id === editId);
      if (admin && !admin.isMain) {
        renderAdminFormFromAdmin(admin);
      }
    }

    if (deleteId) {
      const admin = getAdmins().find((item) => item.id === deleteId);
      if (!admin || admin.isMain) return;

      if (!window.confirm(`Delete administrator ${admin.email}?`)) {
        return;
      }

      const remaining = getAdmins().filter((item) => item.id !== deleteId);
      saveAdmins(remaining);
      clearAdminForm();
      renderAdminList();
    }
  });

  resetButton.addEventListener("click", clearAdminForm);
}

function initArticleForm() {
  const form = document.getElementById("article-form");
  const adminList = document.getElementById("admin-article-list");
  const resetBtn = document.getElementById("reset-form");
  if (!form || !adminList || !resetBtn) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const currentAdmin = getCurrentAdmin();
    if (!canManage(currentAdmin, "manageArticles")) return;

    const idField = document.getElementById("article-id");
    const titleField = document.getElementById("article-title");
    const authorField = document.getElementById("article-author");
    const summaryField = document.getElementById("article-summary");
    const contentField = document.getElementById("article-content");

    if (
      !idField ||
      !titleField ||
      !authorField ||
      !summaryField ||
      !contentField
    )
      return;

    const id = idField.value;
    const title = titleField.value.trim();
    const author = authorField.value.trim();
    const summary = summaryField.value.trim();
    const content = contentField.value.trim();

    if (!title || !author || !summary || !content) return;

    const articles = getArticles();
    if (id) {
      const index = articles.findIndex((article) => article.id === id);
      if (index !== -1) {
        articles[index] = {
          ...articles[index],
          title,
          author,
          summary,
          content,
        };
      }
    } else {
      articles.push({
        id: crypto.randomUUID(),
        title,
        author,
        summary,
        content,
        createdAt: new Date().toISOString(),
      });
    }

    saveArticles(articles);
    clearArticleForm();
    renderArticles();
    renderAdminArticlesList();
  });

  adminList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const editId = target.dataset.editArticle;
    const deleteId = target.dataset.deleteArticle;

    if (editId) {
      const article = getArticles().find((item) => item.id === editId);
      if (!article) return;

      const idField = document.getElementById("article-id");
      const titleField = document.getElementById("article-title");
      const authorField = document.getElementById("article-author");
      const summaryField = document.getElementById("article-summary");
      const contentField = document.getElementById("article-content");

      if (
        !idField ||
        !titleField ||
        !authorField ||
        !summaryField ||
        !contentField
      )
        return;

      idField.value = article.id;
      titleField.value = article.title;
      authorField.value = article.author;
      summaryField.value = article.summary;
      contentField.value = article.content;
    }

    if (deleteId) {
      const remaining = getArticles().filter((item) => item.id !== deleteId);
      saveArticles(remaining);
      renderArticles();
      renderAdminArticlesList();
      clearArticleForm();
    }
  });

  resetBtn.addEventListener("click", clearArticleForm);
}

function initStatsForm() {
  const form = document.getElementById("stats-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const currentAdmin = getCurrentAdmin();
    if (!canManage(currentAdmin, "manageStats")) return;

    const siteState = getSiteState();
    const message = document.getElementById("stats-form-message");
    const values = {
      students: document.getElementById("stat-students")?.value.trim() || "",
      courses: document.getElementById("stat-courses")?.value.trim() || "",
      trainees: document.getElementById("stat-trainees")?.value.trim() || "",
      events: document.getElementById("stat-events")?.value.trim() || "",
    };

    siteState.stats = siteState.stats.map((item) => ({
      ...item,
      value: values[item.id] || item.value,
    }));

    saveSiteState(siteState);
    renderStats();
    if (message) {
      message.textContent = "Statistics saved.";
    }
  });
}

function initTeamForm() {
  const form = document.getElementById("team-form");
  const list = document.getElementById("team-editor-list");
  if (!form || !list) return;

  list.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const row = target.closest(".editor-row");
    if (!row) return;

    if (target.dataset.usePlaceholder) {
      const imageInput = row.querySelector(".team-image-input");
      if (imageInput) {
        imageInput.value = TEAM_PLACEHOLDER_IMAGE;
      }
    }

    if (target.dataset.clearPicture) {
      const imageInput = row.querySelector(".team-image-input");
      if (imageInput) {
        imageInput.value = "";
      }
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin || !currentAdmin.isMain) return;

    const rows = Array.from(list.querySelectorAll(".editor-row"));
    const defaultTeamMembers = getDefaultTeamMembers();
    const team = rows
      .map((row) => {
        const inputs = row.querySelectorAll("input");
        const name = inputs[0]?.value.trim() || "";
        const imagePath = inputs[1]?.value.trim() || "";
        return { name, imagePath };
      })
      .map((member, index) => ({
        ...defaultTeamMembers[index],
        name: member.name || defaultTeamMembers[index].name,
        imagePath: member.imagePath,
      }));

    const siteState = getSiteState();
    siteState.team = team;
    saveSiteState(siteState);
    renderTeam();
    renderTeamEditor();

    const message = document.getElementById("team-form-message");
    if (message) {
      message.textContent = "Team hierarchy saved.";
    }
  });
}

function initPartnersForm() {
  const form = document.getElementById("partners-form");
  const addButton = document.getElementById("add-partner");
  const list = document.getElementById("partners-editor-list");
  if (!form || !addButton || !list) return;

  addButton.addEventListener("click", () => {
    const currentAdmin = getCurrentAdmin();
    if (!canManage(currentAdmin, "managePartners")) return;

    const row = document.createElement("div");
    row.className = "editor-row";
    const label = document.createElement("label");
    label.textContent = "Partner Name";
    const input = document.createElement("input");
    input.type = "text";
    label.appendChild(input);

    const actions = document.createElement("div");
    actions.className = "editor-row-actions";
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "btn btn-outline btn-small";
    removeButton.textContent = "Remove";
    removeButton.dataset.removeRow = "true";
    actions.appendChild(removeButton);

    row.append(label, actions);
    list.appendChild(row);
  });

  list.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.dataset.removeRow) {
      const row = target.closest(".editor-row");
      if (row) row.remove();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const currentAdmin = getCurrentAdmin();
    if (!canManage(currentAdmin, "managePartners")) return;

    const partners = Array.from(list.querySelectorAll("input"))
      .map((input) => input.value.trim())
      .filter(Boolean);

    const siteState = getSiteState();
    siteState.partners = partners;
    saveSiteState(siteState);
    renderPartners();
    renderPartnersEditor();

    const message = document.getElementById("partners-form-message");
    if (message) {
      message.textContent = "Partners saved.";
    }
  });
}

function init() {
  getArticles();
  getSiteState();
  getAdmins();
  renderArticles();
  renderStats();
  renderTeam();
  renderPartners();
  initPartnersToggle();
  initAdminLogin();
  initAdminForm();
  initArticleForm();
  initStatsForm();
  initTeamForm();
  initPartnersForm();
  renderAdminWorkspace();
}

document.addEventListener("DOMContentLoaded", init);
