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
  itemNote?: string;
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
  weather: string = "none",
  attackerItem: string = "なし",
  defenderItem: string = "なし"
): DamageResult => {
  // 特性による威力補正
  let finalPower = power;
  if (attackerAbility === "テクニシャン" && power <= 60) {
    finalPower = Math.floor(power * 1.5);
  }
  
  // アイテムによる威力補正 (ちからのハチマキ・ものしりメガネ・パンチグローブ等はMVPスコープ外なら一旦保留でもOKだが、ここで汎用的に扱ってもよい)
  // 今回は最終ダメージに補正をかける「いのちのたま」「たつじんのおび」を処理する

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

  if (immunityReason) {
    return {
      minDamage: 0,
      maxDamage: 0,
      minPercent: 0,
      maxPercent: 0,
      hitsToKO: "無効",
      stabBonus: stab,
      effectiveness: 0,
      weatherBonus,
      immunityReason
    };
  }

  // 最終補正 (いのちのたま、たつじんのおび等)
  let itemMultiplier = 1.0;
  if (attackerItem === "いのちのたま") {
    itemMultiplier = 1.3;
  } else if (attackerItem === "たつじんのおび" && effectiveness > 1) {
    itemMultiplier = 1.2;
  }

  // もくたん・しんぴのしずく等のタイプ強化 (1.2倍)
  const typeBoostingItems: Record<string, string> = {
    "もくたん": "ほのお", "しんぴのしずく": "みず", "じしゃく": "でんき", "きせきのタネ": "くさ",
    "とけないこおり": "こおり", "くろおび": "かくとう", "どくバリ": "どく", "やわらかいすな": "じめん",
    "するどいくちばし": "ひこう", "まがったスプーン": "エスパー", "ぎんのこな": "むし",
    "かたいいし": "いわ", "のろいのおふだ": "ゴースト", "りゅうのキバ": "ドラゴン",
    "くろいメガネ": "あく", "メタルコート": "はがね", "ようせいのはね": "フェアリー",
    "シルクのスカーフ": "ノーマル", "ノーマルジュエル": "ノーマル"
  };
  if (typeBoostingItems[attackerItem] === moveType) {
    if (attackerItem === "ノーマルジュエル") {
      itemMultiplier *= 1.3;
    } else {
      itemMultiplier *= 1.2;
    }
  }

  let minDamage = Math.floor(Math.floor(Math.floor(baseDamage * stab) * effectiveness * 0.85) * weatherBonus * itemMultiplier);
  let maxDamage = Math.floor(Math.floor(Math.floor(baseDamage * stab) * effectiveness * 1.00) * weatherBonus * itemMultiplier);

  // 防御側のアイテム補正（きあいのタスキ）
  let itemNote = undefined;
  if (defenderItem === "きあいのタスキ" && maxDamage >= targetMaxHp) {
    itemNote = "タスキ";
    if (minDamage >= targetMaxHp) minDamage = targetMaxHp - 1;
    if (maxDamage >= targetMaxHp) maxDamage = targetMaxHp - 1;
  }

  // 確定◯発の計算
  const hitsToKORaw = minDamage > 0 ? Math.ceil(targetMaxHp / Math.min(maxDamage, targetMaxHp)) : 99;
  let hitsToKO = hitsToKORaw <= 1 ? "確定1発" : hitsToKORaw === 2 ? "確定2発" : hitsToKORaw === 3 ? "確定3発" : "3発以上";

  if (hitsToKORaw > 1 && maxDamage >= targetMaxHp) {
    hitsToKO = `乱数1発`;
  }

  if (itemNote === "タスキ" && hitsToKO.includes("1発")) {
    hitsToKO = "確定2発";
  }

  return {
    minDamage: Math.min(minDamage, targetMaxHp),
    maxDamage: Math.min(maxDamage, targetMaxHp),
    minPercent: Math.min(Math.floor((minDamage / targetMaxHp) * 1000) / 10, 100),
    maxPercent: Math.min(Math.floor((maxDamage / targetMaxHp) * 1000) / 10, 100),
    hitsToKO,
    stabBonus: stab,
    effectiveness,
    weatherBonus,
    immunityReason,
    itemNote
  };
};
