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

export const applyStatRank = (stat: number, rank: number): number => {
  if (rank === 0) return stat;
  const clampedRank = Math.max(-6, Math.min(6, rank));
  const num = Math.max(2, 2 + clampedRank);
  const den = Math.max(2, 2 - clampedRank);
  return Math.floor(stat * num / den);
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

export const calculateActualSpeed = (
  baseSpeed: number,
  iv: number,
  ev: number,
  natureMultiplier: number,
  rank: number,
  item: string,
  ability: string,
  weather: string
): number => {
  let speed = calculateStat(baseSpeed, iv, ev, 50, natureMultiplier, false);
  speed = applyStatRank(speed, rank);

  

  if (item === 'こだわりスカーフ') {
    speed = Math.floor(speed * 1.5);
  } else if (item === 'くろいてっきゅう' || item === 'きょうせいギプス' || item === 'パワーリスト' || item === 'パワーベルト' || item === 'パワーレンズ' || item === 'パワーバンド' || item === 'パワーアンクル' || item === 'パワーウエイト') {
    speed = Math.floor(speed * 0.5);
  }

  if (ability === 'すいすい' && weather === 'rain') {
    speed = Math.floor(speed * 2);
  } else if (ability === 'ようりょくそ' && weather === 'sun') {
    speed = Math.floor(speed * 2);
  } else if (ability === 'すなかき' && weather === 'sandstorm') {
    speed = Math.floor(speed * 2);
  } else if (ability === 'ゆきかき' && weather === 'snow') {
    speed = Math.floor(speed * 2);
  } else if (ability === 'はやあし') {
    // simplified for now, assuming status is active if we really want to check it, but let's just leave it out if we don't have status toggle
  }

  // 麻痺の場合は 0.5倍 になるが、今回は一旦未実装とする

  return speed;
};
