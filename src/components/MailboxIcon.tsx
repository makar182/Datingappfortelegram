interface MailboxIconProps {
  hasNewMail: boolean;
  className?: string;
}

export function MailboxIcon({ hasNewMail, className = "w-6 h-6" }: MailboxIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Mailbox post/stand */}
      <path d="M 12 18 L 12 23" strokeWidth="2" />
      <ellipse cx="12" cy="23" rx="3" ry="0.5" fill="currentColor" fillOpacity="0.2" />
      
      {/* Main mailbox body - rounded box */}
      <path d="M 4 10 Q 4 7 6 7 L 18 7 Q 20 7 20 10 L 20 16 Q 20 18 18 18 L 6 18 Q 4 18 4 16 Z" 
            fill="currentColor" 
            fillOpacity="0.1" 
            strokeWidth="2" />
      
      {/* Mail door/envelope on front left */}
      <rect x="5" y="10" width="6" height="5" rx="0.5" fill="none" strokeWidth="1.8" />
      <path d="M 5 10 L 8 12.5 L 11 10" strokeWidth="1.8" fill="none" />
      
      {/* Decorative lines on right side */}
      <line x1="15" y1="11" x2="18" y2="11" strokeWidth="1.5" />
      <line x1="15" y1="13.5" x2="18" y2="13.5" strokeWidth="1.5" />
      <line x1="15" y1="16" x2="18" y2="16" strokeWidth="1.5" />
      
      {/* Flag pole - animated position */}
      <line 
        x1="20" 
        y1={hasNewMail ? "3" : "7"} 
        x2="20" 
        y2="10" 
        strokeWidth="2"
        className="transition-all duration-300"
      />
      
      {/* Flag circle connector */}
      <circle 
        cx="20" 
        cy="10" 
        r="1.2" 
        fill="currentColor" 
        stroke="currentColor"
        strokeWidth="1.5"
      />
      
      {/* Flag - rectangular shape */}
      <rect
        x="20"
        y={hasNewMail ? "3" : "7"}
        width="3.5"
        height="2.5"
        rx="0.3"
        fill={hasNewMail ? "#ef4444" : "currentColor"}
        stroke={hasNewMail ? "#ef4444" : "currentColor"}
        strokeWidth="1.2"
        fillOpacity={hasNewMail ? "1" : "0.4"}
        className="transition-all duration-300"
      />
    </svg>
  );
}