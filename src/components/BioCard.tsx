import { BookOpen, Heart, Sunrise, Theater, Sparkles as SparklesIcon, Palette, Star, Sun, DollarSign, MessageCircle, Users, Globe, Lock, Brain, Zap } from 'lucide-react';

interface BioCardProps {
  bio?: string;
  compact?: boolean;
  multiPreview?: boolean;
}

export function BioCard({ bio, compact = false, multiPreview = false }: BioCardProps) {
  if (!bio) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center">
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Анкета еще не заполнена</p>
      </div>
    );
  }

  // Парсим био на секции
  const sections = bio.split('\\n\\n').filter(section => section.trim());

  // Функция для получения иконки по эмодзи
  const getIcon = (emoji: string) => {
    const iconMap: { [key: string]: any } = {
      // Личные вопросы (О Вас)
      '🌍': Globe,
      '✨': SparklesIcon,
      '🎲': Palette,
      '🎯': Star,
      '🏡': Heart,
      '😄': Sun,
      '👥': Users,
      '🔍': BookOpen,
      '🌙': SparklesIcon,
      '💬': MessageCircle,
      // Социальные вопросы (Ваше мнение о...)
      '💰': DollarSign,
      '🧠': Brain,
      '🔒': Lock,
    };
    return iconMap[emoji] || BookOpen;
  };

  // Функция для получения цвета градиента по эмодзи
  const getGradient = (emoji: string) => {
    const gradientMap: { [key: string]: string } = {
      // Личные вопросы (О Вас) - теплые тона
      '🌍': 'from-cyan-50 to-teal-50 border-cyan-200',
      '✨': 'from-violet-50 to-purple-50 border-violet-200',
      '🎲': 'from-emerald-50 to-teal-50 border-emerald-200',
      '🎯': 'from-yellow-50 to-amber-50 border-yellow-200',
      '🏡': 'from-pink-50 to-rose-50 border-pink-200',
      '😄': 'from-amber-50 to-orange-50 border-amber-200',
      '👥': 'from-blue-50 to-sky-50 border-blue-200',
      '🔍': 'from-blue-50 to-indigo-50 border-blue-200',
      '🌙': 'from-indigo-50 to-violet-50 border-indigo-200',
      '💬': 'from-teal-50 to-cyan-50 border-teal-200',
      // Социальные вопросы (Ваше мнение о...) - холодные тона
      '💰': 'from-green-50 to-emerald-50 border-green-200',
      '🧠': 'from-purple-50 to-indigo-50 border-purple-200',
      '🔒': 'from-slate-50 to-gray-50 border-slate-200',
    };
    return gradientMap[emoji] || 'from-gray-50 to-gray-100 border-gray-200';
  };

  const getIconColor = (emoji: string) => {
    const colorMap: { [key: string]: string } = {
      // Личные вопросы
      '🌍': 'text-cyan-600',
      '✨': 'text-violet-600',
      '🎲': 'text-emerald-600',
      '🎯': 'text-yellow-600',
      '🏡': 'text-pink-600',
      '😄': 'text-amber-600',
      '👥': 'text-blue-600',
      '🔍': 'text-blue-600',
      '🌙': 'text-indigo-600',
      '💬': 'text-teal-600',
      // Социальные вопросы
      '💰': 'text-green-600',
      '🧠': 'text-purple-600',
      '🔒': 'text-slate-600',
    };
    return colorMap[emoji] || 'text-gray-600';
  };

  if (compact) {
    // Компактный вид - показываем только первую секцию
    const firstSection = sections[0];
    if (!firstSection) return null;

    const lines = firstSection.split('\n');
    const titleLine = lines[0];
    const emoji = titleLine.match(/[^\w\s:]/)?.[0] || '💭';
    const title = titleLine.replace(emoji, '').replace(/:/g, '').trim();
    const content = lines.slice(1).join(' ').trim();
    
    // Обрезаем текст для превью
    const preview = content.length > 120 ? content.slice(0, 120) + '...' : content;

    return (
      <div className={`bg-gradient-to-br ${getGradient(emoji)} rounded-xl p-3 border relative overflow-hidden group`}>
        <p className="text-xs text-gray-500 mb-1 flex items-center justify-between">
          <span>{title}</span>
          <span className="text-[10px] opacity-60 group-hover:opacity-100 transition-opacity">Нажмите для просмотра</span>
        </p>
        <p className="text-sm text-gray-700 line-clamp-3">{preview}</p>
      </div>
    );
  }

  if (multiPreview) {
    // Многострочный предварительный просмотр
    return (
      <div className="space-y-4">
        {sections.map((section, idx) => {
          const lines = section.split('\n');
          const titleLine = lines[0];
          const emoji = titleLine.match(/[^\w\s:]/)?.[0] || '💭';
          const title = titleLine.replace(emoji, '').replace(/:/g, '').trim();
          const content = lines.slice(1).join(' ').trim();
          
          // Обрезаем текст для превью
          const preview = content.length > 120 ? content.slice(0, 120) + '...' : content;

          return (
            <div
              key={idx}
              className={`bg-gradient-to-br ${getGradient(emoji)} rounded-xl p-3 border relative overflow-hidden group`}
            >
              <p className="text-xs text-gray-500 mb-1 flex items-center justify-between">
                <span>{title}</span>
                <span className="text-[10px] opacity-60 group-hover:opacity-100 transition-opacity">Нажмите для просмотра</span>
              </p>
              <p className="text-sm text-gray-700 line-clamp-3">{preview}</p>
            </div>
          );
        })}
      </div>
    );
  }

  // Полный вид
  return (
    <div className="space-y-4">
      {sections.map((section, idx) => {
        const lines = section.split('\n');
        const titleLine = lines[0];
        const emoji = titleLine.match(/[^\w\s:]/)?.[0] || '💭';
        const title = titleLine.replace(emoji, '').replace(/:/g, '').trim();
        const content = lines.slice(1).join('\n').trim();
        
        const Icon = getIcon(emoji);
        const gradient = getGradient(emoji);
        const iconColor = getIconColor(emoji);

        return (
          <div
            key={idx}
            className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 border transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full bg-white/80 flex items-center justify-center ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-gray-800">{title}</h4>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{content}</p>
          </div>
        );
      })}
    </div>
  );
}