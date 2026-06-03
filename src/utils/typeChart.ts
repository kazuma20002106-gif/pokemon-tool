export const TYPE_CHART: Record<string, Record<string, number>> = {
  "ノーマル": { "かくとう": 2, "ゴースト": 0 },
  "ほのお": { "みず": 2, "じめん": 2, "いわ": 2, "ほのお": 0.5, "くさ": 0.5, "こおり": 0.5, "むし": 0.5, "はがね": 0.5, "フェアリー": 0.5 },
  "みず": { "でんき": 2, "くさ": 2, "ほのお": 0.5, "みず": 0.5, "こおり": 0.5, "はがね": 0.5 },
  "くさ": { "ほのお": 2, "こおり": 2, "どく": 2, "ひこう": 2, "むし": 2, "みず": 0.5, "くさ": 0.5, "でんき": 0.5, "じめん": 0.5 },
  "でんき": { "じめん": 2, "でんき": 0.5, "ひこう": 0.5, "はがね": 0.5 },
  "こおり": { "ほのお": 2, "かくとう": 2, "いわ": 2, "はがね": 2, "こおり": 0.5 },
  "かくとう": { "ひこう": 2, "エスパー": 2, "フェアリー": 2, "むし": 0.5, "いわ": 0.5, "あく": 0.5 },
  "どく": { "じめん": 2, "エスパー": 2, "くさ": 0.5, "かくとう": 0.5, "どく": 0.5, "むし": 0.5, "フェアリー": 0.5 },
  "じめん": { "みず": 2, "くさ": 2, "こおり": 2, "どく": 0.5, "いわ": 0.5, "でんき": 0 },
  "ひこう": { "でんき": 2, "こおり": 2, "いわ": 2, "くさ": 0.5, "かくとう": 0.5, "むし": 0.5, "じめん": 0 },
  "エスパー": { "むし": 2, "ゴースト": 2, "あく": 2, "かくとう": 0.5, "エスパー": 0.5 },
  "むし": { "ほのお": 2, "ひこう": 2, "いわ": 2, "くさ": 0.5, "かくとう": 0.5, "じめん": 0.5 },
  "いわ": { "みず": 2, "くさ": 2, "かくとう": 2, "じめん": 2, "はがね": 2, "ノーマル": 0.5, "ほのお": 0.5, "どく": 0.5, "ひこう": 0.5 },
  "ゴースト": { "ゴースト": 2, "あく": 2, "どく": 0.5, "むし": 0.5, "ノーマル": 0, "かくとう": 0 },
  "ドラゴン": { "こおり": 2, "ドラゴン": 2, "フェアリー": 2, "ほのお": 0.5, "みず": 0.5, "くさ": 0.5, "でんき": 0.5 },
  "あく": { "かくとう": 2, "むし": 2, "フェアリー": 2, "ゴースト": 0.5, "あく": 0.5, "エスパー": 0 },
  "はがね": { "ほのお": 2, "かくとう": 2, "じめん": 2, "ノーマル": 0.5, "くさ": 0.5, "こおり": 0.5, "ひこう": 0.5, "エスパー": 0.5, "むし": 0.5, "いわ": 0.5, "ドラゴン": 0.5, "はがね": 0.5, "フェアリー": 0.5, "どく": 0 },
  "フェアリー": { "どく": 2, "はがね": 2, "かくとう": 0.5, "むし": 0.5, "あく": 0.5, "ドラゴン": 0 }
};

export interface TypeMatchups {
  quadWeak: string[];
  weak: string[];
  resist: string[];
  quadResist: string[];
  immune: string[];
}

export const getWeaknesses = (types: string[]): TypeMatchups => {
  const multipliers: Record<string, number> = {};
  
  // Initialize all types with 1.0 multiplier
  Object.keys(TYPE_CHART).forEach(type => {
    multipliers[type] = 1;
  });

  // Apply multipliers from defensive typing
  types.forEach(defenseType => {
    if (TYPE_CHART[defenseType]) {
      Object.keys(TYPE_CHART[defenseType]).forEach(attackType => {
        const mult = TYPE_CHART[defenseType][attackType];
        multipliers[attackType] *= mult;
      });
    }
  });

  const quadWeak: string[] = [];
  const weak: string[] = [];
  const resist: string[] = [];
  const quadResist: string[] = [];
  const immune: string[] = [];

  Object.keys(multipliers).forEach(type => {
    if (multipliers[type] === 4) quadWeak.push(type);
    else if (multipliers[type] === 2) weak.push(type);
    else if (multipliers[type] === 0.5) resist.push(type);
    else if (multipliers[type] === 0.25) quadResist.push(type);
    else if (multipliers[type] === 0) immune.push(type);
  });

  return { quadWeak, weak, resist, quadResist, immune };
};
