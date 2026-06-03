const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/items.json', 'utf8'));

data['いのちのたま'] = '技の威力が1.3倍になるが、攻撃後に最大HPの1/10のダメージを受ける。';
data['たつじんのおび'] = '効果バツグンの技を出したとき、威力が1.2倍になる。';
data['とつげきチョッキ'] = '特防が1.5倍になるが、変化技が出せなくなる。';
data['パンチグローブ'] = 'パンチ系の技の威力が1.1倍になり、直接攻撃でなくなる。';
data['ものしりメガネ'] = '特殊技の威力が1.1倍になる。';
data['ちからのハチマキ'] = '物理技の威力が1.1倍になる。';

fs.writeFileSync('src/data/items.json', JSON.stringify(data, null, 2));
