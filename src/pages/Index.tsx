import { useState, useEffect } from 'react';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import MyWords from '@/components/MyWords';
import LearnWords from '@/components/LearnWords';
import MyProgress from '@/components/MyProgress';
import Help from '@/components/Help';
import Settings from '@/components/Settings';
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
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard' | 'words' | 'learn' | 'progress' | 'help' | 'settings'>('landing');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('shagtospeak_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      if (userData.profile_completed === false) {
        setShowProfileSetup(true);
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('dashboard');
      }
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('shagtospeak_user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('shagtospeak_user');
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

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'landing' && <LandingPage onLogin={handleLogin} />}
      {currentPage === 'dashboard' && user && (
        <>
          <Dashboard 
            user={user} 
            onNavigate={setCurrentPage}
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
        <MyWords 
          user={user}
          onNavigate={setCurrentPage}
          updateUser={updateUserData}
        />
      )}
      {currentPage === 'learn' && user && (
        <LearnWords 
          user={user}
          onNavigate={setCurrentPage}
          updateUser={updateUserData}
        />
      )}
      {currentPage === 'progress' && user && (
        <MyProgress 
          user={user}
          onNavigate={setCurrentPage}
        />
      )}
      {currentPage === 'help' && user && (
        <Help onNavigate={setCurrentPage} />
      )}
      {currentPage === 'settings' && user && (
        <Settings
          user={user}
          onNavigate={setCurrentPage}
          updateUser={updateUserData}
        />
      )}
    </div>
  );
};

export default Index;