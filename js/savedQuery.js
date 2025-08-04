document.addEventListener('DOMContentLoaded', function () {
    // Route create button to newQuery.html
    const createBtn = document.getElementById('create-new-query-btn');
    if (createBtn) {
        createBtn.onclick = function() {
            window.location.href = 'newQuery.html';
        };
    }
    // Load saved queries
    const savedQueriesList = document.getElementById('saved-queries-list');
    let savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
    if (!Array.isArray(savedQueries)) savedQueries = [];
    // Remove duplicates by name
    const uniqueByName = {};
    savedQueries.forEach(q => {
        if (typeof q === 'object' && q.name && !uniqueByName[q.name]) {
            uniqueByName[q.name] = q.query;
        }
    });
    const names = Object.keys(uniqueByName);
    function renderSavedQueries() {
        savedQueriesList.innerHTML = '';
        if (names.length === 0) {
            savedQueriesList.innerHTML = '<div style="color:#888; padding:1em;">No saved queries yet. Save a query from the query screen!</div>';
        } else {
            names.forEach(name => {
                const card = document.createElement('div');
                card.className = 'card-item';
                card.style.cursor = 'pointer';
                card.innerHTML = `
                    <span class="card-item-title">${name}</span>
                    <span class="card-item-desc">${uniqueByName[name]}</span>
                    <button class="delete-cross-btn" title="Delete" style="display:none;">&times;</button>
                `;
                const deleteBtn = card.querySelector('.delete-cross-btn');
                card.onmouseenter = function() { deleteBtn.style.display = 'block'; };
                card.onmouseleave = function() { deleteBtn.style.display = 'none'; };
                deleteBtn.onclick = function(e) {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this query?')) {
                        let savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
                        savedQueries = savedQueries.filter(q => q.name !== name);
                        localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
                        delete uniqueByName[name];
                        names.splice(names.indexOf(name), 1);
                        renderSavedQueries();
                    }
                };
                card.onclick = function(e) {
                    if (!e.target.classList.contains('delete-cross-btn')) {
                        window.location.href = 'newQuery.html?query=' + encodeURIComponent(uniqueByName[name]);
                    }
                };
                savedQueriesList.appendChild(card);
            });
        }
    }
    renderSavedQueries();
});

// Gemini API config
const GEMINI_API_KEY = "AIzaSyB8D1b17YFa37ZksnkP27qR8B8lF9O6n5Q";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function getGeminiSummary(promptText) {
    const payload = {
        contents: [
            {
                parts: [
                    { text: promptText }
                ]
            }
        ]
    };
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": GEMINI_API_KEY
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("API error: " + response.status);
        const data = await response.json();
        // Try to extract the answer text
        return data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data, null, 2);
    } catch (e) {
        return "Error: " + e.message;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const aiSummaryBtn = document.getElementById("ai-summary-btn");
    if (aiSummaryBtn) {
        aiSummaryBtn.addEventListener("click", async () => {
            aiSummaryBtn.disabled = true;
            aiSummaryBtn.textContent = "Loading...";
            // You can customize the prompt here or use selected query text
            const prompt = "Explain how AI works in a few words";
            const summary = await getGeminiSummary(prompt);
            alert("Gemini AI Summary:\n" + summary);
            aiSummaryBtn.disabled = false;
            aiSummaryBtn.textContent = "AI Summary";
        });
    }
});

(function() {
    const darkBtn = document.getElementById('theme-dark-btn');
    const lightBtn = document.getElementById('theme-light-btn');
    const slider = document.getElementById('theme-toggle-slider');
    const body = document.body;
    function setTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-mode');
            darkBtn.classList.add('selected');
            lightBtn.classList.remove('selected');
            slider.style.left = '2px';
        } else {
            body.classList.remove('dark-mode');
            darkBtn.classList.remove('selected');
            lightBtn.classList.add('selected');
            slider.style.left = 'calc(50% - 2px)';
        }
        localStorage.setItem('darkMode', isDark);
    }
    // Load preference
    const darkPref = localStorage.getItem('darkMode') === 'true';
    setTheme(darkPref);
    darkBtn.addEventListener('click', function() { setTheme(true); });
    lightBtn.addEventListener('click', function() { setTheme(false); });
})();
