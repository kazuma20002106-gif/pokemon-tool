const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// I need to wrap it or move it.
// Let's replace the broken part:
//               </div>
//                 {/* ダメージ計算エリア */}
//                 <DamageCalculator myTeam={myTeam} opponent={opponent} />
//             )}

const broken = `
              </div>
                {/* ダメージ計算エリア */}
                <DamageCalculator myTeam={myTeam} opponent={opponent} />
            )}
`;

const fixed = `
                {/* ダメージ計算エリア */}
                <DamageCalculator myTeam={myTeam} opponent={opponent} />
              </div>
            )}
`;

app = app.replace(broken, fixed);

fs.writeFileSync('src/App.tsx', app);
console.log("Fixed JSX syntax error!");
