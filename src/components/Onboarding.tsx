import { useState } from 'react';
import { ChevronRight, Heart, GraduationCap, User, Star } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: GraduationCap,
      title: 'Эксперимент Артура Арона',
      description: 'Научный путь к духовной близости',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            <strong>Артур Арон</strong> — психолог из Университета Стоуни-Брук, который в 1997 году провел революционный эксперимент.
          </p>
          <div className="bg-white p-4 rounded-2xl border border-pink-200">
            <p className="text-emerald-800">
              Он доказал: <strong>близость можно создать намеренно</strong> через правильные вопросы
            </p>
          </div>
          <p className="text-gray-700">
            Незнакомым людям предлагалось задать друг другу 36 постепенно углубляющихся вопросов. 
            Результат превзошёл ожидания: участники испытали глубокую эмоциональную связь, которая обычно формируется годами.
          </p>
          <div className="bg-white p-4 rounded-xl border border-pink-200">
            <p className="text-gray-600 text-center">
              Некоторые пары <strong>влюбились</strong> друг в друга после эксперимента
            </p>
          </div>
        </div>
      ),
    },
    {
      icon: Heart,
      title: '36 вопросов друг другу для эмоциональной близости',
      description: 'Как работает метод',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Вопросы разделены на <strong>3 части</strong>, каждая из которых углубляет связь:
          </p>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">1️⃣</span>
                <span className="font-semibold text-gray-800">Поверхностное знакомство</span>
              </div>
              <p className="text-gray-600">
                Простые вопросы о предпочтениях и интересах
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">2️⃣</span>
                <span className="font-semibold text-gray-800">Личные истории</span>
              </div>
              <p className="text-gray-600">
                Вопросы о прошлом, отношениях и ценностях
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">3️⃣</span>
                <span className="font-semibold text-gray-800">Глубокие эмоции</span>
              </div>
              <p className="text-gray-600">
                Сокровенные вопросы о чувствах и мечтах
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: GraduationCap,
      title: 'Наше приложение — это эксперимент',
      description: '',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Мы адаптировали метод Артура Арона для знакомств в онлайн-формате:
          </p>
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex items-start gap-3">
              <span className="text-xl">🎯</span>
              <div>
                <p className="font-semibold text-gray-800">Система этапов</p>
                <p className="text-gray-600">6 стадий эксперимента для постепенного знакомства. Выполняйте условия для перехода к следующему этапу.</p>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex items-start gap-3">
              <span className="text-xl">💬</span>
              <div>
                <p className="font-semibold text-gray-800">Вопросы дя сближения</p>
                <p className="text-gray-600">Специально подговленные вопросы позволят следовать принципу легендарного эксперимента Артура Арона</p>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex items-start gap-3">
              <span className="text-xl">🤝</span>
              <div>
                <p className="font-semibold text-gray-800">То, ради чего мы создали это приложение</p>
                <p className="text-gray-600">Финальный этап "Свидание" — вы вместе пройдете легендарный эксперимент Артура Арона ...вживую, а мы поможем</p>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex items-start gap-3">
              <span className="text-xl">🌟</span>
              <div>
                <p className="font-semibold text-gray-800">А что дальше?</p>
                <p className="text-gray-600">А дальше мы вам больше не нужны, удалите приложение и наслаждайтесь обществом друг друга!</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
            <p className="text-sm font-semibold text-amber-900 mb-2">💡 Рекомендация для чистоты эксперимента</p>
            <p className="text-sm text-amber-800">
              Конечно, вы можете обменяться контактами и общаться вне приложения. Однако это нарушит структуру эксперимента — постепенное раскрытие через контролируемые этапы и вопросы, что значительно снизит эффективность сближения.
            </p>
          </div>
        </div>
      ),
    },
    {
      icon: User,
      title: 'Правило одного чата',
      description: 'Полное погружение в эксперимент',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Для создания настоящей близости важна <strong>концентрация и присутствие</strong>. 
            Поэтому в нашем приложении действует особое равило:
          </p>
          
          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <p className="text-gray-800 text-center">
              <strong>Правило №1</strong>
            </p>
            <p className="text-gray-600 mt-2">
              Вы можете вести только один чат за раз. Это правило дает гарантию, что ваш собеседник общается только с вами.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-xl border border-gray-200">
              <p className="text-gray-700">
                <strong>🎯 Почему это важно?</strong>
              </p>
              <p className="text-gray-600 mt-1">
                Параллельное общение с несколькими людьми исключает искреннюю заинтересованность в отдельно взятом человеке.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-gray-200">
              <p className="text-gray-700">
                <strong>💫 Как это работает?</strong>
              </p>
              <p className="text-gray-600 mt-1">
                Пока вы проходите эксперимент с одним человеком, другие письма остаются доступны после завершения текущего чата
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-gray-200">
              <p className="text-gray-700">
                <strong>✨ Преимущество</strong>
              </p>
              <p className="text-gray-600 mt-1">
                Полная фокусировка на одном человеке создаёт более глубокую связь, чем поверхностное общение с множеством людей
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-red-200">
              <p className="text-gray-800 text-center">
                <strong>Правило №2</strong>
              </p>
              <p className="text-gray-600 mt-2">
                Если вы начнёте новый чат, предыдущий будет безвозвратно удалён — уходя-уходи.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: User,
      title: 'Ваша нкета — начало пути',
      description: 'Начало эксперимента',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-gray-700">
              Расскажите о себе подробно и честно. Это привлечет тех, 
              кто тоже ищет настоящей связи.
            </p>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-gray-600 mb-2">❌ <strong>Поверхностно:</strong></p>
              <p className="text-gray-500 italic">"Люблю путешествия  музыку"</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-gray-600 mb-2">✅ <strong>Глубоко:</strong></p>
              <p className="text-gray-700 italic">
                "Путешествия для меня — это выход из зоны комфорта и познание себя через другие культуры. 
                Музыка помогает мне чувствовать то, что сложно выразить словами."
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicators */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'bg-emerald-600'
                  : idx < currentStep
                  ? 'bg-emerald-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white">
          {/* Title */}
          <h2 className="text-center mb-2 text-3xl">
            {currentStepData.title}
          </h2>

          {/* Description */}
          <p className="text-center text-gray-500 mb-6">
            {currentStepData.description}
          </p>

          {/* Content */}
          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleSkip}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Пропустить
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'К анкете' : 'Далее'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}