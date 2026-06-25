function toggleTheme() {
    const body = document.body;
    const icon = document.querySelector('#themeToggle i');
    
    if (body.classList.contains('light')) {
        body.classList.remove('light');
        icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light');
        icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'light');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const body = document.body;
    const icon = document.querySelector('#themeToggle i');
    
    if (savedTheme === 'light') {
        body.classList.add('light');
        if (icon) icon.className = 'fas fa-sun';
    } else {
        body.classList.remove('light');
        if (icon) icon.className = 'fas fa-moon';
    }
}

document.addEventListener('DOMContentLoaded', loadTheme);