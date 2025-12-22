import { useState } from 'react';
import { UserProfile } from '../App';
import { ChevronRight, User as UserIcon, Heart, MapPin, Calendar, Sparkles } from 'lucide-react';

interface ProfileFormNewProps {
  user?: UserProfile;
  onSave: (profile: UserProfile & { bio?: string }) => void;
  isFirstTime?: boolean;
}

export function ProfileFormNew({ user, onSave, isFirstTime = false }: ProfileFormNewProps) {
  const [step, setStep] = useState<'overview' | 'details'>('overview');
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

  const [bioPrompts, setBioPrompts] = useState({
    inspiration: '',
    morning: '',
    emotions: '',
    dreams: '',
    closeness: '',
    expression: '',
    values: '',
    perfect_day: '',
  });

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

  const handleSave = () => {
    // Собираем био из промптов
    const bioSections = [];
    
    if (bioPrompts.inspiration) {
      bioSections.push(`💭 Что меня вдохновляет:\n${bioPrompts.inspiration}`);
    }
    if (bioPrompts.morning) {
      bioSections.push(`🌅 Мое идеальное утро:\n${bioPrompts.morning}`);
    }
    if (bioPrompts.emotions) {
      bioSections.push(`🎭 Что меня трогает:\n${bioPrompts.emotions}`);
    }
    if (bioPrompts.dreams) {
      bioSections.push(`🌌 Мои мечты:\n${bioPrompts.dreams}`);
    }
    if (bioPrompts.closeness) {
      bioSections.push(`💫 Близость для меня:\n${bioPrompts.closeness}`);
    }
    if (bioPrompts.expression) {
      bioSections.push(`🎨 Как я выражаю себя:\n${bioPrompts.expression}`);
    }
    if (bioPrompts.values) {
      bioSections.push(`⭐ Мои ценности:\n${bioPrompts.values}`);
    }
    if (bioPrompts.perfect_day) {
      bioSections.push(`☀️ Идеальный день:\n${bioPrompts.perfect_day}`);
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

  const bioQuestions = [
    {
      key: 'inspiration',
      icon: '💭',
      title: 'Что вас вдохновляет?',
      placeholder: 'Расскажите о книгах, музыке, идеях, людях или местах...',
    },
    {
      key: 'morning',
      icon: '🌅',
      title: 'Идеальное утро для вас?',
      placeholder: 'Опишите, как вы любите начинать день...',
    },
    {
      key: 'emotions',
      icon: '🎭',
      title: 'Что вас по-настоящему трогает?',
      placeholder: 'Моменты, которые вызывают сильные эмоции...',
    },
    {
      key: 'dreams',
      icon: '🌌',
      title: 'О чем вы мечтаете?',
      placeholder: 'Не цели и планы, а именно мечты...',
    },
    {
      key: 'closeness',
      icon: '💫',
      title: 'Что для вас значит близость?',
      placeholder: 'В отношениях, дружбе, с самим собой...',
    },
    {
      key: 'expression',
      icon: '🎨',
      title: 'Как вы выражаете себя?',
      placeholder: 'Творчество, общение, выбор, образ жизни...',
    },
    {
      key: 'values',
      icon: '⭐',
      title: 'Какие ценности важны?',
      placeholder: 'Как они проявляются в вашей жизни...',
    },
    {
      key: 'perfect_day',
      icon: '☀️',
      title: 'Ваш идеальный день?',
      placeholder: 'Если бы вы могли провести день как угодно...',
    },
  ];

  if (step === 'overview') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-10">
          <h1 className="text-center text-gray-900">Мой профиль</h1>
        </div>

        <div className="max-w-md mx-auto px-4 pb-20">
          {/* Avatar Section */}
          <div className="py-8 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mb-3 shadow-sm">
              <UserIcon className="w-16 h-16 text-orange-500" />
            </div>
            <button className="text-orange-500 hover:text-orange-600 transition-colors">
              Изменить фото
            </button>
          </div>

          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl overflow-hidden mb-6 shadow-sm">
            <button
              onClick={() => setStep('details')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <span className="text-gray-700">Имя</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-900">{formData.name}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>

            <button
              onClick={() => setStep('details')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <span className="text-gray-700">Пол</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-900">
                  {formData.gender === 'male' ? 'Мужской' : 'Женский'}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>

            <button
              onClick={() => setStep('details')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">Возраст</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-900">{calculateAge(formData.dateOfBirth)} лет</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>

          {/* Personalize Section */}
          <div className="mb-4">
            <h3 className="text-xs uppercase tracking-wide text-gray-500 px-2 mb-3">
              Настройки поиска
            </h3>
            
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setStep('details')}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <Heart className="w-5 h-5 text-gray-700" />
                <span className="flex-1 text-left text-gray-900">Предпочтения</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={() => setStep('details')}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <MapPin className="w-5 h-5 text-gray-700" />
                <span className="flex-1 text-left text-gray-900">Радиус поиска</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{formData.searchRadius} км</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mb-4">
            <h3 className="text-xs uppercase tracking-wide text-gray-500 px-2 mb-3">
              Моя анкета
            </h3>
            
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setStep('details')}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <Sparkles className="w-5 h-5 text-gray-700" />
                <span className="flex-1 text-left text-gray-900">Расскажите о себе</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="text-xs text-gray-500 px-2 leading-relaxed">
            Ваши данные никогда не покидают ваше устройство. Все данные хранятся только на вашем устройстве.
            Если вы больше не хотите использовать приложение, просто удалите его.
          </div>
        </div>
      </div>
    );
  }

  // Details/Edit view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-10 flex items-center justify-between">
        <button
          onClick={() => setStep('overview')}
          className="text-gray-900 hover:text-gray-600 transition-colors"
        >
          Назад
        </button>
        <h1 className="text-gray-900">Редактирование</h1>
        <button
          onClick={() => {
            handleSave();
            setStep('overview');
          }}
          className="text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Готово
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-gray-800 mb-4">Основная информация</h3>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">Имя</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Пол</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Дата рождения</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Search Preferences */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-gray-800 mb-4">Кого вы ищете</h3>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">Пол</label>
            <select
              value={formData.lookingForGender}
              onChange={(e) => setFormData({ ...formData, lookingForGender: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
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
            <label className="block text-sm text-gray-600 mb-2">
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

        {/* Bio Questions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-gray-800 mb-2">Расскажите о себе</h3>
            <p className="text-sm text-gray-600">
              Заполните те разделы, которые резонируют с вами
            </p>
          </div>

          {bioQuestions.map((q) => (
            <div key={q.key}>
              <label className="block mb-3">
                <span className="flex items-center gap-2 text-gray-800 mb-2">
                  <span className="text-xl">{q.icon}</span>
                  <span className="text-sm">{q.title}</span>
                </span>
              </label>
              <textarea
                value={bioPrompts[q.key as keyof typeof bioPrompts]}
                onChange={(e) => setBioPrompts({ ...bioPrompts, [q.key]: e.target.value })}
                placeholder={q.placeholder}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
