import { TYPE_CHART } from './typeChart';

export interface DamageResult {
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
  hitsToKO: string;
}

export const getEffectiveness = (moveType: string, targetTypes: string[]): number => {
  if (!moveType || !TYPE_CHART[moveType]) return 1;
  let multiplier = 1;
  for (const tType of targetTypes) {
    if (TYPE_CHART[moveType].weak.includes(tType)) multiplier *= 2;
    if (TYPE_CHART[moveType].resist.includes(tType)) multiplier *= 0.5;
    if (TYPE_CHART[moveType].immune.includes(tType)) multiplier *= 0;
  }
  return multiplier;
};

export const calculateDamage = (
  level: number,
  power: number,
  attackStat: number,
  defenseStat: number,
  moveType: string,
  attackerTypes: string[],
  targetTypes: string[],
  targetMaxHp: number
): DamageResult => {
  // 基本ダメージ: ((2 * L / 5 + 2) * Power * A / D) / 50 + 2
  const baseDamage = Math.floor(Math.floor(Math.floor((2 * level) / 5 + 2) * power * attackStat / defenseStat) / 50) + 2;

  // タイプ一致ボーナス (STAB)
  const stab = attackerTypes.includes(moveType) ? 1.5 : 1.0;
  
  // タイプ相性
  const effectiveness = getEffectiveness(moveType, targetTypes);

  // Modifier = STAB * Effectiveness
  const modifier = stab * effectiveness;

  // 乱数 (0.85 ~ 1.0)
  const minDamage = Math.floor(Math.floor(baseDamage * modifier) * 0.85);
  const maxDamage = Math.floor(Math.floor(baseDamage * modifier) * 1.00);

  const minPercent = (minDamage / targetMaxHp) * 100;
  const maxPercent = (maxDamage / targetMaxHp) * 100;

  // 確定数 (例: 確定1発, 乱数2発など)
  let hitsToKO = "";
  if (minPercent >= 100) {
    hitsToKO = "確定1発";
  } else if (maxPercent >= 100) {
    // Calculate chance
    // This is a simplified chance based on 16 possible random rolls (0.85 to 1.00 in increments of ~0.01 in real game, simplified here)
    const threshold = targetMaxHp;
    // (max - threshold) / (max - min) roughly
    const chance = Math.floor(((maxDamage - threshold + 1) / (maxDamage - minDamage + 1)) * 100);
    hitsToKO = `乱数1発 (${chance}%)`;
  } else if (minPercent >= 50) {
    hitsToKO = "確定2発";
  } else if (maxPercent >= 50) {
    hitsToKO = "乱数2発";
  } else if (minPercent >= 33.3) {
    hitsToKO = "確定3発";
  } else {
    hitsToKO = "3発以上";
  }

  return {
    minDamage,
    maxDamage,
    minPercent: Number(minPercent.toFixed(1)),
    maxPercent: Number(maxPercent.toFixed(1)),
    hitsToKO
  };
};
