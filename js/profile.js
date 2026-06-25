async function loadProfile() {
    try {
        const user = await getCurrentUser();
        if (!user) return;
        
        const profile = await getUserProfile(user.id);
        if (!profile.success) return;
        
        const userData = profile.data;
        
        document.getElementById('profileUsername').textContent = userData.username || 'User';
        document.getElementById('profileEmail').textContent = user.email || 'No email';
        document.getElementById('profileAvatar').src = userData.avatar || 'assets/default-avatar.png';
        
        if (userData.join_date) {
            document.getElementById('joinDate').textContent = new Date(userData.join_date).toLocaleDateString();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadStats() {
    try {
        const user = await getCurrentUser();
        if (!user) return;
        
        const profile = await getUserProfile(user.id);
        if (!profile.success) return;
        
        const userData = profile.data;
        const solved = await getSolvedProblems(user.id);
        if (!solved.success) return;
        
        const solvedIds = solved.data.map(s => s.problem_id);
        const problems = await getProblems();
        if (!problems.success) return;
        
        const allProblems = problems.data;
        const totalProblems = allProblems.length;
        const submissions = await getRecentSubmissions(user.id, 1000);
        const rank = await getUserRank(user.id);
        
        document.getElementById('profileScore').textContent = userData.score || 0;
        document.getElementById('profileSolved').textContent = solvedIds.length;
        document.getElementById('profileRank').textContent = rank.success ? `#${rank.rank}` : '-';
        document.getElementById('profileSubmissions').textContent = submissions.success ? submissions.data.length : 0;
        
        const easy = allProblems.filter(p => p.difficulty === 'easy');
        const medium = allProblems.filter(p => p.difficulty === 'medium');
        const hard = allProblems.filter(p => p.difficulty === 'hard');
        
        const easySolved = easy.filter(p => solvedIds.includes(p.id)).length;
        const mediumSolved = medium.filter(p => solvedIds.includes(p.id)).length;
        const hardSolved = hard.filter(p => solvedIds.includes(p.id)).length;
        
        document.getElementById('profileEasyProgress').style.width = easy.length > 0 ? `${(easySolved / easy.length) * 100}%` : '0%';
        document.getElementById('profileEasyCount').textContent = `${easySolved}/${easy.length}`;
        document.getElementById('profileMediumProgress').style.width = medium.length > 0 ? `${(mediumSolved / medium.length) * 100}%` : '0%';
        document.getElementById('profileMediumCount').textContent = `${mediumSolved}/${medium.length}`;
        document.getElementById('profileHardProgress').style.width = hard.length > 0 ? `${(hardSolved / hard.length) * 100}%` : '0%';
        document.getElementById('profileHardCount').textContent = `${hardSolved}/${hard.length}`;
        
        loadRecentProblems(solved.data, allProblems);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadRecentProblems(solvedData, allProblems) {
    const container = document.getElementById('recentProblems');
    
    if (!solvedData.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No problems solved yet</p>
                <span>Start solving to build your portfolio</span>
            </div>
        `;
        return;
    }
    
    const recent = solvedData
        .sort((a, b) => new Date(b.solved_at) - new Date(a.solved_at))
        .slice(0, 10);
    
    container.innerHTML = recent.map(item => {
        const problem = allProblems.find(p => p.id === item.problem_id);
        if (!problem) return '';
        return `
            <div class="recent-problem-item">
                <span class="problem-title">${problem.title}</span>
                <span class="problem-difficulty ${problem.difficulty}">${problem.difficulty}</span>
                <span class="problem-time">${formatDate(item.solved_at)}</span>
            </div>
        `;
    }).join('');
}

async function loadAchievements() {
    try {
        const user = await getCurrentUser();
        if (!user) return;
        
        const profile = await getUserProfile(user.id);
        if (!profile.success) return;
        
        const score = profile.data.score || 0;
        const solved = await getSolvedProblems(user.id);
        const solvedCount = solved.success ? solved.data.length : 0;
        
        const achievements = [
            { id: 'beginner', name: 'Beginner', icon: '🌟', desc: 'Start your journey', condition: solvedCount >= 1 },
            { id: '50_points', name: '50 Points', icon: '⭐', desc: 'Earn 50 points', condition: score >= 50 },
            { id: 'problem_solver', name: 'Problem Solver', icon: '🏆', desc: 'Solve 10 problems', condition: solvedCount >= 10 },
            { id: '200_points', name: '200 Points', icon: '💎', desc: 'Earn 200 points', condition: score >= 200 },
            { id: 'rising_coder', name: 'Rising Coder', icon: '🚀', desc: 'Solve 25 problems', condition: solvedCount >= 25 },
            { id: '500_points', name: '500 Points', icon: '👑', desc: 'Earn 500 points', condition: score >= 500 },
            { id: 'master_coder', name: 'Master Coder', icon: '🎯', desc: 'Solve 50 problems', condition: solvedCount >= 50 },
            { id: '1000_points', name: '1000 Points', icon: '💫', desc: 'Earn 1000 points', condition: score >= 1000 },
            { id: 'legend', name: 'Legend', icon: '🌟', desc: 'Solve 100 problems', condition: solvedCount >= 100 },
            { id: '2500_points', name: '2500 Points', icon: '🏅', desc: 'Earn 2500 points', condition: score >= 2500 }
        ];
        
        const container = document.getElementById('achievementsGrid');
        
        container.innerHTML = achievements.map(ach => `
            <div class="achievement-card ${ach.condition ? '' : 'locked'}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.desc}</div>
                ${ach.condition ? '<div style="color: var(--success); font-size: 0.7rem;">✓ Unlocked</div>' : '<div style="color: var(--text-muted); font-size: 0.7rem;">🔒 Locked</div>'}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading achievements:', error);
    }
}

async function uploadAvatar(file) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not logged in' };
        
        const result = await uploadAvatar(file, user.id);
        if (!result.success) return result;
        
        await updateUserProfile(user.id, { avatar: result.url });
        return { success: true, url: result.url };
    } catch (error) {
        return { success: false, error: error.message };
    }
}