import { MicOff } from 'lucide-react';
import { useState } from 'react';
import { AVATAR_PRESETS } from '../data/seedData';

interface AvatarBadgeProps {
  name: string;
  avatarId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  isMuted?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarBadgeProps['size']>, string> = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export function AvatarBadge({
  name,
  avatarId,
  size = 'md',
  isSpeaking = false,
  isMuted = false,
  className = '',
}: AvatarBadgeProps) {
  const [imgError, setImgError] = useState(false);
  const preset = AVATAR_PRESETS.find((item) => item.id === avatarId) || AVATAR_PRESETS[0];
  const isCustomImage =
    !imgError &&
    (avatarId.startsWith('data:image/') ||
      avatarId.startsWith('http://') ||
      avatarId.startsWith('https://'));

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center ${className}`}>
      {isSpeaking && !isMuted && (
        <span
          aria-hidden="true"
          className="animate-voice-ring absolute -inset-1 rounded-full bg-gradient-to-tr from-violet-500 via-pink-500 to-rose-400 opacity-70 blur-[1px]"
        />
      )}
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${preset.gradient} font-display font-bold text-white shadow-md ring-2 ring-white/15 ${SIZE_CLASSES[size]}`}
      >
        {isCustomImage ? (
          <img
            src={avatarId}
            alt={name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials || 'Z'}</span>
        )}
      </div>
      {isMuted && (
        <span
          aria-label="Muted"
          className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#140E28] text-rose-400 ring-1 ring-white/20"
        >
          <MicOff className="h-3 w-3" />
        </span>
      )}
    </div>
  );
}
