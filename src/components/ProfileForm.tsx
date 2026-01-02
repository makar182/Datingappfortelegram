import { useState } from 'react';
import { UserProfile } from '../App';
import { 
  User as UserIcon, 
  Heart, 
  MapPin, 
  Sparkles, 
  Save, 
  Edit2, 
  X, 
  ChevronRight,
  Calendar,
  Settings,
  BookOpen
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProfileFormBio } from './ProfileFormBio';

interface ProfileFormProps {
  user?: UserProfile;
  onSave: (profile: UserProfile & { bio?: string }) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  isFirstTime?: boolean;
  isEditing?: boolean;
  onShowOnboarding?: () => void;
}

export function ProfileForm({ user, onSave, onCancel, onEdit, isFirstTime = false, isEditing = true, onShowOnboarding }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || 'Марк',
    gender: user?.gender || 'male',
    dateOfBirth: user?.dateOfBirth || '1988-06-20',
    lookingForGender: user?.lookingForGender || 'female',
    ageRangeMin: user?.ageRangeMin || 22,
    ageRangeMax: user?.ageRangeMax || 35,
    searchRadius: user?.searchRadius || 50,
    bio: '',
  });

  const [editSection, setEditSection] = useState<'basic' | 'preferences' | 'bio' | null>(null);

  // Состояние для переключения между группами вопросов
  const [bioTab, setBioTab] = useState<'about' | 'opinion'>('about');
  
  // Состояние для раскрытых вопросов
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // Функция переключения раскрытия вопроса
  const toggleQuestion = (key: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(key)) {
      // Схлопываем только если ответа нет
      if (!bioPrompts[key as keyof typeof bioPrompts]?.trim()) {
        newExpanded.delete(key);
      }
    } else {
      newExpanded.add(key);
    }
    setExpandedQuestions(newExpanded);
  };

  // Парсим существующую анкету пользователя
  const parseBioPrompts = (bio?: string) => {
    const prompts: any = {
      // Группа "О Вас"
      free_year: '',
      small_moment: '',
      spontaneous_or_planned: '',
      accidental_skill: '',
      cozy_or_adventure: '',
      funny_memory: '',
      praise_and_jokes: '',
      important_detail: '',
      recovery_method: '',
      favorite_question: '',
      // Группа "Ваше мнение о..." - Деньги
      money_paying: '',
      money_split: '',
      money_support: '',
      money_resource: '',
      // Отношения, роли и ожидания
      rel_roles: '',
      rel_stability: '',
      rel_no_obligations: '',
      rel_freedom: '',
      // Семь и дети
      family_goal: '',
      family_kids: '',
      family_happy: '',
      family_priority: '',
      // Ценности, общество, мировоззрение
      values_success: '',
      values_infantilism: '',
      values_nothing_owed: '',
      values_self_work: '',
      // Границы, честность, ответственность
      bound_truth: '',
      bound_secrets: '',
      bound_space: '',
      bound_responsibility: '',
      // Саморефлексия
      reflect_changed: '',
      reflect_was_norm: '',
      reflect_not_ready: '',
      // Финальный вопрос
      final_phrase: '',
    };

    if (!bio) return prompts;

    const sections = bio.split('\n\n');
    sections.forEach(section => {
      // Группа "О Вас"
      if (section.includes('🌍 Свободный год:')) {
        prompts.free_year = section.replace('🌍 Свободный год:\n', '');
      } else if (section.includes('✨ Маленький момент:')) {
        prompts.small_moment = section.replace('✨ Маленький момент:\n', '');
      } else if (section.includes('🎲 Спонтанность или планирование:')) {
        prompts.spontaneous_or_planned = section.replace('🎲 Спонтанность или планирование:\n', '');
      } else if (section.includes('🎯 Случайный навык:')) {
        prompts.accidental_skill = section.replace('🎯 Случайный навык:\n', '');
      } else if (section.includes('🏡 Уют или приключение:')) {
        prompts.cozy_or_adventure = section.replace('🏡 Уют или приключение:\n', '');
      } else if (section.includes('😄 Смешная история:')) {
        prompts.funny_memory = section.replace('😄 Смешная история:\n', '');
      } else if (section.includes('👥 Хвалят и подшучивают:')) {
        prompts.praise_and_jokes = section.replace('👥 Хвалят и подшучивают:\n', '');
      } else if (section.includes('🔍 Важная мелочь:')) {
        prompts.important_detail = section.replace('🔍 Важная мелочь:\n', '');
      } else if (section.includes('🌙 Восстановление:')) {
        prompts.recovery_method = section.replace('🌙 Восстановление:\\n', '');
      } else if (section.includes('💬 Любимый вопрос:')) {
        prompts.favorite_question = section.replace('💬 Любимый вопрос:\\n', '');
      }
      // Деньги
      else if (section.includes('💰 Оплата в отношениях:')) {
        prompts.money_paying = section.replace('💰 Оплата в отношениях:\n', '');
      } else if (section.includes('💰 Платим пополам:')) {
        prompts.money_split = section.replace('💰 Платим пополам:\n', '');
      } else if (section.includes('💰 Материальная поддержка:')) {
        prompts.money_support = section.replace('💰 Материальная поддержка:\n', '');
      } else if (section.includes('💰 Деньги в паре:')) {
        prompts.money_resource = section.replace('💰 Деньги в паре:\n', '');
      }
      // Отношения
      else if (section.includes('💬 Роли в паре:')) {
        prompts.rel_roles = section.replace('💬 Роли в паре:\n', '');
      } else if (section.includes('💬 Стабильность или свобода:')) {
        prompts.rel_stability = section.replace('💬 Стабильность или свобода:\n', '');
      } else if (section.includes('💬 Отношения без обязательств:')) {
        prompts.rel_no_obligations = section.replace('💬 Отношения без обязательств:\n', '');
      } else if (section.includes('💬 Свобода и ответственность:')) {
        prompts.rel_freedom = section.replace('💬 Свобода и ответственность:\n', '');
      }
      // Семья
      else if (section.includes('👨‍👩‍👧 Семья как цель:')) {
        prompts.family_goal = section.replace('👨‍👩‍👧 Семья как цель:\n', '');
      } else if (section.includes('���‍👩‍👧 Дети:')) {
        prompts.family_kids = section.replace('👨‍👩‍👧 Дети:\n', '');
      } else if (section.includes('👨‍👩‍👧 Счастье без семьи:')) {
        prompts.family_happy = section.replace('👨‍👩‍👧 Счастье без семьи:\n', '');
      } else if (section.includes('👨‍👩‍👧 Важное для ребенка:')) {
        prompts.family_priority = section.replace('👨‍👩‍👧 Важное для ребенка:\n', '');
      }
      // Ценности
      else if (section.includes('🌍 Успех или вклад:')) {
        prompts.values_success = section.replace('🌍 Успех или вклад:\n', '');
      } else if (section.includes('🌍 Инфантильность:')) {
        prompts.values_infantilism = section.replace('🌍 Инфантильность:\n', '');
      } else if (section.includes('🌍 Никто ничего не должен:')) {
        prompts.values_nothing_owed = section.replace('🌍 Никто ничего не должен:\n', '');
      } else if (section.includes('🌍 Разобраться с собой:')) {
        prompts.values_self_work = section.replace('🌍 Разобраться с собой:\n', '');
      }
      // Границы
      else if (section.includes('🔒 Правда или ложь:')) {
        prompts.bound_truth = section.replace('🔒 Правда или ложь:\n', '');
      } else if (section.includes('🔒 Скрывать от партнера:')) {
        prompts.bound_secrets = section.replace('🔒 Скрывать от партнера:\n', '');
      } else if (section.includes('🔒 Личное пространство:')) {
        prompts.bound_space = section.replace('🔒 Личное пространство:\n', '');
      } else if (section.includes('🔒 Ответственность:')) {
        prompts.bound_responsibility = section.replace('🔒 Ответственность:\n', '');
      }
      // Саморефлексия
      else if (section.includes('🧠 Пересмотренная установка:')) {
        prompts.reflect_changed = section.replace('🧠 Пересмотренная установка:\n', '');
      } else if (section.includes('🧠 Раньше норма — сейчас нет:')) {
        prompts.reflect_was_norm = section.replace('🧠 Раньше норма — сейчас нет:\n', '');
      } else if (section.includes('🧠 К чему не готовы:')) {
        prompts.reflect_not_ready = section.replace('🧠 К чему не готовы:\n', '');
      }
      // Финальный
      else if (section.includes('✨ Одна фраза:')) {
        prompts.final_phrase = section.replace('✨ Одна фраза:\n', '');
      }
    });

    return prompts;
  };

  const [bioPrompts, setBioPrompts] = useState(parseBioPrompts(user?.bio));

  // Вычисляем возраст
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Собираем био из промптов
    const bioSections = [];
    
    // Группа "О Вас"
    if (bioPrompts.free_year) {
      bioSections.push(`🌍 Свободный год:\n${bioPrompts.free_year}`);
    }
    if (bioPrompts.small_moment) {
      bioSections.push(`✨ Маленький момент:\n${bioPrompts.small_moment}`);
    }
    if (bioPrompts.spontaneous_or_planned) {
      bioSections.push(`🎲 Спонтанность или планирование:\n${bioPrompts.spontaneous_or_planned}`);
    }
    if (bioPrompts.accidental_skill) {
      bioSections.push(`🎯 Случайный навык:\n${bioPrompts.accidental_skill}`);
    }
    if (bioPrompts.cozy_or_adventure) {
      bioSections.push(`🏡 Уют или приключение:\n${bioPrompts.cozy_or_adventure}`);
    }
    if (bioPrompts.funny_memory) {
      bioSections.push(`😄 Смешная история:\n${bioPrompts.funny_memory}`);
    }
    if (bioPrompts.praise_and_jokes) {
      bioSections.push(`👥 Хвалят и подшучивают:\n${bioPrompts.praise_and_jokes}`);
    }
    if (bioPrompts.important_detail) {
      bioSections.push(`🔍 Важная мелочь:\n${bioPrompts.important_detail}`);
    }
    if (bioPrompts.recovery_method) {
      bioSections.push(`🌙 Восстановление:\\n${bioPrompts.recovery_method}`);
    }
    if (bioPrompts.favorite_question) {
      bioSections.push(`💬 Любимый вопрос:\\n${bioPrompts.favorite_question}`);
    }

    // Группа "Ваше мнение о..." - Деньги
    if (bioPrompts.money_paying) {
      bioSections.push(`💰 Оплата в отношениях:\n${bioPrompts.money_paying}`);
    }
    if (bioPrompts.money_split) {
      bioSections.push(`💰 Платим пополам:\n${bioPrompts.money_split}`);
    }
    if (bioPrompts.money_support) {
      bioSections.push(`💰 Материальная поддержка:\n${bioPrompts.money_support}`);
    }
    if (bioPrompts.money_resource) {
      bioSections.push(`💰 Деньги в паре:\n${bioPrompts.money_resource}`);
    }

    // Отношения
    if (bioPrompts.rel_roles) {
      bioSections.push(`�� Роли в паре:\n${bioPrompts.rel_roles}`);
    }
    if (bioPrompts.rel_stability) {
      bioSections.push(`💬 Стабильность или свобода:\n${bioPrompts.rel_stability}`);
    }
    if (bioPrompts.rel_no_obligations) {
      bioSections.push(`💬 Отношения без обязательств:\n${bioPrompts.rel_no_obligations}`);
    }
    if (bioPrompts.rel_freedom) {
      bioSections.push(`💬 Свобода и ответственность:\n${bioPrompts.rel_freedom}`);
    }

    // Семья
    if (bioPrompts.family_goal) {
      bioSections.push(`👨‍👩‍👧 Семья как цель:\n${bioPrompts.family_goal}`);
    }
    if (bioPrompts.family_kids) {
      bioSections.push(`👨‍👩‍👧 Дети:\n${bioPrompts.family_kids}`);
    }
    if (bioPrompts.family_happy) {
      bioSections.push(`👨‍👩‍👧 Счастье без семьи:\n${bioPrompts.family_happy}`);
    }
    if (bioPrompts.family_priority) {
      bioSections.push(`👨‍👩‍👧 Важное для ребенка:\n${bioPrompts.family_priority}`);
    }

    // Ценности
    if (bioPrompts.values_success) {
      bioSections.push(`🌍 Успех или вклад:\n${bioPrompts.values_success}`);
    }
    if (bioPrompts.values_infantilism) {
      bioSections.push(`🌍 Инфантильность:\n${bioPrompts.values_infantilism}`);
    }
    if (bioPrompts.values_nothing_owed) {
      bioSections.push(`🌍 Никто ничего не должен:\n${bioPrompts.values_nothing_owed}`);
    }
    if (bioPrompts.values_self_work) {
      bioSections.push(`🌍 Разобраться с собой:\n${bioPrompts.values_self_work}`);
    }

    // Границы
    if (bioPrompts.bound_truth) {
      bioSections.push(`🔒 Правда или ложь:\n${bioPrompts.bound_truth}`);
    }
    if (bioPrompts.bound_secrets) {
      bioSections.push(`🔒 Скрывать от партнера:\n${bioPrompts.bound_secrets}`);
    }
    if (bioPrompts.bound_space) {
      bioSections.push(`🔒 Личное пространство:\n${bioPrompts.bound_space}`);
    }
    if (bioPrompts.bound_responsibility) {
      bioSections.push(`🔒 Ответственность:\n${bioPrompts.bound_responsibility}`);
    }

    // Саморефлексия
    if (bioPrompts.reflect_changed) {
      bioSections.push(`🧠 Пересмотренная установка:\n${bioPrompts.reflect_changed}`);
    }
    if (bioPrompts.reflect_was_norm) {
      bioSections.push(`🧠 Раньше норма — сейчас нет:\n${bioPrompts.reflect_was_norm}`);
    }
    if (bioPrompts.reflect_not_ready) {
      bioSections.push(`🧠 К чему не готовы:\n${bioPrompts.reflect_not_ready}`);
    }

    // Финальный
    if (bioPrompts.final_phrase) {
      bioSections.push(`✨ Одна фраза:\n${bioPrompts.final_phrase}`);
    }

    const bio = bioSections.join('\n\n');

    onSave({
      id: user?.id || `user-${Date.now()}`,
      name: formData.name,
      gender: formData.gender as 'male' | 'female',
      dateOfBirth: formData.dateOfBirth,
      lookingForGender: formData.lookingForGender as 'male' | 'female',
      ageRangeMin: formData.ageRangeMin,
      ageRangeMax: formData.ageRangeMax,
      searchRadius: formData.searchRadius,
      bio,
    });
  };

  // Группа 1: О Вас
  const aboutYouQuestions = [
    {
      key: 'free_year',
      icon: '🌍',
      question: 'Если бы у тебя был свободный год без обязательств, чем бы ты его заполнил(а)?',
      placeholder: 'Поделитесь своими мечтами и планами...',
    },
    {
      key: 'small_moment',
      icon: '✨',
      question: 'Какой маленький момент из обычной жизни делает твой день заметно лучше?',
      placeholder: 'Расскажите о простых радостях...',
    },
    {
      key: 'spontaneous_or_planned',
      icon: '🎲',
      question: 'Ты больше за спонтанные решения или за "я всё продумал(а) заранее"? Есть пример?',
      placeholder: 'Поделитесь своим стилем принятия решений...',
    },
    {
      key: 'accidental_skill',
      icon: '🎯',
      question: 'Какой навык или привычку ты однажды случайно приобрёл(а) — и теперь рад(а), что она с тобой?',
      placeholder: 'Расскажите о неожиданном приобретении...',
    },
    {
      key: 'cozy_or_adventure',
      icon: '🏡',
      question: 'Если выбирать: уютный вечер дома или неожиданное приключение — что победит сегодня?',
      placeholder: 'Что ближе вам в данный момент...',
    },
    {
      key: 'funny_memory',
      icon: '😄',
      question: 'Какая ситуация из жизни до сих пор вызывает улыбку, даже если тогда было не до смеха?',
      placeholder: 'Поделитесь забавной историей...',
    },
    {
      key: 'praise_and_jokes',
      icon: '👥',
      question: 'За что тебя чаще всего хвалят друзья — и за что слегка подшучивают?',
      placeholder: 'Расскажите о том, как вас видят близкие...',
    },
    {
      key: 'important_detail',
      icon: '🔍',
      question: 'Есть ли у тебя мелочь, которую другие не понимают, а тебе она почему-то важна?',
      placeholder: 'Что-то личное и важное для вас...',
    },
    {
      key: 'recovery_method',
      icon: '🌙',
      question: 'Как ты обычно восстанавливаешься после сложного дня?',
      placeholder: 'Расскажите о своих способах перезагрузки...',
    },
    {
      key: 'favorite_question',
      icon: '💬',
      question: 'Какой вопрос ты сам(а) любишь задавать новым людям — и почему?',
      placeholder: 'Поделитесь своим любимым вопросом...',
    },
  ];

  // Группа 2: Ваше мнение о...
  const opinionQuestions = [
    // Деньги, вклад и справедливость
    {
      section: 'Деньги, вклад и справедливость',
      questions: [
        {
          key: 'money_paying',
          icon: '💰',
          question: 'Как ты относишься к ситуации, когда один человек системно платит за всё в отношениях?',
          placeholder: 'норма / временно допустимо / неприемлемо / зависит от контекста',
        },
        {
          key: 'money_split',
          icon: '💰',
          question: 'Фраза "платим пополам" для тебя — это про равенство, удобство или отсутствие инициативы?',
          placeholder: 'Ваш взгляд...',
        },
        {
          key: 'money_support',
          icon: '💰',
          question: 'Считаешь ли ты нормальным ожидать материальной поддержки от партнёра просто за сам факт отношений?',
          placeholder: 'Ваше мнение...',
        },
        {
          key: 'money_resource',
          icon: '💰',
          question: 'Деньги в паре — это общий ресурс или личная ответственность каждого? Почему?',
          placeholder: 'Ваш ответ...',
        },
      ],
    },
    // Отношения, роли и ожидания
    {
      section: 'Отношения, роли и ожидания',
      questions: [
        {
          key: 'rel_roles',
          icon: '💬',
          question: 'Должны ли в паре быть "роли" (инициатор, защитник, заботящийся) или это устаревшая модель?',
          placeholder: 'Ваше мнение...',
        },
        {
          key: 'rel_stability',
          icon: '💬',
          question: 'Что для тебя важнее в отношениях: стабильность или свобода?',
          placeholder: 'Ваш ответ...',
        },
        {
          key: 'rel_no_obligations',
          icon: '💬',
          question: 'Допустим ли для тебя формат отношений без обязательств, но с эмоци��нальной близостью?',
          placeholder: 'Ваш взгляд...',
        },
        {
          key: 'rel_freedom',
          icon: '💬',
          question: 'Где для тебя проходит граница между личной свободой и ответственностью перед партнёром?',
          placeholder: 'Ваше мнение...',
        },
      ],
    },
    // Семья и дети
    {
      section: 'Семья и дети',
      questions: [
        {
          key: 'family_goal',
          icon: '👨‍👩‍👧',
          question: 'Считаешь ли ты создание семьи важной целью жизни или лишь одним из возможных сценариев?',
          placeholder: 'Ваш взгляд...',
        },
        {
          key: 'family_kids',
          icon: '👨‍👩‍👧',
          question: 'Хочешь ли ты детей? Если да — "когда-нибудь" или при определённых условиях?',
          placeholder: 'Ваш ответ...',
        },
        {
          key: 'family_happy',
          icon: '👨‍👩‍👧',
          question: 'Можно ли, по-твоему, быть счастливым без семьи и детей?',
          placeholder: 'Ваше мнение...',
        },
        {
          key: 'family_priority',
          icon: '👨‍👩‍👧',
          question: 'Что для тебя важнее для ребёнка: финансовая стабильность или эмоциональная доступность родителей?',
          placeholder: 'Ваш взгляд...',
        },
      ],
    },
    // Ценности, общество, мировоззрение
    {
      section: 'Ценности, общество, мировоззрение',
      questions: [
        {
          key: 'values_success',
          icon: '🌍',
          question: 'Что для тебя важнее: личный успех или вклад в общество?',
          placeholder: 'Ваш ответ...',
        },
        {
          key: 'values_infantilism',
          icon: '🌍',
          question: 'Считаешь ли ты, что современное общество поощряет инфантильность во взрослых отношениях?',
          placeholder: 'Ваше мнение...',
        },
        {
          key: 'values_nothing_owed',
          icon: '🌍',
          question: 'Как ты относишься к идее, что "никто никому ничего не должен"?',
          placeholder: 'Ваш взгляд...',
        },
        {
          key: 'values_self_work',
          icon: '🌍',
          question: 'Должен ли человек сначала "разобраться с собой", прежде чем вступать в серьёзные отношения?',
          placeholder: 'Ваше мнение...',
        },
      ],
    },
    // Границы, честность, ответственность
    {
      section: 'Границы, честность, ответственность',
      questions: [
        {
          key: 'bound_truth',
          icon: '🔒',
          question: 'Лучше горькая правда или мягкая ложь в отношениях?',
          placeholder: 'Ваш ответ...',
        },
        {
          key: 'bound_secrets',
          icon: '🔒',
          question: 'Считаешь ли ты допустимым скрыват�� часть своей жизни от партнёра ради спокойствия?',
          placeholder: 'Ваше мнение...',
        },
        {
          key: 'bound_space',
          icon: '🔒',
          question: 'Где для тебя проходит граница личного пространства в паре?',
          placeholder: 'Ваш взгляд...',
        },
        {
          key: 'bound_responsibility',
          icon: '🔒',
          question: 'Кто, по-твоему, несёт ответственность за качество отношений — оба или каждый за себя?',
          placeholder: 'Ваш ответ...',
        },
      ],
    },
    // Саморефлексия
    {
      section: 'Саморефлексия',
      questions: [
        {
          key: 'reflect_changed',
          icon: '🧠',
          question: 'Какую свою установку об отношениях ты уже пересмотрел(а) с возрастом?',
          placeholder: 'Ваш ответ...',
        },
        {
          key: 'reflect_was_norm',
          icon: '🧠',
          question: 'Что ты раньше считал(а) нормой в отношениях, а сейчас — нет?',
          placeholder: 'Ваше мнение...',
        },
        {
          key: 'reflect_not_ready',
          icon: '🧠',
          question: 'Чему, по-твоему, люди чаще всего не готовы в отношениях, но должны быть готовы?',
          placeholder: 'Ваш взгляд...',
        },
      ],
    },
    // Финальный вопрос
    {
      section: 'Финальный вопрос',
      questions: [
        {
          key: 'final_phrase',
          icon: '✨',
          question: 'Если бы тебе нужно было описать свои взгляды на отношения одной фразой — какой она была бы?',
          placeholder: 'Одна фраза...',
        },
      ],
    },
  ];

  const aboutYouFilledCount = aboutYouQuestions.filter(q => bioPrompts[q.key as keyof typeof bioPrompts]?.trim()).length;
  const opinionFilledCount = opinionQuestions.reduce((count, section) => {
    return count + section.questions.filter(q => bioPrompts[q.key as keyof typeof bioPrompts]?.trim()).length;
  }, 0);
  const totalOpinionQuestions = opinionQuestions.reduce((count, section) => count + section.questions.length, 0);

  // Режим просмотра профиля (не первый раз и не редакти��ование)
  if (!isFirstTime && !isEditing && editSection === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="p-4">
            {/* Убрана кнопка редактирования */}
          </div>

          {/* Avatar Section with Decorative Elements */}
          <div className="flex flex-col items-center px-4 pb-6">
            {/* Decorative leaves */}
            <div className="relative">
              <div className="absolute -left-16 top-8 text-6xl opacity-10">🌿</div>
              <div className="absolute -right-16 top-8 text-6xl opacity-10 transform scale-x-[-1]">🌿</div>
              
              {/* Avatar */}
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center mb-4">
                {user?.photo ? (
                  <ImageWithFallback
                    src={user.photo}
                    alt={formData.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-orange-600" />
                )}
              </div>
            </div>

            {/* Name */}
            <h1 className="text-3xl mb-1">{formData.name}</h1>
            
            {/* Age */}
            <p className="text-emerald-600 uppercase text-sm tracking-wide">
              {calculateAge(formData.dateOfBirth)} лет
            </p>
          </div>

          {/* Menu Sections */}
          <div className="px-4 pb-24">
            {/* PROFILE SECTION */}
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-3 px-2">
                Профиль
              </h3>
              
              <div className="space-y-3">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setEditSection('basic')}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-gray-700" />
                      </div>
                      <span className="text-gray-900">Основная информация</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => setEditSection('preferences')}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-gray-700" />
                      </div>
                      <span className="text-gray-900">Предпочтения поиска</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

              {/* Проверяем, есть ли заполненная анкета */}
              {user?.bio ? (
                (() => {
                  const sections = (user.bio || '').split('\\n\\n').filter((s: string) => s.trim());
                  
                  // Группа "О Вас" - первые 10 вопросов (по эмодзи)
                  const aboutYouEmojis = ['🌍', '✨', '🎲', '🎯', '🏡', '😄', '👥', '🔍', '🌙', '💬'];
                  const aboutYouSections = sections.filter((s: string) => {
                    const emoji = s.match(/[^\\w\\s:]/)?.[0];
                    return emoji && aboutYouEmojis.includes(emoji);
                  }).slice(0, 2); // Берем только первые 2 ответа
                  
                  // Группа "Ваше мнение" - остальные вопросы
                  const opinionEmojis = ['💰', '💬', '👨‍👩‍👧', '🌍', '🔒', '🧠', '✨'];
                  const opinionSections = sections.filter((s: string) => {
                    const emoji = s.match(/[^\\w\\s:]/)?.[0];
                    return emoji && opinionEmojis.includes(emoji);
                  }).slice(0, 2); // Берем только первые 2 ответа
                  
                  const getBgGradient = (emoji: string) => {
                    const gradientMap: { [key: string]: string } = {
                      '🎵': 'from-blue-50 to-indigo-50 border-blue-200',
                      '🍔': 'from-orange-50 to-amber-50 border-orange-200',
                      '🎮': 'from-purple-50 to-pink-50 border-purple-200',
                      '🌙': 'from-indigo-50 to-violet-50 border-indigo-200',
                      '🎬': 'from-pink-50 to-rose-50 border-pink-200',
                      '🎪': 'from-emerald-50 to-teal-50 border-emerald-200',
                      '☕': 'from-yellow-50 to-amber-50 border-yellow-200',
                      '🦸': 'from-amber-50 to-orange-50 border-amber-200',
                      '💰': 'from-green-50 to-emerald-50 border-green-200',
                      '💬': 'from-teal-50 to-cyan-50 border-teal-200',
                      '👨‍👩‍👧': 'from-blue-50 to-sky-50 border-blue-200',
                      '🌍': 'from-cyan-50 to-teal-50 border-cyan-200',
                      '🔒': 'from-slate-50 to-gray-50 border-slate-200',
                      '🧠': 'from-purple-50 to-indigo-50 border-purple-200',
                      '✨': 'from-violet-50 to-purple-50 border-violet-200',
                    };
                    return gradientMap[emoji] || 'from-gray-50 to-gray-100 border-gray-200';
                  };
                  
                  return (
                    <div className="space-y-3">
                      {/* Блок "О Вас" */}
                      {aboutYouSections.length > 0 && (
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                          <button
                            onClick={() => setEditSection('bio')}
                            className="w-full px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-emerald-700" />
                              </div>
                              <span className="text-gray-900">О Вас</span>
                            </div>
                            <div className="space-y-2">
                              {aboutYouSections.map((section: string, idx: number) => {
                                const lines = section.split('\\n');
                                const titleLine = lines[0];
                                const emoji = titleLine.match(/[^\\w\\s:]/)?.[0] || '💭';
                                const title = titleLine.replace(emoji, '').replace(/:/g, '').trim();
                                const content = lines.slice(1).join(' ').trim();
                                const preview = content.length > 100 ? content.slice(0, 100) + '...' : content;
                                const gradient = getBgGradient(emoji);
                                
                                return (
                                  <div
                                    key={idx}
                                    className={`bg-gradient-to-br ${gradient} rounded-xl p-3 border`}
                                  >
                                    <p className="text-xs text-gray-500 mb-1">{title}</p>
                                    <p className="text-sm text-gray-700">{preview}</p>
                                  </div>
                                );
                              })}
                            </div>
                            {aboutYouFilledCount > 2 && (
                              <p className="text-xs text-gray-500 mt-3 text-center">
                                +{aboutYouFilledCount - 2} ответов
                              </p>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {/* Блок "Ваше мнение" */}
                      {opinionSections.length > 0 && (
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                          <button
                            onClick={() => setEditSection('bio')}
                            className="w-full px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-teal-700" />
                              </div>
                              <span className="text-gray-900">Ваше мнение</span>
                            </div>
                            <div className="space-y-2">
                              {opinionSections.map((section: string, idx: number) => {
                                const lines = section.split('\\n');
                                const titleLine = lines[0];
                                const emoji = titleLine.match(/[^\\w\\s:]/)?.[0] || '💰';
                                const title = titleLine.replace(emoji, '').replace(/:/g, '').trim();
                                const content = lines.slice(1).join(' ').trim();
                                const preview = content.length > 100 ? content.slice(0, 100) + '...' : content;
                                const gradient = getBgGradient(emoji);
                                
                                return (
                                  <div
                                    key={idx}
                                    className={`bg-gradient-to-br ${gradient} rounded-xl p-3 border`}
                                  >
                                    <p className="text-xs text-gray-500 mb-1">{title}</p>
                                    <p className="text-sm text-gray-700">{preview}</p>
                                  </div>
                                );
                              })}
                            </div>
                            {opinionFilledCount > 2 && (
                              <p className="text-xs text-gray-500 mt-3 text-center">
                                +{opinionFilledCount - 2} ответов
                              </p>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {/* Если нет ни одного заполненного ответа */}
                      {aboutYouSections.length === 0 && opinionSections.length === 0 && (
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                          <button
                            onClick={() => setEditSection('bio')}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-gray-700" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="text-gray-900">Анкета</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setEditSection('bio')}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-gray-700" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-gray-900">Анкета</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              )}

              {/* Кнопка возврата к онбордингу */}
              {onShowOnboarding && (
                <div className="mt-6">
                  <button
                    onClick={onShowOnboarding}
                    className="w-full bg-white rounded-2xl px-5 py-4 hover:bg-gray-50 transition-colors shadow-sm text-center text-gray-600 text-sm"
                  >
                    Показать онбординг
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Режим редактирования конкретной секции
  if (editSection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setEditSection(null)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl text-gray-900">
              {editSection === 'basic' && 'Основная информация'}
              {editSection === 'preferences' && 'Предпочтения поиска'}
              {editSection === 'bio' && 'О себе'}
            </h1>
            <div className="w-10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            {editSection === 'basic' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Как вас зовут? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="max-w-xs px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="Ва��е имя"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Ваш пол <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="max-w-xs px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      >
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Дата рождения
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="max-w-xs px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {editSection === 'preferences' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Пол</label>
                    <select
                      value={formData.lookingForGender}
                      onChange={(e) => setFormData({ ...formData, lookingForGender: e.target.value })}
                      className="max-w-xs px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    >
                      <option value="male">Мужс��ой</option>
                      <option value="female">Женский</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Возраст: {formData.ageRangeMin} — {formData.ageRangeMax} лет
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="range"
                        min="18"
                        max="100"
                        value={formData.ageRangeMin}
                        onChange={(e) => setFormData({ ...formData, ageRangeMin: Number(e.target.value) })}
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="18"
                        max="100"
                        value={formData.ageRangeMax}
                        onChange={(e) => setFormData({ ...formData, ageRangeMax: Number(e.target.value) })}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Радиус поиска: {formData.searchRadius} км
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={formData.searchRadius}
                      onChange={(e) => setFormData({ ...formData, searchRadius: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bio Section */}
            {editSection === 'bio' && (
              <>
                {/* Tab Switcher */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white mb-6">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBioTab('about')}
                      className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
                        bioTab === 'about'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      О Вас ({aboutYouFilledCount}/{aboutYouQuestions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBioTab('opinion')}
                      className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
                        bioTab === 'opinion'
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Ваше мнение ({opinionFilledCount}/{totalOpinionQuestions})
                    </button>
                  </div>
                </div>

                {/* Tab: О Вас */}
                {bioTab === 'about' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white">
                    <div className="space-y-4">
                      {aboutYouQuestions.map((q) => {
                        const isExpanded = expandedQuestions.has(q.key) || bioPrompts[q.key as keyof typeof bioPrompts]?.trim();
                        
                        return (
                          <div key={q.key} className="group">
                            <button
                              type="button"
                              onClick={() => toggleQuestion(q.key)}
                              className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                                isExpanded 
                                  ? 'bg-emerald-50 border-2 border-emerald-200' 
                                  : 'bg-gray-50 border-2 border-gray-200 hover:border-emerald-300'
                              }`}
                            >
                              <span className="flex items-center gap-2 text-gray-800">
                                <span className="text-xl">{q.icon}</span>
                                <span className="flex-1">{q.question}</span>
                                {bioPrompts[q.key as keyof typeof bioPrompts]?.trim() && (
                                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                )}
                              </span>
                            </button>
                            
                            {isExpanded && (
                              <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                                <textarea
                                  value={bioPrompts[q.key as keyof typeof bioPrompts]}
                                  onChange={(e) => setBioPrompts({ ...bioPrompts, [q.key]: e.target.value })}
                                  placeholder={q.placeholder}
                                  rows={4}
                                  className="max-w-lg px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                                  autoFocus
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab: Ваше мнение о... */}
                {bioTab === 'opinion' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white">
                    {opinionQuestions.map((section, idx) => (
                      <div key={idx} className="mb-8 last:mb-0">
                        <h4 className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                          <span className="w-8 h-0.5 bg-gray-300"></span>
                          {section.section}
                        </h4>
                        <div className="space-y-4">
                          {section.questions.map((q) => {
                            const isExpanded = expandedQuestions.has(q.key) || bioPrompts[q.key as keyof typeof bioPrompts]?.trim();
                            
                            return (
                              <div key={q.key} className="group">
                                <button
                                  type="button"
                                  onClick={() => toggleQuestion(q.key)}
                                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                                    isExpanded 
                                      ? 'bg-teal-50 border-2 border-teal-200' 
                                      : 'bg-gray-50 border-2 border-gray-200 hover:border-teal-300'
                                  }`}
                                >
                                  <span className="flex items-start gap-2 text-gray-800">
                                    <span className="text-lg mt-0.5">{q.icon}</span>
                                    <span className="flex-1 text-sm leading-relaxed">{q.question}</span>
                                    {bioPrompts[q.key as keyof typeof bioPrompts]?.trim() && (
                                      <span className="w-2 h-2 bg-teal-500 rounded-full mt-1 flex-shrink-0"></span>
                                    )}
                                  </span>
                                </button>
                                
                                {isExpanded && (
                                  <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                                    <textarea
                                      value={bioPrompts[q.key as keyof typeof bioPrompts]}
                                      onChange={(e) => setBioPrompts({ ...bioPrompts, [q.key]: e.target.value })}
                                      placeholder={q.placeholder}
                                      rows={3}
                                      className="max-w-lg px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                                      autoFocus
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Save Button */}
            <div className="sticky bottom-0 bg-gradient-to-t from-emerald-50 via-emerald-50 to-transparent pt-6 pb-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-4 rounded-full hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Сохранить изменени��
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Режим первого создания или полного редактирования
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        {!isFirstTime && (
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Редактирование профиля
            </h1>
          </div>
        )}

        {isFirstTime && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-3xl mb-8 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8" />
              <h1>��оздайте вашу анкету</h1>
            </div>
            <p className="text-emerald-50">
              Заполните столько полей, сколько захотите. Чем больше заполните — тем вероятней сможете найти своего человека.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white">
            <h3 className="flex items-center gap-2 mb-6 text-gray-800">
              <UserIcon className="w-5 h-5 text-emerald-600" />
              Основная информация
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Как вас зовут? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="max-w-xs px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Ваше имя"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Ваш пол <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="max-w-xs px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="male">Мужской</option>
                    <option value="female">Женский</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Дата рождения
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="max-w-xs px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search Preferences */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white">
            <h3 className="flex items-center gap-2 mb-6 text-gray-800">
              <Heart className="w-5 h-5 text-emerald-600" />
              Кого вы ищете
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Пол</label>
                <select
                  value={formData.lookingForGender}
                  onChange={(e) => setFormData({ ...formData, lookingForGender: e.target.value })}
                  className="max-w-xs px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Возраст: {formData.ageRangeMin} — {formData.ageRangeMax} лет
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={formData.ageRangeMin}
                    onChange={(e) => setFormData({ ...formData, ageRangeMin: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={formData.ageRangeMax}
                    onChange={(e) => setFormData({ ...formData, ageRangeMax: Number(e.target.value) })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Радиус поиска: {formData.searchRadius} км
                </label>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={formData.searchRadius}
                  onChange={(e) => setFormData({ ...formData, searchRadius: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Anketa Section with tabs and collapsible fields */}
          <ProfileFormBio
            aboutYouQuestions={aboutYouQuestions}
            opinionQuestions={opinionQuestions}
            bioPrompts={bioPrompts}
            setBioPrompts={setBioPrompts}
            bioTab={bioTab}
            setBioTab={setBioTab}
            expandedQuestions={expandedQuestions}
            toggleQuestion={toggleQuestion}
            aboutYouFilledCount={aboutYouFilledCount}
            opinionFilledCount={opinionFilledCount}
            totalOpinionQuestions={totalOpinionQuestions}
          />

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-gradient-to-t from-emerald-50 via-emerald-50 to-transparent pt-6 pb-4">
            <div className="flex gap-3">
              {!isFirstTime && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-white text-gray-700 py-4 rounded-full border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Отмена
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-4 rounded-full hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isFirstTime ? 'Сохранить и начать' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}