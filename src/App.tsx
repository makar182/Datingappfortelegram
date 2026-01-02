import { useState, useCallback } from 'react';
import { User, MessageCircle, Heart } from 'lucide-react';
import { Profile } from './components/Profile';
import { Search } from './components/Search';
import { Messages } from './components/Messages';
import { BottomNav } from './components/BottomNav';
import { Onboarding } from './components/Onboarding';
import { ProfileForm } from './components/ProfileForm';
import { MailboxIcon } from './components/MailboxIcon';

type Tab = 'profile' | 'search' | 'messages';
type AppStage = 'onboarding' | 'profile-form' | 'main';

export interface UserProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  photo?: string;
  lookingForGender: 'male' | 'female';
  ageRangeMin: number;
  ageRangeMax: number;
  searchRadius: number;
  bio?: string;
}

export interface Match {
  id: string;
  name: string;
  age: number;
  distance: number;
  photo?: string;
  isOnline: boolean;
  bio?: string;
  gender?: 'male' | 'female';
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  replyTo?: {
    id: string;
    text: string;
    senderId: string;
  };
}

function App() {
  // For testing, you can change 'onboarding' to 'main' to skip onboarding
  const [appStage, setAppStage] = useState<AppStage>('onboarding');
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [activeChatMatch, setActiveChatMatch] = useState<Match | null>(null);
  const [searchInitialTab, setSearchInitialTab] = useState<'discover' | 'likes'>('discover');
  
  // Mock current user data
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'user-1',
    name: 'Александр',
    gender: 'male',
    dateOfBirth: '1995-06-15',
    photo: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjYzMTYyODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    lookingForGender: 'female',
    ageRangeMin: 22,
    ageRangeMax: 35,
    searchRadius: 50,
  });

  // Лайки: кого я лайкнул
  const [myLikes, setMyLikes] = useState<string[]>([]);
  
  // Лайки: кто лайкнул меня (для примера добавляем пару человек)
  const [whoLikedMe, setWhoLikedMe] = useState<Match[]>([
    {
      id: 'like-1',
      name: 'Елена',
      age: 28,
      distance: 3,
      photo: 'https://images.unsplash.com/photo-1612739980306-908bac4fc9fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHVsdCUyMHdvbWFuJTIwZWxlZ2FudCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2NjI5ODU2MXww&ixlib=rb-4.1.0&q=80&w=1080',
      isOnline: true,
      bio: '💭 Что меня вдохновляет:\\\\nСтарые книжные магазины, разговоры после которых хочется переосмыслить всё.',
      gender: 'female',
    },
    {
      id: 'like-2',
      name: 'Мария',
      age: 26,
      distance: 5,
      photo: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6',
      isOnline: false,
      bio: 'Ищу интересного человека',
      gender: 'female',
    },
  ]);

  // Взаимные матчи (кого я лайкнул И кто лайкнул меня)
  // Для тестирования добавляем Елену как взаимный матч
  const [mutualMatches, setMutualMatches] = useState<Match[]>([
    {
      id: 'like-1',
      name: 'Елена',
      age: 28,
      distance: 3,
      photo: 'https://images.unsplash.com/photo-1612739980306-908bac4fc9fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHVsdCUyMHdvbWFuJTIwZWxlZ2FudCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2NjI5ODU2MXww&ixlib=rb-4.1.0&q=80&w=1080',
      isOnline: true,
      bio: '💭 Что меня вдохновляет:\\\\\\\\nСтарые книжные магазины, разговоры после которых хочется переосмыслить всё.',
      gender: 'female',
    },
    {
      id: 'like-2',
      name: 'Мария',
      age: 26,
      distance: 5,
      photo: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6',
      isOnline: false,
      bio: 'Ищу интересного человека',
      gender: 'female',
    },
  ]);

  // Просмотренные письма (для отслеживания новых)
  const [viewedInvites, setViewedInvites] = useState<string[]>([]);

  // Запросы а чат (кто предложил начать чат)
  const [chatRequests, setChatRequests] = useState<{from: string, match: Match}[]>([]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);
  };

  const handleOnboardingComplete = () => {
    setAppStage('profile-form');
  };

  const handleProfileFormSave = (profile: UserProfile) => {
    setCurrentUser(profile);
    setAppStage('main');
  };

  const handleShowOnboarding = () => {
    setAppStage('onboarding');
  };

  // Обработка лайка
  const handleLike = (matchId: string) => {
    if (!myLikes.includes(matchId)) {
      setMyLikes([...myLikes, matchId]);
      
      // Проверяем, есть ли взаимный лайк
      const likedMeBack = whoLikedMe.find(m => m.id === matchId);
      if (likedMeBack && !mutualMatches.find(m => m.id === matchId)) {
        setMutualMatches([...mutualMatches, likedMeBack]);
      }
    }
  };

  // Обработка предложения начать чат
  const handleRequestChat = (match: Match) => {
    // Можно предложить чат только если уже есть взаимный матч
    if (mutualMatches.find(m => m.id === match.id)) {
      // В реальности здесь был бы запрос к API
      // Для примера сразу открываем чат
      handleOpenChat(match.id, match);
    }
  };

  const handleOpenChat = (matchId: string, match: Match) => {
    // Закрываем все другие чаты (может быть ативен только один)
    setActiveChatMatch(match);
    setActiveTab('messages');
  };

  // Принятие лайка от другого пользователя (создаем взаимный матч)
  const handleAcceptLike = (match: Match) => {
    if (!myLikes.includes(match.id)) {
      setMyLikes([...myLikes, match.id]);
    }
    if (!mutualMatches.find(m => m.id === match.id)) {
      setMutualMatches([...mutualMatches, match]);
    }
    // Удаляем из списка "кто меня лайкнул"
    setWhoLikedMe(whoLikedMe.filter(m => m.id !== match.id));
  };

  // Обработчик клика на кнопку чата/приглашений
  const handleMessagesTabClick = () => {
    if (activeChatMatch !== null) {
      // Если есть открытый чат, переходим в Messages
      setActiveTab('messages');
    } else {
      // Если нет открытого чата, переходим в Почту (Search с вкладкой likes)
      setActiveTab('search');
      setSearchInitialTab('likes');
    }
  };

  // Обработчик открытия вкладки почты - помечаем все как просмотренные
  const handleMarkInvitesAsViewed = useCallback(() => {
    const allInviteIds = whoLikedMe.map(m => m.id);
    setViewedInvites(allInviteIds);
  }, [whoLikedMe]);

  // Удаление матча из всех списков
  const handleRemoveMatch = (matchId: string) => {
    // Удаляем из взаимных матчей
    setMutualMatches(prev => prev.filter(m => m.id !== matchId));
    // Удаляем из списка "кто меня лайкнул"
    setWhoLikedMe(prev => prev.filter(m => m.id !== matchId));
    // Удаляем из моих лайков
    setMyLikes(prev => prev.filter(id => id !== matchId));
  };

  // Подсчет новых (непросмотренных) приглашений
  const newInvitesCount = whoLikedMe.filter(m => !viewedInvites.includes(m.id)).length;
  const hasNewInvites = newInvitesCount > 0;

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { 
      id: 'search', 
      label: 'Поиск', 
      customContent: <span className="font-semibold text-sm">36</span>,
      isActive: activeTab === 'search' && searchInitialTab === 'discover'
    },
    { 
      id: 'messages', 
      label: 'Чат', 
      customContent: activeChatMatch !== null ? <MessageCircle className="w-8 h-8" /> : <MailboxIcon hasNewMail={hasNewInvites} className="w-8 h-8" />,
      isActive: activeChatMatch !== null ? activeTab === 'messages' : (activeTab === 'search' && searchInitialTab === 'likes')
    },
  ];

  // Show onboarding
  if (appStage === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Show profile form
  if (appStage === 'profile-form') {
    return <ProfileForm onSave={handleProfileFormSave} isFirstTime={true} />;
  }

  // Main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex flex-col">
      {/* Main content */}
      <main className="flex-1 pb-20 overflow-hidden">
        {activeTab === 'profile' && (
          <Profile user={currentUser} onUpdate={handleProfileUpdate} onShowOnboarding={handleShowOnboarding} />
        )}
        {activeTab === 'search' && (
          <Search 
            currentUser={currentUser}
            myLikes={myLikes}
            whoLikedMe={whoLikedMe}
            mutualMatches={mutualMatches}
            onLike={handleLike}
            onAcceptLike={handleAcceptLike}
            onRequestChat={handleRequestChat}
            initialTab={searchInitialTab}
            viewedInvites={viewedInvites}
            onMarkInvitesAsViewed={handleMarkInvitesAsViewed}
            onSelectMatch={(match) => {
              setActiveChatMatch(match);
              setActiveTab('messages');
            }}
            onRemoveMatch={handleRemoveMatch}
            activeChatMatch={activeChatMatch}
          />
        )}
        {activeTab === 'messages' && (
          <Messages 
            chatMatch={activeChatMatch}
            mutualMatches={mutualMatches}
            onSelectMatch={(match) => setActiveChatMatch(match)}
            onCloseChat={() => {
              setActiveChatMatch(null);
              setActiveTab('search');
              setSearchInitialTab('likes');
            }}
            onRemoveMatch={handleRemoveMatch}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={(tabId) => {
          if (tabId === 'messages') {
            handleMessagesTabClick();
          } else {
            setActiveTab(tabId as Tab);
            if (tabId === 'search') {
              setSearchInitialTab('discover');
            }
          }
        }} 
      />
    </div>
  );
}

export default App;