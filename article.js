const STORAGE_KEY = "geohub_articles";

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function loadArticle() {
  const articleView = document.getElementById("article-view");
  const missingView = document.getElementById("article-missing");
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  if (!articleId) {
    missingView.hidden = false;
    return;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    missingView.hidden = false;
    return;
  }

  let articles = [];
  try {
    articles = JSON.parse(raw);
  } catch (err) {
    console.error("Could not read articles", err);
  }

  const article = articles.find((item) => item.id === articleId);
  if (!article) {
    missingView.hidden = false;
    return;
  }

  document.title = `${article.title} | GeoHub`;
  document.getElementById("article-date").textContent = formatDate(
    article.createdAt,
  );
  document.getElementById("article-title").textContent = article.title;
  document.getElementById("article-author").textContent =
    `By ${article.author}`;
  document.getElementById("article-summary").textContent = article.summary;
  document.getElementById("article-content").innerText = article.content;
  articleView.hidden = false;
}

document.addEventListener("DOMContentLoaded", loadArticle);
