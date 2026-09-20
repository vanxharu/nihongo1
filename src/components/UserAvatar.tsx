import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  avatar?: string | null;
  name?: string;
  className?: string;
  fallbackEmoji?: string;
}

export function isImageUrl(str?: string | null): boolean {
  if (!str) return false;
  const s = str.trim();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('data:image/') ||
    s.startsWith('/avatars/') ||
    s.startsWith('/uploads/') ||
    s.startsWith('blob:')
  );
}

export default function UserAvatar({
  avatar,
  name,
  className = 'w-10 h-10 rounded-full',
  fallbackEmoji = '🦊'
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Reset img error if avatar URL changes
  useEffect(() => {
    setImgError(false);
  }, [avatar]);

  // If avatar is an image URL and has not failed to load
  if (avatar && isImageUrl(avatar) && !imgError) {
    return (
      <div className={`relative overflow-hidden shrink-0 flex items-center justify-center select-none ${className}`}>
        <img
          src={avatar}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover rounded-[inherit]"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // If avatar is a short string / emoji (length <= 6)
  const isEmojiOrShort = avatar && avatar.trim().length > 0 && avatar.trim().length <= 6;
  const displayEmoji = isEmojiOrShort ? avatar.trim() : fallbackEmoji;

  return (
    <div className={`relative overflow-hidden shrink-0 flex items-center justify-center select-none ${className}`}>
      {displayEmoji ? (
        <span className="leading-none select-none text-[1.15em]">{displayEmoji}</span>
      ) : (
        <User className="w-1/2 h-1/2 opacity-75" />
      )}
    </div>
  );
}
