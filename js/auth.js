async function signup(username, email, password, avatarFile) {
    try {
        const result = await signUp(email, password, { username: username });
        
        if (!result.success) {
            return result;
        }
        
        const user = result.data.user;
        
        let avatarUrl = null;
        if (avatarFile) {
            const uploadResult = await uploadAvatar(avatarFile, user.id);
            if (uploadResult.success) {
                avatarUrl = uploadResult.url;
            }
        }
        
        const profileResult = await createUserProfile(user.id, username, email, avatarUrl);
        
        if (!profileResult.success) {
            return profileResult;
        }
        
        return { success: true, data: result.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function login(email, password, rememberMe) {
    try {
        const result = await signIn(email, password);
        
        if (!result.success) {
            return result;
        }
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('rememberMe');
        }
        
        return { success: true, data: result.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function logout() {
    try {
        const result = await signOut();
        localStorage.removeItem('rememberMe');
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function checkSession() {
    try {
        const session = await getSession();
        if (session) {
            return session;
        }
        
        if (localStorage.getItem('rememberMe') === 'true') {
            const { data, error } = await supabaseClient.auth.refreshSession();
            if (!error && data.session) {
                return data.session;
            }
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

async function requireAuth() {
    const session = await checkSession();
    if (!session) {
        window.location.href = 'index.html';
        return null;
    }
    return session;
}

async function getCurrentUserData() {
    const user = await getCurrentUser();
    if (!user) return null;
    
    const profile = await getUserProfile(user.id);
    if (!profile.success) return null;
    
    return {
        ...user,
        profile: profile.data
    };
}