import React from 'react';

export type AchievementCharacter = 
  | 'shiba-welcome'
  | 'shiba-regular'
  | 'daruma-early'
  | 'owl-night'
  | 'shiba-start'
  | 'shiba-study'
  | 'shiba-jump'
  | 'shiba-return'
  | 'shiba-five'
  | 'shiba-quiz'
  | 'shiba-cards'
  | 'daruma-steady'
  | 'daruma-gold'
  | 'shiba-master'
  | 'shiba-crown'
  | 'shiba-trophy'
  | 'shiba-fire'
  | 'shiba-diamond'
  | 'shiba-kanji'
  | 'shiba-grammar'
  | 'shiba-listening'
  | 'shiba-reading'
  | 'shiba-exam'
  | 'shiba-notebook'
  | 'shiba-speed'
  | 'shiba-sakura'
  | 'maneki-neko'
  | 'samurai-shiba'
  | 'ninja-shiba'
  | 'fuji-explorer';

interface MascotIconProps {
  type: AchievementCharacter;
  isUnlocked: boolean;
  size?: number;
  className?: string;
}

export const AchievementMascotIcon: React.FC<MascotIconProps> = ({
  type,
  isUnlocked,
  size = 64,
  className = ''
}) => {
  const filterClass = isUnlocked ? '' : 'grayscale opacity-35 contrast-125';

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${filterClass} ${className}`}
      style={{ width: size, height: size }}
    >
      {renderMascotSvg(type, size)}
    </div>
  );
};

function renderMascotSvg(type: AchievementCharacter, size: number) {
  switch (type) {
    // 1. Chào mừng bạn! (Happy Shiba waving with "こんにちは" speech bubble)
    case 'shiba-welcome':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <defs>
            <linearGradient id="sw_fur" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="sw_shirt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          {/* Ears */}
          <polygon points="20,16 34,36 14,35" fill="url(#sw_fur)" stroke="#9A3412" strokeWidth="1.5" />
          <polygon points="22,20 31,34 18,33" fill="#FED7AA" />
          <polygon points="76,16 62,36 82,35" fill="url(#sw_fur)" stroke="#9A3412" strokeWidth="1.5" />
          <polygon points="74,20 65,34 78,33" fill="#FED7AA" />
          {/* Head */}
          <circle cx="48" cy="42" r="26" fill="url(#sw_fur)" stroke="#9A3412" strokeWidth="1.5" />
          <ellipse cx="48" cy="48" rx="19" ry="15" fill="#FFF7ED" />
          {/* Cheeks & eyebrows */}
          <circle cx="34" cy="46" r="3" fill="#FCA5A5" />
          <circle cx="62" cy="46" r="3" fill="#FCA5A5" />
          <ellipse cx="37" cy="32" rx="3" ry="2" fill="#FFF7ED" />
          <ellipse cx="59" cy="32" rx="3" ry="2" fill="#FFF7ED" />
          {/* Eyes & Nose */}
          <circle cx="38" cy="39" r="3.2" fill="#1E293B" />
          <circle cx="39.5" cy="37.5" r="1.2" fill="#FFFFFF" />
          <circle cx="58" cy="39" r="3.2" fill="#1E293B" />
          <circle cx="59.5" cy="37.5" r="1.2" fill="#FFFFFF" />
          <ellipse cx="48" cy="44" rx="3" ry="2" fill="#1E293B" />
          <path d="M 44 48 Q 48 52 52 48" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* Body & Blue Hoodie */}
          <path d="M 28 66 Q 48 62 68 66 L 72 94 L 24 94 Z" fill="url(#sw_shirt)" stroke="#0369A1" strokeWidth="1.5" />
          <rect x="36" y="74" width="24" height="9" rx="3" fill="#0F172A" />
          <text x="48" y="81" fontSize="5.5" fontWeight="bold" fill="#F8FAFC" textAnchor="middle" fontFamily="monospace">JLPT</text>
          {/* Speech bubble "こんにちは" */}
          <g transform="translate(62, 24)">
            <rect x="0" y="0" width="36" height="18" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))" />
            <polygon points="6,18 2,24 12,18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
            <rect x="5" y="17" width="8" height="2" fill="#FFFFFF" />
            <text x="18" y="12" fontSize="5.5" fontWeight="bold" fill="#0F172A" textAnchor="middle">こんにちは</text>
          </g>
          {/* Waving Paw */}
          <circle cx="70" cy="58" r="5" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.5" />
          <circle cx="26" cy="72" r="5" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.5" />
        </svg>
      );

    // 2. Khách quen (Loyal Shiba giving thumbs-up)
    case 'shiba-regular':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <defs>
            <linearGradient id="sr_fur" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="sr_shirt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          <polygon points="20,16 34,36 14,35" fill="url(#sr_fur)" stroke="#9A3412" strokeWidth="1.5" />
          <polygon points="22,20 31,34 18,33" fill="#FED7AA" />
          <polygon points="76,16 62,36 82,35" fill="url(#sr_fur)" stroke="#9A3412" strokeWidth="1.5" />
          <polygon points="74,20 65,34 78,33" fill="#FED7AA" />
          <circle cx="48" cy="42" r="26" fill="url(#sr_fur)" stroke="#9A3412" strokeWidth="1.5" />
          <ellipse cx="48" cy="48" rx="19" ry="15" fill="#FFF7ED" />
          <circle cx="34" cy="46" r="3" fill="#FCA5A5" />
          <circle cx="62" cy="46" r="3" fill="#FCA5A5" />
          {/* Confident winking eyes */}
          <path d="M 33 40 Q 38 36 43 40" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="58" cy="39" r="3.2" fill="#1E293B" />
          <circle cx="59.5" cy="37.5" r="1.2" fill="#FFFFFF" />
          <ellipse cx="48" cy="44" rx="3" ry="2" fill="#1E293B" />
          <path d="M 44 48 Q 48 53 52 48" stroke="#1E293B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* Blue shirt & thumbs up */}
          <path d="M 28 66 Q 48 62 68 66 L 72 94 L 24 94 Z" fill="url(#sr_shirt)" stroke="#0369A1" strokeWidth="1.5" />
          <rect x="36" y="74" width="24" height="9" rx="3" fill="#0F172A" />
          <text x="48" y="81" fontSize="5.5" fontWeight="bold" fill="#F8FAFC" textAnchor="middle" fontFamily="monospace">JLPT</text>
          {/* Thumbs up paw */}
          <g transform="translate(68, 54)">
            <ellipse cx="6" cy="8" rx="5" ry="4" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.2" />
            <path d="M 5 6 L 5 0 Q 7 -2 9 0 L 9 6 Z" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.2" />
          </g>
          <circle cx="26" cy="74" r="5" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.5" />
        </svg>
      );

    // 3. Chim dậy sớm (Early Bird Daruma with clock / alarm)
    case 'daruma-early':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <defs>
            <linearGradient id="de_body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>
          </defs>
          {/* Daruma Round Body */}
          <ellipse cx="48" cy="54" rx="32" ry="34" fill="url(#de_body)" stroke="#7F1D1D" strokeWidth="2" />
          {/* White Face area */}
          <path d="M 26 50 C 26 30, 70 30, 70 50 C 70 66, 26 66, 26 50 Z" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.5" />
          {/* Daruma crane eyebrows */}
          <path d="M 32 38 Q 40 34 44 40" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 64 38 Q 56 34 52 40" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Eyes */}
          <circle cx="38" cy="46" r="4.5" fill="#0F172A" />
          <circle cx="58" cy="46" r="4.5" fill="#0F172A" />
          <circle cx="39.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          <circle cx="59.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          {/* Mustache */}
          <path d="M 36 56 Q 48 52 60 56 Q 48 60 36 56 Z" fill="#0F172A" />
          {/* JLPT text on belly */}
          <text x="48" y="78" fontSize="8" fontWeight="black" fill="#FDE047" textAnchor="middle" fontFamily="monospace">JLPT</text>
          {/* Alarm clock on the right */}
          <g transform="translate(68, 36)">
            <circle cx="12" cy="14" r="11" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
            <circle cx="12" cy="14" r="9" fill="#F0F9FF" />
            {/* Clock hands pointing at 6 AM */}
            <line x1="12" y1="14" x2="12" y2="8" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="14" x2="15" y2="16" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
            {/* Clock bell toppers */}
            <circle cx="5" cy="4" r="3" fill="#0284C7" />
            <circle cx="19" cy="4" r="3" fill="#0284C7" />
          </g>
        </svg>
      );

    // 4. Cú đêm (Night Owl / Sleeping Shiba with Night Cap & Stars)
    case 'owl-night':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <defs>
            <linearGradient id="on_fur" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          {/* Shiba sleeping with Night Cap */}
          <circle cx="48" cy="50" r="28" fill="url(#on_fur)" stroke="#9A3412" strokeWidth="1.5" />
          <ellipse cx="48" cy="56" rx="20" ry="16" fill="#FFF7ED" />
          {/* Night Cap */}
          <path d="M 22 36 Q 44 20 68 28 L 84 46 Q 78 54 68 48 Z" fill="#6366F1" stroke="#4338CA" strokeWidth="1.5" />
          <circle cx="86" cy="48" r="4.5" fill="#F8FAFC" />
          {/* Sleeping closed curve eyes */}
          <path d="M 33 48 Q 38 52 43 48" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 53 48 Q 58 52 63 48" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <ellipse cx="48" cy="54" rx="2.5" ry="1.8" fill="#1E293B" />
          <path d="M 45 57 Q 48 59 51 57" stroke="#1E293B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* "Z z z" */}
          <text x="76" y="24" fontSize="9" fontWeight="bold" fill="#A5B4FC" fontFamily="sans-serif">Z</text>
          <text x="84" y="16" fontSize="6.5" fontWeight="bold" fill="#818CF8" fontFamily="sans-serif">z</text>
        </svg>
      );

    // 5. Shiba mở đầu (Adorable Japanese Shiba Inu puppy mascot)
    case 'shiba-start':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <defs>
            <linearGradient id="ss_fur" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="ss_bell" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          {/* Triangular Shiba Ears with soft inner cream pads */}
          <path d="M 20 18 L 38 38 L 14 36 Z" fill="url(#ss_fur)" stroke="#C2410C" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 22 22 L 34 35 L 18 34 Z" fill="#FED7AA" />
          <path d="M 80 18 L 62 38 L 86 36 Z" fill="url(#ss_fur)" stroke="#C2410C" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 78 22 L 66 35 L 82 34 Z" fill="#FED7AA" />

          {/* Chubby Round Head */}
          <ellipse cx="50" cy="46" rx="30" ry="26" fill="url(#ss_fur)" stroke="#C2410C" strokeWidth="1.5" />
          
          {/* Shiba White Urajiro Cheeks & Muzzle */}
          <path d="M 28 46 C 20 54, 22 66, 36 68 C 44 70, 56 70, 64 68 C 78 66, 80 54, 72 46 C 66 42, 60 48, 50 48 C 40 48, 34 42, 28 46 Z" fill="#FFFDF5" />
          
          {/* Shiba Eyebrow dots (mame-mayu) */}
          <ellipse cx="37" cy="34" rx="3.5" ry="2.5" fill="#FFFDF5" />
          <ellipse cx="63" cy="34" rx="3.5" ry="2.5" fill="#FFFDF5" />

          {/* Big Sparkly Eyes */}
          <circle cx="36" cy="44" r="4.2" fill="#1E1B4B" />
          <circle cx="38" cy="42" r="1.6" fill="#FFFFFF" />
          <circle cx="34.5" cy="45.5" r="0.8" fill="#FFFFFF" />

          <circle cx="64" cy="44" r="4.2" fill="#1E1B4B" />
          <circle cx="66" cy="42" r="1.6" fill="#FFFFFF" />
          <circle cx="62.5" cy="45.5" r="0.8" fill="#FFFFFF" />

          {/* Soft Pink Blush on Cheeks */}
          <ellipse cx="27" cy="54" rx="4.5" ry="2.8" fill="#FDA4AF" opacity="0.8" />
          <ellipse cx="73" cy="54" rx="4.5" ry="2.8" fill="#FDA4AF" opacity="0.8" />

          {/* Cute Black Button Nose & Gentle Smile */}
          <ellipse cx="50" cy="52" rx="3.5" ry="2.2" fill="#0F172A" />
          <path d="M 45 56 Q 50 60 55 56" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Red Collar with Golden Bell */}
          <path d="M 32 68 Q 50 76 68 68" stroke="#DC2626" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="74" r="4.5" fill="url(#ss_bell)" stroke="#A16207" strokeWidth="1" />
          <circle cx="50" cy="75" r="1" fill="#713F12" />

          {/* Cute Front Paws */}
          <ellipse cx="40" cy="81" rx="5" ry="4" fill="#FFFDF5" stroke="#F97316" strokeWidth="1" />
          <ellipse cx="60" cy="81" rx="5" ry="4" fill="#FFFDF5" stroke="#F97316" strokeWidth="1" />
        </svg>
      );

    // 6. Shiba học tập (Studying with stack of books)
    case 'shiba-study':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <circle cx="48" cy="36" r="24" fill="#FB923C" stroke="#9A3412" strokeWidth="1.5" />
          <ellipse cx="48" cy="42" rx="17" ry="13" fill="#FFF7ED" />
          <circle cx="38" cy="34" r="3" fill="#1E293B" />
          <circle cx="58" cy="34" r="3" fill="#1E293B" />
          {/* Scholar Hat */}
          <polygon points="30,16 48,8 66,16 48,22" fill="#1E293B" />
          <path d="M 48 16 L 62 20" stroke="#F59E0B" strokeWidth="1.5" />
          {/* Stack of colorful study books */}
          <g transform="translate(24, 60)">
            {/* Book 1 */}
            <rect x="0" y="18" width="50" height="9" rx="2" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
            <text x="25" y="24" fontSize="4.5" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">KANJI</text>
            {/* Book 2 */}
            <rect x="4" y="9" width="44" height="9" rx="2" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
            <text x="26" y="15" fontSize="4.5" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">TỪ VỰNG</text>
            {/* Book 3 */}
            <rect x="8" y="0" width="38" height="9" rx="2" fill="#10B981" stroke="#047857" strokeWidth="1" />
            <text x="27" y="6" fontSize="4.5" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">NGỮ PHÁP</text>
          </g>
        </svg>
      );

    // 7. Cú nhảy nhỏ (Jumping joyful Shiba)
    case 'shiba-jump':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <polygon points="18,14 34,34 12,33" fill="#FB923C" stroke="#9A3412" strokeWidth="1.5" />
          <polygon points="78,14 62,34 84,33" fill="#FB923C" stroke="#9A3412" strokeWidth="1.5" />
          <circle cx="48" cy="40" r="26" fill="#FB923C" stroke="#9A3412" strokeWidth="1.5" />
          <ellipse cx="48" cy="46" rx="19" ry="15" fill="#FFF7ED" />
          {/* Star eyes */}
          <polygon points="38,32 40,37 45,38 41,41 42,46 38,43 34,46 35,41 31,38 36,37" fill="#F59E0B" />
          <polygon points="58,32 60,37 65,38 61,41 62,46 58,43 54,46 55,41 51,38 56,37" fill="#F59E0B" />
          <path d="M 42 48 Q 48 54 54 48" stroke="#1E293B" strokeWidth="2" fill="#EF4444" strokeLinecap="round" />
          {/* Raised arms celebration */}
          <path d="M 24 64 L 14 44" stroke="#FB923C" strokeWidth="7" strokeLinecap="round" />
          <path d="M 72 64 L 82 44" stroke="#FB923C" strokeWidth="7" strokeLinecap="round" />
          <path d="M 28 64 Q 48 60 68 64 L 72 90 L 24 90 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
        </svg>
      );

    // 8. Shiba trở lại (Returning with clipboard checklist)
    case 'shiba-return':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <circle cx="44" cy="42" r="24" fill="#FB923C" stroke="#9A3412" strokeWidth="1.5" />
          <ellipse cx="44" cy="48" rx="17" ry="14" fill="#FFF7ED" />
          <circle cx="36" cy="40" r="3" fill="#1E293B" />
          <circle cx="54" cy="40" r="3" fill="#1E293B" />
          {/* Clipboard with checkmarks */}
          <g transform="translate(58, 40)">
            <rect x="0" y="0" width="28" height="38" rx="3" fill="#F8FAFC" stroke="#475569" strokeWidth="1.5" />
            <rect x="8" y="-4" width="12" height="6" rx="2" fill="#64748B" />
            {/* Check lines */}
            <path d="M 4 10 L 8 13 L 14 7" stroke="#10B981" strokeWidth="1.5" fill="none" />
            <line x1="16" y1="10" x2="24" y2="10" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M 4 20 L 8 23 L 14 17" stroke="#10B981" strokeWidth="1.5" fill="none" />
            <line x1="16" y1="20" x2="24" y2="20" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M 4 30 L 8 33 L 14 27" stroke="#10B981" strokeWidth="1.5" fill="none" />
            <line x1="16" y1="30" x2="24" y2="30" stroke="#94A3B8" strokeWidth="1.5" />
          </g>
        </svg>
      );

    // 9. Năm bài đầu tay (5 Lessons - Shiba holding chalkboard "〜です")
    case 'shiba-five':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <circle cx="48" cy="38" r="24" fill="#FB923C" stroke="#9A3412" strokeWidth="1.5" />
          <ellipse cx="48" cy="44" rx="17" ry="13" fill="#FFF7ED" />
          <circle cx="40" cy="36" r="3" fill="#1E293B" />
          <circle cx="56" cy="36" r="3" fill="#1E293B" />
          {/* Small blackboard */}
          <g transform="translate(18, 52)">
            <rect x="0" y="0" width="60" height="34" rx="4" fill="#064E3B" stroke="#78350F" strokeWidth="2.5" />
            <text x="30" y="14" fontSize="6.5" fontWeight="bold" fill="#FDE047" textAnchor="middle">〜は〜です</text>
            <text x="30" y="26" fontSize="5.5" fill="#A7F3D0" textAnchor="middle">Bài 1 - 5 Hoàn thành</text>
          </g>
        </svg>
      );

    // 10. Khởi động quiz (Quiz start - Shiba with megaphone / buzzer)
    case 'shiba-quiz':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <circle cx="44" cy="42" r="25" fill="#FB923C" stroke="#9A3412" strokeWidth="1.5" />
          <ellipse cx="44" cy="48" rx="18" ry="14" fill="#FFF7ED" />
          <circle cx="36" cy="40" r="3.2" fill="#1E293B" />
          <circle cx="54" cy="40" r="3.2" fill="#1E293B" />
          {/* Megaphone */}
          <g transform="translate(56, 44)">
            <polygon points="0,8 18,0 18,22 0,14" fill="#EF4444" stroke="#991B1B" strokeWidth="1.2" />
            <ellipse cx="18" cy="11" rx="4" ry="11" fill="#FCA5A5" stroke="#991B1B" strokeWidth="1" />
            <rect x="-4" y="6" width="4" height="10" rx="1" fill="#0F172A" />
            <path d="M 24 6 Q 28 11 24 16" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          </g>
        </svg>
      );

    // 11. Cún lật thẻ (Flashcard master - Shiba flipping card "あ a")
    case 'shiba-cards':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <circle cx="44" cy="40" r="24" fill="#FB923C" stroke="#9A3412" strokeWidth="1.5" />
          <ellipse cx="44" cy="46" rx="17" ry="13" fill="#FFF7ED" />
          <circle cx="36" cy="38" r="3" fill="#1E293B" />
          <circle cx="52" cy="38" r="3" fill="#1E293B" />
          {/* Flashcard holding */}
          <g transform="translate(58, 36) rotate(10)">
            <rect x="0" y="0" width="22" height="30" rx="3" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
            <text x="11" y="15" fontSize="11" fontWeight="bold" fill="#0284C7" textAnchor="middle">あ</text>
            <text x="11" y="24" fontSize="7" fontWeight="bold" fill="#64748B" textAnchor="middle">a</text>
          </g>
        </svg>
      );

    // 12. Bước chân đều đặn (Steady Daruma walking / meditating)
    case 'daruma-steady':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <defs>
            <linearGradient id="ds_body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="54" rx="32" ry="34" fill="url(#ds_body)" stroke="#9A3412" strokeWidth="2" />
          <path d="M 28 50 C 28 30, 72 30, 72 50 C 72 66, 28 66, 28 50 Z" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.5" />
          <path d="M 34 38 Q 42 34 46 40" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 66 38 Q 58 34 54 40" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="40" cy="46" r="4.5" fill="#0F172A" />
          <circle cx="60" cy="46" r="4.5" fill="#0F172A" />
          <circle cx="41.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          <circle cx="61.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          <path d="M 38 56 Q 50 52 62 56 Q 50 60 38 56 Z" fill="#0F172A" />
          <text x="50" y="78" fontSize="8" fontWeight="black" fill="#FDE047" textAnchor="middle" fontFamily="monospace">JLPT</text>
          <circle cx="76" cy="42" r="6" fill="#FFFBEB" stroke="#9A3412" strokeWidth="1.5" />
        </svg>
      );

    // 13. Daruma Vàng (Golden Victory Daruma)
    case 'daruma-gold':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <defs>
            <linearGradient id="dg_gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="54" rx="32" ry="34" fill="url(#dg_gold)" stroke="#854D0E" strokeWidth="2" />
          <path d="M 28 50 C 28 30, 72 30, 72 50 C 72 66, 28 66, 28 50 Z" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.5" />
          <path d="M 34 38 Q 42 34 46 40" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 66 38 Q 58 34 54 40" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="40" cy="46" r="4.5" fill="#0F172A" />
          <circle cx="60" cy="46" r="4.5" fill="#0F172A" />
          <circle cx="41.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          <circle cx="61.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          <path d="M 38 56 Q 50 52 62 56 Q 50 60 38 56 Z" fill="#0F172A" />
          <text x="50" y="78" fontSize="9" fontWeight="black" fill="#B45309" textAnchor="middle">必勝</text>
        </svg>
      );

    // 14. Vương miện danh dự (Shiba Crown)
    case 'shiba-crown':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <ellipse cx="50" cy="52" rx="28" ry="24" fill="#FB923C" stroke="#C2410C" strokeWidth="1.5" />
          <ellipse cx="50" cy="58" rx="18" ry="14" fill="#FFFDF5" />
          <ellipse cx="38" cy="42" rx="3" ry="2" fill="#FFFDF5" />
          <ellipse cx="62" cy="42" rx="3" ry="2" fill="#FFFDF5" />
          <circle cx="38" cy="50" r="3.5" fill="#1E1B4B" />
          <circle cx="62" cy="50" r="3.5" fill="#1E1B4B" />
          <ellipse cx="50" cy="56" rx="3" ry="2" fill="#0F172A" />
          {/* Royal Crown */}
          <polygon points="30,30 36,16 50,24 64,16 70,30" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="36" cy="16" r="2" fill="#EF4444" />
          <circle cx="50" cy="24" r="2.5" fill="#3B82F6" />
          <circle cx="64" cy="16" r="2" fill="#10B981" />
        </svg>
      );

    // 15. Cúp vàng (Shiba Trophy)
    case 'shiba-trophy':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          {/* Golden Trophy Cup */}
          <path d="M 32 24 L 68 24 L 62 54 Q 50 66 38 54 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
          <path d="M 32 30 C 18 30 18 46 33 48" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <path d="M 68 30 C 82 30 82 46 67 48" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <rect x="44" y="60" width="12" height="16" fill="#D97706" />
          <rect x="30" y="76" width="40" height="12" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          {/* Shiba peeking over cup */}
          <ellipse cx="50" cy="22" rx="14" ry="12" fill="#FB923C" stroke="#C2410C" strokeWidth="1.2" />
          <circle cx="45" cy="20" r="1.8" fill="#0F172A" />
          <circle cx="55" cy="20" r="1.8" fill="#0F172A" />
          <polygon points="36,12 43,18 34,22" fill="#FB923C" />
          <polygon points="64,12 57,18 66,22" fill="#FB923C" />
          <text x="50" y="44" fontSize="11" fontWeight="black" fill="#78350F" textAnchor="middle">1</text>
        </svg>
      );

    // 16. Lửa nhiệt huyết (Shiba Fire / Streak)
    case 'shiba-fire':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          {/* Fire Flame */}
          <path d="M 50 10 C 65 30, 85 45, 82 66 C 79 84, 66 94, 50 94 C 34 94, 21 84, 18 66 C 15 45, 35 30, 50 10 Z" fill="#F97316" />
          <path d="M 50 32 C 60 45, 72 56, 70 72 C 68 84, 60 88, 50 88 C 40 88, 32 84, 30 72 C 28 56, 40 45, 50 32 Z" fill="#FBBF24" />
          {/* Shiba head inside flame */}
          <ellipse cx="50" cy="62" rx="16" ry="14" fill="#FFFDF5" />
          <circle cx="43" cy="60" r="2.2" fill="#0F172A" />
          <circle cx="57" cy="60" r="2.2" fill="#0F172A" />
          <ellipse cx="50" cy="65" rx="2" ry="1.5" fill="#0F172A" />
          <path d="M 47 68 Q 50 71 53 68" stroke="#0F172A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      );

    // 17. Kim cương tỏa sáng (Shiba Diamond)
    case 'shiba-diamond':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          {/* Diamond Gem */}
          <polygon points="50,14 84,36 50,86 16,36" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
          <polygon points="50,14 66,36 50,86 34,36" fill="#E0F2FE" />
          <polygon points="34,36 50,14 16,36" fill="#7DD3FC" />
          <polygon points="66,36 50,14 84,36" fill="#7DD3FC" />
          {/* Shiba Face in center */}
          <circle cx="50" cy="46" r="14" fill="#FB923C" stroke="#C2410C" strokeWidth="1" />
          <ellipse cx="50" cy="50" rx="9" ry="7" fill="#FFFDF5" />
          <circle cx="45" cy="45" r="1.8" fill="#0F172A" />
          <circle cx="55" cy="45" r="1.8" fill="#0F172A" />
          <ellipse cx="50" cy="49" rx="1.5" ry="1" fill="#0F172A" />
        </svg>
      );

    // 18. Hán tự thư pháp (Shiba Kanji)
    case 'shiba-kanji':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          {/* Traditional Scroll */}
          <rect x="20" y="16" width="60" height="68" rx="4" fill="#FEF3C7" stroke="#78350F" strokeWidth="2" />
          <rect x="16" y="12" width="68" height="6" rx="2" fill="#78350F" />
          <rect x="16" y="82" width="68" height="6" rx="2" fill="#78350F" />
          {/* Kanji character "漢" */}
          <text x="50" y="58" fontSize="34" fontWeight="black" fill="#1E293B" textAnchor="middle" fontFamily="serif">漢</text>
          {/* Small Shiba stamp */}
          <circle cx="66" cy="68" r="8" fill="#DC2626" />
          <text x="66" y="71" fontSize="6.5" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">印</text>
        </svg>
      );

    // 19. Ngữ pháp thông thái (Shiba Grammar)
    case 'shiba-grammar':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          {/* Shiba with scholar hat and open book */}
          <ellipse cx="50" cy="46" rx="24" ry="20" fill="#FB923C" stroke="#C2410C" strokeWidth="1.5" />
          <ellipse cx="50" cy="52" rx="16" ry="12" fill="#FFFDF5" />
          <circle cx="40" cy="44" r="3" fill="#1E1B4B" />
          <circle cx="60" cy="44" r="3" fill="#1E1B4B" />
          {/* Scholar Hat */}
          <polygon points="30,22 50,14 70,22 50,28" fill="#1E293B" />
          <line x1="50" y1="22" x2="68" y2="28" stroke="#F59E0B" strokeWidth="1.5" />
          {/* Open Book */}
          <path d="M 24 74 Q 50 68 50 82 Q 50 68 76 74 L 74 92 Q 50 86 50 96 Q 50 86 26 92 Z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="1.5" />
          <text x="36" y="84" fontSize="7" fontWeight="bold" fill="#FFFFFF">文</text>
          <text x="64" y="84" fontSize="7" fontWeight="bold" fill="#FFFFFF">法</text>
        </svg>
      );

    // 20. Luyện nghe (Shiba Listening with headphones)
    case 'shiba-listening':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <ellipse cx="50" cy="50" rx="26" ry="22" fill="#FB923C" stroke="#C2410C" strokeWidth="1.5" />
          <ellipse cx="50" cy="56" rx="17" ry="13" fill="#FFFDF5" />
          <circle cx="40" cy="48" r="3.2" fill="#1E1B4B" />
          <circle cx="60" cy="48" r="3.2" fill="#1E1B4B" />
          <ellipse cx="50" cy="54" rx="3" ry="2" fill="#0F172A" />
          {/* Headphones */}
          <path d="M 22 50 A 28 28 0 0 1 78 50" fill="none" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" />
          <rect x="18" y="44" width="8" height="18" rx="4" fill="#4F46E5" />
          <rect x="74" y="44" width="8" height="18" rx="4" fill="#4F46E5" />
          {/* Musical Notes */}
          <text x="74" y="30" fontSize="12" fill="#A855F7">♪</text>
          <text x="24" y="32" fontSize="9" fill="#EC4899">♫</text>
        </svg>
      );

    // 21. Đọc hiểu sâu (Shiba Reading with glasses)
    case 'shiba-reading':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <ellipse cx="50" cy="44" rx="26" ry="22" fill="#FB923C" stroke="#C2410C" strokeWidth="1.5" />
          <ellipse cx="50" cy="50" rx="17" ry="13" fill="#FFFDF5" />
          {/* Cute Round Glasses */}
          <circle cx="39" cy="42" r="7" fill="none" stroke="#334155" strokeWidth="1.8" />
          <circle cx="61" cy="42" r="7" fill="none" stroke="#334155" strokeWidth="1.8" />
          <line x1="46" y1="42" x2="54" y2="42" stroke="#334155" strokeWidth="1.8" />
          <circle cx="39" cy="42" r="2.5" fill="#1E1B4B" />
          <circle cx="61" cy="42" r="2.5" fill="#1E1B4B" />
          {/* Open Book */}
          <g transform="translate(26, 62)">
            <rect x="0" y="4" width="22" height="24" rx="2" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.2" />
            <rect x="26" y="4" width="22" height="24" rx="2" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.2" />
            <line x1="4" y1="10" x2="18" y2="10" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="4" y1="16" x2="18" y2="16" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="30" y1="10" x2="44" y2="10" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="30" y1="16" x2="44" y2="16" stroke="#CBD5E1" strokeWidth="1.5" />
          </g>
        </svg>
      );

    // 22. Quyết thắng kỳ thi (Shiba Exam with Hachimaki headband '必勝')
    case 'shiba-exam':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <ellipse cx="50" cy="50" rx="28" ry="24" fill="#FB923C" stroke="#C2410C" strokeWidth="1.5" />
          <ellipse cx="50" cy="56" rx="18" ry="14" fill="#FFFDF5" />
          {/* White Headband (Hachimaki) with Red Sun */}
          <rect x="22" y="32" width="56" height="9" rx="2" fill="#FFFFFF" stroke="#DC2626" strokeWidth="1.2" />
          <circle cx="50" cy="36.5" r="3.2" fill="#DC2626" />
          {/* Resolute Eyes */}
          <path d="M 36 46 L 44 48" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" />
          <path d="M 64 46 L 56 48" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="50" cy="54" rx="2.8" ry="1.8" fill="#0F172A" />
          <path d="M 45 58 Q 50 61 55 58" stroke="#0F172A" strokeWidth="1.8" fill="none" />
        </svg>
      );

    // 23. Sổ tay tri thức (Shiba Notebook)
    case 'shiba-notebook':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          {/* Ring Notebook */}
          <rect x="28" y="20" width="48" height="64" rx="4" fill="#10B981" stroke="#047857" strokeWidth="2" />
          <rect x="36" y="28" width="34" height="48" rx="2" fill="#FFFFFF" />
          {/* Rings */}
          <circle cx="28" cy="30" r="3" fill="#D1D5DB" stroke="#374151" strokeWidth="1" />
          <circle cx="28" cy="45" r="3" fill="#D1D5DB" stroke="#374151" strokeWidth="1" />
          <circle cx="28" cy="60" r="3" fill="#D1D5DB" stroke="#374151" strokeWidth="1" />
          <circle cx="28" cy="75" r="3" fill="#D1D5DB" stroke="#374151" strokeWidth="1" />
          {/* Bookmark ribbon */}
          <polygon points="56,20 62,20 62,40 59,36 56,40" fill="#EF4444" />
          {/* Shiba Paw Stamp */}
          <ellipse cx="53" cy="52" rx="4" ry="3.2" fill="#F97316" />
          <circle cx="48" cy="46" r="1.5" fill="#F97316" />
          <circle cx="53" cy="44" r="1.5" fill="#F97316" />
          <circle cx="58" cy="46" r="1.5" fill="#F97316" />
        </svg>
      );

    // 24. Tốc độ tia chớp (Shiba Speed)
    case 'shiba-speed':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          {/* Lightning Bolt */}
          <polygon points="54,10 28,52 48,52 44,90 74,44 54,44" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
          {/* Shiba running head */}
          <circle cx="48" cy="48" r="14" fill="#FB923C" stroke="#C2410C" strokeWidth="1" />
          <circle cx="44" cy="46" r="2" fill="#1E1B4B" />
          <circle cx="52" cy="46" r="2" fill="#1E1B4B" />
          <ellipse cx="48" cy="50" rx="1.5" ry="1" fill="#0F172A" />
        </svg>
      );

    // 25. Hoa anh đào (Shiba Sakura)
    case 'shiba-sakura':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          {/* 5 Sakura Petals */}
          <g transform="translate(50, 50)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path
                key={angle}
                d="M 0 0 C -12 -24, 12 -24, 0 0 Z"
                fill="#F472B6"
                stroke="#DB2777"
                strokeWidth="1"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="10" fill="#FDF2F8" stroke="#F472B6" strokeWidth="1" />
            <circle cx="-3" cy="-1" r="1.2" fill="#0F172A" />
            <circle cx="3" cy="-1" r="1.2" fill="#0F172A" />
            <ellipse cx="0" cy="2" rx="1" ry="0.6" fill="#0F172A" />
          </g>
        </svg>
      );

    // 26. Mèo thần tài (Maneki Neko)
    case 'maneki-neko':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          {/* White Lucky Cat Body & Head */}
          <ellipse cx="50" cy="56" rx="28" ry="26" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <polygon points="26,24 38,40 22,40" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <polygon points="28,28 36,38 24,38" fill="#FCA5A5" />
          <polygon points="74,24 62,40 78,40" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <polygon points="72,28 64,38 76,38" fill="#FCA5A5" />
          {/* Cute Cat Face */}
          <circle cx="40" cy="48" r="3" fill="#0F172A" />
          <circle cx="60" cy="48" r="3" fill="#0F172A" />
          <ellipse cx="50" cy="53" rx="2" ry="1.5" fill="#F43F5E" />
          {/* Whiskers */}
          <line x1="26" y1="52" x2="34" y2="52" stroke="#64748B" strokeWidth="1.2" />
          <line x1="26" y1="56" x2="34" y2="54" stroke="#64748B" strokeWidth="1.2" />
          <line x1="74" y1="52" x2="66" y2="52" stroke="#64748B" strokeWidth="1.2" />
          <line x1="74" y1="56" x2="66" y2="54" stroke="#64748B" strokeWidth="1.2" />
          {/* Golden Koban Coin */}
          <ellipse cx="50" cy="72" rx="10" ry="14" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
          <text x="50" y="74" fontSize="8" fontWeight="bold" fill="#78350F" textAnchor="middle">万両</text>
          {/* Raised Right Paw waving luck */}
          <circle cx="74" cy="40" r="7" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        </svg>
      );

    // 27. Samurai Shiba
    case 'samurai-shiba':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <ellipse cx="50" cy="52" rx="26" ry="22" fill="#FB923C" stroke="#C2410C" strokeWidth="1.5" />
          <ellipse cx="50" cy="58" rx="17" ry="13" fill="#FFFDF5" />
          {/* Kabuto Helmet */}
          <path d="M 24 38 Q 50 16 76 38 L 72 44 L 28 44 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
          {/* Golden Crescent Crest (Maedate) */}
          <path d="M 38 24 Q 50 10 62 24 Q 50 16 38 24 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
          <circle cx="41" cy="50" r="3" fill="#1E1B4B" />
          <circle cx="59" cy="50" r="3" fill="#1E1B4B" />
          <ellipse cx="50" cy="56" rx="2.5" ry="1.8" fill="#0F172A" />
        </svg>
      );

    // 28. Ninja Shiba
    case 'ninja-shiba':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          {/* Ninja Mask Head */}
          <circle cx="50" cy="48" r="28" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
          {/* Eye opening slit */}
          <rect x="30" y="40" width="40" height="14" rx="4" fill="#FFFDF5" />
          <circle cx="42" cy="47" r="3" fill="#0F172A" />
          <circle cx="58" cy="47" r="3" fill="#0F172A" />
          {/* Ninja Headband metal plate */}
          <rect x="34" y="26" width="32" height="8" rx="2" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
          {/* Shuriken Star in bottom */}
          <polygon points="50,72 54,80 62,80 56,86 58,94 50,88 42,94 44,86 38,80 46,80" fill="#64748B" />
        </svg>
      );

    // 29. Núi Phú Sĩ (Fuji Explorer)
    case 'fuji-explorer':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          {/* Red Rising Sun behind */}
          <circle cx="50" cy="36" r="22" fill="#EF4444" />
          {/* Mount Fuji */}
          <polygon points="50,28 84,86 16,86" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />
          {/* Snow Cap */}
          <polygon points="50,28 62,48 56,44 50,50 44,44 38,48" fill="#FFFFFF" />
          {/* Little Shiba waving flag on side */}
          <ellipse cx="66" cy="74" rx="10" ry="8" fill="#FB923C" />
          <circle cx="64" cy="72" r="1.5" fill="#0F172A" />
          <line x1="74" y1="62" x2="74" y2="82" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="74,62 84,66 74,70" fill="#DC2626" />
        </svg>
      );

    // 30. Đại sư Shiba (Shiba Master)
    case 'shiba-master':
    default:
      return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-full h-full drop-shadow">
          <defs>
            <linearGradient id="sm_gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="50" rx="30" ry="26" fill="url(#sm_gold)" stroke="#B45309" strokeWidth="2" />
          <ellipse cx="50" cy="56" rx="19" ry="15" fill="#FFFDF5" />
          <circle cx="38" cy="46" r="3.5" fill="#1E1B4B" />
          <circle cx="62" cy="46" r="3.5" fill="#1E1B4B" />
          <ellipse cx="50" cy="52" rx="3" ry="2" fill="#0F172A" />
          {/* Master Golden Halo / Aura */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="#FDE047" strokeWidth="2" strokeDasharray="4 3" />
          {/* Golden Badge on Chest */}
          <circle cx="50" cy="74" r="7" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
          <text x="50" y="77" fontSize="8" fontWeight="black" fill="#854D0E" textAnchor="middle">達</text>
        </svg>
      );
  }
}

export default AchievementMascotIcon;
