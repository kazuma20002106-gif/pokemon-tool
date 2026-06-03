import { TYPE_CHART } from './typeChart';

export interface DamageResult {
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
  hitsToKO: string;
  stabBonus: number;
  effectiveness: number;
  weatherBonus: number;
  immunityReason?: string;
}

export const getEffectiveness = (moveType: string, targetTypes: string[]): number => {
  if (!moveType) return 1;
  let multiplier = 1;
  for (const tType of targetTypes) {
    if (TYPE_CHART[tType] && TYPE_CHART[tType][moveType] !== undefined) {
      multiplier *= TYPE_CHART[tType][moveType];
    }
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
  targetMaxHp: number,
  attackerAbility: string = "",
  defenderAbilities: string[] = [],
  weather: string = "none"
): DamageResult => {
  // 特性による威力補正
  let finalPower = power;
  if (attackerAbility === "テクニシャン" && power <= 60) {
    finalPower = Math.floor(power * 1.5);
  }

  // 基本ダメージ: ((2 * L / 5 + 2) * Power * A / D) / 50 + 2
  const baseDamage = Math.floor(Math.floor(Math.floor((2 * level) / 5 + 2) * finalPower * attackStat / defenseStat) / 50) + 2;

  // タイプ一致ボーナス (STAB)
  let stab = attackerTypes.includes(moveType) ? 1.5 : 1.0;
  if (attackerAbility === "てきおうりょく" && stab > 1.0) {
    stab = 2.0;
  }
  
  // タイプ相性
  const effectiveness = getEffectiveness(moveType, targetTypes);

  // 特性による無効化判定
  let immunityReason = undefined;
  if (effectiveness === 0) {
    immunityReason = 'type';
  } else if (moveType === 'じめん' && defenderAbilities.includes('ふゆう')) {
    immunityReason = 'ふゆう';
  } else if (moveType === 'じめん' && defenderAbilities.includes('どしょく')) {
    immunityReason = 'どしょく';
  } else if (moveType === 'みず' && (defenderAbilities.includes('ちょすい') || defenderAbilities.includes('よびみず') || defenderAbilities.includes('かんそうはだ'))) {
    immunityReason = defenderAbilities.find(a => ['ちょすい', 'よびみず', 'かんそうはだ'].includes(a));
  } else if (moveType === 'ほのお' && defenderAbilities.includes('もらいび')) {
    immunityReason = 'もらいび';
  } else if (moveType === 'でんき' && (defenderAbilities.includes('ちくでん') || defenderAbilities.includes('ひらいしん') || defenderAbilities.includes('でんきエンジン'))) {
    immunityReason = defenderAbilities.find(a => ['ちくでん', 'ひらいしん', 'でんきエンジン'].includes(a));
  } else if (moveType === 'くさ' && defenderAbilities.includes('そうしょく')) {
    immunityReason = 'そうしょく';
  }

  // 天候ボーナス
  let weatherBonus = 1.0;
  if (weather === "sun") {
    if (moveType === "ほのお") weatherBonus = 1.5;
    if (moveType === "みず") weatherBonus = 0.5;
  } else if (weather === "rain") {
    if (moveType === "みず") weatherBonus = 1.5;
    if (moveType === "ほのお") weatherBonus = 0.5;
  }

  // Modifier = STAB * Effectiveness * Weather
  const modifier = immunityReason ? 0 : (stab * effectiveness * weatherBonus);

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
    hitsToKO,
    stabBonus: stab,
    effectiveness: immunityReason ? 0 : effectiveness,
    weatherBonus,
    immunityReason
  };
};
