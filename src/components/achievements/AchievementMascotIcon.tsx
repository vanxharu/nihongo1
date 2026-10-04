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
  poseIndex?: number;
  badgeNumber?: number;
  tier?: number;
}

export const AchievementMascotIcon: React.FC<MascotIconProps> = ({
  type,
  isUnlocked,
  size = 64,
  className = '', poseIndex, badgeNumber, tier = 0
}) => {
  const filterClass = isUnlocked ? '' : 'grayscale opacity-60';
  const types:AchievementCharacter[] = ['shiba-welcome','shiba-study','shiba-listening','shiba-reading','shiba-regular','shiba-jump','shiba-return','shiba-quiz','shiba-trophy','shiba-start','shiba-kanji','shiba-cards','shiba-grammar','shiba-speed','shiba-crown','daruma-early','owl-night','shiba-sakura','fuji-explorer','shiba-master'];
  const pose = Math.max(0, Math.min(19, poseIndex ?? Math.max(0,types.indexOf(type))));
  const colors=['#82cdb0','#8ec3ea','#b89cf3','#f0b29a','#f8cf77'];

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${filterClass} ${className}`}
      style={{ width:size, height:size, borderRadius:['28%','50%','35% 35% 50% 50%','22%','50%'][tier%5], background:`radial-gradient(ellipse at 50% 35%,${colors[tier%5]}30,#111b2b)`, border:`2px solid ${colors[tier%5]}80`, boxShadow:`inset 0 0 0 3px #111b2b,0 3px 10px #0003` }}
    >
      <span role="img" aria-label={`Huy hiệu Shiba ${badgeNumber || type}`} className="badge-illustration" style={{ position:'relative',width:'90%',height:'90%',overflow:'hidden',display:'block',transition:'transform .25s' }}><img src="/mascot/shiba-journey-atlas.png" alt="" style={{position:'absolute',width:'500%',height:'400%',maxWidth:'none',left:`${-(pose%5)*100}%`,top:`${-Math.floor(pose/5)*100}%`}} /></span>
      {badgeNumber !== undefined && <span style={{position:'absolute',bottom:-4,right:-4,background:colors[tier%5],color:'#172033',borderRadius:6,padding:'1px 4px',fontWeight:900,fontSize:Math.max(8,size*.12),border:'2px solid #152034'}}>{String(badgeNumber).padStart(3,'0')}</span>}
    </div>
  );
};

