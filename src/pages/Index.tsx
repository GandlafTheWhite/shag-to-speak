import { useState, useEffect } from 'react';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import MyWords from '@/components/MyWords';
import LearnWords from '@/components/LearnWords';
import MyProgress from '@/components/MyProgress';
import Help from '@/components/Help';
import Settings from '@/components/Settings';
import Achievements from '@/components/Achievements';
import ProfileSetupWizard from '@/components/ProfileSetupWizard';
import { apiClient } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: number;
  name: string;
  email: string;
  status: 'free' | 'premium';
  preferences: string[];
  word_count: number;
  exercises_remaining: number;
  daily_exercises_count: number;
  profile_completed?: boolean;
  exercise_difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'master';
  total_points?: number;
  current_streak?: number;
  longest_streak?: number;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard' | 'words' | 'learn' | 'progress' | 'help' | 'settings' | 'achievements'>('landing');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('shagtospeak_user');
    const storedToken = localStorage.getItem('auth_token');
    
    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      
      apiClient.setAuth(userData.id, storedToken);
      
      setUser(userData);
      
      if (userData.profile_completed === false) {
        setShowProfileSetup(true);
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('dashboard');
      }
    }
  }, []);

  const handleLogin = (userData: User, token: string) => {
    apiClient.setAuth(userData.id, token);
    
    setUser(userData);
    localStorage.setItem('shagtospeak_user', JSON.stringify(userData));
    localStorage.setItem('auth_token', token);
    
    if (userData.profile_completed === false) {
      setShowProfileSetup(true);
    }
    
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    apiClient.clearAuth();
    
    setUser(null);
    localStorage.removeItem('shagtospeak_user');
    localStorage.removeItem('auth_token');
    setCurrentPage('landing');
  };

  const updateUserData = (newData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);
      localStorage.setItem('shagtospeak_user', JSON.stringify(updatedUser));
    }
  };

  const handleCompleteProfile = async (data: { name: string; email: string; phone: string; preferences: string[] }) => {
    if (!user) return;
    
    setIsProfileLoading(true);
    try {
      const { user: updatedUser } = await apiClient.completeProfile(user.id, data);
      setUser(updatedUser);
      localStorage.setItem('shagtospeak_user', JSON.stringify(updatedUser));
      setShowProfileSetup(false);
      toast({
        title: 'Профиль настроен! 🎉',
        description: 'Теперь вы можете пользоваться всеми функциями платформы'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить профиль',
        variant: 'destructive'
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'landing' && <LandingPage onLogin={handleLogin} />}
      {currentPage === 'dashboard' && user && (
        <>
          <Dashboard 
            user={user} 
            onNavigate={(page) => {
              if (user.profile_completed === false) {
                setShowProfileSetup(true);
              } else {
                setCurrentPage(page);
              }
            }}
            onLogout={handleLogout}
            updateUser={updateUserData}
          />
          {showProfileSetup && (
            <ProfileSetupWizard 
              open={showProfileSetup}
              userId={user.id}
              initialName={user.name}
              onComplete={handleCompleteProfile}
              isLoading={isProfileLoading}
            />
          )}
        </>
      )}
      {currentPage === 'words' && user && (
        <>
          <MyWords 
            user={user}
            onNavigate={(page) => {
              if (user.profile_completed === false) {
                setShowProfileSetup(true);
                setCurrentPage('dashboard');
              } else {
                setCurrentPage(page);
              }
            }}
            updateUser={updateUserData}
          />
          {showProfileSetup && (
            <ProfileSetupWizard 
              open={showProfileSetup}
              userId={user.id}
              initialName={user.name}
              onComplete={handleCompleteProfile}
              isLoading={isProfileLoading}
            />
          )}
        </>
      )}
      {currentPage === 'learn' && user && (
        <>
          <LearnWords 
            user={user}
            onNavigate={(page) => {
              if (user.profile_completed === false) {
                setShowProfileSetup(true);
                setCurrentPage('dashboard');
              } else {
                setCurrentPage(page);
              }
            }}
            updateUser={updateUserData}
          />
          {showProfileSetup && (
            <ProfileSetupWizard 
              open={showProfileSetup}
              userId={user.id}
              initialName={user.name}
              onComplete={handleCompleteProfile}
              isLoading={isProfileLoading}
            />
          )}
        </>
      )}
      {currentPage === 'progress' && user && (
        <>
          <MyProgress 
            user={user}
            onNavigate={(page) => {
              if (user.profile_completed === false) {
                setShowProfileSetup(true);
                setCurrentPage('dashboard');
              } else {
                setCurrentPage(page);
              }
            }}
          />
          {showProfileSetup && (
            <ProfileSetupWizard 
              open={showProfileSetup}
              userId={user.id}
              initialName={user.name}
              onComplete={handleCompleteProfile}
              isLoading={isProfileLoading}
            />
          )}
        </>
      )}
      {currentPage === 'help' && user && (
        <>
          <Help onNavigate={(page) => {
            if (user.profile_completed === false) {
              setShowProfileSetup(true);
              setCurrentPage('dashboard');
            } else {
              setCurrentPage(page);
            }
          }} />
          {showProfileSetup && (
            <ProfileSetupWizard 
              open={showProfileSetup}
              userId={user.id}
              initialName={user.name}
              onComplete={handleCompleteProfile}
              isLoading={isProfileLoading}
            />
          )}
        </>
      )}
      {currentPage === 'settings' && user && (
        <>
          <Settings
            user={user}
            onNavigate={(page) => {
              if (user.profile_completed === false) {
                setShowProfileSetup(true);
                setCurrentPage('dashboard');
              } else {
                setCurrentPage(page);
              }
            }}
            updateUser={updateUserData}
          />
          {showProfileSetup && (
            <ProfileSetupWizard 
              open={showProfileSetup}
              userId={user.id}
              initialName={user.name}
              onComplete={handleCompleteProfile}
              isLoading={isProfileLoading}
            />
          )}
        </>
      )}
      {currentPage === 'achievements' && user && (
        <>
          <Achievements
            user={user}
            onNavigate={(page) => {
              if (user.profile_completed === false) {
                setShowProfileSetup(true);
                setCurrentPage('dashboard');
              } else {
                setCurrentPage(page);
              }
            }}
          />
          {showProfileSetup && (
            <ProfileSetupWizard 
              open={showProfileSetup}
              userId={user.id}
              initialName={user.name}
              onComplete={handleCompleteProfile}
              isLoading={isProfileLoading}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Index;