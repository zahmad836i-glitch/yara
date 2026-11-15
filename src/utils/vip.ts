import { FamilyNameColor } from '../types';

export interface VipTierInfo {
  level: number;
  requiredRecharge: number;
  label: string;
  perk: string;
}

export const VIP_TIERS: VipTierInfo[] = [
  { level: 1, requiredRecharge: 10_000_000, label: 'VIP 1', perk: '10M Recharge Badge' },
  { level: 2, requiredRecharge: 20_000_000, label: 'VIP 2', perk: '20M Recharge Badge' },
  { level: 3, requiredRecharge: 30_000_000, label: 'VIP 3', perk: '30M Recharge Badge' },
  { level: 4, requiredRecharge: 40_000_000, label: 'VIP 4', perk: 'Gold ID Name' },
  {
    level: 5,
    requiredRecharge: 70_000_000,
    label: 'VIP 5',
    perk: 'Red Name & Anti-Block All Rooms',
  },
];

export function calculateVipLevel(totalRecharged = 0, uid?: string): number {
  if (uid === '100001') return 6;
  if (totalRecharged >= 70_000_000) return 5;
  if (totalRecharged >= 40_000_000) return 4;
  if (totalRecharged >= 30_000_000) return 3;
  if (totalRecharged >= 20_000_000) return 2;
  if (totalRecharged >= 10_000_000) return 1;
  return 0;
}

export function getNameColorClass(
  vipLevel = 0,
  uid?: string,
  fallback = 'text-white'
): string {
  const effectiveVip = Math.max(vipLevel, uid === '100001' ? 6 : 0);
  if (effectiveVip >= 5) return 'text-red-500';
  if (effectiveVip === 4) return 'text-amber-400';
  return fallback;
}

export function getFamilyNameColorClass(
  color?: FamilyNameColor,
  familyName?: string
): string {
  if (color === 'red' || familyName?.trim().toLowerCase() === 'jutt') {
    return 'text-red-500';
  }
  if (color === 'gold') {
    return 'text-amber-400';
  }
  return 'text-pink-300';
}

export function getFamilyBadgeClass(
  color?: FamilyNameColor,
  familyName?: string
): string {
  if (color === 'red' || familyName?.trim().toLowerCase() === 'jutt') {
    return 'border-red-500/45 bg-red-500/15 text-red-500';
  }
  if (color === 'gold') {
    return 'border-amber-400/40 bg-amber-400/15 text-amber-300';
  }
  return 'border-pink-400/35 bg-pink-500/15 text-pink-200';
}

export function canBypassRoomBlock(vipLevel = 0, uid?: string): boolean {
  return uid === '100001' || vipLevel >= 5;
}

export function getNextVipInfo(vipLevel: number): VipTierInfo | null {
  return VIP_TIERS.find((t) => t.level === vipLevel + 1) || null;
}

export function formatMillionLabel(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return amount.toLocaleString();
}
