const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

if (!app.includes('import { DamageCalculator }')) {
  app = app.replace(
    "import { TypeBadge } from './components/TypeBadge';",
    "import { TypeBadge } from './components/TypeBadge';\nimport { DamageCalculator } from './components/DamageCalculator';"
  );
}

const insertionPoint = '                </div>\n              </div>\n            )}\n          </div>\n        </section>';
const componentStr = '\n                {/* ダメージ計算エリア */}\n                <DamageCalculator myTeam={myTeam} opponent={opponent} />\n';

app = app.replace(
  insertionPoint,
  '                </div>\n              </div>\n' + componentStr + '            )}\n          </div>\n        </section>'
);

fs.writeFileSync('src/App.tsx', app);
console.log("App.tsx updated with DamageCalculator!");
