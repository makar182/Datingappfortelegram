import { ChevronRight } from 'lucide-react';

interface BioPreviewProps {
  bio?: string;
  onClick?: () => void;
}

export function BioPreview({ bio, onClick }: BioPreviewProps) {
  if (!bio) {
    return null;
  }

  // Парсим био на секции
  const sections = bio.split('\\\\n\\\\n').filter(section => section.trim());

  const getBgGradient = (emoji: string) => {
    const gradientMap: { [key: string]: string } = {
      // Личные вопросы
      '💭': 'from-blue-500/10 to-indigo-500/10',
      '🌅': 'from-orange-500/10 to-amber-500/10',
      '🎭': 'from-purple-500/10 to-pink-500/10',
      '🌌': 'from-indigo-500/10 to-violet-500/10',
      '💫': 'from-pink-500/10 to-rose-500/10',
      '🎨': 'from-emerald-500/10 to-teal-500/10',
      '⭐': 'from-yellow-500/10 to-amber-500/10',
      '☀️': 'from-amber-500/10 to-orange-500/10',
      // Социальные вопросы
      '💰': 'from-green-500/10 to-emerald-500/10',
      '💬': 'from-teal-500/10 to-cyan-500/10',
      '👨‍👩‍👧': 'from-blue-500/10 to-sky-500/10',
      '🌍': 'from-cyan-500/10 to-teal-500/10',
      '🔒': 'from-slate-500/10 to-gray-500/10',
      '🧠': 'from-purple-500/10 to-indigo-500/10',
      '✨': 'from-violet-500/10 to-purple-500/10',
    };
    return gradientMap[emoji] || 'from-gray-500/10 to-gray-500/10';
  };

  return (
    <div className="relative group">
      {/* Scrollable Container - показываем все ответы пользователя */}
      <div 
        className="max-h-[12rem] overflow-y-auto space-y-2.5 cursor-pointer pr-1.5 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/40"
        onClick={onClick}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
        }}
      >
        {sections.map((section, idx) => {
          const lines = section.split('\\n');
          const titleLine = lines[0];
          const emoji = titleLine.match(/[^\\w\\s:]/)?.[0] || '💭';
          const title = titleLine.replace(emoji, '').replace(/:/g, '').trim();
          const content = lines.slice(1).join(' ').trim();
          
          const gradient = getBgGradient(emoji);

          return (
            <div
              key={idx}
              className={`bg-gradient-to-r ${gradient} backdrop-blur-sm rounded-xl p-3 transition-all duration-300 group-hover:shadow-lg border-2 border-white/40 shadow-md`}
            >
              <div className="flex items-start gap-2">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/90 mb-1 uppercase tracking-wide">{title}</p>
                  <p className="text-sm text-white leading-relaxed line-clamp-1">{content}</p>
                </div>

                {/* Arrow hint */}
                <ChevronRight className="w-4 h-4 text-white/70 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Scroll hint - показываем если есть больше 2 секций */}
      {sections.length > 2 && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-b-xl" />
      )}
    </div>
  );
}