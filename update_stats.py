import os

calc_file = 'src/utils/statsCalc.ts'
with open(calc_file, 'r', encoding='utf-8') as f:
    content = f.read()

new_func = """
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

  let modifier = 4096; // using 4096 base for fractional math if needed, but simple float works too

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
"""

if "calculateActualSpeed" not in content:
    content += new_func

with open(calc_file, 'w', encoding='utf-8') as f:
    f.write(content)
