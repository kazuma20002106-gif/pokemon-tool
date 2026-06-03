export const calculateStat = (
  base: number,
  iv: number,
  ev: number,
  level: number,
  natureMultiplier: number,
  isHp: boolean
): number => {
  if (isHp) {
    return Math.floor(((base * 2 + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }
  const stat = Math.floor(((base * 2 + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  return Math.floor(stat * natureMultiplier);
};

export const NATURE_MULTIPLIERS: Record<string, { [key: string]: number }> = {
  "いじっぱり (攻撃↑ 特攻↓)": { attack: 1.1, spAttack: 0.9 },
  "やんちゃ (攻撃↑ 特防↓)": { attack: 1.1, spDefense: 0.9 },
  "ゆうかん (攻撃↑ 素早↓)": { attack: 1.1, speed: 0.9 },
  "さみしがり (攻撃↑ 防御↓)": { attack: 1.1, defense: 0.9 },
  "ひかえめ (特攻↑ 攻撃↓)": { spAttack: 1.1, attack: 0.9 },
  "おっとり (特攻↑ 防御↓)": { spAttack: 1.1, defense: 0.9 },
  "れいせい (特攻↑ 素早↓)": { spAttack: 1.1, speed: 0.9 },
  "うっかりや (特攻↑ 特防↓)": { spAttack: 1.1, spDefense: 0.9 },
  "おくびょう (素早↑ 攻撃↓)": { speed: 1.1, attack: 0.9 },
  "せっかち (素早↑ 防御↓)": { speed: 1.1, defense: 0.9 },
  "ようき (素早↑ 特攻↓)": { speed: 1.1, spAttack: 0.9 },
  "むじゃき (素早↑ 特防↓)": { speed: 1.1, spDefense: 0.9 },
  "ずぶとい (防御↑ 攻撃↓)": { defense: 1.1, attack: 0.9 },
  "のんき (防御↑ 素早↓)": { defense: 1.1, speed: 0.9 },
  "わんぱく (防御↑ 特攻↓)": { defense: 1.1, spAttack: 0.9 },
  "のうてんき (防御↑ 特防↓)": { defense: 1.1, spDefense: 0.9 },
  "おだやか (特防↑ 攻撃↓)": { spDefense: 1.1, attack: 0.9 },
  "おとなしい (特防↑ 防御↓)": { spDefense: 1.1, defense: 0.9 },
  "なまいき (特防↑ 素早↓)": { spDefense: 1.1, speed: 0.9 },
  "しんちょう (特防↑ 特攻↓)": { spDefense: 1.1, spAttack: 0.9 }
};

export const getNatureMultiplier = (natureName: string, statKey: string): number => {
  if (NATURE_MULTIPLIERS[natureName] && NATURE_MULTIPLIERS[natureName][statKey]) {
    return NATURE_MULTIPLIERS[natureName][statKey];
  }
  return 1.0;
};
