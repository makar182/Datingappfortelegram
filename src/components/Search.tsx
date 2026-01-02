import { useState, useEffect, useRef } from 'react';
import { Match, UserProfile } from '../App';
import { MapPin, Heart, ChevronLeft, ChevronRight, MessageCircle, Users, X } from 'lucide-react';
import { SkeletonCard } from './SkeletonCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProfileModal } from './ProfileModal';
import { BioPreview } from './BioPreview';

interface SearchProps {
  currentUser: UserProfile;
  myLikes: string[];
  whoLikedMe: Match[];
  mutualMatches: Match[];
  onLike: (matchId: string) => void;
  onAcceptLike: (match: Match) => void;
  onRequestChat: (match: Match) => void;
  initialTab?: 'discover' | 'likes';
  viewedInvites: string[];
  onMarkInvitesAsViewed: () => void;
  onSelectMatch?: (match: Match) => void;
  onRemoveMatch?: (matchId: string) => void;
  activeChatMatch?: Match | null;
}

type SearchTab = 'discover' | 'likes';
type LikesSubTab = 'received' | 'mutual';

export function Search({ 
  currentUser, 
  myLikes, 
  whoLikedMe, 
  mutualMatches,
  onLike, 
  onAcceptLike,
  onRequestChat,
  initialTab = 'discover',
  viewedInvites,
  onMarkInvitesAsViewed,
  onSelectMatch,
  onRemoveMatch,
  activeChatMatch = null
}: SearchProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);
  const [likesSubTab, setLikesSubTab] = useState<LikesSubTab>('received');
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Spotlight effect state for "Likes" tab (Есть другой чат button)
  const [showSpotlight, setShowSpotlight] = useState(false);
  const spotlightButtonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  // Spotlight effect state for "Discover" tab (Начать чат button when user has active chat)
  const [showDiscoverSpotlight, setShowDiscoverSpotlight] = useState(false);
  const discoverSpotlightButtonRef = useRef<HTMLButtonElement>(null);
  const [discoverButtonRect, setDiscoverButtonRect] = useState<DOMRect | null>(null);

  // Show spotlight when user switches to "received" tab and there's a disabled button
  useEffect(() => {
    // Check if we're on the right tab and if there's at least one disabled button (index 1)
    if (activeTab === 'likes' && likesSubTab === 'received' && whoLikedMe.length > 1) {
      const wasShown = localStorage.getItem('spotlightShown');
      if (!wasShown) {
        // Delay spotlight to let user see the page first
        const timer = setTimeout(() => {
          setShowSpotlight(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } else {
      // Hide spotlight if conditions are not met
      setShowSpotlight(false);
    }
  }, [activeTab, likesSubTab, whoLikedMe.length]);

  // Update button position when spotlight is shown
  useEffect(() => {
    if (showSpotlight && spotlightButtonRef.current) {
      const rect = spotlightButtonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
  }, [showSpotlight, activeTab, likesSubTab]);

  // Recalculate position on resize
  useEffect(() => {
    const handleResize = () => {
      if (showSpotlight && spotlightButtonRef.current) {
        const rect = spotlightButtonRef.current.getBoundingClientRect();
        setButtonRect(rect);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showSpotlight]);

  const handleCloseSpotlight = () => {
    setShowSpotlight(false);
    localStorage.setItem('spotlightShown', 'true');
  };

  const handleCloseDiscoverSpotlight = () => {
    setShowDiscoverSpotlight(false);
    localStorage.setItem('discoverSpotlightShown', 'true');
  };

  // Show spotlight in Discover when user tries to start chat but already has active chat
  useEffect(() => {
    // Check if current match is mutual
    const currentMatch = matches[currentIndex];
    const isMutualMatch = currentMatch && mutualMatches.find(m => m.id === currentMatch.id);
    
    if (activeTab === 'discover' && activeChatMatch !== null && isMutualMatch) {
      const wasShown = localStorage.getItem('discoverSpotlightShown');
      if (!wasShown) {
        // Delay spotlight to let user see the page first
        const timer = setTimeout(() => {
          setShowDiscoverSpotlight(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } else {
      // Hide spotlight if conditions are not met
      setShowDiscoverSpotlight(false);
    }
  }, [activeTab, activeChatMatch, currentIndex, matches, mutualMatches]);

  // Update discover button position when spotlight is shown
  useEffect(() => {
    if (showDiscoverSpotlight && discoverSpotlightButtonRef.current) {
      const rect = discoverSpotlightButtonRef.current.getBoundingClientRect();
      setDiscoverButtonRect(rect);
    }
  }, [showDiscoverSpotlight, activeTab, currentIndex]);

  // Recalculate discover position on resize
  useEffect(() => {
    const handleResize = () => {
      if (showDiscoverSpotlight && discoverSpotlightButtonRef.current) {
        const rect = discoverSpotlightButtonRef.current.getBoundingClientRect();
        setDiscoverButtonRect(rect);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showDiscoverSpotlight]);

  // Sync activeTab with initialTab prop
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Mark invites as viewed when user opens the "Меня пригласили" tab
  useEffect(() => {
    if (activeTab === 'likes' && likesSubTab === 'received') {
      onMarkInvitesAsViewed();
    }
  }, [activeTab, likesSubTab, onMarkInvitesAsViewed]);

  // Mock data generation
  useEffect(() => {
    const generateMockMatches = (): Match[] => {
      const names = currentUser.lookingForGender === 'female' 
        ? ['Анна', 'Наталья', 'Екатерина', 'Ирина', 'Светлана', 'Ольга', 'Дарья', 'Виктория']
        : ['Дмитрий', 'Александр', 'Максим', 'Сергей', 'Андрей', 'Иван', 'Михаил', 'Павел'];
      
      const photos = currentUser.lookingForGender === 'female'
        ? [
            'https://images.unsplash.com/photo-1623594675959-02360202d4d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwc21pbGV8ZW58MXx8fHwxNzY2Mjk4NTYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1612739980306-908bac4fc9fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHVsdCUyMHdvbWFuJTIwZWxlZ2FudCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2NjI5ODU2MXww&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1733685318298-89c7e43d5e6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXR1cmUlMjB3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBob3RvfGVufDF8fHx8MTc2NjI5ODU2MXww&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1661955571743-583dbaa19c58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBvdXRkb29yfGVufDF8fHx8MTc2NjI5ODU2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1722718827199-bb595ab51a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGxpZmVzdHlsZSUyMHBvcnRyYWl0JTIwYWR1bHR8ZW58MXx8fHwxNzY2Mjk4NTYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1758518727888-ffa196002e59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25maWRlbnQlMjB3b21hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2NjI5ODU2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
          ]
        : [];
      
      const bioExamples = [
        `💭 Что меня вдохновляет:\\nСтарые книжные магазины, где пахнет временем и историями. Разговоры, после коорых хоется переосмыслить всё, что казалось очевидным. Момент, когда понимаешь, что нашел единомыленника. Музыка, которая проникает прямо в душу и остается там навсегда. Путешествия в места, где никто тебя не знает, и можно быть собой без масок. Закаты над морем, когда все замирает и чувствуешь связь с чем-то большим.\\n\\n🌅 Мое идеальное утро:\\nПросыпаться без будильника, когда организм сам решил, что выспался. Первая чашка кофе с корицей на балконе, пока город еще не проснулся. Тишина и покой, когда можно просто думать о чем-то приятном. Легкая прохлада и солнечные лучи, пробивающиеся сквозь занавески. Никуда не спешить и не думать о делах хотя бы первый час. Может быть, немного почитать книгу или просто смотреть в окно.\\n\\n💫 Близость для меня:\\nЭто когда можно быть уязвимым и знать, что тебя не осудят, а примут таким, какой ты есть. Кода не нужно подбирать слова и можно говорить все, что чувствуешь. Момент, когда понимаешь человека с полувзгляда, без слов. Возможность разделить и радость, и печаль, зная, что тебя поддержат. Когда молчание не неловкое, а наоборот – комфортное и наполненное. Чувство, что ты дома, где бы ты ни был, лишь бы рядом был этот человек.`,
        
        `🎭 Что меня трогает:\\nМоменты искренности, когда люди снимают маски и показывают свою настоящую суть. Кгда человек не боится быть уязвимым и делится тем, что у него на душе. История успеха через преодоление трудностей всегда вдохновляет меня. Маленькие проявления доброты к незнакомым людям трогают до глубиы души. Кгда кто-то находит в себе силы простить и отпустить обиды. Честность даже в тех ситуациях, когда можно было бы солгать и никто бы не узнал.\\n\\n🌌 Мои мечты:\\nЖить так, чтобы каждый день был наполнен смыслом, а не просто прожит по инерции. Создать что-то значимое, что переживет меня и поможет другим людям. Путешествовать по миру и познавать разные культуры, расширяя свое понимание жизни. Найти баланс между работой и личной жизнью, чтобы было время на то, что действительно важно. Окружить себя люьм, которые разделяют мои ценности и вдохновляют становиться лучше. В конце жизни оглянуться назад без сожалений о несказанных словах и несделанных поступках.\\n\\n⭐ Мои ценности:\\nГлубина важнее ширины – лучше иметь несколько настоящих друей, чем тысячу знакомых. Честность перед собой и другими, даже когда это сложно и неудобно. азтие и рост – я верю, что нужно всегда двигаться вперед, а не стоять на месте. Эмпатия и способность понять чужую боль, поставить себя на место другого человека. Ответственность за свои слова и поступки, без перекладывания вины на обстоятельства. Свобода быть собой и давать эту свободу другим, не навязывая свои взгляды.`,
        
        `💫 Близость для меня:\\nЭто общие тишины, которые комфортнее любых слов и н треуют заполнения разговорами. Когда вы можете просто быть рядом и чувствовать связь без необходимости что-то говорить. Понимание с полувзгляда, когда один взгляд заменяет тысячу слов. Возможность показать свои слабости и странности, зная, что тебя примут. Совместные ритуалы, которые создаете только вы двое и которые наполнены мыслом. Чувство безопасности и принятия, которое не нужно заслуживать, оно просто есть.\\n\\n⭐ Мои ценности:\\nЛучше один настоящий разгово��, чем сто поверхностных бесед ни о чем. Качество общения важнее его количества – я ценю глубину. Искренность и открытость даже в тех моментах, когда проще было бы промолчать. Время – самый ценный ресурс, и я готов делиться им только с теми, кто действительно важен. Личные границы и уажение к пространству другого человека. Взаимность в отношениях, когда оба человека вкладываются одинаково.\\n\\n☀️ Идеальный день:\\nПрогулка по городу без маршрута, когда можно свернуть в любой переулок, который заинтересовал. Зайти в случайное кафе, которое никогда раньше не видел, и попробовать что-то новое. Встретить нтересного человека и поговорить о жизни, философии, мечтах. Найти тихое место в парке и почитать книгу или просто помечтать. Вечером встре��иться с близкими друзьями и провести время за настоящими разговорами. Закончить день с чувством, что прожил его не зря, что он был наполнен смыслом.`,
        
        `⭐ Мои ценности:\\nГлубина важнее ширины – я предпочитаю узкий круг по-настоящему близких людей. Честность в отноениях, даже если правда может быть неудобной или болезненной. Саморазвитие и постоянный рост – жизнь слишком коротка, чтобы стоять на месте. Эмоциональный интеллект и способность понимать себя и других на глубоком уровне. Баланс между раионалнотью и эмоциональностью в принятии решений. Уважение к выбору других людей, даже еи я  ним не согласен.\\n\\n☀️ Идеальный день:\\nДолгий разговор в уютном кафе, где забываешь про время и окружающий мир. Обсуждение глубоких тем – о смысле жизни, о мечтах, о том, что действительно важно. Совместное создание чего-то нового, будь то идея, проект или просто планы на будущее. Прогулка по вечернему городу, когда улицы пустеют и можно говорить обо всем на свете. Смотреть на звезды и философствовать о вселенной и нашем месте в ней. Вернуться домой с чувством глубокого удовлетворения от проведенного времени.\\n\\n💭 Что меня вдохновляет:\\nЛюди, которые живут своей правдой, не оглядываясь на мнение окружающих. Те, кто осмеливается быть уникальным в мире, где все стремятся быть как все. История о том, как кто-то преодолел свои страхи и ошел за мечтой. Творчество во всех его проявлениях – музыка, искусство, литература, танец. Глубокие разговоры, которые заставляют переосмыслить привычные вещи. Природа и ее совершенство, которое напоминает о чем-то большем, чем мы сами.`,
        
        `💭 Что меня вдохновляет:\\nПутешествия, которые меняют взгляд на мир и показывают, что все можно увидеть под другим углом. Встречи с людьми из разных культур, которые живт совершенно иначе, но счастливы. Моменты, когда понимаешь, что твои ограничения были только в голове. Книги, которые открывают новые миры и заставляют думать. Искусство, которое трогает за живое и пробуждает эмоции. Природа в ее первозданом вид, когда чувствуешь себя частью чего-то большего.\\n\\n🌅 Мое идеальное утро:\\nЙога на рассвете, когда мир еще спит и можно услышать свои мысли. Медитация под звуки природы, которая помогает настроиться на день. Свежий воздух и тишина, которая наполняет энергией и спокойствием. Легкий завтрак с чем-то вкусным и полезным, приготовленный не спеша. Планирование дня, но без жесткого графика, оставляя место для спонтанности. Может быть, утренняя прогулка или просто время, чтобы побыть наедине с собой.\\n\\n🎭 Чт меня трогает:\\nИскренние эмоии людей, когда они не боятся показать свою уязвимость. Момент, когда кто-то делится с тобой чем-то очень личным и важным. Проявления доброты без ожидания чего-то взамен, просто потому что так правильно. Истоия продоления, когда человек не сдался, несмотря на все трудности. Дети и их способность адоваться мелочам и жить настоящим моментом. Любовь во всех ее проявлениях – к людям, к жизни, к себе.`,
      ];
      
      return names.map((name, index) => ({
        id: `match-${index + 1}`,
        name,
        age: Math.floor(Math.random() * (currentUser.ageRangeMax - currentUser.ageRangeMin + 1)) + currentUser.ageRangeMin,
        distance: Math.floor(Math.random() * currentUser.searchRadius) + 1,
        photo: photos[index % photos.length],
        isOnline: Math.random() > 0.5,
        bio: bioExamples[index % bioExamples.length],
        gender: currentUser.lookingForGender,
      }));
    };

    // Simulate loading
    setTimeout(() => {
      setMatches(generateMockMatches());
      setIsLoading(false);
    }, 1000);
  }, [currentUser]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation on discover tab
      if (activeTab !== 'discover') return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < matches.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, matches.length, activeTab]);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart !== null) {
      const distance = e.targetTouches[0].clientX - touchStart;
      setSwipeOffset(distance);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwipeOffset(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    
    setSwipeOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleLikeClick = (match: Match) => {
    onLike(match.id);
    // Убираем автоматический переход - пусть пользователь сам листает
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl mb-6">Поиск</h1>
        <SkeletonCard />
      </div>
    );
  }

  // Вкладка "Кто меня лайкнул"
  if (activeTab === 'likes') {
    // Используем реальные данные вместо моков
    const iReceivedInvites = whoLikedMe; // Те, кто меня пригласил
    const iSentInvites = mutualMatches; // Взаимные приглашения (я пригласил и они приняли)

    const handleRemoveInvite = (matchId: string) => {
      console.log('Удалить приглашение:', matchId);
      // Логика удаления будет добавлена позже
      onRemoveMatch?.(matchId);
    };

    return (
      <div className="max-w-lg mx-auto p-6 flex flex-col h-[calc(100vh-5rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Почта</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setLikesSubTab('received')}
            className="flex-1 bg-white rounded-xl p-1 shadow-sm"
          >
            <div className={`rounded-lg py-2 px-4 text-center text-sm transition-all ${
              likesSubTab === 'received'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : 'text-gray-500 hover:bg-gray-50'
            }`}>
              Меня пригласили ({iReceivedInvites.length})
            </div>
          </button>
          <button
            onClick={() => setLikesSubTab('mutual')}
            className="flex-1 bg-white rounded-xl p-1 shadow-sm"
          >
            <div className={`rounded-lg py-2 px-4 text-center text-sm transition-all ${
              likesSubTab === 'mutual'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                : 'text-gray-500 hover:bg-gray-50'
            }`}>
              Я пригласил ({iSentInvites.length})
            </div>
          </button>
        </div>

        {/* List content */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {likesSubTab === 'received' ? (
            // Раздел "Меня пригласили"
            iReceivedInvites.map((match, index) => {
              const hasAnotherChat = index === 1; // Вторая запись с задизейбленной кнопкой
              
              return (
                <div key={match.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex gap-4">
                    {/* Photo */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      {match.photo ? (
                        <ImageWithFallback
                          src={match.photo}
                          alt={match.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
                          <span className="text-white text-2xl">{match.name.charAt(0)}</span>
                        </div>
                      )}
                      {match.isOnline && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-lg truncate">{match.name}</h3>
                        <span className="text-sm text-gray-500">{match.age}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{match.distance} км</span>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          ref={hasAnotherChat ? spotlightButtonRef : null}
                          onClick={() => {
                            if (!hasAnotherChat) {
                              onRequestChat(match);
                              onSelectMatch?.(match);
                            }
                          }}
                          disabled={hasAnotherChat}
                          className={`flex-1 rounded-xl py-2 px-4 text-sm transition-all flex items-center justify-center gap-1 ${
                            hasAnotherChat
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg'
                          }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          {hasAnotherChat ? 'Есть другой чат' : 'Начать чат'}
                        </button>
                        <button
                          onClick={() => handleRemoveInvite(match.id)}
                          className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all flex items-center justify-center"
                          title="Удалить"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Раздел "Я пригласил"
            iSentInvites.map((match) => (
              <div key={match.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex gap-4">
                  {/* Photo */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    {match.photo ? (
                      <ImageWithFallback
                        src={match.photo}
                        alt={match.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
                        <span className="text-white text-2xl">{match.name.charAt(0)}</span>
                      </div>
                    )}
                    {match.isOnline && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="text-lg truncate">{match.name}</h3>
                      <span className="text-sm text-gray-500">{match.age}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{match.distance} км</span>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        disabled
                        className="flex-1 bg-gray-100 text-gray-400 rounded-xl py-2 px-4 text-sm cursor-not-allowed"
                      >
                        Жду ответа
                      </button>
                      <button
                        onClick={() => handleRemoveInvite(match.id)}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all flex items-center justify-center"
                        title="Удалить"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Spotlight overlay - only on "Есть другой чат" button */}
        {showSpotlight && activeTab === 'likes' && likesSubTab === 'received' && buttonRect && (
          <>
            {/* Dark overlay with cutout */}
            <div 
              className="fixed inset-0 pointer-events-none z-50"
              style={{
                background: `radial-gradient(
                  ellipse ${buttonRect.width + 40}px ${buttonRect.height + 40}px at ${buttonRect.left + buttonRect.width / 2}px ${buttonRect.top + buttonRect.height / 2}px,
                  transparent 0%,
                  transparent 40%,
                  rgba(0, 0, 0, 0.85) 70%
                )`
              }}
            />

            {/* Glowing ring around button */}
            <div
              className="fixed z-50 pointer-events-none animate-pulse"
              style={{
                top: buttonRect.top - 12,
                left: buttonRect.left - 12,
                width: buttonRect.width + 24,
                height: buttonRect.height + 24,
                borderRadius: '12px',
                border: '3px solid rgba(251, 191, 36, 0.8)',
                boxShadow: '0 0 30px rgba(251, 191, 36, 0.6), inset 0 0 20px rgba(251, 191, 36, 0.3)',
              }}
            />

            {/* Tooltip text */}
            <div
              className="fixed z-50 pointer-events-none"
              style={{
                top: buttonRect.top - 140,
                left: buttonRect.left + buttonRect.width / 2,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 max-w-sm relative animate-in fade-in zoom-in duration-300">
                {/* Close button in top right corner */}
                <button
                  onClick={handleCloseSpotlight}
                  className="pointer-events-auto absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-gray-600 hover:text-gray-800 border border-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="text-center text-gray-800 space-y-3">
                  <strong className="block text-lg">💬 Правило одного чата</strong>
                  <p className="text-sm">
                    Этот человек уже общается с кем-то другим. По правилам эксперимента можно вести только один чат одновременно.
                  </p>
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-lg text-left">
                    <p className="text-xs text-gray-700">
                      <strong>📍 Совет:</strong> Отслеживайте изменение статуса этой кнопки — как только она станет активной, вы сможете начать чат с этим человеком!
                    </p>
                  </div>
                </div>
              </div>
              {/* Arrow pointing down */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 -bottom-2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '8px solid white',
                }}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // Вкладка "Discover" (основной поиск)
  if (matches.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl mb-6">Поиск</h1>
        <div className="bg-white rounded-lg p-8 text-center shadow-sm">
          <p className="text-gray-500">Нет доступных собеседников</p>
        </div>
      </div>
    );
  }

  const currentMatch = matches[currentIndex];
  const isLiked = myLikes.includes(currentMatch.id);
  const isMutual = mutualMatches.find(m => m.id === currentMatch.id);

  return (
    <div className="max-w-lg mx-auto p-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Card Container */}
      <div className="flex-1 flex flex-col relative min-h-0 mt-6">
        <div
          ref={cardRef}
          className="flex-1 bg-white rounded-3xl shadow-[0_20px_60px_rgba(5,150,105,0.15)] overflow-hidden transition-all duration-300 flex flex-col relative"
          style={{
            transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.03}deg)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Photo */}
          <div className="relative flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
            {currentMatch.photo ? (
              <ImageWithFallback
                src={currentMatch.photo}
                alt={currentMatch.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400">
                <span className="text-white text-8xl">
                  {currentMatch.name.charAt(0)}
                </span>
              </div>
            )}
            
            {/* Online badge */}
            {currentMatch.isOnline && (
              <div className="absolute top-5 right-5 text-white text-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Online
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-6 text-white">
              <div className="flex items-baseline gap-2 mb-2">
                <h2 className="text-4xl">{currentMatch.name}</h2>
                <span className="text-2xl opacity-90">{currentMatch.age}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm opacity-90 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{currentMatch.distance} км от вас</span>
              </div>

              {/* Bio Preview */}
              {currentMatch.bio && (
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="w-full mb-6"
                >
                  <BioPreview bio={currentMatch.bio} onClick={() => setShowProfileModal(true)} />
                </button>
              )}

              {/* Action buttons on photo */}
              <div className="flex gap-3">
                {!isLiked ? (
                  <button
                    onClick={() => handleLikeClick(currentMatch)}
                    className="flex-1 bg-white/20 backdrop-blur-md text-white rounded-2xl py-4 hover:bg-white/30 transition-all flex items-center justify-center gap-2 border border-white/30"
                  >
                    <span className="font-medium">Пригласить</span>
                  </button>
                ) : isMutual ? (
                  <button
                    ref={activeChatMatch ? discoverSpotlightButtonRef : null}
                    onClick={() => {
                      if (!activeChatMatch) {
                        onRequestChat(currentMatch);
                      }
                    }}
                    disabled={activeChatMatch !== null}
                    className={`flex-1 backdrop-blur-md rounded-2xl py-4 transition-all flex items-center justify-center gap-2 shadow-xl ${
                      activeChatMatch
                        ? 'bg-gray-200/95 text-gray-500 cursor-not-allowed'
                        : 'bg-white/95 text-pink-600 hover:bg-white'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">{activeChatMatch ? 'Уже есть чат' : 'Начать чат'}</span>
                  </button>
                ) : (
                  <div className="flex-1 bg-white/95 backdrop-blur-md rounded-2xl py-4 flex items-center justify-center shadow-xl">
                    <span className="text-emerald-700 font-medium">✓ Приглашение отправлено</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation hint */}
        <div className="flex justify-center gap-2 mt-4">
          {matches.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          match={currentMatch}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Discover Spotlight overlay - only on "Уже есть чат" button */}
      {showDiscoverSpotlight && activeTab === 'discover' && discoverButtonRect && (
        <>
          {/* Dark overlay with cutout */}
          <div 
            className="fixed inset-0 pointer-events-none z-50"
            style={{
              background: `radial-gradient(
                ellipse ${discoverButtonRect.width + 40}px ${discoverButtonRect.height + 40}px at ${discoverButtonRect.left + discoverButtonRect.width / 2}px ${discoverButtonRect.top + discoverButtonRect.height / 2}px,
                transparent 0%,
                transparent 40%,
                rgba(0, 0, 0, 0.85) 70%
              )`
            }}
          />

          {/* Glowing ring around button */}
          <div
            className="fixed z-50 pointer-events-none animate-pulse"
            style={{
              top: discoverButtonRect.top - 12,
              left: discoverButtonRect.left - 12,
              width: discoverButtonRect.width + 24,
              height: discoverButtonRect.height + 24,
              borderRadius: '20px',
              border: '3px solid rgba(251, 191, 36, 0.8)',
              boxShadow: '0 0 30px rgba(251, 191, 36, 0.6), inset 0 0 20px rgba(251, 191, 36, 0.3)',
            }}
          />

          {/* Tooltip text */}
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              top: discoverButtonRect.top - 160,
              left: discoverButtonRect.left + discoverButtonRect.width / 2,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 max-w-sm relative animate-in fade-in zoom-in duration-300">
              {/* Close button in top right corner */}
              <button
                onClick={handleCloseDiscoverSpotlight}
                className="pointer-events-auto absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-gray-600 hover:text-gray-800 border border-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center text-gray-800 space-y-3">
                <strong className="block text-lg">⚡ Правило одного чата</strong>
                <p className="text-sm">
                  У вас уже есть активный чат. По правилам эксперимента можно вести только один чат одновременно.
                </p>
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-lg text-left">
                  <p className="text-xs text-gray-700">
                    <strong>💡 Подсказка:</strong> Завершите текущий чат, чтобы начать общение с новым человеком. Это помогает сосредоточиться на качестве знакомства!
                  </p>
                </div>
              </div>
            </div>
            {/* Arrow pointing down */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 -bottom-2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid white',
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}