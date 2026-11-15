import {
  DailyTaskItem,
  DirectThread,
  GiftItem,
  HostSpotlight,
  MicSeat,
  RoomCategory,
  RoomParticipant,
  VoiceRoom,
} from '../types';

export const ROOM_CATEGORIES: RoomCategory[] = [
  'All',
  'Music',
  'Gaming',
  'Chatting',
  'Poetry',
  'Funny',
];

export const AVATAR_PRESETS = [
  { id: 'violet-rose', label: 'Royal Rose', gradient: 'from-violet-600 to-pink-500' },
  { id: 'fuchsia-amber', label: 'Mehfil Gold', gradient: 'from-pink-500 to-amber-400' },
  { id: 'indigo-cyan', label: 'Midnight Sky', gradient: 'from-indigo-600 to-sky-400' },
  { id: 'plum-coral', label: 'Sunset Plum', gradient: 'from-purple-700 to-rose-400' },
  { id: 'emerald-teal', label: 'Emerald Vibe', gradient: 'from-emerald-500 to-teal-400' },
  { id: 'crimson-pink', label: 'Dil Ruby', gradient: 'from-rose-600 to-pink-400' },
];

export const GIFT_CATALOG: GiftItem[] = [
  {
    id: 'rose',
    name: 'Rose',
    urduTag: 'Gulab',
    coins: 10,
    emoji: '🌹',
    accentGradient: 'from-rose-500 to-pink-500',
    category: 'normal',
  },
  {
    id: 'heart',
    name: 'Heart',
    urduTag: 'Dil',
    coins: 50,
    emoji: '💖',
    accentGradient: 'from-pink-500 to-fuchsia-500',
    category: 'normal',
  },
  {
    id: 'crown',
    name: 'Crown',
    urduTag: 'Taaj',
    coins: 500,
    emoji: '👑',
    accentGradient: 'from-amber-400 to-orange-500',
    category: 'normal',
  },
  {
    id: 'car',
    name: 'Sports Car',
    urduTag: 'Supercar',
    coins: 10_000,
    emoji: '🏎️',
    accentGradient: 'from-violet-500 to-pink-500',
    category: 'normal',
  },
  {
    id: 'yacht',
    name: 'Royal Yacht',
    urduTag: 'Shahi Yacht',
    coins: 100_000,
    emoji: '🛥️',
    accentGradient: 'from-sky-500 to-indigo-600',
    category: 'normal',
  },
  {
    id: 'jet',
    name: 'Private Jet',
    urduTag: 'VIP Jet',
    coins: 1_000_000,
    emoji: '✈️',
    accentGradient: 'from-indigo-500 to-purple-600',
    category: 'normal',
  },
  {
    id: 'castle',
    name: 'Golden Castle',
    urduTag: 'Sona Mahal',
    coins: 5_000_000,
    emoji: '🏰',
    accentGradient: 'from-amber-400 to-yellow-600',
    category: 'normal',
  },
  {
    id: 'palace',
    name: 'Diamond Palace',
    urduTag: '10M Grand Gift',
    coins: 10_000_000,
    emoji: '💎',
    accentGradient: 'from-cyan-400 via-violet-500 to-pink-500',
    category: 'normal',
  },
  // Lucky Gifts (up to 50K)
  {
    id: 'lucky-clover',
    name: 'Lucky Clover',
    urduTag: 'Win up to 100x',
    coins: 500,
    emoji: '🍀',
    accentGradient: 'from-emerald-400 to-teal-600',
    category: 'lucky',
    maxMultiplier: 100,
  },
  {
    id: 'lucky-star',
    name: 'Lucky Star',
    urduTag: 'Win up to 200x',
    coins: 2_500,
    emoji: '🌟',
    accentGradient: 'from-amber-400 to-orange-500',
    category: 'lucky',
    maxMultiplier: 200,
  },
  {
    id: 'lucky-spider',
    name: 'Magic Spider',
    urduTag: 'Win up to 500x',
    coins: 10_000,
    emoji: '🕷️',
    accentGradient: 'from-fuchsia-500 to-purple-700',
    category: 'lucky',
    maxMultiplier: 500,
  },
  {
    id: 'lucky-dragon',
    name: 'Lucky Dragon',
    urduTag: '50K Lucky Max',
    coins: 50_000,
    emoji: '🐉',
    accentGradient: 'from-rose-500 via-amber-500 to-yellow-400',
    category: 'lucky',
    maxMultiplier: 500,
  },
];

export const QUICK_EMOJIS = ['❤️', '🔥', '🎤', '🌹', '👏', '😂', '🎶', '✨', '💯', '☕', '👑', '🙌'];

export const GOOGLE_LOCAL_ACCOUNTS = [
  {
    name: 'Zeeshan Ahmed',
    email: 'zeeshan.ahmed@gmail.com',
    avatar: 'violet-rose',
  },
  {
    name: 'Ayesha Khan',
    email: 'ayesha.k@gmail.com',
    avatar: 'fuchsia-amber',
  },
  {
    name: 'Saad Mahmood',
    email: 'saad.voice@gmail.com',
    avatar: 'indigo-cyan',
  },
];

export const DEFAULT_ROOM_PARTICIPANTS: RoomParticipant[] = [
  { id: 'guest-sana', uid: '100002', name: 'Sana Mir', avatar: 'fuchsia-amber' },
  { id: 'guest-hamza', uid: '100003', name: 'Hamza Raza', avatar: 'indigo-cyan' },
  { id: 'guest-zara', uid: '100004', name: 'Zara Noor', avatar: 'plum-coral' },
  { id: 'guest-bilal', uid: '100005', name: 'Bilal Pro', avatar: 'emerald-teal' },
];

export function buildInitialSeats(
  hostId: string,
  hostName: string,
  hostAvatar: string,
  guests: Array<{
    id: string;
    name: string;
    avatar: string;
    speaking?: boolean;
    muted?: boolean;
    isAdmin?: boolean;
  }> = []
): MicSeat[] {
  const seats: MicSeat[] = [
    {
      seatNumber: 1,
      occupantId: hostId,
      occupantName: hostName,
      occupantAvatar: hostAvatar,
      isHost: true,
      isAdmin: true,
      isMuted: false,
      isSpeaking: true,
      isLocked: false,
    },
  ];

  for (let i = 2; i <= 8; i++) {
    const guest = guests[i - 2];
    seats.push({
      seatNumber: i,
      occupantId: guest ? guest.id : null,
      occupantName: guest ? guest.name : null,
      occupantAvatar: guest ? guest.avatar : null,
      isHost: false,
      isAdmin: guest ? Boolean(guest.isAdmin) : false,
      isMuted: guest ? Boolean(guest.muted) : false,
      isSpeaking: guest ? Boolean(guest.speaking) : false,
      isLocked: false,
    });
  }

  return seats;
}

// All rooms start closed on fresh app launch; newly created or reopened rooms show live.
export const INITIAL_ROOMS: VoiceRoom[] = [];

export const DEFAULT_DAILY_TASKS: DailyTaskItem[] = [
  {
    id: 'checkin',
    title: 'Daily Check-In',
    subtitle: 'Open Zariya today & claim reward',
    reward: 20000,
    progress: 1,
    target: 1,
    claimed: false,
  },
  {
    id: 'room',
    title: 'Host or Join a Room',
    subtitle: 'Create a live room or sit on mic',
    reward: 30000,
    progress: 0,
    target: 1,
    claimed: false,
  },
  {
    id: 'game',
    title: 'Play Party Games',
    subtitle: 'Play Fruit Party, Rocket, Teen Patti, or GatesOfOlympus',
    reward: 25000,
    progress: 0,
    target: 1,
    claimed: false,
  },
  {
    id: 'gift',
    title: 'Send Gift or Chat',
    subtitle: 'Interact in any live voice room',
    reward: 25000,
    progress: 0,
    target: 1,
    claimed: false,
  },
];

export const SPOTLIGHT_HOSTS: HostSpotlight[] = [
  {
    id: 'host-hira',
    name: 'Hira Khan',
    handle: '@hira.vocals',
    avatar: 'crimson-pink',
    specialty: 'Music',
    followers: '24.8K',
  },
  {
    id: 'host-zara',
    name: 'Zara Noor',
    handle: '@zara.shayari',
    avatar: 'plum-coral',
    specialty: 'Poetry',
    followers: '18.2K',
  },
  {
    id: 'host-hamza',
    name: 'Hamza Raza',
    handle: '@hamza.midnight',
    avatar: 'indigo-cyan',
    specialty: 'Chatting',
    followers: '15.6K',
  },
  {
    id: 'host-bilal',
    name: 'Bilal Pro',
    handle: '@bilal.squad',
    avatar: 'emerald-teal',
    specialty: 'Gaming',
    followers: '12.1K',
  },
];

export const INITIAL_THREADS: DirectThread[] = [
  {
    id: 'thread-zara',
    peerId: 'host-zara',
    peerName: 'Zara Noor',
    peerAvatar: 'plum-coral',
    peerStatus: 'Zariya Poetry Host',
    unread: 2,
    messages: [
      {
        id: 'dm1',
        fromMe: false,
        text: 'Salaam! Jab aap apna room live karein toh mujhe invite zaroor bhejna ✨',
        time: '10:42 PM',
      },
      {
        id: 'dm2',
        fromMe: false,
        text: 'Aaj 100,000 daily task, Teen Patti aur GatesOfOlympus zaroor try karna!',
        time: '10:43 PM',
      },
    ],
  },
  {
    id: 'thread-hamza',
    peerId: 'host-hamza',
    peerName: 'Hamza Raza',
    peerAvatar: 'indigo-cyan',
    peerStatus: 'Late Night Host',
    unread: 1,
    messages: [
      {
        id: 'dm3',
        fromMe: false,
        text: 'Bro apna room create karo aur mujhe Admin bana dena stage pe!',
        time: '11:01 PM',
      },
    ],
  },
  {
    id: 'thread-hira',
    peerId: 'host-hira',
    peerName: 'Hira Khan',
    peerAvatar: 'crimson-pink',
    peerStatus: 'Unplugged Singer',
    unread: 0,
    messages: [
      {
        id: 'dm4',
        fromMe: true,
        text: 'Kal ka unplugged session kamaal tha!',
        time: 'Yesterday',
      },
      {
        id: 'dm5',
        fromMe: false,
        text: 'Shukriya! Aaj phir duet karte hain 🎤',
        time: 'Yesterday',
      },
    ],
  },
];
