/**
 * EduRecommend API Client (EduApi)
 * Connects frontend to FastAPI backend (base path: /api/v1)
 * Features:
 *  - In-memory JWT access token
 *  - HttpOnly refresh token cookie rotation with X-Requested-With: fetch
 *  - Automatic 401 retry with token refresh
 *  - Full coverage of Auth, Profile, Recommendations, Courses, Enrollments,
 *    Learning Path, Interactions, and Feedback endpoints.
 */

(function (global) {
  // Configurable base URL: can be overridden via window.EDU_API_BASE
  const API_BASE = (typeof window !== 'undefined' && window.EDU_API_BASE)
    || 'http://127.0.0.1:8000/api/v1';

  let accessToken = null;
  let currentUser = null;
  let refreshPromise = null;

  /**
   * Safe fetch wrapper with auth header, CSRF header, and auto-refresh on 401
   */
  async function request(endpoint, options = {}, isRetry = false) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config = {
      ...options,
      headers,
      credentials: options.credentials || 'include', // needed for httpOnly refresh cookie
    };

    let response;
    try {
      response = await fetch(url, config);
    } catch (networkErr) {
      console.warn(`[EduApi] Network request failed to ${url}:`, networkErr);
      throw new Error(`Unable to reach EduRecommend backend at ${API_BASE}. Please ensure FastAPI is running on port 8000.`);
    }

    // Auto-refresh access token on 401 (if not already retrying and not calling auth endpoints)
    if (response.status === 401 && !isRetry && !endpoint.startsWith('/auth/')) {
      try {
        await refreshSession();
        return await request(endpoint, options, true);
      } catch (refreshErr) {
        accessToken = null;
        currentUser = null;
        throw new Error('Session expired. Please log in again.');
      }
    }

    // 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = (data && data.error && data.error.message)
        || (data && data.detail)
        || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  /**
   * Rotates refresh token via httpOnly cookie and acquires a fresh access token
   */
  async function refreshSession() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'fetch', // CSRF protection required by backend
          },
          credentials: 'include',
        });

        if (!res.ok) {
          accessToken = null;
          currentUser = null;
          throw new Error('Refresh failed');
        }

        const data = await res.json();
        accessToken = data.access_token || data.token || null;
        if (data.user) currentUser = data.user;
        return accessToken;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  const EduApi = {
    get API_BASE() {
      return API_BASE;
    },
    get accessToken() {
      return accessToken;
    },
    get currentUser() {
      return currentUser;
    },

    setAccessToken(token) {
      accessToken = token;
    },

    setCurrentUser(user) {
      currentUser = user;
    },

    // ----------------------------------------------------
    // AUTHENTICATION
    // ----------------------------------------------------

    /**
     * Attempts to restore session on page load using httpOnly refresh cookie
     */
    async restoreSession() {
      try {
        await refreshSession();
        if (accessToken) {
          currentUser = await this.getProfile();
          return currentUser;
        }
      } catch (err) {
        // No active session
        accessToken = null;
        currentUser = null;
      }
      return null;
    },

    /**
     * Log in user with email & password
     */
    async login(email, password) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      accessToken = data.access_token || data.token;
      currentUser = data.user || (await this.getProfile());
      return { token: accessToken, user: currentUser };
    },

    /**
     * Register a new user
     */
    async register(userData) {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      accessToken = data.access_token || data.token;
      currentUser = data.user || (await this.getProfile());
      return { token: accessToken, user: currentUser };
    },

    /**
     * Revoke session and clear refresh cookie
     */
    async logout() {
      try {
        await request('/auth/logout', {
          method: 'POST',
          headers: {
            'X-Requested-With': 'fetch',
          },
        });
      } catch (err) {
        console.warn('[EduApi] Logout request returned:', err);
      } finally {
        accessToken = null;
        currentUser = null;
      }
    },

    // ----------------------------------------------------
    // PROFILE & SKILLS
    // ----------------------------------------------------

    /**
     * Get current learner profile
     */
    async getProfile() {
      const profile = await request('/me');
      currentUser = profile;
      return profile;
    },

    /**
     * Update current learner profile (name, program, level, interests)
     */
    async updateProfile(updates) {
      const profile = await request('/me', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      currentUser = profile;
      return profile;
    },

    /**
     * Replace user declared skills: [{ name: 'Python', proficiency: 4 }, ...]
     */
    async updateSkills(skillsList) {
      return await request('/me/skills', {
        method: 'PUT',
        body: JSON.stringify(skillsList),
      });
    },

    // ----------------------------------------------------
    // COURSES & CATALOGUE
    // ----------------------------------------------------

    /**
     * Query courses with search, category, level, and pagination
     */
    async getCourses(params = {}) {
      const query = new URLSearchParams();
      if (params.q) query.set('q', params.q);
      if (params.category && params.category !== 'All') query.set('category', params.category);
      if (params.level && params.level !== 'All') query.set('level', params.level);
      if (params.page) query.set('page', params.page);
      if (params.limit) query.set('limit', params.limit);

      const qs = query.toString();
      return await request(`/courses${qs ? `?${qs}` : ''}`);
    },

    /**
     * Get single course detail by ID
     */
    async getCourse(courseId) {
      return await request(`/courses/${courseId}`);
    },

    // ----------------------------------------------------
    // AI RECOMMENDATIONS
    // ----------------------------------------------------

    /**
     * Get hybrid AI recommendations for current user
     */
    async getRecommendations(limit = 4, refresh = false) {
      return await request(`/me/recommendations?limit=${limit}&refresh=${refresh}`);
    },

    // ----------------------------------------------------
    // ENROLLMENT & PROGRESS
    // ----------------------------------------------------

    /**
     * Start/Enroll in course (returns enrollment record)
     */
    async startCourse(courseId) {
      return await request(`/courses/${courseId}/start`, {
        method: 'POST',
      });
    },

    /**
     * Get current user's enrollments
     */
    async getEnrollments() {
      return await request('/me/enrollments');
    },

    /**
     * Update enrollment progress percentage (0 - 100)
     */
    async updateEnrollmentProgress(enrollmentId, progressPct) {
      return await request(`/enrollments/${enrollmentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ progress_pct: progressPct }),
      });
    },

    // ----------------------------------------------------
    // LEARNING PATH & PROGRESS
    // ----------------------------------------------------

    /**
     * Get personalized learning path
     */
    async getLearningPath() {
      return await request('/me/learning-path');
    },

    /**
     * Regenerate learning path
     */
    async regenerateLearningPath() {
      return await request('/me/learning-path/regenerate', {
        method: 'POST',
      });
    },

    /**
     * Get overall learner progress statistics
     */
    async getProgress() {
      return await request('/me/progress');
    },

    // ----------------------------------------------------
    // INTERACTIONS & FEEDBACK
    // ----------------------------------------------------

    /**
     * Track user events (batch of views/searches)
     * e.g. [{ type: 'view', course_id: 'c1' }, { type: 'search', query: 'PyTorch' }]
     */
    async trackEvents(events) {
      return await request('/interactions', {
        method: 'POST',
        body: JSON.stringify(events),
      });
    },

    /**
     * Send learner rating & feedback
     * { rating: 1-5, message?: string, course_id?: string }
     */
    async sendFeedback(rating, message = '', courseId = null) {
      const payload = { rating: Number(rating) };
      if (message) payload.message = message;
      if (courseId) payload.course_id = courseId;
      return await request('/feedback', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    // ----------------------------------------------------
    // HEALTH CHECK
    // ----------------------------------------------------
    async checkHealth() {
      try {
        const root = API_BASE.replace('/api/v1', '');
        const res = await fetch(`${root}/health`);
        return await res.json();
      } catch (err) {
        return { status: 'down', error: err.message };
      }
    },
  };

  // Export for browser scripts and Node / bundlers
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EduApi;
  }
  global.EduApi = EduApi;
})(typeof window !== 'undefined' ? window : globalThis);
