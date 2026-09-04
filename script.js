/**
 * NEXUS FORGE STUDIOS - Complete Game Studio Engine & Supabase Cloud Backend
 * 
 * Connected Backend:
 * - Supabase Project: https://nxzdwkjlcomvunewmvle.supabase.co
 * 
 * Features:
 * - Supabase Cloud Database Integration (Messages, Games Catalog, Profiles)
 * - User & Player Management (View all users, last login timestamps, 1-click Block/Unblock)
 * - Strict 1-Time Unique Email Registration
 * - Automatic Local Storage Fallback & Offline Resilience
 * - Dynamic Game Catalog CRUD (Add, Edit, Remove Games)
 * - Interactive Analytics Graphs (Traffic, Progress, Daily/Monthly Logins)
 * - Unified Auth & Session Routing (Admin vs Player)
 * - Gated Contact Inquiries into Developer Inbox
 */

// ----------------------------------------------------
// 1. Supabase Cloud Configuration
// ----------------------------------------------------
const SUPABASE_CONFIG = {
    url: 'https://nxzdwkjlcomvunewmvle.supabase.co',
    anonKey: 'sb_publishable_ERMzgZnW-dtl9lCl2nWxwg_cjOj5AqB'
};

let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Connected to Supabase Cloud Backend at:', SUPABASE_CONFIG.url);
    } catch (err) {
        console.warn('⚠️ Supabase init warning:', err);
    }
}

// Local Storage Keys for offline / fallback
const STORAGE_KEYS = {
    MESSAGES: 'nexus_forge_messages',
    USERS: 'nexus_forge_registered_users',
    CURRENT_USER: 'nexus_forge_session_user',
    GAMES: 'nexus_forge_games_catalog',
    LOGINS: 'nexus_forge_login_events',
    ABOUT: 'nexus_forge_about_content',
    REVIEWS: 'nexus_forge_game_reviews'
};

// Default Seed Reviews
const DEFAULT_SEED_REVIEWS = [
    {
        id: 'rev-1',
        gameId: 'cyber-vanguard',
        authorName: 'Alex Mercer',
        authorEmail: 'alex.mercer@gmail.com',
        rating: 5,
        comment: 'The cyber katana combat animations and particle effects look phenomenal. Combat is super fluid and reminds me of Cyberpunk meets Devil May Cry!',
        date: '2026-08-27 14:30',
        featured: true
    },
    {
        id: 'rev-2',
        gameId: 'cyber-vanguard',
        authorName: 'Valkyrie77',
        authorEmail: 'valkyrie.cyber@outlook.com',
        rating: 5,
        comment: 'High FPS on PC and the atmospheric lighting in Unity HDRP is stunning. Can\'t wait for the full Steam release!',
        date: '2026-08-28 09:15',
        featured: false
    },
    {
        id: 'rev-3',
        gameId: 'shadows-eldoria',
        authorName: 'EldoriaKnight',
        authorEmail: 'knight@eldoria.com',
        rating: 5,
        comment: 'Blender 3D creature designs are incredible. The dark gothic castle dungeon environment is full of tension.',
        date: '2026-08-26 19:40',
        featured: true
    },
    {
        id: 'rev-4',
        gameId: 'cosmic-drift',
        authorName: 'StarPilot_X',
        authorEmail: 'pilot@nexus.com',
        rating: 4,
        comment: 'Thruster mechanics and zero-g physics in Unity feel very responsive. The neon synthwave vibe is awesome.',
        date: '2026-08-28 11:20',
        featured: false
    }
];

function getStoredReviews() {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!raw) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEFAULT_SEED_REVIEWS));
        return DEFAULT_SEED_REVIEWS;
    }
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SEED_REVIEWS;
    } catch (e) {
        return DEFAULT_SEED_REVIEWS;
    }
}

function saveStoredReviews(reviews) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
}

function getGameReviews(gameId) {
    const all = getStoredReviews();
    return all.filter(r => r.gameId === gameId);
}

function calculateGameRating(gameId) {
    const reviews = getGameReviews(gameId);
    if (reviews.length === 0) return { avg: 5.0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    return {
        avg: (sum / reviews.length).toFixed(1),
        count: reviews.length
    };
}

async function addGameReview(gameId, authorName, authorEmail, rating, comment) {
    const reviews = getStoredReviews();
    const now = new Date();
    const dateStr = now.getFullYear() + '-' 
        + String(now.getMonth() + 1).padStart(2, '0') + '-' 
        + String(now.getDate()).padStart(2, '0') + ' ' 
        + String(now.getHours()).padStart(2, '0') + ':' 
        + String(now.getMinutes()).padStart(2, '0');

    const newRev = {
        id: 'rev-' + Date.now(),
        gameId: gameId,
        authorName: authorName,
        authorEmail: authorEmail,
        rating: parseInt(rating) || 5,
        comment: comment.trim(),
        date: dateStr,
        featured: false
    };

    reviews.unshift(newRev);
    saveStoredReviews(reviews);

    if (supabaseClient) {
        try {
            await supabaseClient.from('reviews').insert([newRev]);
        } catch (e) {
            console.warn('Supabase review insert error:', e);
        }
    }

    return newRev;
}

// Default Seed About Us Content
const DEFAULT_SEED_ABOUT = {
    badge: 'The Developer & Vision',
    headline: 'Passionate Indie Game Dev & 3D Digital Sculptor',
    bio1: 'Hello! I am A. Rehman, an independent game developer and 3D artist behind Nexus Forge Studios. My focus is crafting atmospheric, mechanically engaging games from scratch using the power of Unity Engine and Blender.',
    bio2: 'Every game is born from a desire to combine cinematic visuals, fluid real-time combat, and expansive sci-fi and fantasy lore. From modeling custom 3D character meshes and hard-surface weaponry to architecting scalable C# gameplay systems, I manage the full end-to-end production cycle.',
    skillUnity: 95,
    skillBlender: 92,
    skillCSharp: 90,
    skillShader: 88,
    pillar1Title: 'Tight, Responsive Controls',
    pillar1Desc: 'Gameplay always comes first. Every jump, sword strike, and thruster pulse is engineered with frame-accurate responsiveness and satisfying audio-visual punch.',
    pillar2Title: 'Handcrafted 3D Artistry',
    pillar2Desc: 'We don\'t rely on generic asset store packs. All key characters, enemies, environments, and HUD elements are designed from scratch in Blender.',
    pillar3Title: 'Optimization & Smooth FPS',
    pillar3Desc: 'High graphics quality shouldn\'t come at the cost of stuttering frames. We utilize GPU instancing, occlusion culling, and LOD hierarchies in Unity.'
};

function getAboutContent() {
    const raw = localStorage.getItem(STORAGE_KEYS.ABOUT);
    if (!raw) {
        localStorage.setItem(STORAGE_KEYS.ABOUT, JSON.stringify(DEFAULT_SEED_ABOUT));
        return DEFAULT_SEED_ABOUT;
    }
    try {
        return JSON.parse(raw) || DEFAULT_SEED_ABOUT;
    } catch (e) {
        return DEFAULT_SEED_ABOUT;
    }
}

function saveAboutContent(aboutObj) {
    localStorage.setItem(STORAGE_KEYS.ABOUT, JSON.stringify(aboutObj));
}

// Admin Credentials
const ADMIN_CREDENTIALS = {
    email: 'arehman.ilahe@gmail.com',
    username: 'admin',
    password: 'admin123',
    name: 'A. Rehman (Admin)'
};

// Default Seed Games
const DEFAULT_SEED_GAMES = [
    {
        id: 'cyber-vanguard',
        title: 'Cyber Vanguard',
        category: 'scifi',
        categoryLabel: 'Cyberpunk / Sci-Fi',
        engine: 'Unity 2023 & Blender 3D',
        status: 'Playable Alpha',
        statusCode: 'playable',
        image: 'images/game1.jpg',
        description: 'Set in dystopian Neo-Kyoto in 2088, Cyber Vanguard puts you in control of an augmented Ronin operative fighting through corporate enclaves. Featuring fast-paced katana melee combat, energy abilities, and volumetric ray-traced neon environments modeled in Blender.',
        genre: 'Action RPG / Cyberpunk',
        platforms: 'PC (Steam), Itch.io',
        tags: ['Cyberpunk', 'Action RPG', 'Hack & Slash']
    },
    {
        id: 'shadows-eldoria',
        title: 'Shadows of Eldoria',
        category: 'fantasy',
        categoryLabel: 'Dark Fantasy / RPG',
        engine: 'Unity URP & Blender 3D',
        status: 'In Development',
        statusCode: 'in-dev',
        image: 'images/game2.jpg',
        description: 'Explore the cursed ruins of the kingdom of Eldoria. Master responsive sword-and-shield combat against terrifying mythical beasts. Built with custom physics, procedural dungeon layouts, and hand-sculpted monster assets crafted in Blender.',
        genre: 'Dark Fantasy / Soulslike',
        platforms: 'PC, PS5 (Target)',
        tags: ['Dark Fantasy', 'Soulslike', 'Boss Battles']
    },
    {
        id: 'cosmic-drift',
        title: 'Cosmic Drift: Deep Space',
        category: 'scifi',
        categoryLabel: 'Sci-Fi / Space Sim',
        engine: 'Unity HDRP & Blender',
        status: 'Playable Demo',
        statusCode: 'playable',
        image: 'images/game3.jpg',
        description: 'Pilot your custom exploration vessel across unexplored star systems. Land on uncharted alien worlds with glowing crystalline ecosystems, extract rare minerals, build planetary research outposts, and survive harsh atmospheric storms.',
        genre: 'Sci-Fi Survival / Space Sim',
        platforms: 'PC (Windows / Linux)',
        tags: ['Space Sim', 'Planetary Survival', 'Crafting']
    }
];

// Seed Messages
const DEFAULT_SEED_MESSAGES = [
    {
        id: 'msg-1700000001',
        name: 'Marcus Vance',
        email: 'marcus.vance@indiegamepublisher.com',
        subject: 'Publisher Inquiry - Cyber Vanguard Alpha Demo',
        message: 'Hi Rehman,\n\nI tested the early combat mechanics in your Cyber Vanguard build and was very impressed by the responsive katana combos and volumetric lighting in Unity. Our indie publishing label would love to discuss funding or distribution options for your Steam release.\n\nBest regards,\nMarcus Vance\nHead of Acquisitions',
        date: '2026-08-27 15:40',
        read: false
    },
    {
        id: 'msg-1700000002',
        name: 'Elena Rostova',
        email: 'elena.3d@artstation-community.org',
        subject: 'Commission for Custom 3D Monster Sculpt in Blender',
        message: 'Hello A. Rehman,\n\nI saw the gothic beast sculpts in Shadows of Eldoria—amazing topology and weight painting! I am currently directing a dark fantasy game and would like to commission 3 custom boss models from you in Blender.\n\nPlease let me know your rates and availability.',
        date: '2026-08-28 09:15',
        read: false
    },
    {
        id: 'msg-1700000003',
        name: 'Liam Chen',
        email: 'liam.chen.games@gmail.com',
        subject: 'Playtest Feedback for Cosmic Drift Demo 1.2',
        message: 'Hey Rehman! Played the Cosmic Drift demo for 2 hours today. The alien crystal planet aesthetics and ship thruster physics feel great. I noticed a small collision glitch near the western mountain ridge, but overall it is super smooth on PC 60fps. Keep up the awesome work!',
        date: '2026-08-28 11:20',
        read: true
    }
];

// Seed Login Analytics History
const DEFAULT_LOGIN_ANALYTICS = {
    daily: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
        playerLogins: [38, 45, 52, 60, 84, 115, 95],
        newSignups: [12, 15, 18, 22, 35, 48, 40]
    },
    monthly: {
        labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        playerLogins: [620, 850, 1100, 1450, 1920, 2480],
        newSignups: [180, 260, 340, 480, 650, 820]
    }
};

// ----------------------------------------------------
// 2. Games Catalog CRUD (Cloud + Local)
// ----------------------------------------------------
function getStoredGames() {
    const raw = localStorage.getItem(STORAGE_KEYS.GAMES);
    if (!raw) {
        localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(DEFAULT_SEED_GAMES));
        return DEFAULT_SEED_GAMES;
    }
    try {
        return JSON.parse(raw) || DEFAULT_SEED_GAMES;
    } catch (e) {
        return DEFAULT_SEED_GAMES;
    }
}

function saveStoredGames(games) {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
}

async function addOrUpdateGame(gameData) {
    const games = getStoredGames();
    const existingIndex = games.findIndex(g => g.id === gameData.id);

    if (existingIndex >= 0) {
        games[existingIndex] = { ...games[existingIndex], ...gameData };
    } else {
        if (!gameData.id) {
            gameData.id = 'game-' + Date.now();
        }
        games.unshift(gameData);
    }

    saveStoredGames(games);

    // Sync with Supabase Cloud if connected
    if (supabaseClient) {
        try {
            await supabaseClient.from('games').upsert({
                id: gameData.id,
                title: gameData.title,
                category: gameData.category,
                category_label: gameData.categoryLabel,
                engine: gameData.engine,
                status: gameData.status,
                status_code: gameData.statusCode,
                image: gameData.image,
                description: gameData.description,
                genre: gameData.genre,
                platforms: gameData.platforms,
                tags: gameData.tags
            });
        } catch (e) {
            console.warn('Supabase cloud sync error:', e);
        }
    }

    return games;
}

async function deleteGameById(id) {
    let games = getStoredGames();
    games = games.filter(g => g.id !== id);
    saveStoredGames(games);

    if (supabaseClient) {
        try {
            await supabaseClient.from('games').delete().eq('id', id);
        } catch (e) {
            console.warn('Supabase delete error:', e);
        }
    }

    return games;
}

// ----------------------------------------------------
// 3. Messages Store (Cloud + Local)
// ----------------------------------------------------
function getStoredMessages() {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_SEED_MESSAGES));
        return DEFAULT_SEED_MESSAGES;
    }
    try {
        return JSON.parse(raw) || [];
    } catch (e) {
        return DEFAULT_SEED_MESSAGES;
    }
}

function saveStoredMessages(messages) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

async function addMessageToInbox(name, email, subject, messageText) {
    const messages = getStoredMessages();
    const now = new Date();
    const formattedDate = now.getFullYear() + '-' 
        + String(now.getMonth() + 1).padStart(2, '0') + '-' 
        + String(now.getDate()).padStart(2, '0') + ' ' 
        + String(now.getHours()).padStart(2, '0') + ':' 
        + String(now.getMinutes()).padStart(2, '0');

    const newMessage = {
        id: 'msg-' + Date.now(),
        name: name,
        email: email,
        subject: subject,
        message: messageText,
        date: formattedDate,
        read: false
    };

    messages.unshift(newMessage);
    saveStoredMessages(messages);

    // Save to Supabase Cloud if connected
    if (supabaseClient) {
        try {
            await supabaseClient.from('messages').insert([{
                name: name,
                email: email,
                subject: subject,
                message: messageText,
                is_read: false
            }]);
            console.log('☁️ Message saved to Supabase cloud!');
        } catch (e) {
            console.warn('Supabase insert message error:', e);
        }
    }

    return newMessage;
}

async function deleteMessageById(id) {
    let messages = getStoredMessages();
    messages = messages.filter(m => m.id !== id);
    saveStoredMessages(messages);

    if (supabaseClient) {
        try {
            await supabaseClient.from('messages').delete().eq('id', id);
        } catch (e) {
            console.warn('Supabase delete message error:', e);
        }
    }

    return messages;
}

async function setMessageReadStatus(id, isRead) {
    const messages = getStoredMessages();
    const target = messages.find(m => m.id === id);
    if (target) {
        target.read = isRead;
        saveStoredMessages(messages);
    }

    if (supabaseClient) {
        try {
            await supabaseClient.from('messages').update({ is_read: isRead }).eq('id', id);
        } catch (e) {
            console.warn('Supabase update read status error:', e);
        }
    }

    return messages;
}

// ----------------------------------------------------
// 4. Unified Auth & User Management Engine
// ----------------------------------------------------
const DEFAULT_SEED_USERS = [
    {
        id: 'usr-1700000001',
        name: 'Alex Mercer',
        email: 'alex.mercer@gmail.com',
        password: 'player123',
        createdAt: '2026-08-25 14:20',
        lastLogin: '2026-08-28 11:30',
        status: 'active'
    },
    {
        id: 'usr-1700000002',
        name: 'Valkyrie77',
        email: 'valkyrie.cyber@outlook.com',
        password: 'player123',
        createdAt: '2026-08-26 18:45',
        lastLogin: '2026-08-28 14:10',
        status: 'active'
    },
    {
        id: 'usr-1700000003',
        name: 'SpamBot_99',
        email: 'spambot99@fakeinbox.com',
        password: 'player123',
        createdAt: '2026-08-27 03:12',
        lastLogin: '2026-08-27 03:15',
        status: 'blocked'
    }
];

// Blocked Emails list persistence for cross-device admin enforcement
function getBlockedEmails() {
    const raw = localStorage.getItem('nexus_forge_blocked_emails');
    try {
        return raw ? JSON.parse(raw) : ['spambot99@fakeinbox.com'];
    } catch (e) {
        return ['spambot99@fakeinbox.com'];
    }
}

function saveBlockedEmails(list) {
    localStorage.setItem('nexus_forge_blocked_emails', JSON.stringify(list));
}

function mergeCloudUsers(cloudProfiles) {
    const localUsers = getRegisteredUsers();
    const blockedEmails = getBlockedEmails();
    const usersMap = new Map();

    // 1. Seed / existing local accounts
    localUsers.forEach(u => {
        if (u && u.email) {
            usersMap.set(u.email.toLowerCase(), u);
        }
    });

    // 2. Merge from Supabase cloud profiles
    if (Array.isArray(cloudProfiles)) {
        cloudProfiles.forEach(p => {
            if (!p || !p.email) return;
            const cleanEmail = p.email.toLowerCase();
            const existing = usersMap.get(cleanEmail);
            const isBlocked = blockedEmails.includes(cleanEmail) || (existing && existing.status === 'blocked');
            const formattedDate = p.created_at 
                ? new Date(p.created_at).toISOString().replace('T', ' ').substring(0, 16) 
                : (existing ? existing.createdAt : '2026-08-31 12:00');

            usersMap.set(cleanEmail, {
                id: p.id || (existing ? existing.id : 'usr-' + Date.now()),
                name: p.name || (existing ? existing.name : 'Studio Player'),
                email: cleanEmail,
                password: p.password || (existing ? existing.password : 'player123'),
                createdAt: existing ? existing.createdAt : formattedDate,
                lastLogin: existing ? existing.lastLogin : formattedDate,
                status: isBlocked ? 'blocked' : 'active'
            });
        });
    }

    const mergedList = Array.from(usersMap.values());
    saveRegisteredUsers(mergedList);
    return mergedList;
}

async function fetchUsersFromCloud() {
    if (!supabaseClient) return getRegisteredUsers();
    try {
        const { data: cloudProfiles, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && Array.isArray(cloudProfiles)) {
            console.log(`🌐 Supabase Sync: Fetched ${cloudProfiles.length} registered profiles from cloud.`);
            return mergeCloudUsers(cloudProfiles);
        } else if (error) {
            console.warn('⚠️ Cloud profiles fetch error:', error);
        }
    } catch (e) {
        console.warn('⚠️ Cloud users fetch notice:', e);
    }
    return getRegisteredUsers();
}

function getRegisteredUsers() {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_SEED_USERS));
        return DEFAULT_SEED_USERS;
    }
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SEED_USERS;
    } catch (e) {
        return DEFAULT_SEED_USERS;
    }
}

function saveRegisteredUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getCurrentSession() {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function setCurrentSession(userObj) {
    if (userObj) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));
    } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
}

async function loginUnified(identifier, password) {
    const cleanId = identifier.trim().toLowerCase();

    // Check Admin credentials
    if (
        (cleanId === ADMIN_CREDENTIALS.email.toLowerCase() || cleanId === ADMIN_CREDENTIALS.username.toLowerCase()) &&
        password === ADMIN_CREDENTIALS.password
    ) {
        const adminSession = {
            name: ADMIN_CREDENTIALS.name,
            email: ADMIN_CREDENTIALS.email,
            role: 'admin'
        };
        setCurrentSession(adminSession);
        return { success: true, role: 'admin', user: adminSession };
    }

    // Always fetch latest profiles from Supabase Cloud to ensure cross-device accounts work instantly
    await fetchUsersFromCloud();

    // Check Registered Users
    const users = getRegisteredUsers();
    const foundUser = users.find(u => 
        (u.email.toLowerCase() === cleanId || u.name.toLowerCase() === cleanId) && 
        u.password === password
    );

    if (foundUser) {
        // Check if user is BLOCKED by administrator
        const blockedEmails = getBlockedEmails();
        if (foundUser.status === 'blocked' || blockedEmails.includes(foundUser.email.toLowerCase())) {
            return {
                success: false,
                error: '⛔ Access Denied: Your account has been suspended by the administrator.'
            };
        }

        // Update last login timestamp
        const now = new Date();
        foundUser.lastLogin = now.getFullYear() + '-' 
            + String(now.getMonth() + 1).padStart(2, '0') + '-' 
            + String(now.getDate()).padStart(2, '0') + ' ' 
            + String(now.getHours()).padStart(2, '0') + ':' 
            + String(now.getMinutes()).padStart(2, '0');
        saveRegisteredUsers(users);

        const userSession = {
            name: foundUser.name,
            email: foundUser.email,
            role: 'user'
        };
        setCurrentSession(userSession);
        return { success: true, role: 'user', user: userSession };
    }

    return { success: false, error: 'Invalid email/username or password.' };
}

async function registerUser(name, email, password) {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if trying to register as admin email
    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
        return { success: false, error: 'This email is reserved for the studio administrator.' };
    }

    // Sync cloud users first to ensure strict cross-device 1-time email uniqueness
    await fetchUsersFromCloud();

    // STRICT 1-TIME EMAIL VALIDATION: No duplicate emails allowed!
    const users = getRegisteredUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        return { 
            success: false, 
            error: '⚠️ This email address is already registered. Each email can only be used once.' 
        };
    }

    const now = new Date();
    const formattedDate = now.getFullYear() + '-' 
        + String(now.getMonth() + 1).padStart(2, '0') + '-' 
        + String(now.getDate()).padStart(2, '0') + ' ' 
        + String(now.getHours()).padStart(2, '0') + ':' 
        + String(now.getMinutes()).padStart(2, '0');

    let assignedId = 'usr-' + Date.now();

    // Persist to Supabase Cloud Profiles table
    if (supabaseClient) {
        try {
            const { data: inserted, error: insErr } = await supabaseClient
                .from('profiles')
                .insert([{
                    name: name.trim(),
                    email: cleanEmail,
                    password: password,
                    role: 'user'
                }])
                .select();

            if (!insErr && inserted && inserted.length > 0) {
                assignedId = inserted[0].id;
                console.log('✅ Registered user saved directly to Supabase cloud:', assignedId);
            } else if (insErr) {
                console.warn('⚠️ Supabase profile insert warning:', insErr);
            }
        } catch (e) {
            console.warn('⚠️ Supabase register notice:', e);
        }
    }

    const newUser = {
        id: assignedId,
        name: name.trim(),
        email: cleanEmail,
        password: password,
        createdAt: formattedDate,
        lastLogin: formattedDate,
        status: 'active'
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    const userSession = {
        name: newUser.name,
        email: newUser.email,
        role: 'user'
    };
    setCurrentSession(userSession);

    return { success: true, role: 'user', user: userSession };
}

async function toggleBlockUser(id) {
    const users = getRegisteredUsers();
    const target = users.find(u => u.id === id || u.email === id);
    if (!target) return;

    const newStatus = target.status === 'blocked' ? 'active' : 'blocked';
    target.status = newStatus;

    const blockedEmails = getBlockedEmails();
    const cleanEmail = target.email.toLowerCase();
    if (newStatus === 'blocked') {
        if (!blockedEmails.includes(cleanEmail)) blockedEmails.push(cleanEmail);
    } else {
        const idx = blockedEmails.indexOf(cleanEmail);
        if (idx !== -1) blockedEmails.splice(idx, 1);
    }
    saveBlockedEmails(blockedEmails);
    saveRegisteredUsers(users);

    renderAdminStats();
    renderAdminUsersTable();
    showToast(newStatus === 'blocked' 
        ? `⛔ User ${target.name} (${target.email}) is now BLOCKED.` 
        : `✅ User ${target.name} has been UNBLOCKED.`
    );
}

async function deleteUserAccount(id) {
    if (confirm('⚠️ Are you sure you want to permanently delete this user account?')) {
        let users = getRegisteredUsers();
        const target = users.find(u => u.id === id || u.email === id);
        users = users.filter(u => u.id !== id && u.email !== id);
        saveRegisteredUsers(users);

        if (supabaseClient && target) {
            try {
                await supabaseClient.from('profiles').delete().or(`id.eq.${id},email.eq.${target.email}`);
                console.log('🗑️ Deleted user profile from Supabase cloud:', target.email);
            } catch (e) {
                console.warn('⚠️ Supabase delete user notice:', e);
            }
        }

        renderAdminStats();
        renderAdminUsersTable();
        showToast('🗑️ User account deleted permanently.');
    }
}

window.logoutUnified = function() {
    setCurrentSession(null);
    showToast('👋 You have been logged out.');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 300);
};

// ----------------------------------------------------
// 5. Dynamic Header Auth State Renderer
// ----------------------------------------------------
function renderNavAuth() {
    const containers = document.querySelectorAll('.nav-auth-container');
    const session = getCurrentSession();

    containers.forEach(container => {
        if (!session) {
            container.innerHTML = `
                <a href="login.html" class="nav-signin-btn">
                    <i class="fa-solid fa-user"></i> Sign In
                </a>
            `;
        } else if (session.role === 'admin') {
            container.innerHTML = `
                <div class="nav-auth-box">
                    <a href="admin.html" class="nav-admin-badge">
                        <i class="fa-solid fa-crown"></i> Admin Panel
                    </a>
                    <button class="nav-logout-btn" onclick="logoutUnified()" title="Log out">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="nav-auth-box">
                    <div class="nav-user-badge">
                        <i class="fa-solid fa-user-check"></i> ${escapeHtml(session.name)}
                    </div>
                    <button class="nav-logout-btn" onclick="logoutUnified()" title="Log out">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            `;
        }
    });
}

// ----------------------------------------------------
// 6. Document Ready Setup
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    renderNavAuth();

    // Mobile nav toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const siteHeader = document.querySelector('.site-header');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            mobileToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
            });
        });
    }

    window.addEventListener('scroll', () => {
        if (siteHeader) {
            if (window.scrollY > 40) {
                siteHeader.classList.add('scrolled');
            } else {
                siteHeader.classList.remove('scrolled');
            }
        }
    });

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Render Public Games if on games.html or index.html
    renderPublicGamesList();

    // Render Dynamic About Us Content if on about.html
    renderPublicAboutPage();

    // Initial Cloud Sync with Supabase
    syncFromCloud();

    // Gated Contact Page Logic
    initContactPage();

    // Unified Login Page Logic
    initLoginPage();

    // Admin Dashboard Logic
    initAdminDashboard();

    // Animated Counters
    initCounters();

    // Render Dedicated Game Ratings Hub if on games.html
    renderPageReviewsHub();

    // Floating Cyberpunk OST Music Player
    initMusicPlayer();
});

// ----------------------------------------------------
// 7. Public Games List Rendering
// ----------------------------------------------------
function renderPublicGamesList() {
    const publicGamesGrid = document.querySelector('.games-grid');
    if (!publicGamesGrid) return;

    const games = getStoredGames();
    if (!games || games.length === 0) return;

    publicGamesGrid.innerHTML = games.map(game => {
        const tags = Array.isArray(game.tags) ? game.tags : [game.categoryLabel || '3D Game'];
        const isPlayable = game.statusCode === 'playable' || (game.status && game.status.toLowerCase().includes('play'));
        const ratingData = calculateGameRating(game.id);

        return `
            <div class="game-card" data-category="${game.category || 'all'}">
                <div class="game-thumb-wrapper">
                    <img src="${escapeHtml(game.image || 'images/hero.jpg')}" alt="${escapeHtml(game.title)} Screenshot" width="600" height="340" loading="lazy" onerror="this.src='images/hero.jpg'" />
                    <span class="game-status-badge ${isPlayable ? 'status-playable' : 'status-in-dev'}">
                        ${escapeHtml(game.status || 'In Development')}
                    </span>
                    <span class="star-rating-badge" style="position: absolute; top: 0.8rem; left: 0.8rem; z-index: 2; background: rgba(13, 17, 26, 0.85); backdrop-filter: blur(8px);">
                        <i class="fa-solid fa-star" style="color: #f59e0b;"></i> ${ratingData.avg} <span style="color: var(--text-dim); font-size: 0.75rem;">(${ratingData.count})</span>
                    </span>
                </div>
                <div class="game-card-body">
                    <div class="game-tags">
                        ${tags.map(t => `<span class="game-tag">${escapeHtml(t)}</span>`).join('')}
                    </div>
                    <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
                    <p class="game-card-desc">${escapeHtml(game.description)}</p>
                    <div class="game-card-footer">
                        <span class="game-engine-badge"><i class="fa-brands fa-unity"></i> ${escapeHtml(game.engine || 'Unity + Blender')}</span>
                        <button class="btn btn-outline-cyan" onclick="openGameModal('${game.id}')">
                            <i class="fa-solid fa-eye"></i> Reviews & Specs
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    initGameFilters();
}

function initGameFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const gameCards = document.querySelectorAll('.game-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            gameCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => { card.style.opacity = '1'; }, 50);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => { card.style.display = 'none'; }, 200);
                }
            });
        });
    });
}

window.openGameModal = function(gameId) {
    const games = getStoredGames();
    const game = games.find(g => g.id === gameId);
    const modalOverlay = document.getElementById('gameModal');
    if (!game || !modalOverlay) return;

    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalFeatures = document.getElementById('modalFeatures');

    if (modalImg) modalImg.src = game.image || 'images/hero.jpg';
    if (modalTitle) modalTitle.textContent = game.title;
    if (modalDesc) modalDesc.textContent = game.description;

    const ratingData = calculateGameRating(game.id);
    const reviews = getGameReviews(game.id);
    const session = getCurrentSession();

    if (modalFeatures) {
        modalFeatures.innerHTML = `
            <div class="modal-feature-item">
                <strong>Genre</strong>
                <span>${escapeHtml(game.genre || game.categoryLabel || 'Action RPG')}</span>
            </div>
            <div class="modal-feature-item">
                <strong>Tools Used</strong>
                <span>${escapeHtml(game.engine || 'Unity Engine, Blender 3D, C#')}</span>
            </div>
            <div class="modal-feature-item">
                <strong>Target Platforms</strong>
                <span>${escapeHtml(game.platforms || 'PC (Windows / Steam)')}</span>
            </div>
            <div class="modal-feature-item">
                <strong>Community Rating</strong>
                <span style="color: #f59e0b; font-weight: 700;">
                    <i class="fa-solid fa-star"></i> ${ratingData.avg} / 5.0 (${ratingData.count} reviews)
                </span>
            </div>
        `;
    }

    // Modal Reviews Container
    let reviewsContainer = document.getElementById('modalReviewsContainer');
    if (!reviewsContainer) {
        reviewsContainer = document.createElement('div');
        reviewsContainer.id = 'modalReviewsContainer';
        reviewsContainer.className = 'game-reviews-section';
        const modalContent = modalOverlay.querySelector('.modal-content');
        if (modalContent) modalContent.appendChild(reviewsContainer);
    }

    const reviewsListHtml = reviews.length === 0 ? `
        <p style="color: var(--text-dim); font-size: 0.88rem; font-style: italic; margin-bottom: 1rem;">
            No player reviews yet. Be the first to play and rate this title!
        </p>
    ` : reviews.map(r => `
        <div class="review-item ${r.featured ? 'featured' : ''}">
            <div class="review-meta">
                <div class="review-author">
                    <i class="fa-solid fa-user-circle" style="color: var(--accent-cyan);"></i>
                    ${escapeHtml(r.authorName)}
                    ${r.featured ? '<span class="featured-badge">Featured Review</span>' : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <span style="color: #f59e0b; font-size: 0.85rem;">
                        ${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}
                    </span>
                    <span class="review-date">${escapeHtml(r.date || 'Recent')}</span>
                </div>
            </div>
            <p class="review-text">${escapeHtml(r.comment)}</p>
        </div>
    `).join('');

    const reviewFormHtml = session ? `
        <div class="review-form-card">
            <h4 style="font-size: 1rem; margin-bottom: 0.4rem; color: #fff;">
                <i class="fa-solid fa-star" style="color: #f59e0b;"></i> Leave Your Rating & Feedback
            </h4>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 0.8rem;">
                Posting as: <strong>${escapeHtml(session.name)}</strong> (${escapeHtml(session.email)})
            </p>

            <form id="modalReviewForm">
                <label class="form-label" style="font-size: 0.8rem;">Your Star Rating:</label>
                <div class="star-rating-input" id="starRatingInput">
                    <span class="star-choice selected" data-value="1">★</span>
                    <span class="star-choice selected" data-value="2">★</span>
                    <span class="star-choice selected" data-value="3">★</span>
                    <span class="star-choice selected" data-value="4">★</span>
                    <span class="star-choice selected" data-value="5">★</span>
                </div>
                <input type="hidden" id="selectedStarValue" value="5" />

                <div class="form-group" style="margin-bottom: 1rem;">
                    <textarea id="modalReviewComment" class="form-control" style="min-height: 70px; font-size: 0.85rem;" placeholder="What do you think of the combat mechanics, graphics, or audio in this game?" required></textarea>
                </div>

                <button type="submit" class="btn btn-sm btn-primary">
                    <i class="fa-solid fa-paper-plane"></i> Submit Player Review
                </button>
            </form>
        </div>
    ` : `
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 1.2rem; text-align: center; margin-top: 1.5rem;">
            <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 0.8rem;">
                Want to leave a review and rate this game?
            </p>
            <a href="login.html" class="btn btn-sm btn-outline-cyan">
                <i class="fa-solid fa-user-lock"></i> Sign In to Rate & Review
            </a>
        </div>
    `;

    reviewsContainer.innerHTML = `
        <div class="reviews-header">
            <h4 style="font-size: 1.15rem; color: #fff;">
                <i class="fa-solid fa-comments" style="color: var(--accent-cyan);"></i>
                Player Reviews (${reviews.length})
            </h4>
            <div class="star-rating-badge">
                <i class="fa-solid fa-star"></i> ${ratingData.avg} / 5.0
            </div>
        </div>
        ${reviewsListHtml}
        ${reviewFormHtml}
    `;

    // Star Selection Handler
    const starChoices = reviewsContainer.querySelectorAll('.star-choice');
    const starValInput = document.getElementById('selectedStarValue');
    if (starChoices.length > 0 && starValInput) {
        starChoices.forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.dataset.value);
                starValInput.value = val;
                starChoices.forEach(s => {
                    if (parseInt(s.dataset.value) <= val) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
            });
        });
    }

    // Review Form Submit Handler
    const revForm = document.getElementById('modalReviewForm');
    if (revForm) {
        revForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const comment = document.getElementById('modalReviewComment')?.value.trim();
            const rating = parseInt(starValInput?.value || 5);

            if (!comment) return;

            await addGameReview(game.id, session.name, session.email, rating, comment);
            showToast('⭐ Thank you! Your review has been published.');
            openGameModal(game.id); // Re-render modal with new review
            renderPublicGamesList(); // Update game card average rating
        });
    }

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
};

const modalCloseBtn = document.getElementById('modalClose');
const modalOverlay = document.getElementById('gameModal');
if (modalCloseBtn && modalOverlay) {
    modalCloseBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ----------------------------------------------------
// 8. Contact Page Initialization
// ----------------------------------------------------
function initContactPage() {
    const contactGatedWrapper = document.getElementById('contactGatedWrapper');
    const contactForm = document.getElementById('contactForm');

    if (contactGatedWrapper && contactForm) {
        const session = getCurrentSession();

        if (!session) {
            contactGatedWrapper.innerHTML = `
                <div class="gated-locked-card">
                    <div class="lock-icon">
                        <i class="fa-solid fa-lock"></i>
                    </div>
                    <h3>Sign In Required to Send Message</h3>
                    <p>To prevent spam and keep your conversation organized, please sign in with your account to message the developer.</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="login.html?redirect=contact.html" class="btn btn-primary">
                            <i class="fa-solid fa-right-to-bracket"></i> Sign In / Create Account
                        </a>
                    </div>
                </div>
            `;
        } else {
            const activeUserBar = document.getElementById('activeUserBar');
            if (activeUserBar) {
                activeUserBar.innerHTML = `
                    <div class="user-active-bar">
                        <div>
                            <strong>Sending as:</strong> ${escapeHtml(session.name)} (${escapeHtml(session.email)})
                        </div>
                        <span><i class="fa-solid fa-circle-check"></i> Verified Account</span>
                    </div>
                `;
            }

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');

            if (nameInput) {
                nameInput.value = session.name;
                nameInput.readOnly = true;
            }
            if (emailInput) {
                emailInput.value = session.email;
                emailInput.readOnly = true;
            }

            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const senderName = session.name;
                const senderEmail = session.email;
                const subject = document.getElementById('subject')?.value.trim() || 'General Inquiry';
                const message = document.getElementById('message')?.value.trim();

                if (!subject || !message) {
                    showToast('⚠️ Please provide a subject and message.');
                    return;
                }

                await addMessageToInbox(senderName, senderEmail, subject, message);

                showToast('✅ Message sent! Delivered directly to the developer Admin Panel.');

                const formCard = contactForm.closest('.contact-card');
                if (formCard) {
                    const alertDiv = document.createElement('div');
                    alertDiv.style.cssText = 'background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #10b981; padding: 1rem 1.2rem; border-radius: 10px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.8rem;';
                    alertDiv.innerHTML = '<i class="fa-solid fa-circle-check" style="font-size: 1.4rem;"></i> <div><strong>Message Delivered!</strong><br/><span style="font-size: 0.88rem; color: #cbd5e1;">Your message has been sent to developer <strong>A. Rehman</strong> and is waiting in the Admin Dashboard.</span></div>';
                    
                    formCard.insertBefore(alertDiv, contactForm);
                    setTimeout(() => { alertDiv.remove(); }, 6000);
                }

                document.getElementById('subject').value = '';
                document.getElementById('message').value = '';
            });
        }
    }
}

// ----------------------------------------------------
// 9. Login & Register Page Initialization
// ----------------------------------------------------
function initLoginPage() {
    const unifiedLoginForm = document.getElementById('unifiedLoginForm');
    const unifiedRegisterForm = document.getElementById('unifiedRegisterForm');

    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginPanel = document.getElementById('loginPanel');
    const registerPanel = document.getElementById('registerPanel');

    if (tabLoginBtn && tabRegisterBtn && loginPanel && registerPanel) {
        tabLoginBtn.addEventListener('click', () => {
            tabLoginBtn.classList.add('active');
            tabRegisterBtn.classList.remove('active');
            loginPanel.classList.add('active');
            registerPanel.classList.remove('active');
        });

        tabRegisterBtn.addEventListener('click', () => {
            tabRegisterBtn.classList.add('active');
            tabLoginBtn.classList.remove('active');
            registerPanel.classList.add('active');
            loginPanel.classList.remove('active');
        });
    }

    if (unifiedLoginForm) {
        // Prefetch cloud users on login page load
        fetchUsersFromCloud();

        const session = getCurrentSession();
        if (session) {
            if (session.role === 'admin') {
                window.location.href = 'admin.html';
                return;
            } else {
                window.location.href = 'contact.html';
                return;
            }
        }

        unifiedLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = document.getElementById('loginIdentifier')?.value.trim();
            const password = document.getElementById('loginPassword')?.value.trim();
            const errorDiv = document.getElementById('loginError');

            const submitBtn = unifiedLoginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
            }

            const result = await loginUnified(identifier, password);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In to Account';
            }

            if (result.success) {
                if (result.role === 'admin') {
                    showToast('👑 Welcome Developer! Loading Admin Dashboard...');
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 400);
                } else {
                    showToast(`🎮 Welcome back, ${result.user.name}!`);
                    setTimeout(() => {
                        window.location.href = 'contact.html';
                    }, 400);
                }
            } else {
                if (errorDiv) {
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = '❌ ' + result.error;
                }
                showToast('❌ Login failed: ' + result.error);
            }
        });
    }

    if (unifiedRegisterForm) {
        unifiedRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName')?.value.trim();
            const email = document.getElementById('regEmail')?.value.trim();
            const password = document.getElementById('regPassword')?.value.trim();
            const errorDiv = document.getElementById('registerError');

            if (!name || !email || !password) {
                if (errorDiv) {
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = 'Please fill out all required fields.';
                }
                return;
            }

            const result = await registerUser(name, email, password);

            if (result.success) {
                showToast(`🎉 Account created! Welcome, ${result.user.name}`);
                setTimeout(() => {
                    window.location.href = 'contact.html';
                }, 400);
            } else {
                if (errorDiv) {
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = '❌ ' + result.error;
                }
                showToast('❌ Registration error: ' + result.error);
            }
        });
    }
}

// ----------------------------------------------------
// 10. Admin Dashboard: Stats, Games, Inbox, & Analytics Graphs
// ----------------------------------------------------
let websiteProgressChart = null;
let userLoginAnalyticsChart = null;

function initAdminDashboard() {
    const adminDashboard = document.getElementById('adminDashboard');
    if (!adminDashboard) return;

    const session = getCurrentSession();
    if (!session || session.role !== 'admin') {
        showToast('⚠️ Admin access required. Please log in.');
        window.location.href = 'login.html';
        return;
    }

    // Immediately fetch latest users and data from Supabase Cloud
    fetchUsersFromCloud().then(() => {
        renderAdminStats();
        renderAdminUsersTable();
    });

    // Auto-poll Supabase cloud every 10 seconds for live player registrations from other devices
    if (!window._adminCloudPollInterval) {
        window._adminCloudPollInterval = setInterval(async () => {
            if (document.getElementById('adminDashboard')) {
                await fetchUsersFromCloud();
                renderAdminStats();
                renderAdminUsersTable();
            }
        }, 10000);
    }

    renderAdminStats();
    renderAdminGamesList();
    renderMessagesTable();
    renderAdminUsersTable();
    renderAboutEditor();
    renderAdminReviewsTable();
    initAdminCharts();

    // Tab Navigation Setup
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            if (tab) switchAdminTab(tab);
        });
    });

    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchAdminTab(['dashboard', 'users', 'games', 'messages', 'about', 'reviews'].includes(hash) ? hash : 'dashboard');

    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutUnified();
        });
    }

    const searchInput = document.getElementById('messageSearchInput');
    const filterSelect = document.getElementById('messageFilterSelect');

    if (searchInput) {
        searchInput.addEventListener('input', () => renderMessagesTable());
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', () => renderMessagesTable());
    }

    // User management search & filter listeners
    const userSearch = document.getElementById('userSearchInput');
    const userFilter = document.getElementById('userStatusFilter');
    if (userSearch) {
        userSearch.addEventListener('input', () => renderAdminUsersTable());
    }
    if (userFilter) {
        userFilter.addEventListener('change', () => renderAdminUsersTable());
    }

    // Review management search & filter listeners
    const reviewSearch = document.getElementById('reviewSearchInput');
    const reviewFilter = document.getElementById('reviewRatingFilter');
    if (reviewSearch) {
        reviewSearch.addEventListener('input', () => renderAdminReviewsTable());
    }
    if (reviewFilter) {
        reviewFilter.addEventListener('change', () => renderAdminReviewsTable());
    }

    const clearAllBtn = document.getElementById('clearAllMessagesBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm('⚠️ Are you sure you want to clear all messages from the inbox?')) {
                saveStoredMessages([]);
                renderAdminStats();
                renderMessagesTable();
                showToast('🗑️ All messages cleared.');
            }
        });
    }

    const resetSampleBtn = document.getElementById('resetSampleDataBtn');
    if (resetSampleBtn) {
        resetSampleBtn.addEventListener('click', () => {
            localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_SEED_MESSAGES));
            localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(DEFAULT_SEED_GAMES));
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_SEED_USERS));
            localStorage.setItem(STORAGE_KEYS.ABOUT, JSON.stringify(DEFAULT_SEED_ABOUT));
            localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEFAULT_SEED_REVIEWS));
            renderAdminStats();
            renderAdminGamesList();
            renderMessagesTable();
            renderAdminUsersTable();
            renderAboutEditor();
            renderAdminReviewsTable();
            showToast('🔄 Sample games, reviews, users, about content, and messages restored.');
        });
    }

    // Add Game Form Submission
    const gameForm = document.getElementById('adminGameForm');
    if (gameForm) {
        gameForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const editId = document.getElementById('gameEditId')?.value;
            const title = document.getElementById('gameFormTitle')?.value.trim();
            const category = document.getElementById('gameFormCategory')?.value || 'scifi';
            const categoryLabel = category === 'scifi' ? 'Cyberpunk & Sci-Fi' : (category === 'fantasy' ? 'Dark Fantasy & RPG' : 'Action Game');
            const status = document.getElementById('gameFormStatus')?.value || 'Playable Alpha';
            const engine = document.getElementById('gameFormEngine')?.value.trim() || 'Unity 2023 & Blender 3D';
            const image = document.getElementById('gameFormImage')?.value.trim() || 'images/hero.jpg';
            const description = document.getElementById('gameFormDesc')?.value.trim();
            const tagsRaw = document.getElementById('gameFormTags')?.value.trim();
            const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : [categoryLabel];

            const gameObj = {
                id: editId || ('game-' + Date.now()),
                title: title,
                category: category,
                categoryLabel: categoryLabel,
                status: status,
                statusCode: status.toLowerCase().includes('play') ? 'playable' : 'in-dev',
                engine: engine,
                image: image,
                description: description,
                genre: categoryLabel,
                platforms: 'PC (Windows / Steam)',
                tags: tags
            };

            await addOrUpdateGame(gameObj);
            closeAdminGameModal();
            renderAdminStats();
            renderAdminGamesList();
            showToast(editId ? '✅ Game updated successfully!' : '🎉 New game added to catalog!');
        });
    }
}

function renderAdminStats() {
    const messages = getStoredMessages();
    const games = getStoredGames();
    const users = getRegisteredUsers();

    const totalMessages = messages.length;
    const unreadMessages = messages.filter(m => !m.read).length;
    const totalGamesCount = games.length;

    const totalEl = document.getElementById('statTotalMessages');
    const unreadEl = document.getElementById('statUnreadMessages');
    const gamesEl = document.getElementById('statTotalGames');
    const usersEl = document.getElementById('statTotalUsers');

    if (totalEl) totalEl.textContent = totalMessages;
    if (unreadEl) unreadEl.textContent = unreadMessages;
    if (gamesEl) gamesEl.textContent = totalGamesCount;
    if (usersEl) usersEl.textContent = users.length + 1; // +1 includes Admin
}

// ----------------------------------------------------
// 11. Admin Game Management List & Modal Handlers
// ----------------------------------------------------
function renderAdminGamesList() {
    const grid = document.getElementById('adminGamesGrid');
    if (!grid) return;

    const games = getStoredGames();

    if (games.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <i class="fa-solid fa-gamepad" style="font-size: 2.5rem; margin-bottom: 0.8rem; color: var(--text-dim);"></i>
                <h3>No Games in Catalog</h3>
                <p>Click "+ Add New Game" above to publish your first game title.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = games.map(game => `
        <div class="game-admin-card">
            <div class="game-admin-thumb">
                <img src="${escapeHtml(game.image || 'images/hero.jpg')}" alt="${escapeHtml(game.title)}" onerror="this.src='images/hero.jpg'" />
                <span class="game-status-badge ${game.statusCode === 'playable' ? 'status-playable' : 'status-in-dev'}" style="position: absolute; top: 0.6rem; right: 0.6rem;">
                    ${escapeHtml(game.status || 'Active')}
                </span>
            </div>
            <div class="game-admin-body">
                <h4>${escapeHtml(game.title)}</h4>
                <p>${escapeHtml(game.description)}</p>
                <div style="font-size: 0.8rem; color: var(--accent-cyan); margin-bottom: 0.8rem;">
                    <i class="fa-brands fa-unity"></i> ${escapeHtml(game.engine || 'Unity + Blender')}
                </div>
                <div class="game-admin-actions">
                    <button class="btn btn-sm btn-secondary" style="flex: 1;" onclick="openEditGameModal('${game.id}')">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteGameFromAdmin('${game.id}')">
                        <i class="fa-solid fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

window.openAddGameModal = function() {
    const modal = document.getElementById('adminGameModal');
    const form = document.getElementById('adminGameForm');
    const modalHeading = document.getElementById('gameModalHeading');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('gameEditId').value = '';
    if (modalHeading) modalHeading.textContent = 'Add New Game Title';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.openEditGameModal = function(id) {
    const games = getStoredGames();
    const game = games.find(g => g.id === id);
    const modal = document.getElementById('adminGameModal');
    const modalHeading = document.getElementById('gameModalHeading');
    if (!game || !modal) return;

    document.getElementById('gameEditId').value = game.id;
    document.getElementById('gameFormTitle').value = game.title || '';
    document.getElementById('gameFormCategory').value = game.category || 'scifi';
    document.getElementById('gameFormStatus').value = game.status || 'Playable Alpha';
    document.getElementById('gameFormEngine').value = game.engine || 'Unity 2023 & Blender 3D';
    document.getElementById('gameFormImage').value = game.image || 'images/hero.jpg';
    document.getElementById('gameFormDesc').value = game.description || '';
    document.getElementById('gameFormTags').value = Array.isArray(game.tags) ? game.tags.join(', ') : (game.tags || '');

    if (modalHeading) modalHeading.textContent = `Edit Game: ${game.title}`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeAdminGameModal = function() {
    const modal = document.getElementById('adminGameModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

window.deleteGameFromAdmin = async function(id) {
    if (confirm('⚠️ Are you sure you want to remove this game from your website catalog?')) {
        await deleteGameById(id);
        renderAdminStats();
        renderAdminGamesList();
        showToast('🗑️ Game removed from catalog.');
    }
};

// ----------------------------------------------------
// 12. Admin User & Player Management List
// ----------------------------------------------------
function renderAdminUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    const searchInput = document.getElementById('userSearchInput');
    const filterSelect = document.getElementById('userStatusFilter');
    const emptyState = document.getElementById('emptyUsersState');

    if (!tableBody) return;

    let users = getRegisteredUsers();
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filter = filterSelect ? filterSelect.value : 'all';

    if (filter === 'active') {
        users = users.filter(u => u.status !== 'blocked');
    } else if (filter === 'blocked') {
        users = users.filter(u => u.status === 'blocked');
    }

    if (query) {
        users = users.filter(u => 
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query)
        );
    }

    if (users.length === 0) {
        tableBody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tableBody.innerHTML = users.map(user => {
        const isBlocked = user.status === 'blocked';
        return `
            <tr>
                <td>
                    <span class="status-tag ${isBlocked ? 'status-blocked' : 'status-active'}">
                        <i class="fa-solid ${isBlocked ? 'fa-ban' : 'fa-circle-check'}"></i>
                        ${isBlocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                </td>
                <td>
                    <strong style="color: #fff; font-size: 0.95rem;">${escapeHtml(user.name)}</strong>
                </td>
                <td>
                    <span style="color: var(--accent-cyan); font-size: 0.9rem;">${escapeHtml(user.email)}</span>
                </td>
                <td style="color: var(--text-dim); font-size: 0.85rem; white-space: nowrap;">
                    <i class="fa-regular fa-calendar"></i> ${escapeHtml(user.createdAt || 'Recent')}
                </td>
                <td style="color: var(--text-muted); font-size: 0.85rem; white-space: nowrap;">
                    <i class="fa-regular fa-clock"></i> ${escapeHtml(user.lastLogin || user.createdAt || 'Recent')}
                </td>
                <td>
                    <div class="message-actions-cell">
                        <button class="action-icon-btn ${isBlocked ? 'btn-unblock' : 'btn-block'}" 
                                title="${isBlocked ? 'Unblock User' : 'Block User'}" 
                                onclick="toggleBlockUser('${user.id}')">
                            <i class="fa-solid ${isBlocked ? 'fa-lock-open' : 'fa-ban'}"></i>
                        </button>
                        <button class="action-icon-btn btn-delete" 
                                title="Delete Account" 
                                onclick="deleteUserAccount('${user.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ----------------------------------------------------
// 13. Admin Tab Navigation & View Controller
// ----------------------------------------------------
window.switchAdminTab = function(tabName) {
    const navItems = document.querySelectorAll('.admin-nav-item');
    const tabViews = document.querySelectorAll('.admin-tab-view');
    const titleEl = document.getElementById('adminCurrentViewTitle');

    navItems.forEach(item => {
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    tabViews.forEach(view => {
        if (view.id === `view-${tabName}`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    const titles = {
        dashboard: 'Analytics & Overview Dashboard',
        users: 'Registered Players & User Access Control',
        games: 'Game Catalog & Release Management',
        messages: 'Inquiry Messages Inbox',
        about: 'About Us Content Management (CMS)',
        reviews: 'Player Game Ratings & Reviews Moderation'
    };

    if (titleEl && titles[tabName]) {
        titleEl.textContent = titles[tabName];
    }

    if (tabName === 'dashboard') {
        setTimeout(() => {
            if (websiteProgressChart) websiteProgressChart.resize();
            if (userLoginAnalyticsChart) userLoginAnalyticsChart.resize();
        }, 50);
    } else if (tabName === 'users') {
        fetchUsersFromCloud().then(() => {
            renderAdminStats();
            renderAdminUsersTable();
        });
    }

    window.location.hash = tabName;
};

// ----------------------------------------------------
// 14. About Us CMS Editor (Admin Panel)
// ----------------------------------------------------
function renderAboutEditor() {
    const form = document.getElementById('aboutCmsForm');
    if (!form) return;

    const data = getAboutContent();

    const badgeInput = document.getElementById('cmsAboutBadge');
    const headlineInput = document.getElementById('cmsAboutHeadline');
    const bio1Input = document.getElementById('cmsAboutBio1');
    const bio2Input = document.getElementById('cmsAboutBio2');
    const skillUnityInput = document.getElementById('cmsSkillUnity');
    const skillBlenderInput = document.getElementById('cmsSkillBlender');
    const skillCSharpInput = document.getElementById('cmsSkillCSharp');
    const skillShaderInput = document.getElementById('cmsSkillShader');

    const p1TitleInput = document.getElementById('cmsPillar1Title');
    const p1DescInput = document.getElementById('cmsPillar1Desc');
    const p2TitleInput = document.getElementById('cmsPillar2Title');
    const p2DescInput = document.getElementById('cmsPillar2Desc');
    const p3TitleInput = document.getElementById('cmsPillar3Title');
    const p3DescInput = document.getElementById('cmsPillar3Desc');

    if (badgeInput) badgeInput.value = data.badge || '';
    if (headlineInput) headlineInput.value = data.headline || '';
    if (bio1Input) bio1Input.value = data.bio1 || '';
    if (bio2Input) bio2Input.value = data.bio2 || '';

    if (skillUnityInput) skillUnityInput.value = data.skillUnity || 95;
    if (skillBlenderInput) skillBlenderInput.value = data.skillBlender || 92;
    if (skillCSharpInput) skillCSharpInput.value = data.skillCSharp || 90;
    if (skillShaderInput) skillShaderInput.value = data.skillShader || 88;

    if (p1TitleInput) p1TitleInput.value = data.pillar1Title || '';
    if (p1DescInput) p1DescInput.value = data.pillar1Desc || '';
    if (p2TitleInput) p2TitleInput.value = data.pillar2Title || '';
    if (p2DescInput) p2DescInput.value = data.pillar2Desc || '';
    if (p3TitleInput) p3TitleInput.value = data.pillar3Title || '';
    if (p3DescInput) p3DescInput.value = data.pillar3Desc || '';

    form.onsubmit = function(e) {
        e.preventDefault();

        const updatedData = {
            badge: badgeInput ? badgeInput.value.trim() : data.badge,
            headline: headlineInput ? headlineInput.value.trim() : data.headline,
            bio1: bio1Input ? bio1Input.value.trim() : data.bio1,
            bio2: bio2Input ? bio2Input.value.trim() : data.bio2,
            skillUnity: parseInt(skillUnityInput?.value || 95),
            skillBlender: parseInt(skillBlenderInput?.value || 92),
            skillCSharp: parseInt(skillCSharpInput?.value || 90),
            skillShader: parseInt(skillShaderInput?.value || 88),
            pillar1Title: p1TitleInput ? p1TitleInput.value.trim() : data.pillar1Title,
            pillar1Desc: p1DescInput ? p1DescInput.value.trim() : data.pillar1Desc,
            pillar2Title: p2TitleInput ? p2TitleInput.value.trim() : data.pillar2Title,
            pillar2Desc: p2DescInput ? p2DescInput.value.trim() : data.pillar2Desc,
            pillar3Title: p3TitleInput ? p3TitleInput.value.trim() : data.pillar3Title,
            pillar3Desc: p3DescInput ? p3DescInput.value.trim() : data.pillar3Desc
        };

        saveAboutContent(updatedData);
        showToast('✅ About Us content updated successfully!');
    };
}

// ----------------------------------------------------
// 15. Public About Page Dynamic Content Binding
// ----------------------------------------------------
function renderPublicAboutPage() {
    const aboutHero = document.querySelector('.about-hero');
    if (!aboutHero) return;

    const data = getAboutContent();
    const badgeEl = document.getElementById('aboutBadgeText');
    const headlineEl = document.getElementById('aboutHeadlineText');
    const bio1El = document.getElementById('aboutBio1');
    const bio2El = document.getElementById('aboutBio2');
    const skillUnityEl = document.getElementById('aboutSkillUnity');
    const skillUnityBar = document.getElementById('aboutSkillUnityBar');
    const skillBlenderEl = document.getElementById('aboutSkillBlender');
    const skillBlenderBar = document.getElementById('aboutSkillBlenderBar');
    const skillCSharpEl = document.getElementById('aboutSkillCSharp');
    const skillCSharpBar = document.getElementById('aboutSkillCSharpBar');
    const skillShaderEl = document.getElementById('aboutSkillShader');
    const skillShaderBar = document.getElementById('aboutSkillShaderBar');

    const p1Title = document.getElementById('aboutPillar1Title');
    const p1Desc = document.getElementById('aboutPillar1Desc');
    const p2Title = document.getElementById('aboutPillar2Title');
    const p2Desc = document.getElementById('aboutPillar2Desc');
    const p3Title = document.getElementById('aboutPillar3Title');
    const p3Desc = document.getElementById('aboutPillar3Desc');

    if (badgeEl && data.badge) badgeEl.textContent = data.badge;
    if (headlineEl && data.headline) headlineEl.textContent = data.headline;
    if (bio1El && data.bio1) bio1El.textContent = data.bio1;
    if (bio2El && data.bio2) bio2El.textContent = data.bio2;

    if (skillUnityEl) skillUnityEl.textContent = (data.skillUnity || 95) + '%';
    if (skillUnityBar) skillUnityBar.style.width = (data.skillUnity || 95) + '%';

    if (skillBlenderEl) skillBlenderEl.textContent = (data.skillBlender || 92) + '%';
    if (skillBlenderBar) skillBlenderBar.style.width = (data.skillBlender || 92) + '%';

    if (skillCSharpEl) skillCSharpEl.textContent = (data.skillCSharp || 90) + '%';
    if (skillCSharpBar) skillCSharpBar.style.width = (data.skillCSharp || 90) + '%';

    if (skillShaderEl) skillShaderEl.textContent = (data.skillShader || 88) + '%';
    if (skillShaderBar) skillShaderBar.style.width = (data.skillShader || 88) + '%';

    if (p1Title && data.pillar1Title) p1Title.textContent = data.pillar1Title;
    if (p1Desc && data.pillar1Desc) p1Desc.textContent = data.pillar1Desc;

    if (p2Title && data.pillar2Title) p2Title.textContent = data.pillar2Title;
    if (p2Desc && data.pillar2Desc) p2Desc.textContent = data.pillar2Desc;

    if (p3Title && data.pillar3Title) p3Title.textContent = data.pillar3Title;
    if (p3Desc && data.pillar3Desc) p3Desc.textContent = data.pillar3Desc;
}

// ----------------------------------------------------
// 12. Interactive Analytics Graphs (Chart.js)
// ----------------------------------------------------
function initAdminCharts() {
    if (typeof Chart === 'undefined') return;

    // --- Chart 1: Website Activity & Growth Progress ---
    const progressCanvas = document.getElementById('websiteProgressChart');
    if (progressCanvas) {
        const ctx = progressCanvas.getContext('2d');

        const gradientCyan = ctx.createLinearGradient(0, 0, 0, 300);
        gradientCyan.addColorStop(0, 'rgba(0, 242, 254, 0.45)');
        gradientCyan.addColorStop(1, 'rgba(0, 242, 254, 0.0)');

        const gradientPurple = ctx.createLinearGradient(0, 0, 0, 300);
        gradientPurple.addColorStop(0, 'rgba(157, 78, 221, 0.4)');
        gradientPurple.addColorStop(1, 'rgba(157, 78, 221, 0.0)');

        if (websiteProgressChart) websiteProgressChart.destroy();

        websiteProgressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'This Week'],
                datasets: [
                    {
                        label: 'Website Visitors',
                        data: [420, 680, 950, 1420, 1890, 2450],
                        borderColor: '#00f2fe',
                        backgroundColor: gradientCyan,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#00f2fe',
                        pointBorderColor: '#fff',
                        pointRadius: 4,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Playable Demo Downloads',
                        data: [150, 280, 420, 710, 980, 1340],
                        borderColor: '#9d4edd',
                        backgroundColor: gradientPurple,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#9d4edd',
                        pointBorderColor: '#fff',
                        pointRadius: 4,
                        pointHoverRadius: 7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Orbitron', size: 11 }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#111827',
                        titleColor: '#00f2fe',
                        bodyColor: '#fff',
                        borderColor: 'rgba(0, 242, 254, 0.4)',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b', font: { family: 'Inter' } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b', font: { family: 'Inter' } }
                    }
                }
            }
        });
    }

    // --- Chart 2: User / Player Logins & Registrations (Bottom Graph) ---
    renderUserLoginChart('daily');
}

window.switchLoginAnalyticsTimeframe = function(timeframe) {
    const dailyBtn = document.getElementById('toggleDailyLogins');
    const monthlyBtn = document.getElementById('toggleMonthlyLogins');

    if (timeframe === 'daily') {
        if (dailyBtn) dailyBtn.classList.add('active');
        if (monthlyBtn) monthlyBtn.classList.remove('active');
    } else {
        if (monthlyBtn) monthlyBtn.classList.add('active');
        if (dailyBtn) dailyBtn.classList.remove('active');
    }

    renderUserLoginChart(timeframe);
};

function renderUserLoginChart(timeframe) {
    if (typeof Chart === 'undefined') return;

    const loginCanvas = document.getElementById('userLoginsAnalyticsChart');
    if (!loginCanvas) return;

    const ctx = loginCanvas.getContext('2d');
    const dataSet = DEFAULT_LOGIN_ANALYTICS[timeframe] || DEFAULT_LOGIN_ANALYTICS.daily;

    if (userLoginAnalyticsChart) userLoginAnalyticsChart.destroy();

    userLoginAnalyticsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dataSet.labels,
            datasets: [
                {
                    label: timeframe === 'daily' ? 'Player Logins (Per Day)' : 'Player Logins (Per Month)',
                    data: dataSet.playerLogins,
                    backgroundColor: 'rgba(0, 242, 254, 0.75)',
                    borderColor: '#00f2fe',
                    borderWidth: 1,
                    borderRadius: 6
                },
                {
                    label: timeframe === 'daily' ? 'New Account Sign-Ups (Per Day)' : 'New Account Sign-Ups (Per Month)',
                    data: dataSet.newSignups,
                    backgroundColor: 'rgba(245, 158, 11, 0.75)',
                    borderColor: '#f59e0b',
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Orbitron', size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: '#111827',
                    titleColor: '#00f2fe',
                    bodyColor: '#fff',
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#64748b', font: { family: 'Inter' } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#64748b', font: { family: 'Inter' } }
                }
            }
        }
    });
}

// ----------------------------------------------------
// 13. Admin Messages Table
// ----------------------------------------------------
function renderMessagesTable() {
    const tableBody = document.getElementById('messagesTableBody');
    const searchInput = document.getElementById('messageSearchInput');
    const filterSelect = document.getElementById('messageFilterSelect');
    const emptyState = document.getElementById('emptyInboxState');

    if (!tableBody) return;

    let messages = getStoredMessages();
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filter = filterSelect ? filterSelect.value : 'all';

    if (filter === 'unread') {
        messages = messages.filter(m => !m.read);
    } else if (filter === 'read') {
        messages = messages.filter(m => m.read);
    }

    if (query) {
        messages = messages.filter(m => 
            m.name.toLowerCase().includes(query) ||
            m.email.toLowerCase().includes(query) ||
            m.subject.toLowerCase().includes(query) ||
            m.message.toLowerCase().includes(query)
        );
    }

    if (messages.length === 0) {
        tableBody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tableBody.innerHTML = messages.map(msg => `
        <tr class="message-row ${!msg.read ? 'unread' : ''}" onclick="viewAdminMessage('${msg.id}')">
            <td>
                <span class="status-tag ${!msg.read ? 'status-unread' : 'status-read'}">
                    <i class="fa-solid ${!msg.read ? 'fa-envelope' : 'fa-envelope-open'}"></i>
                    ${!msg.read ? 'UNREAD' : 'READ'}
                </span>
            </td>
            <td>
                <span class="sender-name">${escapeHtml(msg.name)}</span>
                <span class="sender-email">${escapeHtml(msg.email)}</span>
            </td>
            <td>
                <div class="subject-snippet">${escapeHtml(msg.subject)}</div>
                <div class="msg-preview">${escapeHtml(msg.message)}</div>
            </td>
            <td style="color: var(--text-dim); font-size: 0.85rem; white-space: nowrap;">
                <i class="fa-regular fa-clock"></i> ${msg.date}
            </td>
            <td onclick="event.stopPropagation()">
                <div class="message-actions-cell">
                    <button class="action-icon-btn btn-view" title="View Message" onclick="viewAdminMessage('${msg.id}')">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="action-icon-btn" title="${msg.read ? 'Mark as Unread' : 'Mark as Read'}" onclick="toggleMessageRead('${msg.id}')">
                        <i class="fa-solid ${msg.read ? 'fa-envelope' : 'fa-envelope-open'}"></i>
                    </button>
                    <button class="action-icon-btn btn-delete" title="Delete" onclick="deleteAdminMessage('${msg.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.viewAdminMessage = async function(id) {
    const messages = getStoredMessages();
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    if (!msg.read) {
        await setMessageReadStatus(id, true);
        renderAdminStats();
        renderMessagesTable();
    }

    const modal = document.getElementById('adminMessageModal');
    if (!modal) return;

    document.getElementById('modalMsgName').textContent = msg.name;
    document.getElementById('modalMsgEmail').textContent = msg.email;
    document.getElementById('modalMsgSubject').textContent = msg.subject;
    document.getElementById('modalMsgDate').textContent = msg.date;
    document.getElementById('modalMsgBody').textContent = msg.message;

    const replyBtn = document.getElementById('modalReplyBtn');
    if (replyBtn) {
        replyBtn.href = `mailto:${encodeURIComponent(msg.email)}?subject=Re: ${encodeURIComponent(msg.subject)}`;
    }

    const deleteBtn = document.getElementById('modalDeleteBtn');
    if (deleteBtn) {
        deleteBtn.onclick = async () => {
            if (confirm('Delete this message?')) {
                await deleteAdminMessage(id);
                closeAdminMessageModal();
            }
        };
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeAdminMessageModal = function() {
    const modal = document.getElementById('adminMessageModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

window.toggleMessageRead = async function(id) {
    const messages = getStoredMessages();
    const msg = messages.find(m => m.id === id);
    if (msg) {
        await setMessageReadStatus(id, !msg.read);
        renderAdminStats();
        renderMessagesTable();
        showToast(msg.read ? '📩 Marked as unread' : '📬 Marked as read');
    }
};

window.deleteAdminMessage = async function(id) {
    await deleteMessageById(id);
    renderAdminStats();
    renderMessagesTable();
    showToast('🗑️ Message deleted from inbox.');
};

// ----------------------------------------------------
// 14. Helper Utilities & Animated Counters
// ----------------------------------------------------
function initCounters() {
    const statCounters = document.querySelectorAll('.counter');
    if (statCounters.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');
                    let count = 0;
                    const speed = target / 30;

                    const updateCount = () => {
                        count += speed;
                        if (count < target) {
                            counter.innerText = Math.ceil(count);
                            requestAnimationFrame(updateCount);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCount();
                    obs.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        statCounters.forEach(c => observer.observe(c));
    }
}

window.copyEmailAddress = function() {
    const email = 'arehman.ilahe@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
        showToast('📋 Copied arehman.ilahe@gmail.com to clipboard!');
    }).catch(() => {
        showToast('Email: arehman.ilahe@gmail.com');
    });
};

window.showToast = function(message) {
    let toastEl = document.getElementById('toast');
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'toast';
        toastEl.className = 'toast';
        
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        container.appendChild(toastEl);
    }

    toastEl.textContent = message;
    toastEl.classList.add('show');

    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 4000);
};

function escapeHtml(string) {
    if (!string) return '';
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
}

// ----------------------------------------------------
// 15. Initial Cloud Sync with Supabase
// ----------------------------------------------------
async function syncFromCloud() {
    if (!supabaseClient) return;

    try {
        // 1. Fetch Cloud Games
        const { data: cloudGames, error: gamesErr } = await supabaseClient
            .from('games')
            .select('*');

        if (!gamesErr && cloudGames && cloudGames.length > 0) {
            const mappedGames = cloudGames.map(g => ({
                id: g.id,
                title: g.title,
                category: g.category,
                categoryLabel: g.category_label || g.categoryLabel,
                engine: g.engine,
                status: g.status,
                statusCode: g.status_code || g.statusCode,
                image: g.image,
                description: g.description,
                genre: g.genre,
                platforms: g.platforms,
                tags: g.tags || []
            }));
            saveStoredGames(mappedGames);
            renderPublicGamesList();
            renderAdminGamesList();
            renderAdminStats();
        }

        // 2. Fetch Cloud Messages for Admin
        const session = getCurrentSession();
        if (session && session.role === 'admin') {
            const { data: cloudMessages, error: msgErr } = await supabaseClient
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (!msgErr && cloudMessages && cloudMessages.length > 0) {
                const mappedMessages = cloudMessages.map(m => ({
                    id: m.id,
                    name: m.name,
                    email: m.email,
                    subject: m.subject,
                    message: m.message,
                    date: new Date(m.created_at).toISOString().replace('T', ' ').substring(0, 16),
                    read: m.is_read
                }));
                saveStoredMessages(mappedMessages);
                renderAdminStats();
                renderMessagesTable();
            }
        }

        // 3. Fetch Cloud Registered Users / Profiles (for all devices & Admin)
        await fetchUsersFromCloud();
        renderAdminStats();
        renderAdminUsersTable();

        // 4. Fetch Cloud Game Reviews
        const { data: cloudReviews, error: revErr } = await supabaseClient
            .from('reviews')
            .select('*')
            .order('date', { ascending: false });

        if (!revErr && cloudReviews && cloudReviews.length > 0) {
            const mappedReviews = cloudReviews.map(r => ({
                id: r.id || ('rev-' + Math.random().toString(36).substr(2, 9)),
                gameId: r.gameId || r.game_id,
                authorName: r.authorName || r.author_name || 'Gamer',
                authorEmail: r.authorEmail || r.author_email || '',
                rating: r.rating || 5,
                comment: r.comment || '',
                date: r.date || new Date(r.created_at || Date.now()).toISOString().replace('T', ' ').substring(0, 16),
                featured: r.featured || false
            }));
            saveStoredReviews(mappedReviews);
            renderRecentReviewsHub();
            renderAdminReviewsTable();
        }
    } catch (e) {
        console.warn('⚠️ Initial cloud sync notice:', e);
    }
}

window.refreshAdminUsersCloud = async function(event) {
    if (event) event.preventDefault();
    const btn = document.getElementById('refreshUsersBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';
    }

    const updated = await fetchUsersFromCloud();
    renderAdminStats();
    renderAdminUsersTable();

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-rotate"></i> Sync Cloud Users';
    }

    showToast(`🌐 Synced ${updated.length} players from Supabase Cloud!`);
};

// ----------------------------------------------------
// 16. Admin Reviews Moderation Table
// ----------------------------------------------------
function renderAdminReviewsTable() {
    const tableBody = document.getElementById('reviewsTableBody');
    const searchInput = document.getElementById('reviewSearchInput');
    const ratingFilter = document.getElementById('reviewRatingFilter');
    const emptyState = document.getElementById('emptyReviewsState');

    if (!tableBody) return;

    let reviews = getStoredReviews();
    const games = getStoredGames();
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const ratingVal = ratingFilter ? ratingFilter.value : 'all';

    if (ratingVal !== 'all') {
        reviews = reviews.filter(r => Number(r.rating) === Number(ratingVal));
    }

    if (query) {
        reviews = reviews.filter(r => 
            r.authorName.toLowerCase().includes(query) ||
            r.authorEmail.toLowerCase().includes(query) ||
            r.comment.toLowerCase().includes(query) ||
            r.gameId.toLowerCase().includes(query)
        );
    }

    if (reviews.length === 0) {
        tableBody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tableBody.innerHTML = reviews.map(rev => {
        const game = games.find(g => g.id === rev.gameId);
        const gameTitle = game ? game.title : rev.gameId;

        return `
            <tr>
                <td>
                    <span class="star-rating-badge" style="font-size: 0.85rem;">
                        <i class="fa-solid fa-star"></i> ${rev.rating} / 5
                    </span>
                    ${rev.featured ? '<span class="featured-badge" style="margin-left: 0.3rem;">Featured</span>' : ''}
                </td>
                <td>
                    <strong style="color: var(--accent-cyan); font-size: 0.95rem;">${escapeHtml(gameTitle)}</strong>
                </td>
                <td>
                    <div style="color: #fff; font-weight: 600;">${escapeHtml(rev.authorName)}</div>
                    <div style="color: var(--text-dim); font-size: 0.8rem;">${escapeHtml(rev.authorEmail)}</div>
                </td>
                <td>
                    <div style="color: var(--text-main); font-size: 0.88rem; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        "${escapeHtml(rev.comment)}"
                    </div>
                </td>
                <td style="color: var(--text-dim); font-size: 0.85rem; white-space: nowrap;">
                    <i class="fa-regular fa-clock"></i> ${escapeHtml(rev.date || 'Recent')}
                </td>
                <td>
                    <div class="message-actions-cell">
                        <button class="action-icon-btn ${rev.featured ? 'btn-unblock' : 'btn-block'}" 
                                title="${rev.featured ? 'Unfeature Review' : 'Feature on Public Site'}" 
                                onclick="toggleFeatureReview('${rev.id}')">
                            <i class="fa-solid ${rev.featured ? 'fa-star-half-stroke' : 'fa-star'}"></i>
                        </button>
                        <button class="action-icon-btn btn-delete" 
                                title="Delete Review" 
                                onclick="deleteReviewFromAdmin('${rev.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.toggleFeatureReview = function(id) {
    const reviews = getStoredReviews();
    const target = reviews.find(r => r.id === id);
    if (!target) return;

    target.featured = !target.featured;
    saveStoredReviews(reviews);
    renderAdminReviewsTable();
    showToast(target.featured ? '⭐ Review marked as FEATURED!' : 'Review unfeatured.');
};

window.deleteReviewFromAdmin = function(id) {
    if (confirm('⚠️ Are you sure you want to delete this player review?')) {
        let reviews = getStoredReviews();
        reviews = reviews.filter(r => r.id !== id);
        saveStoredReviews(reviews);
        renderAdminReviewsTable();
        showToast('🗑️ Review deleted.');
    }
};

// ----------------------------------------------------
// 17. Advanced Pro Game OST Audio Suite & Visualizer
// ----------------------------------------------------
const MUSIC_TRACKS = [
    {
        id: 'track-1',
        title: 'Nexus Singularity',
        artist: 'Nexus Forge OST',
        genre: 'Cyberpunk Synthwave',
        duration: '03:24',
        cover: 'images/hero.jpg',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
        bpm: 120,
        bass: [110, 110, 130.81, 146.83, 164.81, 146.83],
        chords: [[220, 261.63, 329.63], [174.61, 220.00, 261.63], [196.00, 246.94, 293.66], [164.81, 196.00, 246.94]],
        lead: [440, 523.25, 659.25, 587.33, 523.25, 493.88, 440]
    },
    {
        id: 'track-2',
        title: 'Vanguard Protocol',
        artist: 'A. Rehman (Nexus Studio)',
        genre: 'Hybrid Darksynth Action',
        duration: '02:58',
        cover: 'images/hero.jpg',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
        bpm: 130,
        bass: [98.00, 98.00, 116.54, 130.81, 146.83, 130.81],
        chords: [[196.00, 233.08, 293.66], [164.81, 196.00, 246.94], [174.61, 220.00, 261.63], [146.83, 174.61, 220.00]],
        lead: [392, 466.16, 587.33, 523.25, 466.16, 392]
    },
    {
        id: 'track-3',
        title: 'Eldoria Shadows',
        artist: 'Nexus Forge Studio',
        genre: 'Dark Fantasy Symphony',
        duration: '04:12',
        cover: 'images/hero.jpg',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
        bpm: 85,
        bass: [87.31, 87.31, 110.00, 130.81, 110.00],
        chords: [[174.61, 220.00, 261.63], [130.81, 164.81, 196.00], [146.83, 174.61, 220.00], [110.00, 130.81, 164.81]],
        lead: [349.23, 440, 523.25, 440, 392, 349.23]
    },
    {
        id: 'track-4',
        title: 'Cosmic Driftway',
        artist: 'A. Rehman',
        genre: 'Zero-G Synthwave',
        duration: '03:45',
        cover: 'images/hero.jpg',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f777dd.mp3',
        bpm: 115,
        bass: [123.47, 123.47, 146.83, 164.81, 185.00],
        chords: [[246.94, 293.66, 369.99], [196.00, 246.94, 293.66], [220.00, 261.63, 329.63], [185.00, 220.00, 277.18]],
        lead: [493.88, 587.33, 739.99, 659.25, 587.33, 493.88]
    }
];

let audioElement = null;
let currentTrackIndex = 0;
let isMusicPlaying = false;
let isLooping = false;
let isBassBoost = false;
let currentVolume = 0.5;
let visualizerAnimationId = null;
let synthAudioCtx = null;
let synthInterval = null;
let synthGain = null;
let synthStep = 0;

window.toggleMusicPlayState = function() {
    if (!isMusicPlaying) {
        playCurrentTrack();
    } else {
        pauseCurrentTrack();
    }
};

function playCurrentTrack() {
    const track = MUSIC_TRACKS[currentTrackIndex];
    if (!audioElement) {
        audioElement = new Audio();
        audioElement.crossOrigin = 'anonymous';
        audioElement.preload = 'auto';

        audioElement.addEventListener('timeupdate', updateAudioProgress);
        audioElement.addEventListener('ended', onTrackEnded);
        audioElement.addEventListener('error', onAudioErrorFallback);
    }

    audioElement.src = track.audioUrl;
    audioElement.volume = currentVolume;
    audioElement.loop = isLooping;

    audioElement.play().then(() => {
        isMusicPlaying = true;
        updatePlayerUI(true);
        startSpectrumVisualizer();
        showToast('🎵 Playing Studio OST: ' + track.title);
    }).catch(err => {
        console.warn('Audio streaming notice, switching to procedural live synth:', err);
        startProceduralSynth();
        isMusicPlaying = true;
        updatePlayerUI(true);
        startSpectrumVisualizer();
        showToast('🎵 Live Studio Synth: ' + track.title);
    });
}

function pauseCurrentTrack() {
    isMusicPlaying = false;
    if (audioElement) {
        audioElement.pause();
    }
    stopProceduralSynth();
    updatePlayerUI(false);
    showToast('⏸️ Studio OST paused');
}

function changeTrack(direction) {
    currentTrackIndex = (currentTrackIndex + direction + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
    updateTrackInfo();
    renderPlaylistItems();
    if (isMusicPlaying) {
        playCurrentTrack();
    }
}

function setTrackIndex(index) {
    if (index >= 0 && index < MUSIC_TRACKS.length) {
        currentTrackIndex = index;
        updateTrackInfo();
        renderPlaylistItems();
        playCurrentTrack();
    }
}

function onTrackEnded() {
    if (!isLooping) {
        changeTrack(1);
    }
}

function onAudioErrorFallback() {
    console.warn('Live audio stream fallback active.');
    startProceduralSynth();
}

function startProceduralSynth() {
    try {
        if (!synthAudioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            synthAudioCtx = new AudioContext();
        }
        if (synthAudioCtx.state === 'suspended') {
            synthAudioCtx.resume();
        }

        if (!synthGain) {
            synthGain = synthAudioCtx.createGain();
            synthGain.gain.setValueAtTime(currentVolume * 0.4, synthAudioCtx.currentTime);
            synthGain.connect(synthAudioCtx.destination);
        }

        const track = MUSIC_TRACKS[currentTrackIndex];
        const stepTime = (60 / track.bpm) * 0.25 * 1000;

        if (synthInterval) clearInterval(synthInterval);

        synthInterval = setInterval(() => {
            if (!isMusicPlaying || !synthAudioCtx) return;
            const now = synthAudioCtx.currentTime;

            // Kick
            if (synthStep % 4 === 0) {
                const osc = synthAudioCtx.createOscillator();
                const g = synthAudioCtx.createGain();
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.exponentialRampToValueAtTime(32, now + 0.12);
                g.gain.setValueAtTime(0.35, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.connect(g);
                g.connect(synthGain);
                osc.start(now);
                osc.stop(now + 0.16);
            }

            // Bassline
            if (synthStep % 2 === 0) {
                const note = track.bass[Math.floor(synthStep / 2) % track.bass.length];
                const osc = synthAudioCtx.createOscillator();
                const g = synthAudioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(isBassBoost ? note * 0.5 : note, now);
                g.gain.setValueAtTime(0.2, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                osc.connect(g);
                g.connect(synthGain);
                osc.start(now);
                osc.stop(now + 0.24);
            }

            // Lead
            const leadNote = track.lead[synthStep % track.lead.length];
            const leadOsc = synthAudioCtx.createOscillator();
            const leadG = synthAudioCtx.createGain();
            leadOsc.type = 'triangle';
            leadOsc.frequency.setValueAtTime(leadNote, now);
            leadG.gain.setValueAtTime(0.15, now);
            leadG.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            leadOsc.connect(leadG);
            leadG.connect(synthGain);
            leadOsc.start(now);
            leadOsc.stop(now + 0.38);

            synthStep++;
        }, stepTime);
    } catch (e) {
        console.warn('Synth error:', e);
    }
}

function stopProceduralSynth() {
    if (synthInterval) {
        clearInterval(synthInterval);
        synthInterval = null;
    }
}

function updateAudioProgress() {
    if (!audioElement) return;

    const fillEl = document.getElementById('topProgressBarFill');
    const durationEl = document.getElementById('topAudioDuration');

    const curr = audioElement.currentTime || 0;
    const dur = audioElement.duration || 0;

    if (fillEl && dur > 0) {
        const pct = (curr / dur) * 100;
        fillEl.style.width = pct + '%';
    }

    if (durationEl && dur > 0) {
        durationEl.textContent = `${formatTime(curr)} / ${formatTime(dur)}`;
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
}

function updateTrackInfo() {
    const track = MUSIC_TRACKS[currentTrackIndex];
    const topTitle = document.getElementById('topAudioTrackTitle');
    const topGenre = document.getElementById('topAudioGenre');
    const topDuration = document.getElementById('topAudioDuration');

    if (topTitle) topTitle.textContent = track.title;
    if (topGenre) topGenre.textContent = `${track.genre} • ${track.artist}`;
    if (topDuration) topDuration.textContent = `00:00 / ${track.duration}`;
}

function updatePlayerUI(playing) {
    const navMusicPlayIcon = document.getElementById('navMusicPlayIcon');
    const topDropdownPlayIcon = document.getElementById('topDropdownPlayIcon');
    const navText = document.getElementById('navMusicText');
    const headerEqs = document.querySelectorAll('.header-music-eq');

    const iconClass = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    if (navMusicPlayIcon) navMusicPlayIcon.className = iconClass;
    if (topDropdownPlayIcon) topDropdownPlayIcon.className = iconClass;

    if (navText) navText.textContent = playing ? 'Pause OST' : 'Play OST';

    headerEqs.forEach(eq => {
        if (playing) eq.classList.add('playing');
        else eq.classList.remove('playing');
    });
}

window.toggleTopAudioMenu = function(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('topAudioDropdown');
    if (!dropdown) return;
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
};

window.toggleLoopMode = function() {
    isLooping = !isLooping;
    if (audioElement) audioElement.loop = isLooping;
    const btn = document.getElementById('topLoopBtn');
    if (btn) btn.classList.toggle('active', isLooping);
    showToast(isLooping ? '🔂 Track repeat enabled' : '➡️ Continuous playback');
};

window.toggleBassBoost = function() {
    isBassBoost = !isBassBoost;
    const btn = document.getElementById('topBassBtn');
    if (btn) btn.classList.toggle('active', isBassBoost);
    showToast(isBassBoost ? '⚡ Bass Boost ON (+8dB)' : 'Bass Boost standard');
};

function initMusicPlayer() {
    // Progress bar seek
    const progressBg = document.getElementById('topProgressBarBg');
    progressBg?.addEventListener('click', (e) => {
        if (!audioElement || !audioElement.duration) return;
        const rect = progressBg.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = clickX / rect.width;
        audioElement.currentTime = pct * audioElement.duration;
    });

    // Volume slider
    const volSlider = document.getElementById('topVolSlider');
    volSlider?.addEventListener('input', (e) => {
        currentVolume = parseFloat(e.target.value);
        if (audioElement) audioElement.volume = currentVolume;
        if (synthGain && synthAudioCtx) synthGain.gain.setValueAtTime(currentVolume * 0.4, synthAudioCtx.currentTime);
    });

    // Click outside to close dropdown
    document.addEventListener('click', (e) => {
        const group = document.querySelector('.nav-music-group');
        const dropdown = document.getElementById('topAudioDropdown');
        if (dropdown && group && !group.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    updateTrackInfo();
}

// ----------------------------------------------------
// 18. Standalone Page Reviews & Ratings Hub (games.html)
// ----------------------------------------------------
function renderPageReviewsHub() {
    const form = document.getElementById('standaloneReviewForm');
    const select = document.getElementById('reviewGameSelect');
    const listContainer = document.getElementById('pageReviewsList');
    const badgeEl = document.getElementById('overallReviewsBadge');
    const authNote = document.getElementById('pageReviewAuthNote');

    if (!form || !select || !listContainer) return;

    const games = getStoredGames();
    const allReviews = getStoredReviews();
    const session = getCurrentSession();

    // Populate Game Select Dropdown
    select.innerHTML = games.map(g => `
        <option value="${g.id}">${escapeHtml(g.title)} (${escapeHtml(g.categoryLabel || g.genre || '3D Game')})</option>
    `).join('');

    // Update Overall Rating Badge
    if (badgeEl) {
        if (allReviews.length === 0) {
            badgeEl.innerHTML = `<i class="fa-solid fa-star"></i> 5.0 / 5.0 (0 reviews)`;
        } else {
            const sum = allReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
            const avg = (sum / allReviews.length).toFixed(1);
            badgeEl.innerHTML = `<i class="fa-solid fa-star"></i> ${avg} / 5.0 (${allReviews.length} reviews)`;
        }
    }

    // Render Review List
    if (allReviews.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-dim);">
                <i class="fa-solid fa-star" style="font-size: 2.5rem; margin-bottom: 0.8rem; color: rgba(245, 158, 11, 0.3);"></i>
                <h4>No Reviews Yet</h4>
                <p style="font-size: 0.88rem;">Be the first player to submit a rating for our games!</p>
            </div>
        `;
    } else {
        listContainer.innerHTML = allReviews.map(r => {
            const game = games.find(g => g.id === r.gameId);
            const gameTitle = game ? game.title : r.gameId;

            return `
                <div class="review-item ${r.featured ? 'featured' : ''}" style="margin-bottom: 1.2rem;">
                    <div class="review-meta">
                        <div class="review-author">
                            <i class="fa-solid fa-circle-user" style="color: var(--accent-cyan);"></i>
                            <span>${escapeHtml(r.authorName)}</span>
                            ${r.featured ? '<span class="featured-badge">Featured</span>' : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                            <span style="color: #f59e0b; font-size: 0.9rem;">
                                ${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}
                            </span>
                            <span class="review-date">${escapeHtml(r.date || 'Recent')}</span>
                        </div>
                    </div>
                    <div style="font-size: 0.82rem; color: var(--accent-cyan); font-weight: 600; margin-bottom: 0.4rem;">
                        <i class="fa-solid fa-gamepad"></i> Game: ${escapeHtml(gameTitle)}
                    </div>
                    <p class="review-text" style="font-size: 0.9rem;">${escapeHtml(r.comment)}</p>
                </div>
            `;
        }).join('');
    }

    // Auth Note Display
    if (authNote) {
        if (session) {
            authNote.innerHTML = `
                <div style="font-size: 0.85rem; color: var(--accent-cyan); margin-bottom: 1rem; background: rgba(0, 242, 254, 0.05); padding: 0.6rem 0.8rem; border-radius: 6px;">
                    <i class="fa-solid fa-user-check"></i> Signed in as: <strong>${escapeHtml(session.name)}</strong> (${escapeHtml(session.email)})
                </div>
            `;
        } else {
            authNote.innerHTML = `
                <div style="font-size: 0.85rem; color: var(--accent-amber); margin-bottom: 1rem; background: rgba(245, 158, 11, 0.08); padding: 0.6rem 0.8rem; border-radius: 6px;">
                    <i class="fa-solid fa-circle-info"></i> Note: You can <a href="login.html" style="color: #fff; text-decoration: underline;">Sign In</a> or submit as Guest Player.
                </div>
            `;
        }
    }

    // Star Selection Handler
    const starChoices = document.querySelectorAll('#pageStarRatingInput .star-choice');
    const starValInput = document.getElementById('pageSelectedStarValue');
    if (starChoices.length > 0 && starValInput) {
        starChoices.forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.dataset.value);
                starValInput.value = val;
                starChoices.forEach(s => {
                    if (parseInt(s.dataset.value) <= val) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
            });
        });
    }

    // Form Submission
    form.onsubmit = async function(e) {
        e.preventDefault();
        const selectedGameId = select.value;
        const comment = document.getElementById('pageReviewComment')?.value.trim();
        const rating = parseInt(starValInput?.value || 5);

        if (!selectedGameId || !comment) return;

        const authorName = session ? session.name : 'Player Guest';
        const authorEmail = session ? session.email : 'player@nexusforge.com';

        await addGameReview(selectedGameId, authorName, authorEmail, rating, comment);
        showToast('⭐ Thank you! Your game review and rating have been published!');
        document.getElementById('pageReviewComment').value = '';
        renderPageReviewsHub();
        renderPublicGamesList();
    };
}
