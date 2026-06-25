// Supabase Configuration - CubeAlgo
const SUPABASE_URL = 'https://rjnxpnyhpvcpxzxrcqfg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbnhwbnlocHZjcHh6eHJjcWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDYwNDksImV4cCI6MjA5Nzk4MjA0OX0.IIpm4vaFSesFjVayVTbLmR-YSjKWzfXv6fL2oC9j-Ag';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth functions
async function signUp(email, password, userData) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: userData
            }
        });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getSession() {
    try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return data.session;
    } catch (error) {
        return null;
    }
}

async function getCurrentUser() {
    try {
        const { data, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        return data.user;
    } catch (error) {
        return null;
    }
}

// Database functions
async function getUserProfile(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function createUserProfile(userId, username, email, avatarUrl) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .insert([{
                id: userId,
                username: username,
                email: email,
                avatar: avatarUrl || 'assets/default-avatar.png',
                score: 0,
                join_date: new Date().toISOString()
            }]);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .update(updates)
            .eq('id', userId);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getProblems(filters = {}) {
    try {
        let query = supabaseClient.from('problems').select('*');
        
        if (filters.difficulty) {
            query = query.eq('difficulty', filters.difficulty);
        }
        
        if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }
        
        const { data, error } = await query.order('id');
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getProblemById(problemId) {
    try {
        const { data, error } = await supabaseClient
            .from('problems')
            .select('*')
            .eq('id', problemId)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getSolvedProblems(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('solved_problems')
            .select('problem_id, solved_at')
            .eq('user_id', userId);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function saveSolvedProblem(userId, problemId) {
    try {
        const { data, error } = await supabaseClient
            .from('solved_problems')
            .insert([{
                user_id: userId,
                problem_id: problemId,
                solved_at: new Date().toISOString()
            }]);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function saveSubmission(userId, problemId, language, code, status, scoreEarned) {
    try {
        const { data, error } = await supabaseClient
            .from('submissions')
            .insert([{
                user_id: userId,
                problem_id: problemId,
                language: language,
                code: code,
                status: status,
                score_earned: scoreEarned || 0,
                submitted_at: new Date().toISOString()
            }]);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getLeaderboard(limit = 10) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('id, username, avatar, score')
            .order('score', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getUserRank(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('id, score')
            .order('score', { ascending: false });
        
        if (error) throw error;
        
        const rank = data.findIndex(user => user.id === userId) + 1;
        return { success: true, rank: rank > 0 ? rank : data.length + 1 };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getRecentSubmissions(userId, limit = 10) {
    try {
        const { data, error } = await supabaseClient
            .from('submissions')
            .select('*, problems(title, difficulty)')
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Storage functions
async function uploadAvatar(file, userId) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/avatar.${fileExt}`;
        
        const { data, error } = await supabaseClient
            .storage
            .from('avatars')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });
        
        if (error) throw error;
        
        const { data: urlData } = supabaseClient
            .storage
            .from('avatars')
            .getPublicUrl(fileName);
        
        return { success: true, url: urlData.publicUrl };
    } catch (error) {
        return { success: false, error: error.message };
    }
}