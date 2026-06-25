// Problems page functions
let allProblems = [];
let solvedIds = [];
let currentFilter = 'all';
let currentSearch = '';
let currentPage = 1;
const itemsPerPage = 10;

// Make them globally accessible
window.currentFilter = currentFilter;
window.currentSearch = currentSearch;
window.currentPage = currentPage;

async function loadProblems() {
    try {
        const user = await getCurrentUser();
        const problemsBody = document.getElementById('problemsBody');
        
        problemsBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="loading-skeleton">
                        <div class="skeleton-row"></div>
                        <div class="skeleton-row"></div>
                        <div class="skeleton-row"></div>
                        <div class="skeleton-row"></div>
                        <div class="skeleton-row"></div>
                    </div>
                </td>
            </tr>
        `;
        
        const result = await getProblems();
        if (!result.success) {
            problemsBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Error loading problems</p>
                            <span>${result.error}</span>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        allProblems = result.data;
        
        if (user) {
            const solved = await getSolvedProblems(user.id);
            if (solved.success) {
                solvedIds = solved.data.map(s => s.problem_id);
            }
        }
        
        applyFiltersAndRender();
    } catch (error) {
        console.error('Error loading problems:', error);
    }
}

// Make loadProblems globally accessible
window.loadProblems = loadProblems;

function applyFiltersAndRender() {
    let filtered = [...allProblems];
    
    if (currentFilter !== 'all') {
        if (currentFilter === 'solved') {
            filtered = filtered.filter(p => solvedIds.includes(p.id));
        } else if (currentFilter === 'unsolved') {
            filtered = filtered.filter(p => !solvedIds.includes(p.id));
        } else {
            filtered = filtered.filter(p => p.difficulty === currentFilter);
        }
    }
    
    if (currentSearch) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(currentSearch) ||
            p.id.toString().includes(currentSearch)
        );
    }
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filtered.slice(start, end);
    
    renderProblems(pageItems, filtered.length, currentPage, totalPages);
}

function renderProblems(problems, total, page, totalPages) {
    const problemsBody = document.getElementById('problemsBody');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (!problems.length) {
        problemsBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>No problems found</p>
                        <span>Try adjusting your search or filters</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    problemsBody.innerHTML = problems.map(problem => {
        const isSolved = solvedIds.includes(problem.id);
        return `
            <tr class="clickable" data-id="${problem.id}">
                <td>${problem.id}</td>
                <td>${problem.title}</td>
                <td>
                    <span class="difficulty-badge ${problem.difficulty}">
                        ${problem.difficulty}
                    </span>
                </td>
                <td>${problem.score || 10}</td>
                <td>
                    <span class="status-badge ${isSolved ? 'solved' : 'unsolved'}">
                        ${isSolved ? '✅ Solved' : '❌ Unsolved'}
                    </span>
                </td>
                <td>
                    <button class="solve-btn" onclick="window.location.href='solve.html?id=${problem.id}'">
                        Solve
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    document.querySelectorAll('.problems-table tbody tr.clickable').forEach(row => {
        row.addEventListener('click', function() {
            const id = this.dataset.id;
            window.location.href = `solve.html?id=${id}`;
        });
    });
    
    pageInfo.textContent = `Page ${page} of ${totalPages || 1}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
}

// Make applyFiltersAndRender globally accessible
window.applyFiltersAndRender = applyFiltersAndRender;