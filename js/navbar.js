// Dynamically load navbar.html into the #navbar div
function loadNavbar() {
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
            setupThemeToggle();
        });
}

document.addEventListener('DOMContentLoaded', loadNavbar);

function setupThemeToggle() {
    const darkBtn = document.getElementById('theme-dark-btn');
    const lightBtn = document.getElementById('theme-light-btn');
    const slider = document.getElementById('theme-toggle-slider');
    const body = document.body;
    function setTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-mode');
            if (darkBtn) darkBtn.classList.add('selected');
            if (lightBtn) lightBtn.classList.remove('selected');
            if (slider) slider.style.left = '2px';
        } else {
            body.classList.remove('dark-mode');
            if (darkBtn) darkBtn.classList.remove('selected');
            if (lightBtn) lightBtn.classList.add('selected');
            if (slider) slider.style.left = 'calc(50% - 2px)';
        }
        localStorage.setItem('darkMode', isDark);
    }
    // Load preference
    const darkPref = localStorage.getItem('darkMode') === 'true';
    setTheme(darkPref);
    if (darkBtn) darkBtn.addEventListener('click', function() { setTheme(true); });
    if (lightBtn) lightBtn.addEventListener('click', function() { setTheme(false); });
} 