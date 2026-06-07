import os

dc_file = 'src/components/DamageCalculator.tsx'
with open(dc_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update itemNote logic
old_speed_logic = """    myTeam.forEach((myPoke, i) => {
      if (!myPoke || !activeMyIndices.includes(i)) return;
      const myRank = myBattleRanks[i]?.speed || 0;
      const speed = calculateActualSpeed(
        myPoke.base.stats.speed,
        31,
        myPoke.evs.speed,
        getNatureMultiplier(myPoke.nature, 'speed'),
        myRank,
        myPoke.item || 'なし',
        myPoke.ability || 'なし',
        weather
      );
      speedList.push({
        id: `my-${i}`,
        name: myPoke.base.name,
        speed,
        isOpponent: false,
        pokemon: myPoke,
        details: `(努力値${myPoke.evs.speed})`,
        isFaceoff: i === activeMyFaceoffIndex
      });
    });"""

new_speed_logic = """    myTeam.forEach((myPoke, i) => {
      if (!myPoke || !activeMyIndices.includes(i)) return;
      const myRank = myBattleRanks[i]?.speed || 0;
      const speed = calculateActualSpeed(
        myPoke.base.stats.speed,
        31,
        myPoke.evs.speed,
        getNatureMultiplier(myPoke.nature, 'speed'),
        myRank,
        myPoke.item || 'なし',
        myPoke.ability || 'なし',
        weather
      );
      
      let itemNote = '';
      if (myPoke.item === 'こだわりスカーフ') itemNote = ' / スカーフ';
      else if (myPoke.item && (myPoke.item === 'くろいてっきゅう' || myPoke.item.includes('パワー') || myPoke.item === 'きょうせいギプス')) itemNote = ' / 鉄球系';

      speedList.push({
        id: `my-${i}`,
        name: myPoke.base.name,
        speed,
        isOpponent: false,
        pokemon: myPoke,
        details: `(努力値${myPoke.evs.speed}${itemNote})`,
        isFaceoff: i === activeMyFaceoffIndex
      });
    });"""

content = content.replace(old_speed_logic, new_speed_logic)

# 2. Update max-h class
old_scroll_class = """<div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-2 pb-10">"""
new_scroll_class = """<div className="space-y-1.5 max-h-[350px] md:max-h-[500px] overflow-y-auto pr-2 pb-10">"""

content = content.replace(old_scroll_class, new_scroll_class)

with open(dc_file, 'w', encoding='utf-8') as f:
    f.write(content)
