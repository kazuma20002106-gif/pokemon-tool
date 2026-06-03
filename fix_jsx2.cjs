const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  '              </div>\r\n\r\n                {/* ダメージ計算エリア */}\r\n                <DamageCalculator myTeam={myTeam} opponent={opponent} />\r\n            )}',
  '                {/* ダメージ計算エリア */}\r\n                <DamageCalculator myTeam={myTeam} opponent={opponent} />\r\n              </div>\r\n            )}'
);
app = app.replace(
  '              </div>\n\n                {/* ダメージ計算エリア */}\n                <DamageCalculator myTeam={myTeam} opponent={opponent} />\n            )}',
  '                {/* ダメージ計算エリア */}\n                <DamageCalculator myTeam={myTeam} opponent={opponent} />\n              </div>\n            )}'
);

fs.writeFileSync('src/App.tsx', app);
console.log("Fixed it.");
