import { useState } from 'react';
import type { User } from '@/pages/Index';
import { apiClient } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import LandingPageContent from './landing/LandingPageContent';
import ModeSelectionDialog from './landing/ModeSelectionDialog';
import AuthDialog from './landing/AuthDialog';
import ForgotPasswordDialog from './landing/ForgotPasswordDialog';
import TelegramAuthDialog from './landing/TelegramAuthDialog';

interface LandingPageProps {
  onLogin: (user: User, token: string) => void;
}

const LandingPage = ({ onLogin }: LandingPageProps) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showTelegramAuth, setShowTelegramAuth] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'code'>('email');
  const { toast } = useToast();

  const handleOpenTelegramAuth = () => {
    setShowModeDialog(false);
    setShowAuthDialog(false);
    setShowTelegramAuth(true);
  };

  const handleVerifyTelegramCode = async (code: string) => {
    setIsLoading(true);
    try {
      const { user, token } = await apiClient.telegramBotAuth(code);
      onLogin(user, token);
      setShowTelegramAuth(false);
      toast({
        title: 'Вход выполнен!',
        description: `Добро пожаловать, ${user.name}! 🚀`
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось войти через Telegram',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isRegister) {
        const { user, token } = await apiClient.register(
          email,
          password,
          name || 'Пользователь',
          phone,
          selectedPreferences
        );
        
        onLogin(user, token);
        
        toast({
          title: 'Регистрация успешна!',
          description: `Добро пожаловать, ${user.name}!`
        });
      } else {
        const { user, token } = await apiClient.login(email, password);
        
        onLogin(user, token);
        
        toast({
          title: 'Вход выполнен!',
          description: `С возвращением, ${user.name}!`
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRecoveryCode = async () => {
    if (!recoveryEmail) return;
    setIsLoading(true);
    try {
      await apiClient.sendRecoveryCode(recoveryEmail);
      setRecoveryStep('code');
      toast({
        title: 'Код отправлен!',
        description: 'Проверьте Telegram — код придет в личные сообщения бота'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить код',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!recoveryEmail || !recoveryCode || !newPassword) return;
    setIsLoading(true);
    try {
      await apiClient.verifyRecoveryCode(recoveryEmail, recoveryCode, newPassword);
      setShowForgotPassword(false);
      setRecoveryStep('email');
      setRecoveryEmail('');
      setRecoveryCode('');
      setNewPassword('');
      toast({
        title: 'Пароль изменен!',
        description: 'Теперь вы можете войти с новым паролем'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сбросить пароль',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePreference = (prefId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(p => p !== prefId)
        : [...prev, prefId]
    );
  };

  const handleToggleAuthMode = () => {
    setIsRegister(!isRegister);
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setSelectedPreferences([]);
  };

  const handleShowForgotPassword = () => {
    setShowAuthDialog(false);
    setShowForgotPassword(true);
  };

  const handleBackToEmail = () => {
    setRecoveryStep('email');
    setRecoveryCode('');
    setNewPassword('');
  };

  const handleSelectRegister = () => {
    setShowModeDialog(false);
    setIsRegister(true);
    setShowAuthDialog(true);
  };

  const handleSelectLogin = () => {
    setShowModeDialog(false);
    setIsRegister(false);
    setShowAuthDialog(true);
  };

  return (
    <div className="min-h-screen">
      <LandingPageContent onShowModeDialog={() => setShowModeDialog(true)} />
      
      <ModeSelectionDialog
        open={showModeDialog}
        onOpenChange={setShowModeDialog}
        onSelectRegister={handleSelectRegister}
        onSelectLogin={handleSelectLogin}
        onTelegramAuth={handleOpenTelegramAuth}
      />

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        isRegister={isRegister}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        name={name}
        setName={setName}
        phone={phone}
        setPhone={setPhone}
        selectedPreferences={selectedPreferences}
        togglePreference={togglePreference}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onTelegramAuth={handleOpenTelegramAuth}
        onToggleMode={handleToggleAuthMode}
        onShowForgotPassword={handleShowForgotPassword}
      />

      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        recoveryStep={recoveryStep}
        recoveryEmail={recoveryEmail}
        setRecoveryEmail={setRecoveryEmail}
        recoveryCode={recoveryCode}
        setRecoveryCode={setRecoveryCode}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        isLoading={isLoading}
        onSendCode={handleSendRecoveryCode}
        onVerifyCode={handleVerifyCode}
        onBack={handleBackToEmail}
      />

      <TelegramAuthDialog
        open={showTelegramAuth}
        onOpenChange={setShowTelegramAuth}
        onVerifyCode={handleVerifyTelegramCode}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LandingPage;