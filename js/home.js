async function loadUserData() {
    const userData = await getCurrentUserData();
    if (!userData) return;
    document.getElementById('userName').textContent = userData.profile.username || 'Coder';
}

async function loadDashboard() {
    try {
        const user = await getCurrentUser();
        if (!user) return;
        
        const profile = await getUserProfile(user.id);
        if (!profile.success) return;
        const userData = profile.data;
        
        const solved = await getSolvedProblems(user.id);
        const solvedIds = solved.success ? solved.data.map(s => s.problem_id) : [];
        
        const problems = await getProblems();
        const totalProblems = problems.success ? problems.data.length : 0;
        
        const rank = await getUserRank(user.id);
        
        document.getElementById('rank').textContent = rank.success ? `#${rank.rank}` : '-';
        document.getElementById('score').textContent = userData.score || 0;
        document.getElementById('totalProblems').textContent = totalProblems;
        document.getElementById('solvedProblems').textContent = solvedIds.length;
        
        if (problems.success) {
            const easy = problems.data.filter(p => p.difficulty === 'easy');
            const medium = problems.data.filter(p => p.difficulty === 'medium');
            const hard = problems.data.filter(p => p.difficulty === 'hard');
            
            const easySolved = easy.filter(p => solvedIds.includes(p.id)).length;
            const mediumSolved = medium.filter(p => solvedIds.includes(p.id)).length;
            const hardSolved = hard.filter(p => solvedIds.includes(p.id)).length;
            
            document.getElementById('easyProgress').style.width = easy.length > 0 ? `${(easySolved / easy.length) * 100}%` : '0%';
            document.getElementById('easyCount').textContent = `${easySolved}/${easy.length}`;
            document.getElementById('mediumProgress').style.width = medium.length > 0 ? `${(mediumSolved / medium.length) * 100}%` : '0%';
            document.getElementById('mediumCount').textContent = `${mediumSolved}/${medium.length}`;
            document.getElementById('hardProgress').style.width = hard.length > 0 ? `${(hardSolved / hard.length) * 100}%` : '0%';
            document.getElementById('hardCount').textContent = `${hardSolved}/${hard.length}`;
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadLeaderboard() {
    try {
        const result = await getLeaderboard(10);
        const container = document.getElementById('leaderboardList');
        
        if (!result.success || !result.data.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No users yet</p>
                    <span>Be the first to join!</span>
                </div>
            `;
            return;
        }
        
        const medals = ['🥇', '🥈', '🥉'];
        const ranks = ['gold', 'silver', 'bronze'];
        
        container.innerHTML = result.data.map((user, index) => `
            <div class="leaderboard-item">
                <span class="leaderboard-rank ${index < 3 ? ranks[index] : ''}">
                    ${index < 3 ? medals[index] : `#${index + 1}`}
                </span>
                <div class="leaderboard-avatar">
                    <img src="${user.avatar || 'assets/default-avatar.png'}" alt="${user.username}">
                </div>
                <span class="leaderboard-name">${user.username}</span>
                <span class="leaderboard-score">${user.score || 0} pts</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

async function loadRecentActivity() {
    try {
        const user = await getCurrentUser();
        if (!user) return;
        
        const result = await getRecentSubmissions(user.id, 10);
        const container = document.getElementById('activityList');
        
        if (!result.success || !result.data.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No recent activity</p>
                    <span>Start solving problems to see your activity here</span>
                </div>
            `;
            return;
        }
        
        container.innerHTML = result.data.map(submission => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-code"></i>
                </div>
                <div class="activity-info">
                    <div class="activity-title">${submission.problems?.title || 'Unknown Problem'}</div>
                    <span class="activity-difficulty ${submission.problems?.difficulty || 'easy'}">
                        ${submission.problems?.difficulty || 'Easy'} • ${submission.status === 'accepted' ? '✅' : '❌'}
                    </span>
                </div>
                <span class="activity-time">${formatDate(submission.submitted_at)}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}