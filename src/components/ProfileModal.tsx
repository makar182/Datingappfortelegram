import { Match } from "../App";
import { X, MapPin, BookOpen } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BioCard } from "./BioCard";

interface ProfileModalProps {
  match: Match;
  onClose: () => void;
}

export function ProfileModal({
  match,
  onClose,
}: ProfileModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl shadow-emerald-500/20 transform transition-all flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex-shrink-0">
          {/* Photo */}
          <div className="h-72 bg-gradient-to-br from-gray-100 to-gray-200">
            {match.photo ? (
              <ImageWithFallback
                src={match.photo}
                alt={match.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400">
                <span className="text-white text-8xl">
                  {match.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all duration-300 hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-baseline gap-2 mb-2">
              <h2 className="text-4xl">{match.name}</h2>
              <span className="text-2xl opacity-90">{match.age}</span>
            </div>
            <div className="flex items-center gap-2 opacity-90">
              <MapPin className="w-4 h-4" />
              <span>{match.distance} км от вас</span>
            </div>
          </div>
        </div>

        {/* Bio Section - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h3 className="text-gray-800">О себе</h3>
          </div>
          <BioCard bio={match.bio} />
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
}