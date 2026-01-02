import { useState, useEffect, useRef } from 'react';
import { Match, Message } from '../App';
import { Send, HelpCircle, MessageSquare, Check, X, CornerDownRight, Heart, Sparkles, Brain, Trash2, Eye } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProfileModal } from './ProfileModal';

interface MessagesProps {
  chatMatch: Match | null;
  mutualMatches: Match[];
  onSelectMatch?: (match: Match) => void;
  onCloseChat?: () => void;
  onRemoveMatch?: (matchId: string) => void;
}

export function Messages({ chatMatch, mutualMatches, onSelectMatch, onCloseChat, onRemoveMatch }: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sharedMessageCount, setSharedMessageCount] = useState(5);
  const [questionCount, setQuestionCount] = useState(5);
  const [questionCategories, setQuestionCategories] = useState({
    closer: 5,      // быть ближе
    evenCloser: 5,  // еще ближе
    innerWorld: 5   // внутренний мир
  });
  const [currentStage, setCurrentStage] = useState('Знакомство');
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [pendingAnswers, setPendingAnswers] = useState<{
    [questionId: string]: {
      myAnswer: string | null;
      theirAnswer: string | null;
      myPublished: boolean;
      theirPublished: boolean;
      myMatch: boolean | null;
      theirMatch: boolean | null;
    }
  }>({});
  const [matchedAnswersCount, setMatchedAnswersCount] = useState(0);
  const [matchedQuestions, setMatchedQuestions] = useState<{
    id: string;
    question: string;
    myAnswer: string;
    theirAnswer: string;
  }[]>([]);
  const [showMatchedQuestionsModal, setShowMatchedQuestionsModal] = useState(false);
  const [meetingVote, setMeetingVote] = useState<{
    myVote: 'yes' | 'no' | 'not-ready' | null;
    theirVote: 'yes' | 'no' | 'not-ready' | null;
    canRevote: boolean;
    postponedUntil: Date | null;
  }>({
    myVote: null,
    theirVote: null,
    canRevote: true,
    postponedUntil: null,
  });
  const [showMeetingWarning, setShowMeetingWarning] = useState(false);
  const [timerTick, setTimerTick] = useState(0);
  const [aronQuestions, setAronQuestions] = useState<string[]>([]);
  const [currentAronQuestionIndex, setCurrentAronQuestionIndex] = useState(0);
  const [currentDisplayedQuestion, setCurrentDisplayedQuestion] = useState<string | null>(null);
  const [showEyeContact, setShowEyeContact] = useState(false);
  const [eyeContactTimer, setEyeContactTimer] = useState(240); // 4 minutes = 240 seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [experimentComplete, setExperimentComplete] = useState(false);
  
  // Главный вопрос - новые состояния
  const [showMainQuestionIntro, setShowMainQuestionIntro] = useState(false);
  const [mainQuestionTimer, setMainQuestionTimer] = useState<Date | null>(null); // 3 days timer
  const [showMainQuestion, setShowMainQuestion] = useState(false);
  const [earlyMainQuestionRequest, setEarlyMainQuestionRequest] = useState<'none' | 'requested' | 'confirmed'>('none');
  const [showPartnerConfirmation, setShowPartnerConfirmation] = useState(false);
  const [mainQuestionAnswers, setMainQuestionAnswers] = useState<{
    myAnswer: 'yes' | 'no' | null;
    theirAnswer: 'yes' | 'no' | null;
  }>({
    myAnswer: null,
    theirAnswer: null,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [contactInfo, setContactInfo] = useState('');
  const [partnerContactInfo, setPartnerContactInfo] = useState(''); // For testing
  const [testPartnerAnswer, setTestPartnerAnswer] = useState<'yes' | 'no' | null>(null); // For testing
  const [showContactInput, setShowContactInput] = useState(false); // Show contact input step
  
  // Удаление чата - новые состояния
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [showPartnerDeleteNotification, setShowPartnerDeleteNotification] = useState(false);
  const [partnerDeleteInfo, setPartnerDeleteInfo] = useState<{ reason: string; sharedFeedback: boolean } | null>(null);
  
  // Модальные окна этапов
  const [showStageTransitionModal, setShowStageTransitionModal] = useState(false);
  const [transitionStageName, setTransitionStageName] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const hasShownIntroRef = useRef<string | null>(null); // Track if intro was shown for current chat
  const currentUserId = 'user-1';

  const stages = ['Знакомство', 'Интуиция', 'Сближение', 'Главный вопрос', 'Свидание', 'Свободное общение'];

  // 36 вопросов Артура Арона
  const ARON_36_QUESTIONS = [
    // Набор 1 (вопросы 1-12)
    '1. Если бы вы могли выбрать кого угодно в мире, кого бы вы пригласили на ужин?',
    '2. Хотели бы вы быть знаменитым? Каким образом?',
    '3. Прежде чем позвонить по телефону, вы ко��да-нибудь репетируете то, что собираетесь сказать? Почему?',
    '4. Что для вас было бы "идеальны��" днем?',
    '5. Когда вы в последний раз пели для себя? А для кого-то другого?',
    '6. Если бы вы могли дожить до 90 лет и сохранить либо разум, либо тело 30-летнего на последние 60 лет вашей жизни, что бы вы выбрали?',
    '7. У вас есть ��айное предчувствие о том, как вы умрёте?',
    '8. Назовите три общие черты между вами и вашим партнёром.',
    '9. За что в своей жизни вы бо��ьше всего благодарны?',
    '10. Если бы вы могли что-то изменить в том, как вас воспитывали, что бы это было?',
    '11. В течение 4 минут расскажите своему партнёру историю своей жизни как можно подробнее.',
    '12. Если бы вы могли проснуться завтра, обладая каким-либо качеством или способностью, что бы это было?',
    // Набор 2 (вопросы 13-24)
    '13. Если бы хрустальный шар мог рассказать вам правду о себе, вашей жизни, будущем или о чём-то ещё, что бы вы хотели узнать?',
    '14. Есть ли что-то, о чём вы давно мечтаете? Почему вы этого не сделали?',
    '15. Какое самое большое достижение в вашей жизни?',
    '16. Что вы больше всего цените в дружбе?',
    '17. Какое ваше самое ценное воспоминание?',
    '18. Какое ваше самое ужасное воспоминание?',
    '19. Если бы вы знали, что через год внезапно умрёте, изменили бы вы что-нибудь в своей жизни? Почему?',
    '20. Что значит дружба для вас?',
    '21. Какую роль играют любовь и привязанность в вашей жизни?',
    '22. По очереди поделитесь тем, что считаете положительными качествами своего партнёра. Поделитесь пятью пунктами.',
    '23. Наско��ько близки и тёплы отношения в вашей семье? Считаете ли вы своё детство более счастливым, чем у большинства людей?',
    '24. Как вы относитесь к своим отношениям с матерью?',
    // Набор 3 (вопросы 25-36)
    '25. Произнесите три истинных утверждения, используя "мы". Например, "Мы оба находимся в этой комнате и чувствуем..."',
    '26. Закончите это предложение: "Хотел бы я, чтобы у ме��я был кто-то, с кем я мог бы разделить..."',
    '27. Если бы вы собирались стать близким другом со своим партнёром, пожалуйста, поделитесь тем, что было бы важно для него или неё знать.',
    '28. Расскажите партнёру, что вам в нём или в ней нравится; будьте на этот раз очень честными, говоря то, что не сказали бы кому-то, с кем только что познакомились.',
    '29. Поделитесь с партнёром нело��ким моментом в вашей жизни.',
    '30. Когда вы в последний раз плакали перед другим человеком? А в одиночестве?',
    '31. Расскажите партнёру, что вам в нём или в ней уже нравится.',
    '32. Что для вас слишком серьёзно, чтобы шутить об этом?',
    '33. Если бы вы должны были умереть сегодня вечером без возможности поговорить с кем-либо, о чём вы больше всего сожалели бы, что не сказали ��ому-то? Почему вы до сих пор не сказали им это?',
    '34. Ваш дом со всем, что у вас есть, загорается. После спасения близких и домашних животных у вас есть время, чтобы безопасно совершить последний рывок и спасти один предмет. Что это было бы? Почему?',
    '35. Из всех людей в вашей семье, чья смерть был�� бы для вас самой тяжёлой? Почему?',
    '36. Поделитесь личной проблемой и спросите у партнёра совета о том, как он или она справились бы с ней. Также попросите партнёра рассказа��ь вам, как, по его или её мнению, вы относитесь к выбранной вами проблеме.',
  ];

  useEffect(() => {
    // Initialize Aron questions
    setAronQuestions(ARON_36_QUESTIONS);
  }, []);

  useEffect(() => {
    // Eye contact timer countdown
    if (isTimerRunning && eyeContactTimer > 0) {
      const interval = setInterval(() => {
        setEyeContactTimer(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setExperimentComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, eyeContactTimer]);

  useEffect(() => {
    // Load messages only if chat exists
    if (chatMatch) {
      // Mock messages for the chat
      const mockMessages: Message[] = [
        {
          id: 'msg-1',
          text: 'Привет! Как дела?',
          senderId: chatMatch.id,
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          id: 'msg-2',
          text: 'Привет! Всё отлично, спасибо! Ты как?',
          senderId: currentUserId,
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
        },
        {
          id: 'msg-3',
          text: 'Тоже хорошо! Чем занимаешься?',
          senderId: chatMatch.id,
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
        },
        {
          id: 'msg-4',
          text: 'Работаю над проектом. А ты?',
          senderId: currentUserId,
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
        },
      ];

      setMessages(mockMessages);
      
      // Initialize counter based on total existing messages
      const totalMessages = mockMessages.length;
      setSharedMessageCount(5 - totalMessages);
    } else {
      setMessages([]);
    }
  }, [chatMatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show "Знакомство" stage intro when chat first opens
  useEffect(() => {
    if (chatMatch && currentStage === 'Знакомство' && hasShownIntroRef.current !== chatMatch.id) {
      hasShownIntroRef.current = chatMatch.id;
      const timer = setTimeout(() => {
        setTransitionStageName('Знакомство');
        setShowStageTransitionModal(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [chatMatch, currentStage]);

  // Timer for main question (3 days)
  useEffect(() => {
    if (mainQuestionTimer && !showMainQuestion) {
      const interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = mainQuestionTimer.getTime() - now;
        
        if (timeLeft <= 0) {
          // Time's up, show main question (cannot be closed without answering)
          setShowMainQuestion(true);
          clearInterval(interval);
        } else {
          // Force re-render to update timer display
          setTimerTick(prev => prev + 1);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [mainQuestionTimer, showMainQuestion]);

  // Timer update for postponed vote
  useEffect(() => {
    if (!meetingVote.canRevote && meetingVote.postponedUntil) {
      const interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = meetingVote.postponedUntil!.getTime() - now;
        
        if (timeLeft <= 0) {
          // Time's up, return to "Главный вопрос" stage
          setCurrentStage('Главный вопрос');
          setMeetingVote(prev => ({
            ...prev,
            canRevote: true,
          }));
          clearInterval(interval);
        } else {
          // Force re-render to update timer display
          setTimerTick(prev => prev + 1);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [meetingVote.canRevote, meetingVote.postponedUntil]);

  // Auto-transition from Знакомство to Интуиция
  useEffect(() => {
    if (currentStage === 'Знакомство' && sharedMessageCount <= 0 && !showStageTransitionModal) {
      const timer = setTimeout(() => {
        setTransitionStageName('Интуиция');
        setShowStageTransitionModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStage, sharedMessageCount, showStageTransitionModal]);

  // Auto-transition from Интуиция to Сближение
  useEffect(() => {
    if (currentStage === 'Интуиция' && sharedMessageCount <= 0 && questionCount <= 0 && !showStageTransitionModal) {
      const timer = setTimeout(() => {
        setTransitionStageName('Сближение');
        setShowStageTransitionModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStage, sharedMessageCount, questionCount, showStageTransitionModal]);

  // Auto-trigger Main Question intro when Сближение stage is complete
  useEffect(() => {
    if (currentStage === 'Сближение' && 
        sharedMessageCount <= 0 && 
        questionCategories.closer <= 0 && 
        questionCategories.evenCloser <= 0 && 
        questionCategories.innerWorld <= 0 && 
        !showMainQuestionIntro && 
        !mainQuestionTimer) {
      // Small delay to make transition smoother
      const timer = setTimeout(() => {
        setShowMainQuestionIntro(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStage, sharedMessageCount, questionCategories.closer, questionCategories.evenCloser, questionCategories.innerWorld, showMainQuestionIntro, mainQuestionTimer]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatMatch) return;

    // If replying to a question, handle differently
    if (replyToMessage && replyToMessage.senderId === 'system') {
      // Store answer as pending
      setPendingAnswers(prev => ({
        ...prev,
        [replyToMessage.id]: {
          ...(prev[replyToMessage.id] || {
            myAnswer: null,
            theirAnswer: null,
            myPublished: false,
            theirPublished: false,
            myMatch: null,
            theirMatch: null,
          }),
          myAnswer: newMessage.trim(),
        }
      }));
      setNewMessage('');
      setReplyToMessage(null);
      return;
    }

    // Regular message handling
    const message: Message = {
      id: `msg-${Date.now()}`,
      text: newMessage.trim(),
      senderId: currentUserId,
      timestamp: new Date(),
      ...(replyToMessage && {
        replyTo: {
          id: replyToMessage.id,
          text: replyToMessage.text,
          senderId: replyToMessage.senderId,
        }
      })
    };

    setMessages([...messages, message]);
    setNewMessage('');
    setReplyToMessage(null);
    
    // Update shared message count (prevent negative)
    setSharedMessageCount(prevCount => Math.max(0, prevCount - 1));

    // Simulate response from match
    setTimeout(() => {
      const responses = [
        'Интересно!',
        'Понимаю тебя',
        'Отличная идея!',
        'Согласна!',
        'Расскажи подробнее',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const response: Message = {
        id: `msg-${Date.now()}`,
        text: randomResponse,
        senderId: chatMatch.id,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
      setSharedMessageCount(prev => Math.max(0, prev - 1));
    }, 1500);
  };

  const handleMoveToNextStage = () => {
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      
      // Special handling for "Главный вопрос" stage
      if (nextStage === 'Главный вопрос') {
        setShowMainQuestionIntro(true);
        return;
      }
      
      setCurrentStage(nextStage);
      setSharedMessageCount(5); // Reset counter for new stage
      setQuestionCount(5); // Reset question counter for new stage
    }
  };
  
  const handleStageTransitionClose = () => {
    setShowStageTransitionModal(false);
    setCurrentStage(transitionStageName);
    
    if (transitionStageName === 'Интуиция') {
      setSharedMessageCount(5);
      setQuestionCount(5);
    } else if (transitionStageName === 'Сближение') {
      setSharedMessageCount(5);
      setQuestionCategories({
        closer: 5,
        evenCloser: 5,
        innerWorld: 5
      });
    }
  };
  
  const handleMainQuestionIntroClose = () => {
    setShowMainQuestionIntro(false);
    setCurrentStage('Главный вопрос');
    setSharedMessageCount(0); // Reset to 0 - unlimited messages
    setQuestionCount(0); // Reset to 0
    setQuestionCategories({
      closer: 0,
      evenCloser: 0,
      innerWorld: 0
    }); // Reset all question categories to 0 - unlimited questions
    
    // Start 3-day timer
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
    setMainQuestionTimer(threeDaysLater);
  };
  
  const handleRequestEarlyMainQuestion = () => {
    setEarlyMainQuestionRequest('requested');
    setShowPartnerConfirmation(true);
  };
  
  const handlePartnerResponse = (confirmed: boolean) => {
    setShowPartnerConfirmation(false);
    if (confirmed) {
      setEarlyMainQuestionRequest('confirmed');
      setShowMainQuestion(true);
    } else {
      setEarlyMainQuestionRequest('none');
    }
  };
  
  const handleMainQuestionAnswer = (answer: 'yes' | 'no') => {
    setMainQuestionAnswers(prev => ({ ...prev, myAnswer: answer }));
    
    // If answer is NO, skip contact input and show rejection modal
    if (answer === 'no') {
      setShowContactInput(false);
      setShowMainQuestion(false);
      
      // Simulate partner's response after a delay
      setTimeout(() => {
        setMainQuestionAnswers(prev => ({ ...prev, theirAnswer: testPartnerAnswer || 'no' }));
        setShowRejectionModal(true);
      }, 1500);
    } else {
      // If answer is YES, show contact input form
      setShowContactInput(true);
    }
  };
  
  const handleContactInfoSubmit = () => {
    // Check if test partner answer is set
    if (!testPartnerAnswer) {
      alert('⚠️ Пожалуйста, установите тестовый ответ собеседника в настройках выше');
      return;
    }
    
    setShowContactInput(false);
    
    // Simulate waiting for partner's answer
    setTimeout(() => {
      const partnerAnswer = testPartnerAnswer;
      setMainQuestionAnswers(prev => ({ ...prev, theirAnswer: partnerAnswer }));
      
      // Check results
      if (mainQuestionAnswers.myAnswer === 'yes' && partnerAnswer === 'yes') {
        setShowMainQuestion(false);
        setShowSuccessModal(true);
      } else {
        setShowMainQuestion(false);
        setShowRejectionModal(true);
      }
    }, 1500);
  };
  
  const handleSuccessModalContinue = () => {
    setShowSuccessModal(false);
    setCurrentStage('Свидание');
    setSharedMessageCount(5);
  };
  
  const handleChatDeletion = () => {
    setShowRejectionModal(false);
    // Remove match from the list
    if (chatMatch && onRemoveMatch) {
      onRemoveMatch(chatMatch.id);
    }
    onCloseChat?.();
  };

  // Обработчик удаления чата вручную
  const handleDeleteChatClick = () => {
    setShowDeleteChatModal(true);
  };

  const handleConfirmDeleteChat = () => {
    setShowDeleteChatModal(false);
    
    // Сохраняем информацию для показа партнеру
    // Если есть текст обратной связи, он всегда передаётся собеседнику
    setPartnerDeleteInfo({
      reason: deleteReason,
      sharedFeedback: deleteReason.trim().length > 0
    });
    
    // Для теста показываем сразу уведомление партнера
    setShowPartnerDeleteNotification(true);
  };

  const handlePartnerDeleteNotificationClose = () => {
    setShowPartnerDeleteNotification(false);
    
    // После закрытия уведомления удаляем чат
    if (chatMatch && onRemoveMatch) {
      onRemoveMatch(chatMatch.id);
    }
    onCloseChat?.();
    
    // Сбрасываем состояния
    setDeleteReason('');
    setPartnerDeleteInfo(null);
  };

  const getNextStageName = () => {
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      return stages[currentIndex + 1];
    }
    return null;
  };

  const handleAskQuestion = (category?: 'closer' | 'evenCloser' | 'innerWorld') => {
    if ((currentStage === 'Сближение' || currentStage === 'Главный вопрос' || currentStage === 'Свободное общение') && category) {
      // For "Сближение", "Главный вопрос" and "Свободное общение" stages with categories
      // No limit check - questions never end on these stages
      
      const questionsByCategory = {
        closer: [
          'Какой момент ты считаешь самым важным в нашем общении?',
          'Что тебе нрав��тся в нашем диалоге?',
          'Как часто ты думаешь о наших разговорах?',
        ],
        evenCloser: [
          'Что бы ты хотел(а) узнать обо мне больше всего?',
          'Какие твои самые глубокие желания?',
          'Что делает тебя по-настоящему счастливым(ой)?',
        ],
        innerWorld: [
          'Какие мысли тебя занимают последнее время?',
          'Что для тебя значит быть собой?',
          'Какие чувства ты испытываешь прямо сейчас?',
        ],
      };
      
      const questions = questionsByCategory[category];
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      
      const icons = {
        closer: '❤️',
        evenCloser: '✨',
        innerWorld: '🧠'
      };
      
      const questionMessage: Message = {
        id: `msg-q-${Date.now()}`,
        text: `${icons[category]} ${randomQuestion}`,
        senderId: 'system',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, questionMessage]);
      
      // Decrement category counter only for "Сближение" stage
      // For "Главный вопрос" and "Свободное общение", questions are unlimited and counters don't decrease
      if (currentStage === 'Сближение') {
        setQuestionCategories(prev => ({
          ...prev,
          [category]: Math.max(0, prev[category] - 1)
        }));
      }
    } else {
      // For "Интуиция" stage
      if (questionCount <= 0) return;
      
      const questions = [
        'Какое твое любимое место в городе?',
        'Что тебя вдохновляет?',
        'Какая твоя мечта?',
        'Что для тебя важно  отношениях?',
        'Чем ты увлекаешься в свободное время?',
      ];
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      
      const questionMessage: Message = {
        id: `msg-q-${Date.now()}`,
        text: `❓ ${randomQuestion}`,
        senderId: 'system',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, questionMessage]);
      
      // Decrement counter immediately
      setQuestionCount(prev => Math.max(0, prev - 1));
    }
    
    // Simulate answer from match
    setTimeout(() => {
      const answers = [
        'Отличный вопрос! Мне нужно подумать...',
        'Это ин��ересная тема, давай обсудим!',
        'Хороший вопрос! Расскажу подробнее...',
      ];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      
      const answerMessage: Message = {
        id: `msg-a-${Date.now()}`,
        text: randomAnswer,
        senderId: chatMatch!.id,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, answerMessage]);
    }, 2000);
  };

  const canMoveToNextStage = () => {
    const currentIndex = stages.indexOf(currentStage);
    // For "Знакоство" stage, only check message count
    if (currentIndex === 0) {
      return sharedMessageCount <= 0;
    }
    // For "Интуиция" stage
    if (currentIndex === 1) {
      return sharedMessageCount <= 0 && questionCount <= 0;
    }
    // For "Сближение" stage - check message count AND all 3 question categories
    if (currentIndex === 2) {
      return sharedMessageCount <= 0 && 
             questionCategories.closer <= 0 && 
             questionCategories.evenCloser <= 0 && 
             questionCategories.innerWorld <= 0;
    }
    // For "Свободное общение" stage - questions never end, only check message count
    if (currentIndex === 5) {
      return sharedMessageCount <= 0;
    }
    // For other stages
    return sharedMessageCount <= 0;
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'только что';
    } else if (diffMins < 60) {
      return `${diffMins} мин назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч назад`;
    } else if (diffDays === 1) {
      return 'вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message);
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('highlight-message');
      setTimeout(() => {
        messageElement.classList.remove('highlight-message');
      }, 2000);
    }
  };

  const getSenderName = (senderId: string) => {
    if (senderId === currentUserId) return 'Вы';
    if (senderId === 'system') return 'Система';
    return chatMatch?.name || 'Собеседник';
  };

  const handlePublishAnswer = (questionId: string) => {
    const pending = pendingAnswers[questionId];
    if (!pending || !pending.myAnswer) return;

    setPendingAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        myPublished: true,
      }
    }));
  };

  const handleTheirAnswer = (questionId: string, answer: string) => {
    setPendingAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {
          myAnswer: null,
          theirAnswer: null,
          myPublished: false,
          theirPublished: false,
          myMatch: null,
          theirMatch: null,
        }),
        theirAnswer: answer,
        theirPublished: true,
      }
    }));
  };

  const handleMatchVote = (questionId: string, match: boolean) => {
    const pending = pendingAnswers[questionId];
    if (!pending) return;

    setPendingAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        myMatch: match,
      }
    }));

    // Simulate their vote
    setTimeout(() => {
      const theirMatch = true; // Always vote yes
      
      setPendingAnswers(prev => {
        const updated = {
          ...prev,
          [questionId]: {
            ...prev[questionId],
            theirMatch,
          }
        };
        
        return updated;
      });

      // If both voted yes, increment matched answers and save the question
      if (match && theirMatch) {
        setMatchedAnswersCount(prev => prev + 1);
        
        // Find the question message and save it to matched questions
        const questionMessage = messages.find(m => m.id === questionId);
        if (questionMessage && pending.myAnswer && pending.theirAnswer) {
          setMatchedQuestions(prev => {
            // Avoid duplicates
            if (prev.some(q => q.id === questionId)) {
              return prev;
            }
            return [...prev, {
              id: questionId,
              question: questionMessage.text,
              myAnswer: pending.myAnswer,
              theirAnswer: pending.theirAnswer,
            }];
          });
        }
      }
    }, 1000);
  };

  const handleMeetingVote = (vote: 'yes' | 'no' | 'not-ready') => {
    setMeetingVote(prev => ({
      ...prev,
      myVote: vote,
    }));
    // Don't simulate their vote automatically - let user choose manually for testing
  };

  const handleTheirMeetingVote = (vote: 'yes' | 'no' | 'not-ready') => {
    setMeetingVote(prev => ({
      ...prev,
      theirVote: vote,
    }));

    // If both voted yes, show warning before proceeding
    if (meetingVote.myVote === 'yes' && vote === 'yes') {
      setShowMeetingWarning(true);
    }
  };

  const handleDeleteChat = () => {
    if (window.confirm('Вы уверены, что хотите удалить ��тот чат?')) {
      // Вызываем колбэк для закрытия чата
      onCloseChat?.();
    }
  };

  const handlePostponeVote = (days: number) => {
    const postponedDate = new Date();
    postponedDate.setDate(postponedDate.getDate() + days);
    
    setMeetingVote({
      myVote: null,
      theirVote: null,
      canRevote: false,
      postponedUntil: postponedDate,
    });

    // Allow revote after specified time (simulated with shorter time for testing)
    setTimeout(() => {
      setMeetingVote(prev => ({
        ...prev,
        canRevote: true,
      }));
    }, days * 1000); // In production, this would be days * 24 * 60 * 60 * 1000
  };

  const handleRequestRevote = () => {
    setMeetingVote({
      myVote: null,
      theirVote: null,
      canRevote: true,
      postponedUntil: null,
    });
  };

  const handleProceedToNextStage = () => {
    setShowMeetingWarning(false);
    setCurrentStage('Свидание');
    setCurrentAronQuestionIndex(0);
  };

  const handleAskAronQuestion = () => {
    if (currentAronQuestionIndex >= aronQuestions.length) return;
    
    const question = aronQuestions[currentAronQuestionIndex];
    setCurrentDisplayedQuestion(question);
    setCurrentAronQuestionIndex(prev => prev + 1);
  };

  const handleCompleteQuestions = () => {
    setShowEyeContact(true);
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handleResetTimerToTest = () => {
    setEyeContactTimer(3);
    setIsTimerRunning(false);
    setExperimentComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoToFreeChat = () => {
    setCurrentStage('Свободное общение');
    setShowEyeContact(false);
    setExperimentComplete(false);
  };

  if (!chatMatch) {
    return (
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-2xl mx-auto">
        <div className="flex-1 flex flex-col p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Чаты
            </h1>
            <p className="text-sm text-gray-500">
              Выберите человека для общения
            </p>
          </div>

          {/* Mutual matches list */}
          {mutualMatches.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl text-gray-700 mb-2">
                  Пока нет взаимных симпатий
                </h2>
                <p className="text-gray-500">
                  Найдите интересного собеседника в разделе "Поиск"
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-3">
                💡 Можно начать чат только с одним человеком одновременно
              </p>
              {mutualMatches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => onSelectMatch?.(match)}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex gap-4 items-center">
                    {/* Photo */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      {match.photo ? (
                        <ImageWithFallback
                          src={match.photo}
                          alt={match.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
                          <span className="text-white text-xl">{match.name.charAt(0)}</span>
                        </div>
                      )}
                      {match.isOnline && (
                        <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-lg truncate">{match.name}</h3>
                        <span className="text-sm text-gray-500">{match.age}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Нажмите чтобы начать общение
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="text-emerald-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const isСближениеStage = currentStage === 'Сближение';
  const isГлавныйВопросStage = currentStage === 'Главный вопрос';
  const isСвиданиеStage = currentStage === 'Свидание';
  const isСвободноеОбщениеStage = currentStage === 'Свободное общение';

  // Show OLD meeting question screen if in "Главный вопрос" stage (keeping for backwards compatibility but disabled)
  if (false && isГлавныйВопросStage && meetingVote.canRevote) {
    const bothVoted = meetingVote.myVote !== null && meetingVote.theirVote !== null;
    const bothVotedYes = meetingVote.myVote === 'yes' && meetingVote.theirVote === 'yes';
    const waitingForPartner = meetingVote.myVote !== null && meetingVote.theirVote === null;

    return (
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-2xl mx-auto bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl border-b border-pink-100 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-3 flex-shrink-0 hover:bg-pink-50 rounded-xl p-2 -m-2 transition-all duration-300"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {chatMatch.photo ? (
                <ImageWithFallback
                  src={chatMatch.photo}
                  alt={chatMatch.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400 flex items-center justify-center">
                  <span className="text-white">
                    {chatMatch.name.charAt(0)}
                  </span>
                </div>
              )}
              
              {chatMatch.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="text-gray-900">{chatMatch.name}</p>
                <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  {currentStage}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {chatMatch.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </button>

          <div className="flex-1"></div>
          
          {/* Delete chat button */}
          <button
            onClick={handleDeleteChatClick}
            className="p-2 hover:bg-red-50 rounded-xl transition-all duration-300 text-gray-400 hover:text-red-600"
            title="Удалить чат"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Meeting Question Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-6">
            {/* Question */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                Главный вопрос
              </h2>
              <p className="text-xl text-gray-700">
                Готовы ли вы встретиться?
              </p>
            </div>

            {/* Voting UI */}
            {!waitingForPartner && !bothVoted && (
              <div className="space-y-3">
                <button
                  onClick={() => handleMeetingVote('yes')}
                  disabled={meetingVote.myVote !== null}
                  className={`w-full py-4 rounded-2xl text-lg transition-all duration-300 ${
                    meetingVote.myVote === 'yes'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl scale-105'
                      : 'bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border-2 border-emerald-200 hover:border-emerald-400'
                  }`}
                >
                  {meetingVote.myVote === 'yes' ? '✓ Да' : 'Да'}
                </button>
                <button
                  onClick={() => handleMeetingVote('no')}
                  disabled={meetingVote.myVote !== null}
                  className={`w-full py-4 rounded-2xl text-lg transition-all duration-300 ${
                    meetingVote.myVote === 'no'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl scale-105'
                      : 'bg-white hover:bg-red-50 text-gray-700 hover:text-red-700 border-2 border-red-200 hover:border-red-400'
                  }`}
                >
                  {meetingVote.myVote === 'no' ? '✓ Нет' : 'Нет'}
                </button>
                <button
                  onClick={() => handleMeetingVote('not-ready')}
                  disabled={meetingVote.myVote !== null}
                  className={`w-full py-4 rounded-2xl text-lg transition-all duration-300 ${
                    meetingVote.myVote === 'not-ready'
                      ? 'bg-gradient-to-r from-gray-600 to-slate-600 text-white shadow-xl scale-105'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {meetingVote.myVote === 'not-ready' ? '✓ Не готов ответить' : 'Не готов ответить'}
                </button>
              </div>
            )}

            {/* Testing: Choose partner's answer */}
            {waitingForPartner && !bothVoted && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 space-y-4">
                <div className="text-center">
                  <p className="text-purple-700 mb-1">Тестирование: выбе��ите отве�� собеседника</p>
                  <p className="text-sm text-purple-600">Ваш ответ: {
                    meetingVote.myVote === 'yes' ? 'Да' :
                    meetingVote.myVote === 'no' ? 'Нет' :
                    'Не готов ответить'
                  }</p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleTheirMeetingVote('yes')}
                    className="w-full py-3 rounded-xl bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300"
                  >
                    Собеседник: Да
                  </button>
                  <button
                    onClick={() => handleTheirMeetingVote('no')}
                    className="w-full py-3 rounded-xl bg-white hover:bg-red-50 text-gray-700 hover:text-red-700 border-2 border-red-200 hover:border-red-400 transition-all duration-300"
                  >
                    Собеседник: Нет
                  </button>
                  <button
                    onClick={() => handleTheirMeetingVote('not-ready')}
                    className="w-full py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-400 transition-all duration-300"
                  >
                    Собеседник: Не готов ответить
                  </button>
                </div>
              </div>
            )}

            {/* Results - Not both yes */}
            {bothVoted && !bothVotedYes && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 space-y-4">
                <p className="text-center text-orange-800">
                  К сожалению, вы пока не готовы к встрече 😔
                </p>
                <div className="text-sm text-orange-700 space-y-1">
                  <p>Ваш ответ: <span className="font-semibold">{
                    meetingVote.myVote === 'yes' ? 'Да' :
                    meetingVote.myVote === 'no' ? 'Нет' :
                    'Не готов ответить'
                  }</span></p>
                  <p>Ответ собеседника: <span className="font-semibold">{
                    meetingVote.theirVote === 'yes' ? 'Да' :
                    meetingVote.theirVote === 'no' ? 'Нет' :
                    'Не готов ответить'
                  }</span></p>
                </div>
                
                <div className="pt-4 border-t border-orange-200 space-y-2">
                  <button
                    onClick={() => {
                      handlePostponeVote(1);
                      // Return to previous stage temporarily
                      setCurrentStage('Сближение');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Узнать друг друга получше
                  </button>
                  <button
                    onClick={handleRequestRevote}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Переголосовать сейчас
                  </button>
                  <button
                    onClick={handleDeleteChat}
                    className="w-full py-3 bg-white text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all duration-300"
                  >
                    Удалить чат
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warning Modal - Both voted yes */}
        {showMeetingWarning && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-gray-900 mb-2">Отлично! 🎉</h3>
                <p className="text-gray-700">
                  Вы оба готовы к встрече!
                </p>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 text-xl flex-shrink-0">⚠️</span>
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Важно!</p>
                    <p>После перехода на следующий этап чат станет доступен <span className="font-semibold">только для чтения</span> (36 вопросов).</p>
                    <p className="mt-2">Убедитесь, что вы:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Договорились о встрече</li>
                      <li>Обменялись контактами</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMeetingWarning(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  Отмена
                </button>
                <button
                  onClick={handleProceedToNextStage}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Продолжить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && (
          <ProfileModal match={chatMatch} onClose={() => setShowProfileModal(false)} />
        )}
      </div>
    );
  }

  const showPostponedTimer = !meetingVote.canRevote && meetingVote.postponedUntil !== null;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-2xl mx-auto bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-3 flex-shrink-0 hover:bg-emerald-50 rounded-xl p-2 -m-2 transition-all duration-300"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {chatMatch.photo ? (
              <ImageWithFallback
                src={chatMatch.photo}
                alt={chatMatch.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center">
                <span className="text-white">
                  {chatMatch.name.charAt(0)}
                </span>
              </div>
            )}
            
            {/* Online indicator */}
            {chatMatch.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* Name and status */}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-gray-900">{chatMatch.name}</p>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {currentStage}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {chatMatch.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </button>

        {/* Transition button or postponed timer (centered) */}
        {isГлавныйВопросStage && mainQuestionTimer && !showMainQuestion ? (
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs rounded-full shadow-lg">
              ⏰ Главный вопрос через: {
                mainQuestionTimer 
                  ? (() => {
                      const totalSeconds = Math.ceil((mainQuestionTimer.getTime() - Date.now()) / 1000);
                      const hours = Math.floor(totalSeconds / 3600);
                      const mins = Math.floor((totalSeconds % 3600) / 60);
                      const secs = totalSeconds % 60;
                      if (hours > 0) return `${hours}ч ${mins}м`;
                      if (mins > 0) return `${mins}м ${secs}с`;
                      return `${secs}с`;
                    })()
                  : '...'
              }
            </div>
            <button
              onClick={handleRequestEarlyMainQuestion}
              disabled={earlyMainQuestionRequest === 'requested'}
              className={`px-2.5 py-1 text-xs rounded-full transition-all duration-300 ${
                earlyMainQuestionRequest === 'requested'
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white/80 text-rose-600 hover:bg-white hover:shadow-md hover:scale-105'
              }`}
            >
              {earlyMainQuestionRequest === 'requested' ? '⏳ Ждём ответа...' : '🚀 Готов ответить сейчас'}
            </button>
          </div>
        ) : showPostponedTimer ? (
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full shadow-lg">
              ⏳ Главный вопрос через: {
                meetingVote.postponedUntil 
                  ? Math.ceil((meetingVote.postponedUntil.getTime() - Date.now()) / 1000) + ' сек'
                  : '...'
              }
            </div>
          </div>
        ) : null}

        {/* Message counters - hide for Свидание */}
        {!isСвиданиеStage && (
          <div className="flex items-center gap-2 ml-auto">
            {/* Message counter */}
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
            <MessageSquare className="w-3 h-3 text-emerald-600" />
            {isГлавныйВопросStage || isСвободноеОбщениеStage ? (
              <span className="text-xs text-emerald-700">∞</span>
            ) : sharedMessageCount > 0 ? (
              <span className={`text-xs ${sharedMessageCount <= 3 ? 'text-red-600 font-semibold' : 'text-emerald-700'}`}>
                {sharedMessageCount}
              </span>
            ) : (
              <Check className="w-3 h-3 text-emerald-600 animate-bounce" />
            )}
          </div>
          
          {/* Question counters - only for Сближение and Главный вопрос, not for Свободное общение */}
          {isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage ? (
            <>
              {/* Closer counter */}
              <div className="flex items-center gap-1.5 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                <Heart className="w-3 h-3 text-pink-600" />
                {isГлавныйВопросStage || isСвободноеОбщениеStage ? (
                  <span className="text-xs text-pink-700">∞</span>
                ) : questionCategories.closer > 0 ? (
                  <span className={`text-xs ${questionCategories.closer <= 1 ? 'text-red-600 font-semibold' : 'text-pink-700'}`}>
                    {questionCategories.closer}
                  </span>
                ) : (
                  <Check className="w-3 h-3 text-pink-600 animate-bounce" />
                )}
              </div>
              
              {/* Even closer counter */}
              <div className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                <Sparkles className="w-3 h-3 text-purple-600" />
                {isГлавныйВопросStage || isСвободноеОбщениеStage ? (
                  <span className="text-xs text-purple-700">∞</span>
                ) : questionCategories.evenCloser > 0 ? (
                  <span className={`text-xs ${questionCategories.evenCloser <= 1 ? 'text-red-600 font-semibold' : 'text-purple-700'}`}>
                    {questionCategories.evenCloser}
                  </span>
                ) : (
                  <Check className="w-3 h-3 text-purple-600 animate-bounce" />
                )}
              </div>
              
              {/* Inner world counter */}
              <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                <Brain className="w-3 h-3 text-indigo-600" />
                {isГлавныйВопросStage || isСвободноеОбщениеStage ? (
                  <span className="text-xs text-indigo-700">∞</span>
                ) : questionCategories.innerWorld > 0 ? (
                  <span className={`text-xs ${questionCategories.innerWorld <= 1 ? 'text-red-600 font-semibold' : 'text-indigo-700'}`}>
                    {questionCategories.innerWorld}
                  </span>
                ) : (
                  <Check className="w-3 h-3 text-indigo-600 animate-bounce" />
                )}
              </div>
            </>
          ) : !isСвободноеОбщениеStage && stages.indexOf(currentStage) >= 1 && (
            <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full">
              <HelpCircle className="w-3 h-3 text-blue-600" />
              {questionCount > 0 ? (
                <span className={`text-xs ${questionCount <= 1 ? 'text-red-600 font-semibold' : 'text-blue-700'}`}>
                  {questionCount}
                </span>
              ) : (
                <Check className="w-3 h-3 text-blue-600 animate-bounce" />
              )}
            </div>
          )}
          
          {/* Match counter */}
          {stages.indexOf(currentStage) >= 1 && (() => {
            // Dynamic styling based on matches count
            let bgGradient = 'from-gray-100 to-gray-200';
            let borderColor = 'border-gray-300';
            let textColor = 'text-gray-500';
            let shadowEffect = '';
            let pulseEffect = '';
            let scaleEffect = 'scale-100';
            let emoji = '🤍';
            
            if (matchedAnswersCount >= 16) {
              // 16+ совпадений: фиолетовый градиент с мощным свечением
              bgGradient = 'from-purple-500 via-pink-500 to-red-500';
              borderColor = 'border-purple-400';
              textColor = 'text-white';
              shadowEffect = 'shadow-[0_0_30px_rgba(168,85,247,0.8)]';
              pulseEffect = 'animate-pulse';
              scaleEffect = 'scale-110';
              emoji = '💝';
            } else if (matchedAnswersCount >= 10) {
              // 10-15 совпадений: красно-фиолетовый градиент с сильным свечением
              bgGradient = 'from-red-500 via-pink-500 to-purple-400';
              borderColor = 'border-red-400';
              textColor = 'text-white';
              shadowEffect = 'shadow-[0_0_25px_rgba(239,68,68,0.7)]';
              pulseEffect = 'animate-pulse';
              scaleEffect = 'scale-105';
              emoji = '💓';
            } else if (matchedAnswersCount >= 6) {
              // 6-9 совпадений: красный градиент со свечением
              bgGradient = 'from-red-400 to-pink-500';
              borderColor = 'border-red-300';
              textColor = 'text-white';
              shadowEffect = 'shadow-[0_0_20px_rgba(244,63,94,0.6)]';
              pulseEffect = 'animate-pulse';
              emoji = '💖';
            } else if (matchedAnswersCount >= 3) {
              // 3-5 совпадений: розовый градиент с легким свечением
              bgGradient = 'from-pink-400 to-rose-400';
              borderColor = 'border-pink-300';
              textColor = 'text-white';
              shadowEffect = 'shadow-[0_0_15px_rgba(236,72,153,0.5)]';
              pulseEffect = 'animate-pulse';
              emoji = '💗';
            } else if (matchedAnswersCount >= 1) {
              // 1-2 совпадения: светло-розовый
              bgGradient = 'from-pink-200 to-rose-200';
              borderColor = 'border-pink-300';
              textColor = 'text-pink-700';
              shadowEffect = 'shadow-[0_0_10px_rgba(251,207,232,0.4)]';
              emoji = '💗';
            }
            
            return (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 bg-gradient-to-r ${bgGradient} px-3 py-1.5 rounded-full border ${borderColor} ${shadowEffect} ${pulseEffect} ${scaleEffect} transition-all duration-500`}>
                  <span className="text-sm">{emoji}</span>
                  <span className={`${textColor} transition-all duration-500`}>
                    {matchedAnswersCount}
                  </span>
                </div>
                {matchedAnswersCount > 0 && (
                  <button
                    onClick={() => setShowMatchedQuestionsModal(true)}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 flex items-center justify-center transition-all duration-300 hover:scale-110 border border-pink-300"
                    title="Посмотреть совпадения"
                  >
                    <Eye className="w-4 h-4 text-pink-600" />
                  </button>
                )}
              </div>
            );
          })()}
          </div>
        )}

        {/* Delete chat button */}
        <button
          onClick={handleDeleteChatClick}
          className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all duration-300 hover:scale-105 ml-2 text-red-600"
          title="Удалить чат"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Postponed info banner */}
      {showPostponedTimer && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-2">
          <p className="text-center text-sm text-blue-700">
            💬 Продолжайте общаться, пока идет отсрочка. Главный вопрос появится снова через {
              meetingVote.postponedUntil 
                ? Math.ceil((meetingVote.postponedUntil.getTime() - Date.now()) / 1000) + ' сек'
                : '...'
            }
          </p>
        </div>
      )}

      {/* Messages - special UI for Свидание stage */}
      {isСвиданиеStage ? (
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
          <div className="max-w-xl w-full">
            {!showEyeContact ? (
              <div className="space-y-6">
                {/* Current Question Display */}
                <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      36 вопросов Артура Арона
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <span>Вопрос:</span>
                      <span className="text-lg font-semibold text-purple-700">
                        {currentAronQuestionIndex} / {aronQuestions.length}
                      </span>
                    </div>
                  </div>

                  {currentDisplayedQuestion ? (
                    <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-2xl p-6 min-h-[200px] flex items-center justify-center">
                      <p className="text-lg text-gray-800 text-center leading-relaxed">
                        {currentDisplayedQuestion}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 min-h-[200px] flex items-center justify-center">
                      <p className="text-gray-500 text-center">
                        Нажмите кнопку ниже, чтобы получить первый вопрос
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {currentAronQuestionIndex < aronQuestions.length && (
                      <button
                        onClick={handleAskAronQuestion}
                        className="w-full py-4 rounded-xl text-lg bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300"
                      >
                        {currentDisplayedQuestion ? '📖 Следующий вопрос' : '📖 Получить первый вопрос'}
                      </button>
                    )}
                    
                    <button
                      onClick={handleCompleteQuestions}
                      className="w-full py-4 rounded-xl text-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      {currentAronQuestionIndex >= aronQuestions.length ? '✓ Завершить' : '✓ Завершить досрочно'}
                    </button>
                  </div>
                </div>
              </div>
            ) : !experimentComplete ? (
              <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">👁️</div>
                  <h2 className="text-2xl bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                    Смотрите друг другу в глаза
                  </h2>
                  <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                    Заключительный этап эксперимента. Смотрите друг др��гу в глаза в течение 4 минут, не отводя взгляда.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-2xl p-8">
                  <div className="text-center">
                    <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {formatTime(eyeContactTimer)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {isTimerRunning ? 'Таймер запущен...' : 'Нажмите "Старт", чтобы начать'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {!isTimerRunning && (
                    <button
                      onClick={handleStartTimer}
                      className="w-full py-4 rounded-xl text-lg bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      ▶️ Старт
                    </button>
                  )}
                  
                  {/* Test button */}
                  <button
                    onClick={handleResetTimerToTest}
                    className="w-full py-2 rounded-lg text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-300"
                  >
                    🧪 Тест: сбросить до 3 секунд
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                    Конец эксперимента
                  </h2>
                  <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                    Поздравляем! Вы прошли все этапы эксперимента по методике Артура Арона.
                  </p>
                </div>
                
                <button
                  onClick={handleGoToFreeChat}
                  className="w-full py-4 rounded-xl text-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  💬 Перейти к свободному общению
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            const isQuestion = message.senderId === 'system';
            
            // System questions centered
            if (isQuestion) {
              const pending = pendingAnswers[message.id];
              const bothAnswered = pending?.myAnswer && pending?.theirAnswer;
              const bothPublished = pending?.myPublished && pending?.theirPublished;
              const bothVoted = pending?.myMatch !== null && pending?.theirMatch !== null;
              const isCompleted = bothPublished; // Question is completed when both answers are published

              return (
                <div key={message.id} ref={(el) => (messageRefs.current[message.id] = el)}>
                  <div className="flex justify-center">
                    <div className="max-w-[80%] md:max-w-[70%]">
                      <div
                        onClick={() => !isCompleted && handleReplyToMessage(message)}
                        className={`rounded-lg shadow-sm border px-4 py-2.5 transition-all duration-200 ${
                          isCompleted
                            ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-default opacity-70'
                            : 'bg-blue-50 text-gray-900 border-blue-200 hover:shadow-md cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {isCompleted && (
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                          <p className={`text-center ${isCompleted ? 'line-through' : ''}`}>{message.text}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-1 text-center">
                        {isCompleted ? 'Вопрос выполнен' : formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Pending answers section */}
                  {pending && (
                    <div className="mt-3 space-y-3">
                      {/* My pending answer */}
                      {pending.myAnswer && !pending.myPublished && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mx-auto max-w-[85%]">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-xs text-yellow-700 mb-1">Ваш ответ (не опубликован):</p>
                              <p className="text-sm text-gray-800">{pending.myAnswer}</p>
                            </div>
                            <button
                              onClick={() => handlePublishAnswer(message.id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
                            >
                              Опубликовать
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Published answers */}
                      {bothPublished && (
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 mx-auto max-w-[90%] shadow-sm">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-emerald-700 mb-1">Ваш ответ:</p>
                              <p className="text-sm text-gray-800">{pending.myAnswer}</p>
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                              <p className="text-xs text-blue-700 mb-1">Ответ собеседника:</p>
                              <p className="text-sm text-gray-800">{pending.theirAnswer}</p>
                            </div>

                            {/* Match voting */}
                            {!bothVoted && (
                              <div className="border-t border-gray-200 pt-3">
                                <p className="text-sm text-gray-700 mb-2 text-center">Совпали ли ответы?</p>
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleMatchVote(message.id, true)}
                                    disabled={pending.myMatch !== null}
                                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                                      pending.myMatch === true
                                        ? 'bg-green-600 text-white shadow-lg'
                                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                    }`}
                                  >
                                    Да ✓
                                  </button>
                                  <button
                                    onClick={() => handleMatchVote(message.id, false)}
                                    disabled={pending.myMatch !== null}
                                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                                      pending.myMatch === false
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                    }`}
                                  >
                                    Нет ✗
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Match result */}
                            {bothVoted && (
                              <div className={`border-t border-gray-200 pt-3 text-center ${
                                pending.myMatch && pending.theirMatch
                                  ? 'bg-green-50 -mx-4 -mb-4 px-4 pb-4 mt-3 rounded-b-lg'
                                  : 'bg-gray-50 -mx-4 -mb-4 px-4 pb-4 mt-3 rounded-b-lg'
                              }`}>
                                {pending.myMatch && pending.theirMatch ? (
                                  <div className="space-y-1">
                                    <p className="text-green-700">🎉 От��еты совпали!</p>
                                    <p className="text-xs text-green-600">+1 к шкале совпадений</p>
                                  </div>
                                ) : (
                                  <p className="text-gray-600 text-sm">
                                    {pending.myMatch ? 'Вы: Да' : 'Вы: Нет'} • {pending.theirMatch ? 'Собеседник: Да' : 'Собеседник: Нет'}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Testing controls */}
                      {pending.myAnswer && !pending.theirAnswer && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mx-auto max-w-[85%]">
                          <p className="text-xs text-purple-700 mb-2">Тестирование: ответ собеседника</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Введите ответ собеседника..."
                              className="flex-1 px-3 py-2 text-sm bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.currentTarget;
                                  if (input.value.trim()) {
                                    handleTheirAnswer(message.id, input.value.trim());
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                if (input.value.trim()) {
                                  handleTheirAnswer(message.id, input.value.trim());
                                  input.value = '';
                                }
                              }}
                              className="px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Добавить
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            
            // Regular messages
            return (
              <div
                key={message.id}
                ref={(el) => (messageRefs.current[message.id] = el)}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[75%] md:max-w-[60%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Message bubble */}
                  <div className="flex-1">
                    <div
                      onClick={() => handleReplyToMessage(message)}
                      className={`rounded-3xl px-4 py-2.5 cursor-pointer transition-all duration-200 ${
                        isQuestion
                          ? 'bg-blue-50 text-gray-900 rounded-lg shadow-sm border border-blue-200 hover:shadow-md'
                          : isOwn
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-br-lg shadow-md hover:shadow-lg'
                          : 'bg-white/80 backdrop-blur-sm text-gray-900 rounded-bl-lg shadow-sm border border-emerald-100 hover:shadow-md'
                      }`}
                    >
                      {/* Reply preview inside message */}
                      {message.replyTo && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollToMessage(message.replyTo!.id);
                          }}
                          className={`mb-2 pb-2 border-l-2 pl-2 text-xs opacity-80 cursor-pointer hover:opacity-100 transition-opacity ${
                            isOwn || isQuestion
                              ? 'border-white/50'
                              : 'border-emerald-500/50'
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <CornerDownRight className="w-3 h-3" />
                            <span className="font-semibold">{getSenderName(message.replyTo.senderId)}</span>
                          </div>
                          <p className="line-clamp-2">{message.replyTo.text}</p>
                        </div>
                      )}
                      <p>{message.text}</p>
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 px-1 ${isOwn || isQuestion ? 'text-right' : 'text-left'}`}>
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      )}

      {/* Input - hide for Св��дание stage */}
      {!isСвиданиеStage && (
        <form
          onSubmit={handleSendMessage}
          className="bg-white/70 backdrop-blur-xl border-t border-emerald-100 p-4"
        >
        {/* Reply preview above input */}
        {replyToMessage && (
          <div className="mb-3 bg-emerald-50 rounded-lg p-2 flex items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <CornerDownRight className="w-3 h-3 text-emerald-600" />
                <span className="text-xs text-emerald-700">Ответ на сообщение от {getSenderName(replyToMessage.senderId)}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{replyToMessage.text}</p>
            </div>
            <button
              type="button"
              onClick={() => setReplyToMessage(null)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-emerald-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        <div className="flex gap-2 max-w-2xl mx-auto">
          {/* Question buttons - experimental 3D design with glow effects */}
          {!isСвиданиеStage && (isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage) ? (
            <div className="relative flex items-center gap-1" style={{ perspective: '1000px' }}>
              {/* Connection lines between bubbles */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-0.5 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 opacity-40"></div>
              </div>
              
              {/* Heart button - Closer */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => handleAskQuestion('closer')}
                  data-tooltip="Быть ближе"
                  className={`tooltip-trigger relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 backdrop-blur-sm ${
                    (isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.closer > 0)
                      ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white shadow-lg shadow-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/60 hover:-translate-y-1 active:scale-95'
                      : 'bg-gray-200/80 text-gray-400 cursor-not-allowed'
                  }`}
                  style={{
                    transform: questionCategories.closer > 0 ? 'rotateY(0deg)' : 'rotateY(0deg)',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  onMouseEnter={(e) => {
                    if (isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.closer > 0) {
                      e.currentTarget.style.transform = 'rotateY(15deg) translateY(-4px) scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotateY(0deg) translateY(0px) scale(1)';
                  }}
                >
                  <Heart className={`w-5 h-5 ${(isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.closer > 0) ? 'drop-shadow-lg' : ''}`} />
                  {(isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.closer > 0) && (
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75"></div>
                  )}
                </button>
                {(isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.closer > 0) && (
                  <div className="absolute inset-0 rounded-full bg-pink-400 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                )}
              </div>

              {/* Sparkles button - Even Closer */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => handleAskQuestion('evenCloser')}
                  data-tooltip="Еще ближе"
                  className={`tooltip-trigger relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 backdrop-blur-sm ${
                    (isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.evenCloser > 0)
                      ? 'bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/60 hover:-translate-y-1 active:scale-95'
                      : 'bg-gray-200/80 text-gray-400 cursor-not-allowed'
                  }`}
                  style={{
                    transform: (isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.evenCloser > 0) ? 'rotateY(0deg)' : 'rotateY(0deg)',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  onMouseEnter={(e) => {
                    if (isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.evenCloser > 0) {
                      e.currentTarget.style.transform = 'rotateY(15deg) translateY(-4px) scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotateY(0deg) translateY(0px) scale(1)';
                  }}
                >
                  <Sparkles className={`w-5 h-5 ${(isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.evenCloser > 0) ? 'drop-shadow-lg' : ''}`} />
                  {(isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.evenCloser > 0) && (
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75"></div>
                  )}
                </button>
                {(isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.evenCloser > 0) && (
                  <div className="absolute inset-0 rounded-full bg-purple-400 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                )}
              </div>

              {/* Brain button - Inner World */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => handleAskQuestion('innerWorld')}
                  data-tooltip="Внутренний мир"
                  className={`tooltip-trigger relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 backdrop-blur-sm ${
                    (isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.innerWorld > 0)
                      ? 'bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/60 hover:-translate-y-1 active:scale-95'
                      : 'bg-gray-200/80 text-gray-400 cursor-not-allowed'
                  }`}
                  style={{
                    transform: (isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.innerWorld > 0) ? 'rotateY(0deg)' : 'rotateY(0deg)',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  onMouseEnter={(e) => {
                    if (isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.innerWorld > 0) {
                      e.currentTarget.style.transform = 'rotateY(15deg) translateY(-4px) scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotateY(0deg) translateY(0px) scale(1)';
                  }}
                >
                  <Brain className={`w-5 h-5 ${(isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.innerWorld > 0) ? 'drop-shadow-lg' : ''}`} />
                  {(isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.innerWorld > 0) && (
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75"></div>
                  )}
                </button>
                {(isСближениеStage || isГлавныйВопросStage || isСвободноеОбщениеStage || questionCategories.innerWorld > 0) && (
                  <div className="absolute inset-0 rounded-full bg-indigo-400 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                )}
              </div>
            </div>
          ) : !isСвиданиеStage && !isСвободноеОбщениеStage && stages.indexOf(currentStage) >= 1 && (
            <button
              type="button"
              onClick={() => handleAskQuestion()}
              disabled={questionCount <= 0}
              data-tooltip="Задать вопрос"
              className={`tooltip-trigger w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                questionCount > 0
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30 text-white hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 px-5 py-3 bg-white/80 border border-emerald-100 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
              newMessage.trim()
                ? 'bg-gradient-to-br from-emerald-600 to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30 text-white hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal match={chatMatch} onClose={() => setShowProfileModal(false)} />
      )}

      {/* Matched Questions Modal */}
      {showMatchedQuestionsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span className="text-2xl">💖</span>
                  </div>
                  <div>
                    <h2 className="text-2xl text-white">Наши совпадения</h2>
                    <p className="text-sm text-white/80">Вопросы, где ваши ответы совпали</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMatchedQuestionsModal(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {matchedQuestions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-4 block">🤍</span>
                  <p>Пока нет совпадений</p>
                  <p className="text-sm mt-2">Отвечайте на вопросы, чтобы найти общее!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {matchedQuestions.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-5 border border-pink-200 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">{index + 1}</span>
                        </div>
                        <p className="text-gray-800 flex-1 pt-1">
                          {item.question}
                        </p>
                      </div>
                      
                      <div className="space-y-3 ml-11">
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-emerald-200">
                          <p className="text-xs text-emerald-700 mb-1">Ваш ответ:</p>
                          <p className="text-sm text-gray-800">{item.myAnswer}</p>
                        </div>
                        
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-blue-200">
                          <p className="text-xs text-blue-700 mb-1">Ответ собеседника:</p>
                          <p className="text-sm text-gray-800">{item.theirAnswer}</p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
                          <span className="text-pink-600 text-sm">✨ Совпадение!</span>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowMatchedQuestionsModal(false)}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Transition Modal */}
      {showStageTransitionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-4xl">✨</span>
              </div>
              <h2 className="text-3xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Этап "{transitionStageName}"
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              {transitionStageName === 'Знакомство' && (
                <>
                  <p className="text-center leading-relaxed">
                    Добро пожаловать в эксперимент! Вы начинаете этап <span className="font-semibold text-emerald-600">Знакомство</span>.
                  </p>
                  
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                    <p className="text-sm">
                      <span className="font-semibold">👋 Суть этапа:</span> Познакомьтесь друг с другом в свободной переписке. Расскажите о себе, узнайте собеседника, найдите общие темы.
                    </p>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-sm">
                      <span className="font-semibold">⚡ Правило одного чата:</span> Вы можете общаться только с одним человеком одновременно. Это помогает сосредоточиться на качестве общения, а не на количестве.
                    </p>
                  </div>

                  <p className="text-center text-sm text-gray-600">
                    У вас есть <span className="font-semibold">5 сообщений</span> на двоих на этом этапе. Используйте их мудро!
                  </p>
                </>
              )}

              {transitionStageName === 'Интуиция' && (
                <>
                  <p className="text-center leading-relaxed">
                    Вы познакомились друг с другом! Теперь начинается этап <span className="font-semibold text-emerald-600">Интуиция</span>.
                  </p>
                  
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                    <p className="text-sm">
                      <span className="font-semibold">💡 Суть этапа:</span> Вы будете угадывать ответы друг друга на вопросы. Это поможет узнать, насколько вы чувствуете собеседника.
                    </p>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-sm">
                      <span className="font-semibold">📋 Как это работает:</span>
                    </p>
                    <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                      <li>Кликните по вопросу, чтобы выбрать свой ответ</li>
                      <li>Попробуйте угадать ответ собеседника</li>
                      <li>Сравните результаты — совпали ли ваши догадки?</li>
                    </ul>
                  </div>

                  <p className="text-center text-sm text-gray-600">
                    У вас есть <span className="font-semibold">5 сообщений</span> и <span className="font-semibold">5 вопросов</span> на этом этапе.
                  </p>
                </>
              )}

              {transitionStageName === 'Сближение' && (
                <>
                  <p className="text-center leading-relaxed">
                    Ваша интуиция проверена! Переходим к этапу <span className="font-semibold text-emerald-600">Сближение</span>.
                  </p>
                  
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                    <p className="text-sm">
                      <span className="font-semibold">💚 Суть этапа:</span> Глубокие вопросы на основе исследования 36 вопросов Артура Арона. Они помогут вам узнать друг друга на более личном уровне.
                    </p>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                    <p className="text-sm">
                      <span className="font-semibold">🎯 Три категории вопросов:</span>
                    </p>
                    <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                      <li><strong>Быть ближе</strong> — познавательные вопросы</li>
                      <li><strong>Ещё ближе</strong> — более личные вопросы</li>
                      <li><strong>Внутренний мир</strong> — глубокие вопросы о себе</li>
                    </ul>
                  </div>

                  <p className="text-center text-sm text-gray-600">
                    У вас есть <span className="font-semibold">5 сообщений</span> и <span className="font-semibold">по 5 вопросов</span> каждой категории.
                  </p>
                </>
              )}
            </div>

            <button
              onClick={handleStageTransitionClose}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-lg"
            >
              Начать этап ✨
            </button>
          </div>
        </div>
      )}

      {/* Main Question Intro Modal */}
      {showMainQuestionIntro && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Этап "Главный вопрос"
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="text-center leading-relaxed">
                Вы дошли до ключевого мо��ента эксперимента. Сейчас запустится визуальный <span className="font-semibold text-rose-600">таймер на 3 суток</span>.
              </p>
              
              <p className="text-sm">
                <span className="font-semibold">⚠️ Важно:</span> После истечения времени появится окно с главным вопросом. На него можно ответить только <span className="font-semibold">ДА</span> или <span className="font-semibold">НЕТ</span>.
              </p>
              
              <p className="text-sm font-semibold text-rose-700">
                Если хотя бы один из вас ответит "НЕТ" — чат будет безвозвратно удалён, а вы исчезнете из списков друг друга. Возможно, вы встретитесь снова.
              </p>

              <p className="text-sm">
                💡 Вы можете в любой момент сами вызвать окно с главным вопросом, но для этого оба должны подтвердить готовность.
              </p>

              <p className="text-center text-sm text-gray-600">
                Если прошло трое суток, окно с вопросом появится автоматически и закрыть его без ответа будет нельзя.
              </p>
            </div>

            <button
              onClick={handleMainQuestionIntroClose}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-lg"
            >
              Понятно, продолжить
            </button>
          </div>
        </div>
      )}

      {/* Partner Confirmation Modal */}
      {showPartnerConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl text-gray-900">
                Запрос от собеседника
              </h3>
              <p className="text-gray-600">
                {chatMatch?.name} предлагает перейти к главному вопросу прямо сейчас. Вы готовы?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handlePartnerResponse(true)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Да, я готов(а)
              </button>
              <button
                onClick={() => handlePartnerResponse(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Нет, пока не готов(а)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Question Modal */}
      {showMainQuestion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-4">
              <h2 className="text-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Главный вопрос
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-xl text-center text-gray-800 leading-relaxed">
                Хотите ли вы встретиться с <span className="font-semibold text-rose-600">{chatMatch?.name}</span> в реальной жизни?
              </p>
            </div>

            {/* Test controls - for development */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 space-y-3">
              <p className="text-xs text-yellow-800 font-semibold">🧪 Тестовые настройки:</p>
              
              <div className="space-y-2">
                <label className="block text-xs text-gray-700">
                  Ответ собеседника:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTestPartnerAnswer('yes')}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg transition-all ${
                      testPartnerAnswer === 'yes'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    ДА
                  </button>
                  <button
                    onClick={() => setTestPartnerAnswer('no')}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg transition-all ${
                      testPartnerAnswer === 'no'
                        ? 'bg-red-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    НЕТ
                  </button>
                  <button
                    onClick={() => setTestPartnerAnswer(null)}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg transition-all ${
                      testPartnerAnswer === null
                        ? 'bg-gray-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Случайно
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-gray-700">
                  Контакты собеседни��а:
                </label>
                <input
                  type="text"
                  value={partnerContactInfo}
                  onChange={(e) => setPartnerContactInfo(e.target.value)}
                  placeholder="@partner_telegram, +7 900 000-00-00"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            {mainQuestionAnswers.myAnswer === null ? (
              <div className="space-y-3">
                <p className="text-center text-sm text-gray-600">
                  Выберите ваш ответ:
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleMainQuestionAnswer('yes')}
                    className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-lg font-semibold"
                  >
                    ДА ✓
                  </button>
                  <button
                    onClick={() => handleMainQuestionAnswer('no')}
                    className="flex-1 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-lg font-semibold"
                  >
                    НЕТ ✗
                  </button>
                </div>
              </div>
            ) : showContactInput ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <p className="text-emerald-700 text-center">
                    Ваш ответ: <span className="font-semibold">{mainQuestionAnswers.myAnswer === 'yes' ? 'ДА ✓' : 'НЕТ ✗'}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm text-gray-700 font-medium">
                    Введите ваши контактные данные:
                  </label>
                  <textarea
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Например: +7 900 123-45-67, @username в Telegram"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows={3}
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleContactInfoSubmit}
                  disabled={!contactInfo.trim()}
                  className={`w-full py-4 rounded-2xl transition-all duration-300 text-lg font-semibold ${
                    contactInfo.trim()
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Отправить ответ
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <p className="text-emerald-700">
                    Ваш ответ: <span className="font-semibold">{mainQuestionAnswers.myAnswer === 'yes' ? 'ДА' : 'НЕТ'}</span>
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <p className="ml-2">Ждём ответа собеседника...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Поздравляем! 🎉
              </h2>
              <p className="text-gray-700 text-lg">
                Вы оба ответили "ДА"! Это замечательны�� результат эксперимента.
              </p>
            </div>

            {/* Partner's contact info */}
            {partnerContactInfo && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-800">
                  📱 Контакты {chatMatch?.name}:
                </p>
                <p className="text-gray-800 break-words">
                  {partnerContactInfo}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">📍 Следующий этап: "Свидание"</span><br />
                  Договоритесь о встрече через телефон или соцсети, используя контактные данные выше.
                </p>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg space-y-2">
                <p className="text-sm font-semibold text-amber-900">
                  ⚠️ Важно: Этап "Свидание" — только для встречи
                </p>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>На этапе "Свидание" нет чата — только вопросы для встречи</li>
                  <li>До свидания общайтесь через другие приложения, но постарайтесь свести общение к минимуму</li>
                  <li>Переходите к этапу только ВО ВРЕМЯ встречи</li>
                  <li>Будьте в спокойном состоянии и готовы отвечать на вопросы</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleSuccessModalContinue}
              className="w-full py-4 rounded-2xl transition-all duration-300 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:scale-105"
            >
              Понятно, продолжаем
            </button>
          </div>
        </div>
      )}

      {/* Delete Chat Modal */}
      {showDeleteChatModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl text-gray-900">
                Удалить чат?
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg space-y-2">
                <p className="text-gray-700">
                  <strong>💬 Попрощались ли вы с собеседником?</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Желательно отправить прощальное сообщение перед удалением чата. Молчаливый уход может ранить сильнее, чем честный отказ.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg space-y-2">
                <p className="text-gray-700">
                  <strong>✨ Оставьте обратную связь собеседнику</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Конструктивная обратная связь — бесценный дар для саморазвития. То, что для вас очевидно, может быть открытием для другого человека. Ваши слова могут помочь ему стать лучше не только в знакомствах, но и в жизни.
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Обратная связь для собеседника (опционально)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Напишите, что можно улучшить... Это будет передано собеседнику."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  rows={4}
                />
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-gray-700 text-center text-sm">
                  ⚠️ Это действие безвозвратно удалит чат, а вы исчезнете из списков друг друга.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteChatModal(false);
                  setDeleteReason('');
                }}
                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmDeleteChat}
                className="flex-1 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Delete Notification Modal (for testing) */}
      {showPartnerDeleteNotification && partnerDeleteInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl text-gray-900">
                Чат удалён
              </h2>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 p-5 rounded-r-lg space-y-3">
              <p className="text-gray-700">
                <strong>Собеседник удалил чат.</strong> Вы ��ольше не отображаетесь в списках друг друга.
              </p>
              <p className="text-sm text-gray-600">
                💚 Всё в порядке! Лучше быстро понять, что вы не подходите друг другу, чем тратить время на отношения без искры. Впереди ещё много интересных людей и новых возможностей!
              </p>
            </div>

            {partnerDeleteInfo.sharedFeedback && partnerDeleteInfo.reason && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Обратная связь от собеседника:</strong>
                </p>
                <p className="text-sm text-gray-700">
                  {partnerDeleteInfo.reason}
                </p>
              </div>
            )}

            {(!partnerDeleteInfo.sharedFeedback || !partnerDeleteInfo.reason) && (
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                <p className="text-sm text-purple-900 text-center">
                  ✨ Каждая встреча — это опыт. Двигайтесь дальше с лёгким сердцем!
                </p>
              </div>
            )}

            <button
              onClick={handlePartnerDeleteNotificationClose}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Продолжить знакомства ✨
            </button>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl text-gray-900">
                К сожалению...
              </h2>
            </div>

            <div className="bg-gray-50 border-l-4 border-gray-400 p-5 rounded-r-lg">
              <p className="text-gray-700 text-center">
                {mainQuestionAnswers.theirAnswer === 'no' 
                  ? 'Собеседник ответил "НЕТ" на главный вопрос.'
                  : 'Вы ответили "НЕТ" на главный вопрос.'
                }
              </p>
              <p className="text-gray-600 text-center mt-3 text-sm">
                Согласно правилам эксперимента, чат будет удалён.
              </p>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 p-4 rounded-xl">
              <p className="text-sm text-gray-700">
                💚 Честность — это смелость! Лучше признать несовместимость сейчас, чем жалеть об упущенном времени потом. Вы оба сделали правильный выбор для себя.
              </p>
            </div>

            <button
              onClick={handleChatDeletion}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Продолжить эксперимент ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
}