import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import RecommendationsPage from './pages/RecommendationsPage';
import CourseDetailPage from './pages/CourseDetailPage';
import SkillGapPage from './pages/SkillGapPage';
import ProfileAnalyticsPage from './pages/ProfileAnalyticsPage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import AiNeuralUniversePage from './pages/AiNeuralUniversePage';
import AdminRecommendationDashboard from './pages/AdminRecommendationDashboard';
import DatabaseSchemaPage from './pages/DatabaseSchemaPage';
import ThreeSkillGalaxy from './components/ThreeSkillGalaxy';
import AILearningAssistant from './components/AILearningAssistant';
import ScenarioSwitcher from './components/ScenarioSwitcher';
import SearchAndDiscovery from './components/SearchAndDiscovery';
import { initialUserProfile, coursesData, studentPersonas, availableGoals, skillGalaxyData } from './data/mockData';
import { fetchRecommendations } from './services/recommendationEngine';
import EduApi from './services/eduApi';
import { Menu, X, Network, Database, ShieldCheck } from 'lucide-react';

export default function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('edupulse_theme');
    return saved ? saved === 'dark' : true;
  });

  // Auth & User State
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState(initialUserProfile);
  const [activePersonaKey, setActivePersonaKey] = useState('alex');

  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // AI Recommendation State
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Global Overlay State
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [is2DForced, setIs2DForced] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Sync Dark Mode with document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('edupulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('edupulse_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const showToast = (toastObj) => {
    setToast(toastObj);
  };

  // Restore active FastAPI session on initial load if available
  useEffect(() => {
    async function initBackendSession() {
      try {
        const backendUser = await EduApi.restoreSession();
        if (backendUser) {
          setUser((prev) => ({
            ...prev,
            id: backendUser.id || prev.id,
            name: backendUser.name || prev.name,
            email: backendUser.email || prev.email,
            targetRole: backendUser.program || backendUser.target_career || prev.targetRole,
          }));
          setIsLoggedIn(true);
          showToast({
            type: 'ai',
            title: '⚡ FastAPI Session Active',
            message: `Connected to EduRecommend backend as ${backendUser.name}`,
          });
        }
      } catch (err) {
        // Backend offline or no active session, running in simulation mode
      }
    }
    initBackendSession();
  }, []);

  // Fetch initial recommendations on load or role change
  useEffect(() => {
    const loadAiFeed = async () => {
      setIsLoadingRecommendations(true);
      try {
        const results = await fetchRecommendations(user.id, {}, user.preferences, 300);
        setRecommendedCourses(results);
      } catch (err) {
        console.error('Failed to load initial AI recommendations', err);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };
    loadAiFeed();
  }, [user.targetRole, user.preferences]);

  // Handlers
  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setCurrentView('course-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleBookmark = (courseId) => {
    const isBookmarked = user.bookmarkedCourseIds?.includes(courseId);
    let updatedBookmarks;
    if (isBookmarked) {
      updatedBookmarks = user.bookmarkedCourseIds.filter((id) => id !== courseId);
      showToast({
        type: 'info',
        title: 'Bookmark Removed',
        message: 'Course removed from your wishlist.',
      });
    } else {
      updatedBookmarks = [...(user.bookmarkedCourseIds || []), courseId];
      showToast({
        type: 'success',
        title: 'Saved to Wishlist',
        message: 'Course added to your saved bookmarks.',
      });
    }
    setUser((prev) => ({
      ...prev,
      bookmarkedCourseIds: updatedBookmarks,
    }));
  };

  const handleEnroll = (courseId) => {
    const isAlreadyEnrolled = user.enrolledCourses?.some((enc) => enc.courseId === courseId);
    if (isAlreadyEnrolled) {
      showToast({
        type: 'info',
        title: 'Already Enrolled',
        message: 'You are already actively enrolled in this course.',
      });
      return;
    }

    const courseObj = coursesData.find((c) => c.id === courseId);
    const newEnrollment = {
      courseId,
      progress: 5,
      currentModule: courseObj?.syllabus?.[0]?.title || 'Module 1: Introduction',
      nextLesson: courseObj?.syllabus?.[0]?.lessons?.[0]?.title || 'Lesson 1.1: Getting Started',
      lastAccessed: 'Just now',
      timeSpentHours: 0.5,
    };

    setUser((prev) => ({
      ...prev,
      enrolledCourses: [newEnrollment, ...(prev.enrolledCourses || [])],
    }));

    // Record enrollment in FastAPI backend if online
    EduApi.startCourse(courseId).catch((err) => {
      console.info('[EduApi] Start course background sync:', err.message);
    });

    showToast({
      type: 'success',
      title: '🎉 Enrollment Confirmed!',
      message: `Enrolled in "${courseObj?.title}". Learning module loaded.`,
    });
  };

  const handleUpdatePreferences = (newPreferences) => {
    setUser((prev) => ({
      ...prev,
      targetRole: newPreferences.targetCareer || prev.targetRole,
      preferences: {
        ...prev.preferences,
        ...newPreferences,
      },
    }));
  };

  const handleUpdateTargetRole = (newRole) => {
    setUser((prev) => ({
      ...prev,
      targetRole: newRole,
      preferences: {
        ...prev.preferences,
        targetCareer: newRole,
      },
    }));
  };

  // Persona switching
  const handleSwitchPersona = (key) => {
    const persona = studentPersonas?.[key];
    if (!persona) return;
    setActivePersonaKey(key);
    setUser(persona);
    showToast({
      type: 'ai',
      title: `Switched to ${persona.name}`,
      message: `Persona loaded: ${persona.targetRole}. Recommendations will adapt.`,
    });
  };

  const handleLoginAsDemo = () => {
    setUser(initialUserProfile);
    setActivePersonaKey('alex');
    setIsLoggedIn(true);
    setCurrentView('dashboard');
    showToast({
      type: 'ai',
      title: 'Demo Session Active',
      message: 'Logged in as Alex Morgan (Goal: Become a Data Scientist).',
    });
  };

  const handleLoginCustom = async ({ name, email, targetRole, password }) => {
    if (password) {
      try {
        const res = await EduApi.login(email, password);
        if (res.user) {
          name = res.user.name || name;
          targetRole = res.user.program || targetRole;
        }
      } catch (err) {
        console.warn('[EduApi] Backend login note:', err.message);
      }
    }

    setUser({
      ...initialUserProfile,
      name,
      email,
      targetRole,
      preferences: {
        ...initialUserProfile.preferences,
        targetCareer: targetRole,
      },
    });
    setIsLoggedIn(true);
    setCurrentView('dashboard');
    showToast({
      type: 'success',
      title: `Welcome, ${name}!`,
      message: `Your AI recommendation profile has been initialized for ${targetRole}.`,
    });
  };

  const handleLogout = () => {
    EduApi.logout().catch(() => {});
    setIsLoggedIn(false);
    setCurrentView('landing');
    showToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been logged out of EduPulse AI.',
    });
  };

  // If not logged in or on landing page, show Landing Page
  if (!isLoggedIn || currentView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        <LandingPage
          onLoginAsDemo={handleLoginAsDemo}
          onLoginCustom={handleLoginCustom}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={handleNavigate}
        onSelectCourse={handleSelectCourse}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Container with Sidebar Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 relative pt-6">
        {/* Mobile menu trigger */}
        <div className="lg:hidden fixed bottom-6 left-6 z-50">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-3.5 rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-600/50 flex items-center gap-2 text-xs font-bold"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span>Menu</span>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          user={user}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 min-w-0">
          {currentView === 'dashboard' && (
            <StudentDashboard
              user={user}
              onNavigate={handleNavigate}
              onSelectCourse={handleSelectCourse}
              onToggleBookmark={handleToggleBookmark}
              onEnroll={handleEnroll}
              recommendedCourses={recommendedCourses}
              isLoadingRecommendations={isLoadingRecommendations}
            />
          )}

          {currentView === 'recommendations' && (
            <RecommendationsPage
              user={user}
              onSelectCourse={handleSelectCourse}
              onToggleBookmark={handleToggleBookmark}
              onEnroll={handleEnroll}
              onShowToast={showToast}
            />
          )}

          {currentView === 'neural-universe' && (
            <AiNeuralUniversePage
              user={user}
              onSelectCourse={handleSelectCourse}
              onToggleBookmark={handleToggleBookmark}
              onEnroll={handleEnroll}
              onShowToast={showToast}
              onUpdateTargetRole={handleUpdateTargetRole}
            />
          )}

          {currentView === 'course-detail' && (
            <CourseDetailPage
              course={selectedCourse}
              user={user}
              onBack={() => handleNavigate('dashboard')}
              onSelectCourse={handleSelectCourse}
              onToggleBookmark={handleToggleBookmark}
              onEnroll={handleEnroll}
              onShowToast={showToast}
            />
          )}

          {currentView === 'skill-gap' && (
            <SkillGapPage
              user={user}
              onSelectCourse={handleSelectCourse}
              onShowToast={showToast}
              onUpdateTargetRole={handleUpdateTargetRole}
            />
          )}

          {currentView === 'catalog' && (
            <CourseCatalogPage
              user={user}
              onSelectCourse={handleSelectCourse}
              onToggleBookmark={handleToggleBookmark}
              onEnroll={handleEnroll}
            />
          )}

          {currentView === 'profile' && (
            <ProfileAnalyticsPage
              user={user}
              onUpdatePreferences={handleUpdatePreferences}
              onShowToast={showToast}
            />
          )}

          {currentView === 'admin' && (
            <AdminRecommendationDashboard
              onShowToast={showToast}
            />
          )}

          {currentView === 'database-schema' && (
            <DatabaseSchemaPage />
          )}

          {currentView === 'skill-galaxy' && (
            <div className="pb-8">
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
                    <Network className="w-5 h-5 text-white" />
                  </span>
                  3D Skill Galaxy
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Explore your skill constellation — node size and glow reflect your proficiency. Drag to rotate.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/50 h-[600px]">
                <ThreeSkillGalaxy
                  user={user}
                  skillData={skillGalaxyData}
                  force2D={is2DForced}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── Global Overlays (always mounted, toggled by state) ─── */}

      {/* AI Learning Assistant floating chatbot */}
      <AILearningAssistant
        isOpen={isAIAssistantOpen}
        onToggle={() => setIsAIAssistantOpen((p) => !p)}
        user={user}
        onNavigate={handleNavigate}
      />

      {/* Scenario Switcher dev toolbar */}
      <ScenarioSwitcher
        currentPersonaKey={activePersonaKey}
        onSwitchPersona={handleSwitchPersona}
        availableGoals={availableGoals}
        currentGoal={user.targetRole}
        onChangeGoal={handleUpdateTargetRole}
        is2DForced={is2DForced}
        onToggle2D={() => setIs2DForced((p) => !p)}
      />

      {/* Full-screen Search & Discovery modal */}
      <SearchAndDiscovery
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        user={user}
        onSelectCourse={(course) => {
          setIsSearchOpen(false);
          handleSelectCourse(course);
        }}
        onNavigate={(view) => {
          setIsSearchOpen(false);
          handleNavigate(view);
        }}
      />

      {/* Admin & DB links — quick-access floating pill (desktop only) */}
      <div className="hidden lg:flex fixed bottom-6 right-6 z-40 flex-col gap-2 items-end">
        <button
          onClick={() => handleNavigate('admin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-lg ${
            currentView === 'admin'
              ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 backdrop-blur-xl'
          }`}
          title="Admin Recommendation Dashboard"
        >
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          Admin
        </button>
        <button
          onClick={() => handleNavigate('database-schema')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-lg ${
            currentView === 'database-schema'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 backdrop-blur-xl'
          }`}
          title="Database Schema Explorer"
        >
          <Database className="w-4 h-4 text-emerald-400" />
          DB Schema
        </button>
      </div>

      {/* Global Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
