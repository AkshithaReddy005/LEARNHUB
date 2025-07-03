import { supabase, auth, db } from '../lib/supabase.js'

// Authentication functions
export const authService = {
  async signUp(email, password, username) {
    try {
      const { data, error } = await auth.signUp(email, password, username)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: error.message }
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: error.message }
    }
  },

  async signOut() {
    try {
      const { error } = await auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
  },

  async getCurrentUser() {
    try {
      const user = await auth.getCurrentUser()
      if (user) {
        const { data: profile } = await db.getUser(user.id)
        return { ...user, profile }
      }
      return null
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  onAuthStateChange(callback) {
    return auth.onAuthStateChange(callback)
  }
}

// Course functions
export const courseService = {
  async getCourses(userId) {
    try {
      const { data, error } = await db.getCourses(userId)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get courses error:', error)
      return { success: false, error: error.message }
    }
  },

  async createCourse(courseData) {
    try {
      const { data, error } = await db.createCourse(courseData)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create course error:', error)
      return { success: false, error: error.message }
    }
  },

  async updateCourse(courseId, updates) {
    try {
      const { data, error } = await db.updateCourse(courseId, updates)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update course error:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteCourse(courseId) {
    try {
      const { error } = await db.deleteCourse(courseId)
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete course error:', error)
      return { success: false, error: error.message }
    }
  }
}

// Note functions
export const noteService = {
  async getNotes(userId) {
    try {
      const { data, error } = await db.getNotes(userId)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get notes error:', error)
      return { success: false, error: error.message }
    }
  },

  async createNote(noteData) {
    try {
      const { data, error } = await db.createNote(noteData)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create note error:', error)
      return { success: false, error: error.message }
    }
  },

  async updateNote(noteId, updates) {
    try {
      const { data, error } = await db.updateNote(noteId, updates)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update note error:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteNote(noteId) {
    try {
      const { error } = await db.deleteNote(noteId)
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete note error:', error)
      return { success: false, error: error.message }
    }
  }
}

// Bookmark functions
export const bookmarkService = {
  async getBookmarks(userId) {
    try {
      const { data, error } = await db.getBookmarks(userId)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get bookmarks error:', error)
      return { success: false, error: error.message }
    }
  },

  async createBookmark(bookmarkData) {
    try {
      const { data, error } = await db.createBookmark(bookmarkData)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create bookmark error:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteBookmark(bookmarkId) {
    try {
      const { error } = await db.deleteBookmark(bookmarkId)
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete bookmark error:', error)
      return { success: false, error: error.message }
    }
  }
}

// Reminder functions
export const reminderService = {
  async getReminders(userId) {
    try {
      const { data, error } = await db.getReminders(userId)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get reminders error:', error)
      return { success: false, error: error.message }
    }
  },

  async createReminder(reminderData) {
    try {
      const { data, error } = await db.createReminder(reminderData)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create reminder error:', error)
      return { success: false, error: error.message }
    }
  },

  async updateReminder(reminderId, updates) {
    try {
      const { data, error } = await db.updateReminder(reminderId, updates)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update reminder error:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteReminder(reminderId) {
    try {
      const { error } = await db.deleteReminder(reminderId)
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete reminder error:', error)
      return { success: false, error: error.message }
    }
  }
}

// Study group functions
export const studyGroupService = {
  async getStudyGroups(filter = 'all', userId = null) {
    try {
      const { data, error } = await db.getStudyGroups(filter, userId)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get study groups error:', error)
      return { success: false, error: error.message }
    }
  },

  async createStudyGroup(groupData) {
    try {
      const { data, error } = await db.createStudyGroup(groupData)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create study group error:', error)
      return { success: false, error: error.message }
    }
  },

  async joinStudyGroup(groupId, userId) {
    try {
      const { data, error } = await db.joinStudyGroup(groupId, userId)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Join study group error:', error)
      return { success: false, error: error.message }
    }
  },

  async leaveStudyGroup(groupId, userId) {
    try {
      const { error } = await db.leaveStudyGroup(groupId, userId)
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Leave study group error:', error)
      return { success: false, error: error.message }
    }
  },

  async getGroupMessages(groupId) {
    try {
      const { data, error } = await db.getGroupMessages(groupId)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get group messages error:', error)
      return { success: false, error: error.message }
    }
  },

  async sendMessage(messageData) {
    try {
      const { data, error } = await db.sendMessage(messageData)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Send message error:', error)
      return { success: false, error: error.message }
    }
  }
}

// Platform functions
export const platformService = {
  async getPlatforms(category = 'all') {
    try {
      const { data, error } = await db.getPlatforms(category)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get platforms error:', error)
      return { success: false, error: error.message }
    }
  },

  async getUserFavoritePlatforms(userId) {
    try {
      const { data, error } = await db.getUserFavoritePlatforms(userId)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get user favorite platforms error:', error)
      return { success: false, error: error.message }
    }
  },

  async togglePlatformFavorite(userId, platformId) {
    try {
      const { data, error } = await db.togglePlatformFavorite(userId, platformId)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Toggle platform favorite error:', error)
      return { success: false, error: error.message }
    }
  }
}