import { useState, useEffect } from 'react';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import MyWords from '@/components/MyWords';
import LearnWords from '@/components/LearnWords';
import MyProgress from '@/components/MyProgress';
import Help from '@/components/Help';
import Settings from '@/components/Settings';

export interface User {
  id: number;
  name: string;
  email: string;
  status: 'free' | 'premium';
  preferences: string[];
  word_count: number;
  exercises_remaining: number;
  daily_exercises_count: number;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard' | 'words' | 'learn' | 'progress' | 'help' | 'settings'>('landing');

  useEffect(() => {
    const storedUser = localStorage.getItem('shagtospeak_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentPage('dashboard');
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

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'landing' && <LandingPage onLogin={handleLogin} />}
      {currentPage === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />
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