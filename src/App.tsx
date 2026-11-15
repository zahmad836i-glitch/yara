/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import dilDaVolumeImg from './assets/images/room_dil_da_volume_1794727397715.jpg';
import gamingLoungeImg from './assets/images/room_gaming_lounge_1794727398621.jpg';
import hasnaManaHaiImg from './assets/images/room_hasna_mana_hai_1794727399798.jpg';
import lateNightTalksImg from './assets/images/room_late_night_talks_1794727398092.jpg';
import mehfilShayariImg from './assets/images/room_mehfil_shayari_1794727397914.jpg';
import { BottomNav } from './components/BottomNav';
import { CreateRoomModal } from './components/CreateRoomModal';
import { ExploreView } from './components/ExploreView';
import { FamilyModal } from './components/FamilyModal';
import { GameId, PartyGamesModal } from './components/games/PartyGamesModal';
import { HomeView } from './components/HomeView';
import { LoginView } from './components/LoginView';
import { MessagesView } from './components/MessagesView';
import { ProfileView } from './components/ProfileView';
import { RechargeModal } from './components/RechargeModal';
import { RoomView } from './components/RoomView';
import { WalletModal } from './components/WalletModal';
import { buildInitialSeats, DEFAULT_ROOM_PARTICIPANTS } from './data/seedData';
import {
  AppTab,
  DailyTaskItem,
  DirectThread,
  ExcludeAllCategory,
  FamilyGroup,
  FamilyNameColor,
  GameRankEntry,
  GiftItem,
  RechargeRecord,
  ShareRewardState,
  UidDirectoryEntry,
  UserProfile,
  VoiceRoom,
  WalletTransaction,
} from './types';
import {
  clearUserSession,
  formatTimeNow,
  loadDailyTasks,
  loadFamilies,
  loadFollowedHosts,
  loadGameRanking,
  loadRechargeRecords,
  loadRooms,
  loadShareReward,
  loadThreads,
  loadUidDirectory,
  loadUser,
  loadWalletTransactions,
  mergeUserIntoDirectory,
  normalizeFamilies,
  normalizeRooms,
  saveDailyTasks,
  saveFamilies,
  saveFollowedHosts,
  saveGameRanking,
  saveRechargeRecords,
  saveRooms,
  saveShareReward,
  saveThreads,
  saveUidDirectory,
  saveUser,
  saveWalletTransactions,
} from './utils/storage';
import { calculateVipLevel, canBypassRoomBlock } from './utils/vip';

const TOPIC_COVER_MAP: Record<ExcludeAllCategory, string> = {
  Music: dilDaVolumeImg,
  Poetry: mehfilShayariImg,
  Chatting: lateNightTalksImg,
  Gaming: gamingLoungeImg,
  Funny: hasnaManaHaiImg,
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => loadUser());
  const [rooms, setRooms] = useState<VoiceRoom[]>(() => loadRooms());
  const [threads, setThreads] = useState<DirectThread[]>(() => loadThreads());
  const [followedHostIds, setFollowedHostIds] = useState<string[]>(() => loadFollowedHosts());
  const [dailyTasks, setDailyTasks] = useState<DailyTaskItem[]>(() => loadDailyTasks());
  const [shareReward, setShareReward] = useState<ShareRewardState>(() => loadShareReward());
  const [uidDirectory, setUidDirectory] = useState<UidDirectoryEntry[]>(() => loadUidDirectory());
  const [rechargeHistory, setRechargeHistory] = useState<RechargeRecord[]>(() =>
    loadRechargeRecords()
  );
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() =>
    loadWalletTransactions()
  );
  const [gameRanking, setGameRanking] = useState<GameRankEntry[]>(() => loadGameRanking());
  const [families, setFamilies] = useState<FamilyGroup[]>(() => loadFamilies());

  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [walletUnlocked, setWalletUnlocked] = useState(false);
  const [gamesModalState, setGamesModalState] = useState<{ open: boolean; game: GameId }>({
    open: false,
    game: 'fruit',
  });
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const seenRechargeIdsRef = useRef<Set<string>>(new Set(rechargeHistory.map((r) => r.id)));

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      saveUser(user);
      setUidDirectory((prev) => mergeUserIntoDirectory(prev, user));
      const userVip = calculateVipLevel(user.totalRecharged ?? 0, user.uid);
      setFamilies((prev) =>
        normalizeFamilies(
          prev.map((fam) => ({
            ...fam,
            members: fam.members.map((m) =>
              m.uid === user.uid
                ? { ...m, name: user.name, avatar: user.avatar, vipLevel: userVip }
                : m
            ),
          }))
        )
      );
    }
  }, [user]);

  useEffect(() => {
    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === 'zariya_rooms_v2' && e.newValue) {
        setRooms(loadRooms());
      }
      if (e.key === 'zariya_families_v1' && e.newValue) {
        setFamilies(loadFamilies());
      }
      if (e.key === 'zariya_uid_directory_v1' && e.newValue) {
        setUidDirectory(loadUidDirectory());
      }
      if (e.key === 'zariya_recharge_history_v1' && e.newValue && user) {
        const latest = loadRechargeRecords();
        setRechargeHistory(latest);
        const unseenForMe = latest.filter(
          (rec) => rec.toUid === user.uid && !seenRechargeIdsRef.current.has(rec.id)
        );
        if (unseenForMe.length > 0) {
          let addedCoins = 0;
          unseenForMe.forEach((rec) => {
            seenRechargeIdsRef.current.add(rec.id);
            addedCoins += rec.amount;
          });
          setUser((prev) => {
            if (!prev) return prev;
            const nextTotalRecharged = (prev.totalRecharged ?? 0) + addedCoins;
            const nextVipLevel = calculateVipLevel(nextTotalRecharged, prev.uid);
            return {
              ...prev,
              coins: prev.coins + addedCoins,
              totalRecharged: nextTotalRecharged,
              vipLevel: nextVipLevel,
              isVip: prev.uid === '100001' || nextVipLevel >= 1,
            };
          });
        }
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, [user]);

  useEffect(() => {
    saveRooms(rooms);
  }, [rooms]);

  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  useEffect(() => {
    saveFollowedHosts(followedHostIds);
  }, [followedHostIds]);

  useEffect(() => {
    saveDailyTasks(dailyTasks);
  }, [dailyTasks]);

  useEffect(() => {
    saveShareReward(shareReward);
  }, [shareReward]);

  useEffect(() => {
    saveUidDirectory(uidDirectory);
  }, [uidDirectory]);

  useEffect(() => {
    saveRechargeRecords(rechargeHistory);
  }, [rechargeHistory]);

  useEffect(() => {
    saveWalletTransactions(walletTransactions);
  }, [walletTransactions]);

  useEffect(() => {
    saveGameRanking(gameRanking);
  }, [gameRanking]);

  useEffect(() => {
    saveFamilies(families);
  }, [families]);

  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === activeRoomId && r.isLive) || null,
    [rooms, activeRoomId]
  );

  const userLiveRoom = useMemo(
    () =>
      user
        ? rooms.find((r) => r.isLive && (r.hostUid === user.uid || r.hostId === user.id)) || null
        : null,
    [rooms, user]
  );

  const unreadCount = useMemo(
    () => threads.reduce((acc, t) => acc + t.unread, 0),
    [threads]
  );

  const handleRechargeUid = (
    targetUid: string,
    amount: number
  ): { ok: boolean; message: string } => {
    if (!user) return { ok: false, message: 'No active user session.' };
    if (user.uid !== '100001') {
      return { ok: false, message: 'Recharge is not available for this account.' };
    }

    const normalizedUid = targetUid.replace(/^uid\s*:?\s*/i, '').trim();
    if (!normalizedUid) {
      return { ok: false, message: 'Please enter a valid recipient ID.' };
    }
    if (normalizedUid === user.uid) {
      return { ok: false, message: 'Enter another user ID to send coins.' };
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter a valid coin amount.' };
    }
    if (user.coins < amount) {
      return { ok: false, message: 'Insufficient coins in wallet.' };
    }

    const latestDir = uidDirectory.length > 0 ? uidDirectory : loadUidDirectory();
    const existing = latestDir.find((entry) => entry.uid === normalizedUid);
    const recipientName = existing ? existing.name : `User ${normalizedUid}`;
    const nextTotalRecharged = (existing?.totalRecharged ?? 0) + amount;
    const nextVipLevel = calculateVipLevel(nextTotalRecharged, normalizedUid);

    const nextDirectory: UidDirectoryEntry[] = existing
      ? latestDir.map((entry) =>
          entry.uid === normalizedUid
            ? {
                ...entry,
                coins: entry.coins + amount,
                totalRecharged: nextTotalRecharged,
                vipLevel: nextVipLevel,
              }
            : entry
        )
      : [
          ...latestDir,
          {
            uid: normalizedUid,
            name: recipientName,
            avatar: 'indigo-cyan',
            coins: amount,
            diamonds: 0,
            totalRecharged: nextTotalRecharged,
            vipLevel: nextVipLevel,
          },
        ];

    saveUidDirectory(nextDirectory);
    setUidDirectory(nextDirectory);
    setUser((prev) => (prev ? { ...prev, coins: prev.coins - amount } : prev));

    if (nextVipLevel > 0) {
      setRooms((prev) =>
        prev.map((room) => ({
          ...room,
          hostVipLevel: room.hostUid === normalizedUid ? nextVipLevel : room.hostVipLevel,
          participants: room.participants.map((p) =>
            p.uid === normalizedUid ? { ...p, vipLevel: nextVipLevel } : p
          ),
          seats: room.seats.map((s) =>
            s.occupantUid === normalizedUid ? { ...s, occupantVipLevel: nextVipLevel } : s
          ),
        }))
      );
      setGameRanking((prev) =>
        prev.map((entry) =>
          entry.uid === normalizedUid ? { ...entry, vipLevel: nextVipLevel } : entry
        )
      );
    }

    const record: RechargeRecord = {
      id: `rch-${Date.now()}`,
      fromUid: user.uid,
      toUid: normalizedUid,
      toName: recipientName,
      amount,
      time: formatTimeNow(),
    };
    seenRechargeIdsRef.current.add(record.id);

    setRechargeHistory((prev) => {
      const next = [record, ...prev];
      saveRechargeRecords(next);
      return next;
    });

    setWalletTransactions((prev) => [
      {
        id: `wtx-${Date.now()}`,
        title: `Recharge to UID ${normalizedUid}`,
        detail: recipientName,
        deltaLabel: `-${amount.toLocaleString()} Coins`,
        time: formatTimeNow(),
      },
      ...prev,
    ]);

    const vipNote = nextVipLevel > 0 ? ` · Unlocked VIP ${nextVipLevel}!` : '';
    return {
      ok: true,
      message: `Successfully sent +${amount.toLocaleString()} coins to ID ${normalizedUid} (${recipientName})${vipNote}`,
    };
  };

  const handleConvertWallet = (
    direction: 'coins_to_diamonds' | 'diamonds_to_coins',
    diamondUnits: number
  ): { ok: boolean; message: string } => {
    if (!user) return { ok: false, message: 'No active user.' };
    const coinAmount = diamondUnits * 1000;

    if (direction === 'coins_to_diamonds') {
      if (user.coins < coinAmount) {
        return {
          ok: false,
          message: `Need ${coinAmount.toLocaleString()} coins to get ${diamondUnits.toLocaleString()} diamonds.`,
        };
      }
      setUser((prev) =>
        prev
          ? {
              ...prev,
              coins: prev.coins - coinAmount,
              diamonds: prev.diamonds + diamondUnits,
            }
          : prev
      );
      setWalletTransactions((prev) => [
        {
          id: `wtx-${Date.now()}`,
          title: 'Converted Coins to Diamonds',
          detail: `${coinAmount.toLocaleString()} Coins`,
          deltaLabel: `+${diamondUnits.toLocaleString()} 💎`,
          time: formatTimeNow(),
        },
        ...prev,
      ]);
      return {
        ok: true,
        message: `Converted ${coinAmount.toLocaleString()} coins into +${diamondUnits.toLocaleString()} diamonds!`,
      };
    }

    if (user.diamonds < diamondUnits) {
      return {
        ok: false,
        message: `Need ${diamondUnits.toLocaleString()} diamonds to convert.`,
      };
    }
    setUser((prev) =>
      prev
        ? {
            ...prev,
            diamonds: prev.diamonds - diamondUnits,
            coins: prev.coins + coinAmount,
          }
        : prev
    );
    setWalletTransactions((prev) => [
      {
        id: `wtx-${Date.now()}`,
        title: 'Converted Diamonds to Coins',
        detail: `${diamondUnits.toLocaleString()} 💎`,
        deltaLabel: `+${coinAmount.toLocaleString()} Coins`,
        time: formatTimeNow(),
      },
      ...prev,
    ]);
    return {
      ok: true,
      message: `Converted ${diamondUnits.toLocaleString()} diamonds into +${coinAmount.toLocaleString()} coins!`,
    };
  };

  const markTaskProgress = (taskId: DailyTaskItem['id']) => {
    setDailyTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, progress: task.target } : task
      )
    );
  };

  const handleClaimTask = (taskId: DailyTaskItem['id']) => {
    const task = dailyTasks.find((t) => t.id === taskId);
    if (!task || task.claimed) return;

    setDailyTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, progress: t.target, claimed: true } : t
      )
    );
    setUser((prev) => (prev ? { ...prev, coins: prev.coins + task.reward } : prev));
  };

  const handleShareInvite = () => {
    const WIN_AMOUNT = 1000000;
    setShareReward((prev) => ({
      sharesCount: prev.sharesCount + 1,
      totalEarned: prev.totalEarned + WIN_AMOUNT,
      lastSharedAt: formatTimeNow(),
    }));
    setUser((prev) => (prev ? { ...prev, coins: prev.coins + WIN_AMOUNT } : prev));
  };

  const handleBalanceDelta = (delta: number) => {
    setUser((prev) =>
      prev ? { ...prev, coins: Math.max(0, prev.coins + delta) } : prev
    );
  };

  const handleRecordGameWin = (gameName: string, winAmount: number) => {
    if (!user || winAmount <= 0) return;
    const currentVip = calculateVipLevel(user.totalRecharged ?? 0, user.uid);
    setGameRanking((prev) => {
      const existing = prev.find((e) => e.uid === user.uid);
      if (existing) {
        return prev.map((e) =>
          e.uid === user.uid
            ? {
                ...e,
                name: user.name,
                avatar: user.avatar,
                vipLevel: currentVip,
                totalWon: e.totalWon + winAmount,
                bestWin: Math.max(e.bestWin, winAmount),
                winsCount: e.winsCount + 1,
                lastGame: gameName,
              }
            : e
        );
      }
      return [
        ...prev,
        {
          uid: user.uid,
          name: user.name,
          avatar: user.avatar,
          vipLevel: currentVip,
          totalWon: winAmount,
          bestWin: winAmount,
          winsCount: 1,
          lastGame: gameName,
        },
      ];
    });
  };

  const handleLogin = (loggedInUser: UserProfile) => {
    saveUser(loggedInUser);
    setUser(loggedInUser);
    setWalletUnlocked(false);
    setActiveTab('home');
    setActiveRoomId(null);
  };

  const handleLogout = () => {
    clearUserSession();
    setWalletUnlocked(false);
    setActiveRoomId(null);
    setActiveTab('home');
    setUser(null);
  };

  const handleOpenRoom = (room: VoiceRoom) => {
    markTaskProgress('room');
    setActiveRoomId(room.id);
    setRooms((prev) =>
      normalizeRooms(
        prev.map((r) => {
          if (r.id === room.id) {
            return { ...r, isLive: true, listenersCount: r.listenersCount + 1 };
          }
          const sameHost =
            (room.hostUid && r.hostUid === room.hostUid) ||
            r.hostId === room.hostId;
          if (sameHost && r.isLive) {
            return { ...r, isLive: false };
          }
          return r;
        })
      )
    );
  };

  const handleLeaveRoom = () => {
    if (!activeRoomId || !user) {
      setActiveRoomId(null);
      return;
    }

    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== activeRoomId) return room;
        return {
          ...room,
          listenersCount: Math.max(1, room.listenersCount - 1),
          seats: room.seats.map((seat) =>
            seat.occupantId === user.id && !seat.isHost
              ? {
                  ...seat,
                  occupantId: null,
                  occupantName: null,
                  occupantAvatar: null,
                  isMuted: false,
                  isSpeaking: false,
                }
              : seat
          ),
        };
      })
    );
    setActiveRoomId(null);
  };

  const handleCloseRoom = (roomId: string) => {
    setRooms((prev) =>
      normalizeRooms(prev.map((room) => (room.id === roomId ? { ...room, isLive: false } : room)))
    );
    if (activeRoomId === roomId) {
      setActiveRoomId(null);
    }
  };

  const handleToggleRoomLive = (roomId: string) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return;
    const nextLive = !targetRoom.isLive;

    setRooms((prev) =>
      normalizeRooms(
        prev.map((room) => {
          if (room.id === roomId) {
            return { ...room, isLive: nextLive };
          }
          if (nextLive && room.isLive) {
            const sameHost =
              (targetRoom.hostUid && room.hostUid === targetRoom.hostUid) ||
              room.hostId === targetRoom.hostId;
            if (sameHost) {
              return { ...room, isLive: false };
            }
          }
          return room;
        })
      )
    );

    if (!nextLive && activeRoomId === roomId) {
      setActiveRoomId(null);
    }
  };

  const handleJoinMic = (roomId: string, preferredSeat?: number) => {
    if (!user) return;
    markTaskProgress('room');
    const userVip = calculateVipLevel(user.totalRecharged ?? 0, user.uid);
    const hasAntiBlock = canBypassRoomBlock(userVip, user.uid);

    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const alreadySeated = room.seats.some((s) => s.occupantId === user.id);
        if (alreadySeated) return room;

        const targetSeat =
          (preferredSeat
            ? room.seats.find(
                (s) => s.seatNumber === preferredSeat && !s.occupantId && (!s.isLocked || hasAntiBlock)
              )
            : undefined) || room.seats.find((s) => !s.occupantId && (!s.isLocked || hasAntiBlock));

        if (!targetSeat) return room;

        const updatedSeats = room.seats.map((s) =>
          s.seatNumber === targetSeat.seatNumber
            ? {
                ...s,
                occupantId: user.id,
                occupantUid: user.uid,
                occupantName: user.name,
                occupantAvatar: user.avatar,
                occupantVipLevel: userVip,
                occupantFamilyName: user.uid === '100001' ? 'Jutt' : user.familyName,
                occupantFamilyColor: user.uid === '100001' ? 'red' : user.familyColor,
                isAdmin: room.adminIds.includes(user.id),
                isMuted: false,
                isSpeaking: true,
              }
            : s
        );

        return {
          ...room,
          seats: updatedSeats,
          messages: [
            ...room.messages,
            {
              id: `sys-${Date.now()}`,
              senderId: 'system',
              senderName: 'System',
              senderAvatar: user.avatar,
              text: `${user.name} joined Mic #${targetSeat.seatNumber}`,
              timestamp: formatTimeNow(),
              type: 'system',
            },
          ],
        };
      })
    );
  };

  const handleLeaveMic = (roomId: string) => {
    if (!user) return;
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const mySeat = room.seats.find((s) => s.occupantId === user.id);
        if (!mySeat || mySeat.isHost) return room;

        return {
          ...room,
          seats: room.seats.map((s) =>
            s.occupantId === user.id
              ? {
                  ...s,
                  occupantId: null,
                  occupantName: null,
                  occupantAvatar: null,
                  isMuted: false,
                  isSpeaking: false,
                }
              : s
          ),
          messages: [
            ...room.messages,
            {
              id: `sys-${Date.now()}`,
              senderId: 'system',
              senderName: 'System',
              senderAvatar: user.avatar,
              text: `${user.name} stepped down from the mic`,
              timestamp: formatTimeNow(),
              type: 'system',
            },
          ],
        };
      })
    );
  };

  const handleToggleMute = (roomId: string) => {
    if (!user) return;
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          seats: room.seats.map((s) =>
            s.occupantId === user.id
              ? { ...s, isMuted: !s.isMuted, isSpeaking: s.isMuted }
              : s
          ),
        };
      })
    );
  };

  const handleToggleAdmin = (roomId: string, participantId: string) => {
    if (!user) return;
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const exists = room.adminIds.includes(participantId);
        const participant = room.participants.find((p) => p.id === participantId);
        const nextAdmins = exists
          ? room.adminIds.filter((id) => id !== participantId)
          : [...room.adminIds, participantId];

        return {
          ...room,
          adminIds: nextAdmins,
          seats: room.seats.map((s) =>
            s.occupantId === participantId ? { ...s, isAdmin: !exists } : s
          ),
          messages: participant
            ? [
                ...room.messages,
                {
                  id: `adm-${Date.now()}`,
                  senderId: 'system',
                  senderName: 'System',
                  senderAvatar: user.avatar,
                  text: exists
                    ? `${participant.name} removed from Room Admin`
                    : `${participant.name} is now a Room Admin`,
                  timestamp: formatTimeNow(),
                  type: 'system',
                },
              ]
            : room.messages,
        };
      })
    );
  };

  const handleAdminSeatParticipant = (roomId: string, participantId: string) => {
    if (!user) return;
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const participant = room.participants.find((p) => p.id === participantId);
        if (!participant) return room;
        const openSeat = room.seats.find((s) => !s.occupantId && !s.isLocked);
        if (!openSeat) return room;

        return {
          ...room,
          seats: room.seats.map((s) =>
            s.seatNumber === openSeat.seatNumber
              ? {
                  ...s,
                  occupantId: participant.id,
                  occupantName: participant.name,
                  occupantAvatar: participant.avatar,
                  isAdmin: room.adminIds.includes(participant.id),
                  isMuted: false,
                  isSpeaking: true,
                }
              : s
          ),
          messages: [
            ...room.messages,
            {
              id: `inv-${Date.now()}`,
              senderId: 'system',
              senderName: 'System',
              senderAvatar: user.avatar,
              text: `${participant.name} invited to Mic #${openSeat.seatNumber}`,
              timestamp: formatTimeNow(),
              type: 'system',
            },
          ],
        };
      })
    );
  };

  const handleAdminMuteSeat = (roomId: string, seatNumber: number) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const target = room.seats.find((s) => s.seatNumber === seatNumber);
        if (
          target &&
          canBypassRoomBlock(target.occupantVipLevel ?? 0, target.occupantUid ?? undefined)
        ) {
          return {
            ...room,
            messages: [
              ...room.messages,
              {
                id: `prot-${Date.now()}`,
                senderId: 'system',
                senderName: 'System',
                senderAvatar: room.hostAvatar,
                text: `${target.occupantName} has VIP Room Protection and cannot be muted or blocked.`,
                timestamp: formatTimeNow(),
                type: 'system',
              },
            ],
          };
        }
        return {
          ...room,
          seats: room.seats.map((s) =>
            s.seatNumber === seatNumber
              ? { ...s, isMuted: !s.isMuted, isSpeaking: s.isMuted }
              : s
          ),
        };
      })
    );
  };

  const handleAdminKickSeat = (roomId: string, seatNumber: number) => {
    if (!user) return;
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const seat = room.seats.find((s) => s.seatNumber === seatNumber);
        if (!seat || seat.isHost || !seat.occupantName) return room;
        if (canBypassRoomBlock(seat.occupantVipLevel ?? 0, seat.occupantUid ?? undefined)) {
          return {
            ...room,
            messages: [
              ...room.messages,
              {
                id: `prot-kick-${Date.now()}`,
                senderId: 'system',
                senderName: 'System',
                senderAvatar: user.avatar,
                text: `${seat.occupantName} has VIP Room Protection and cannot be blocked from any room.`,
                timestamp: formatTimeNow(),
                type: 'system',
              },
            ],
          };
        }
        return {
          ...room,
          seats: room.seats.map((s) =>
            s.seatNumber === seatNumber
              ? {
                  ...s,
                  occupantId: null,
                  occupantUid: null,
                  occupantName: null,
                  occupantAvatar: null,
                  occupantVipLevel: undefined,
                  isMuted: false,
                  isSpeaking: false,
                }
              : s
          ),
          messages: [
            ...room.messages,
            {
              id: `kick-${Date.now()}`,
              senderId: 'system',
              senderName: 'System',
              senderAvatar: user.avatar,
              text: `${seat.occupantName} removed from Mic #${seatNumber}`,
              timestamp: formatTimeNow(),
              type: 'system',
            },
          ],
        };
      })
    );
  };

  const handleAdminToggleLockSeat = (roomId: string, seatNumber: number) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          seats: room.seats.map((s) =>
            s.seatNumber === seatNumber && !s.isHost
              ? { ...s, isLocked: !s.isLocked }
              : s
          ),
        };
      })
    );
  };

  const handleSendRoomMessage = (roomId: string, text: string) => {
    if (!user) return;
    markTaskProgress('gift');
    const senderVip = calculateVipLevel(user.totalRecharged ?? 0, user.uid);
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          messages: [
            ...room.messages,
            {
              id: `msg-${Date.now()}`,
              senderId: user.id,
              senderUid: user.uid,
              senderName: user.name,
              senderAvatar: user.avatar,
              senderVipLevel: senderVip,
              senderFamilyName: user.uid === '100001' ? 'Jutt' : user.familyName,
              senderFamilyColor: user.uid === '100001' ? 'red' : user.familyColor,
              text,
              timestamp: formatTimeNow(),
              type: 'chat',
            },
          ],
        };
      })
    );
  };

  const handleSendGift = (
    roomId: string,
    gift: GiftItem,
    recipientName: string
  ): { ok: boolean; luckyMultiplier?: number; luckyWinCoins?: number } => {
    if (!user || user.coins < gift.coins) return { ok: false };
    markTaskProgress('gift');

    let luckyMultiplier = 0;
    let luckyWinCoins = 0;
    if (gift.category === 'lucky') {
      const r = Math.random();
      if (r < 0.62) {
        luckyMultiplier = 0;
      } else if (r < 0.82) {
        luckyMultiplier = 2;
      } else if (r < 0.93) {
        luckyMultiplier = 3;
      } else if (r < 0.975) {
        luckyMultiplier = 5;
      } else if (r < 0.993) {
        luckyMultiplier = 10;
      } else if (r < 0.998) {
        luckyMultiplier = 50;
      } else {
        luckyMultiplier = gift.maxMultiplier || 500;
      }
      luckyWinCoins = luckyMultiplier > 0 ? gift.coins * luckyMultiplier : 0;
    }

    setUser((prev) => {
      if (!prev) return prev;
      const totalXp = prev.xp + Math.max(2, Math.floor(gift.coins / 50));
      const gainedLevels = Math.floor(totalXp / 100);
      return {
        ...prev,
        coins: Math.max(0, prev.coins - gift.coins + luckyWinCoins),
        level: prev.level + gainedLevels,
        xp: totalXp % 100,
      };
    });

    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          messages: [
            ...room.messages,
            {
              id: `gift-${Date.now()}`,
              senderId: user.id,
              senderName: user.name,
              senderAvatar: user.avatar,
              text: `sent ${gift.name} to ${recipientName}`,
              timestamp: formatTimeNow(),
              type: 'gift',
              gift: {
                id: gift.id,
                name: gift.name,
                emoji: gift.emoji,
                coins: gift.coins,
                recipientName,
                isLucky: gift.category === 'lucky',
                luckyMultiplier: gift.category === 'lucky' ? luckyMultiplier : undefined,
                luckyWinCoins: gift.category === 'lucky' ? luckyWinCoins : undefined,
              },
            },
          ],
        };
      })
    );

    return {
      ok: true,
      luckyMultiplier: gift.category === 'lucky' ? luckyMultiplier : undefined,
      luckyWinCoins: gift.category === 'lucky' ? luckyWinCoins : undefined,
    };
  };

  const handleCreateRoom = (payload: {
    name: string;
    topic: ExcludeAllCategory;
    isPrivate: boolean;
    password?: string;
  }) => {
    if (!user) return;
    markTaskProgress('room');

    const isOfficialOwner = user.uid === '100001';
    const resolvedRoomName = isOfficialOwner ? 'Zariya Official' : payload.name.trim();
    const hostVip = calculateVipLevel(user.totalRecharged ?? 0, user.uid);
    const existingOfficial = isOfficialOwner
      ? rooms.find((r) => r.hostUid === '100001' || r.hostId === user.id || r.hostId === 'usr-100001')
      : undefined;
    const nextRoomId = existingOfficial ? existingOfficial.id : `room-${Date.now()}`;

    const initialSeats = buildInitialSeats(user.id, user.name, user.avatar).map((seat) =>
      seat.seatNumber === 1
        ? {
            ...seat,
            occupantUid: user.uid,
            occupantVipLevel: hostVip,
            occupantFamilyName: isOfficialOwner ? 'Jutt' : user.familyName,
            occupantFamilyColor: isOfficialOwner ? 'red' : user.familyColor,
          }
        : seat
    );

    const newRoom: VoiceRoom = {
      id: nextRoomId,
      name: resolvedRoomName,
      topic: payload.topic,
      subtitle: isOfficialOwner
        ? `${payload.topic} · Official Live Mehfil`
        : `${payload.topic} Mehfil hosted by ${user.name}`,
      hostId: user.id,
      hostUid: user.uid,
      hostName: user.name,
      hostAvatar: user.avatar,
      hostVipLevel: hostVip,
      hostFamilyName: isOfficialOwner ? 'Jutt' : user.familyName,
      hostFamilyColor: isOfficialOwner ? 'red' : user.familyColor,
      adminIds: existingOfficial ? existingOfficial.adminIds : [],
      participants: DEFAULT_ROOM_PARTICIPANTS,
      coverImage: TOPIC_COVER_MAP[payload.topic],
      listenersCount: existingOfficial
        ? Math.max(existingOfficial.listenersCount, 1 + DEFAULT_ROOM_PARTICIPANTS.length)
        : 1 + DEFAULT_ROOM_PARTICIPANTS.length,
      isLive: true,
      isPrivate: payload.isPrivate,
      password: payload.password,
      createdByUser: true,
      seats: initialSeats,
      messages: [
        ...(existingOfficial ? existingOfficial.messages : []),
        {
          id: `welcome-${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          senderAvatar: user.avatar,
          text: `${resolvedRoomName} is now live! Host can assign Admins from the Admin panel.`,
          timestamp: formatTimeNow(),
          type: 'system',
        },
      ],
    };

    setRooms((prev) => {
      const updatedOthers = prev
        .filter((r) => !(isOfficialOwner && (r.hostUid === '100001' || r.hostId === user.id || r.hostId === 'usr-100001')))
        .map((r) => {
          const sameHost = r.hostUid === user.uid || r.hostId === user.id;
          return sameHost && r.isLive ? { ...r, isLive: false } : r;
        });

      return normalizeRooms([newRoom, ...updatedOthers]);
    });

    setShowCreateModal(false);
    setActiveTab('home');
    setActiveRoomId(nextRoomId);
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    if (activeRoomId === roomId) {
      setActiveRoomId(null);
    }
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const nextUser = { ...user, ...updates };
    setUser(nextUser);

    setRooms((prev) =>
      prev.map((room) => ({
        ...room,
        hostName: room.hostId === user.id ? nextUser.name : room.hostName,
        hostAvatar: room.hostId === user.id ? nextUser.avatar : room.hostAvatar,
        seats: room.seats.map((seat) =>
          seat.occupantId === user.id
            ? { ...seat, occupantName: nextUser.name, occupantAvatar: nextUser.avatar }
            : seat
        ),
      }))
    );
  };

  const handleUpdateWalletPassword = (nextWalletPassword: string | undefined) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, walletPassword: nextWalletPassword } : prev));
    if (!nextWalletPassword) {
      setWalletUnlocked(false);
    }
  };

  const syncUserFamilyToRooms = (
    targetUid: string,
    targetUserId: string,
    familyName?: string,
    familyColor?: FamilyNameColor
  ) => {
    setRooms((prev) =>
      normalizeRooms(
        prev.map((room) => ({
          ...room,
          hostFamilyName:
            room.hostUid === targetUid || room.hostId === targetUserId
              ? familyName
              : room.hostFamilyName,
          hostFamilyColor:
            room.hostUid === targetUid || room.hostId === targetUserId
              ? familyColor
              : room.hostFamilyColor,
          seats: room.seats.map((seat) =>
            seat.occupantId === targetUserId || seat.occupantUid === targetUid
              ? {
                  ...seat,
                  occupantFamilyName: familyName,
                  occupantFamilyColor: familyColor,
                }
              : seat
          ),
        }))
      )
    );
  };

  const handleJoinFamily = (familyId: string): { ok: boolean; message: string } => {
    if (!user) return { ok: false, message: 'No active user session.' };
    if (user.uid === '100001') {
      return { ok: false, message: 'Official account already leads Jutt family.' };
    }
    const targetFamily = families.find((f) => f.id === familyId);
    if (!targetFamily) {
      return { ok: false, message: 'Family not found.' };
    }
    const ledOtherFamily = families.find(
      (f) => f.id !== familyId && f.leaderUid === user.uid && f.members.length > 1
    );
    if (ledOtherFamily) {
      return {
        ok: false,
        message: `You are currently Leader of ${ledOtherFamily.name}.`,
      };
    }

    const userVip = calculateVipLevel(user.totalRecharged ?? 0, user.uid);
    const updatedFamilies = normalizeFamilies(
      families
        .filter((f) => !(f.leaderUid === user.uid && f.id !== familyId && f.members.length <= 1))
        .map((f) => {
          const withoutUser = f.members.filter((m) => m.uid !== user.uid);
          if (f.id === familyId) {
            return {
              ...f,
              members: [
                ...withoutUser,
                {
                  uid: user.uid,
                  name: user.name,
                  avatar: user.avatar,
                  role: 'Member' as const,
                  vipLevel: userVip,
                  contribution: user.totalRecharged ?? 0,
                  joinedAt: formatTimeNow(),
                },
              ],
            };
          }
          return { ...f, members: withoutUser };
        })
    );

    setFamilies(updatedFamilies);
    setUser((prev) =>
      prev
        ? {
            ...prev,
            familyId: targetFamily.id,
            familyName: targetFamily.name,
            familyColor: targetFamily.nameColor,
          }
        : prev
    );
    syncUserFamilyToRooms(user.uid, user.id, targetFamily.name, targetFamily.nameColor);
    return { ok: true, message: `Joined ${targetFamily.name} family!` };
  };

  const handleLeaveFamily = (): { ok: boolean; message: string } => {
    if (!user) return { ok: false, message: 'No active user session.' };
    if (user.uid === '100001') {
      return { ok: false, message: 'Official account leads Jutt family.' };
    }
    const currentFamily = families.find(
      (f) => f.id === user.familyId || f.members.some((m) => m.uid === user.uid)
    );
    if (!currentFamily) {
      return { ok: false, message: 'You are not in a family.' };
    }
    if (currentFamily.leaderUid === user.uid && currentFamily.members.length > 1) {
      return { ok: false, message: 'Leader cannot leave while other members are active.' };
    }

    const updatedFamilies = normalizeFamilies(
      families
        .filter((f) => !(f.id === currentFamily.id && f.leaderUid === user.uid))
        .map((f) => ({
          ...f,
          members: f.members.filter((m) => m.uid !== user.uid),
        }))
    );

    setFamilies(updatedFamilies);
    setUser((prev) =>
      prev
        ? {
            ...prev,
            familyId: undefined,
            familyName: undefined,
            familyColor: undefined,
          }
        : prev
    );
    syncUserFamilyToRooms(user.uid, user.id, undefined, undefined);
    return { ok: true, message: `Left ${currentFamily.name} family.` };
  };

  const handleCreateFamily = (payload: {
    name: string;
    tag: string;
    slogan: string;
    nameColor: FamilyNameColor;
  }): { ok: boolean; message: string } => {
    if (!user) return { ok: false, message: 'No active user session.' };
    if (user.uid === '100001') {
      return { ok: false, message: 'Official account leads Jutt family.' };
    }
    if (payload.name.length < 2) {
      return { ok: false, message: 'Family name must be at least 2 characters.' };
    }
    if (payload.tag.length < 2) {
      return { ok: false, message: 'Family tag must be 2–5 characters.' };
    }
    const duplicate = families.some(
      (f) =>
        f.name.toLowerCase() === payload.name.toLowerCase() ||
        f.tag.toLowerCase() === payload.tag.toLowerCase()
    );
    if (duplicate) {
      return { ok: false, message: 'A family with this name or tag already exists.' };
    }

    const userVip = calculateVipLevel(user.totalRecharged ?? 0, user.uid);
    const newFamily: FamilyGroup = {
      id: `fam-${Date.now()}`,
      name: payload.name,
      tag: payload.tag,
      slogan: payload.slogan || `Welcome to ${payload.name}!`,
      leaderUid: user.uid,
      nameColor: payload.nameColor,
      level: 1,
      points: Math.max(1000, user.totalRecharged ?? 1000),
      members: [
        {
          uid: user.uid,
          name: user.name,
          avatar: user.avatar,
          role: 'Leader',
          vipLevel: userVip,
          contribution: user.totalRecharged ?? 0,
          joinedAt: formatTimeNow(),
        },
      ],
      createdAt: formatTimeNow(),
    };

    const cleaned = families
      .filter((f) => !(f.leaderUid === user.uid && f.members.length <= 1))
      .map((f) => ({
        ...f,
        members: f.members.filter((m) => m.uid !== user.uid),
      }));

    setFamilies(normalizeFamilies([...cleaned, newFamily]));
    setUser((prev) =>
      prev
        ? {
            ...prev,
            familyId: newFamily.id,
            familyName: newFamily.name,
            familyColor: newFamily.nameColor,
          }
        : prev
    );
    syncUserFamilyToRooms(user.uid, user.id, newFamily.name, newFamily.nameColor);
    return { ok: true, message: `${newFamily.name} family created!` };
  };

  const handleToggleFollow = (hostId: string) => {
    const isAlready = followedHostIds.includes(hostId);
    const updated = isAlready
      ? followedHostIds.filter((id) => id !== hostId)
      : [...followedHostIds, hostId];
    setFollowedHostIds(updated);

    setUser((prev) =>
      prev
        ? {
            ...prev,
            following: Math.max(0, prev.following + (isAlready ? -1 : 1)),
          }
        : prev
    );
  };

  const handleSelectThread = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t))
    );
  };

  const handleSendDirectMessage = (threadId: string, text: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              unread: 0,
              messages: [
                ...t.messages,
                {
                  id: `dm-${Date.now()}`,
                  fromMe: true,
                  text,
                  time: formatTimeNow(),
                },
              ],
            }
          : t
      )
    );
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#0F0A1E] text-slate-100">
      {activeRoom ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <RoomView
            room={activeRoom}
            user={user}
            onLeaveRoom={handleLeaveRoom}
            onCloseRoom={handleCloseRoom}
            onJoinMic={handleJoinMic}
            onLeaveMic={handleLeaveMic}
            onToggleMute={handleToggleMute}
            onSendMessage={handleSendRoomMessage}
            onSendGift={handleSendGift}
            onOpenGames={() => setGamesModalState({ open: true, game: 'rocket' })}
            onToggleAdmin={handleToggleAdmin}
            onAdminSeatParticipant={handleAdminSeatParticipant}
            onAdminMuteSeat={handleAdminMuteSeat}
            onAdminKickSeat={handleAdminKickSeat}
            onAdminToggleLockSeat={handleAdminToggleLockSeat}
          />
        </div>
      ) : (
        <>
          <div
            ref={scrollContainerRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
          >
            {activeTab === 'home' && (
              <HomeView
                user={user}
                rooms={rooms}
                dailyTasks={dailyTasks}
                shareReward={shareReward}
                onOpenRoom={handleOpenRoom}
                onCreateRoomClick={() => setShowCreateModal(true)}
                onGoToProfile={() => setActiveTab('profile')}
                onOpenWallet={() => setShowWalletModal(true)}
                onOpenRecharge={() => setShowRechargeModal(true)}
                onOpenFamily={() => setShowFamilyModal(true)}
                onOpenGame={(game) => setGamesModalState({ open: true, game })}
                onClaimTask={handleClaimTask}
                onShareInvite={handleShareInvite}
              />
            )}

            {activeTab === 'games' && (
              <ExploreView
                uid={user.uid}
                level={user.level}
                xp={user.xp}
                familyName={user.uid === '100001' ? 'Jutt' : user.familyName}
                familyColor={user.uid === '100001' ? 'red' : user.familyColor}
                gameRanking={gameRanking}
                followedHostIds={followedHostIds}
                dailyTasks={dailyTasks}
                shareReward={shareReward}
                onToggleFollow={handleToggleFollow}
                onOpenGame={(game) => setGamesModalState({ open: true, game })}
                onOpenWallet={() => setShowWalletModal(true)}
                onOpenFamily={() => setShowFamilyModal(true)}
                onClaimTask={handleClaimTask}
                onShareInvite={handleShareInvite}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesView
                threads={threads}
                rooms={rooms}
                onSelectThread={handleSelectThread}
                onSendDirectMessage={handleSendDirectMessage}
                onOpenRoom={handleOpenRoom}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                rooms={rooms}
                dailyTasks={dailyTasks}
                shareReward={shareReward}
                onUpdateProfile={handleUpdateProfile}
                onUpdateWalletPassword={handleUpdateWalletPassword}
                onOpenRoom={handleOpenRoom}
                onToggleRoomLive={handleToggleRoomLive}
                onDeleteRoom={handleDeleteRoom}
                onCreateRoomClick={() => setShowCreateModal(true)}
                onOpenWallet={() => setShowWalletModal(true)}
                onOpenRecharge={() => setShowRechargeModal(true)}
                onOpenFamily={() => setShowFamilyModal(true)}
                onClaimTask={handleClaimTask}
                onShareInvite={handleShareInvite}
                onLogout={handleLogout}
              />
            )}
          </div>

          <BottomNav
            activeTab={activeTab}
            unreadCount={unreadCount}
            onSelectTab={setActiveTab}
            onCreateRoom={() => setShowCreateModal(true)}
          />
        </>
      )}

      <CreateRoomModal
        isOpen={showCreateModal}
        isOfficialHost={user.uid === '100001'}
        existingLiveRoom={userLiveRoom}
        onEnterExistingRoom={(room) => {
          setShowCreateModal(false);
          handleOpenRoom(room);
        }}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRoom}
      />

      <WalletModal
        isOpen={showWalletModal}
        user={user}
        transactions={walletTransactions}
        isUnlocked={walletUnlocked}
        onUnlock={() => setWalletUnlocked(true)}
        onLock={() => setWalletUnlocked(false)}
        onUpdateWalletPassword={handleUpdateWalletPassword}
        onClose={() => {
          setShowWalletModal(false);
          setWalletUnlocked(false);
        }}
        onConvert={handleConvertWallet}
        onOpenRecharge={() => {
          setShowWalletModal(false);
          setShowRechargeModal(true);
        }}
      />

      {user.uid === '100001' && (
        <RechargeModal
          isOpen={showRechargeModal}
          user={user}
          directory={uidDirectory.filter((entry) => entry.uid !== user.uid)}
          history={rechargeHistory}
          isWalletUnlocked={walletUnlocked}
          onUnlockWallet={() => setWalletUnlocked(true)}
          onUpdateWalletPassword={handleUpdateWalletPassword}
          onClose={() => {
            setShowRechargeModal(false);
            setWalletUnlocked(false);
          }}
          onRechargeUid={handleRechargeUid}
        />
      )}

      <FamilyModal
        isOpen={showFamilyModal}
        user={user}
        families={families}
        onClose={() => setShowFamilyModal(false)}
        onJoinFamily={handleJoinFamily}
        onLeaveFamily={handleLeaveFamily}
        onCreateFamily={handleCreateFamily}
      />

      <PartyGamesModal
        isOpen={gamesModalState.open}
        initialGame={gamesModalState.game}
        coins={user.coins}
        userName={user.name}
        isRedUser={user.uid === '100001'}
        ranking={gameRanking}
        onClose={() => setGamesModalState((prev) => ({ ...prev, open: false }))}
        onBalanceDelta={handleBalanceDelta}
        onGamePlayed={() => markTaskProgress('game')}
        onRecordWin={handleRecordGameWin}
      />
    </div>
  );
}
