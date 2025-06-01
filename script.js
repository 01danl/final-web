
let articles = [];

fetch('Articles.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to load Articles.json: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    if (!data.articles || !Array.isArray(data.articles) || data.articles.length === 0) {
      throw new Error('Invalid or empty articles data in JSON');
    }
    articles = data.articles;
    displayArticles(articles);
    updateMostPopular();
  })
  .catch(error => {
    console.error('Error:', error);
    document.getElementById('error-message').textContent = `Error loading articles: ${error.message}. Check if Articles.json exists and is valid.`;
  });

function displayArticles(articles) {
  const articleList = document.getElementById('article-list');
  articleList.innerHTML = '';
  if (articles.length === 0) {
    articleList.innerHTML = '<p>No articles available.</p>';
    return;
  }
  articles.forEach(article => {
    const readingTime = Math.ceil(article.wordCount / 200);
    const card = `
      <article class="col-sm-6 col-md-6 article-card">
        <h4>${article.title}</h4>
        <p>${article.content.substring(0, 120)}...</p>
        <p class="text-muted">Category: ${article.category} | ${article.date} | ${article.views} Views</p>
        <p class="text-muted">Reading Time: ${readingTime} min</p>
        <button class="btn btn-primary" onclick="showArticle(${article.id})">Read More</button>
      </article>
    `;
    articleList.innerHTML += card;
  });
}

function showArticle(id) {
  const article = articles.find(a => a.id === id);
  if (!article) {
    console.error('Article not found:', id);
    return;
  }
  article.views += 1;
  document.getElementById('modal-title').textContent = article.title;
  document.getElementById('modal-content').textContent = article.content;
  const readingTime = Math.ceil(article.wordCount / 200);
  document.getElementById('modal-meta').textContent = `Category: ${article.category} | ${article.date} | ${article.views} Views | Reading Time: ${readingTime} min`;
  updateMostPopular();
  $('#articleModal').modal('show');
}

function updateMostPopular() {
  if (!articles.length) return;
  const mostPopular = articles.reduce((max, a) => a.views > max.views ? a : max, articles[0]);
  document.getElementById('most-popular').innerHTML = `
    <h4>${mostPopular.title}</h4>
    <p class="text-muted">${mostPopular.views} Views</p>
    <button class="btn btn-primary btn-sm" onclick="showArticle(${mostPopular.id})">Read More</button>
  `;
}

document.getElementById('sort-select').addEventListener('change', function() {
  const sortBy = this.value;
  let sortedArticles = [...articles];
  if (sortBy === 'views') {
    sortedArticles.sort((a, b) => b.views - a.views);
  } else {
    sortedArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  displayArticles(sortedArticles);
});

document.getElementById('theme-toggle').addEventListener('click', function() {
  const currentTheme = document.body.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  this.textContent = newTheme === 'light' ? 'Dark Mode' : 'Light Mode';
});

const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);
document.getElementById('theme-toggle').textContent = savedTheme === 'light' ? 'Dark Mode' : 'Light Mode';