import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
  signUp: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Users
  getUser: async (authId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single()
    return { data, error }
  },

  updateUser: async (authId, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('auth_id', authId)
      .select()
      .single()
    return { data, error }
  },

  // Courses
  getCourses: async (userId) => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createCourse: async (courseData) => {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single()
    return { data, error }
  },

  updateCourse: async (courseId, updates) => {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single()
    return { data, error }
  },

  deleteCourse: async (courseId) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)
    return { error }
  },

  // Notes
  getNotes: async (userId) => {
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        course:courses(title)
      `)
      .eq('user_id', userId)
      .order('position', { ascending: true })
    return { data, error }
  },

  createNote: async (noteData) => {
    const { data, error } = await supabase
      .from('notes')
      .insert([noteData])
      .select()
      .single()
    return { data, error }
  },

  updateNote: async (noteId, updates) => {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single()
    return { data, error }
  },

  deleteNote: async (noteId) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
    return { error }
  },

  // Bookmarks
  getBookmarks: async (userId) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        course:courses(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createBookmark: async (bookmarkData) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([bookmarkData])
      .select()
      .single()
    return { data, error }
  },

  deleteBookmark: async (bookmarkId) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId)
    return { error }
  },

  // Reminders
  getReminders: async (userId) => {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('datetime', { ascending: true })
    return { data, error }
  },

  createReminder: async (reminderData) => {
    const { data, error } = await supabase
      .from('reminders')
      .insert([reminderData])
      .select()
      .single()
    return { data, error }
  },

  updateReminder: async (reminderId, updates) => {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', reminderId)
      .select()
      .single()
    return { data, error }
  },

  deleteReminder: async (reminderId) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)
    return { error }
  },

  // Study Groups
  getStudyGroups: async (filter = 'all', userId = null) => {
    let query = supabase
      .from('study_groups')
      .select(`
        *,
        owner:users!study_groups_owner_id_fkey(username),
        member_count:group_members(count),
        is_member:group_members!inner(user_id)
      `)

    if (filter === 'public') {
      query = query.eq('visibility', 'public')
    } else if (filter === 'my-groups' && userId) {
      query = query.eq('owner_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  createStudyGroup: async (groupData) => {
    const { data, error } = await supabase
      .from('study_groups')
      .insert([groupData])
      .select()
      .single()
    return { data, error }
  },

  joinStudyGroup: async (groupId, userId) => {
    const { data, error } = await supabase
      .from('group_members')
      .insert([{ group_id: groupId, user_id: userId }])
      .select()
      .single()
    return { data, error }
  },

  leaveStudyGroup: async (groupId, userId) => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)
    return { error }
  },

  getGroupMessages: async (groupId) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:users(username)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  sendMessage: async (messageData) => {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select(`
        *,
        user:users(username)
      `)
      .single()
    return { data, error }
  },

  // Platforms
  getPlatforms: async (category = 'all') => {
    let query = supabase
      .from('platforms')
      .select('*')

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query.order('name', { ascending: true })
    return { data, error }
  },

  getUserFavoritePlatforms: async (userId) => {
    const { data, error } = await supabase
      .from('user_platform_favorites')
      .select(`
        *,
        platform:platforms(*)
      `)
      .eq('user_id', userId)
    return { data, error }
  },

  togglePlatformFavorite: async (userId, platformId) => {
    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_platform_favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('platform_id', platformId)
      .single()

    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from('user_platform_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('platform_id', platformId)
      return { error }
    } else {
      // Add to favorites
      const { data, error } = await supabase
        .from('user_platform_favorites')
        .insert([{ user_id: userId, platform_id: platformId }])
        .select()
        .single()
      return { data, error }
    }
  }
}