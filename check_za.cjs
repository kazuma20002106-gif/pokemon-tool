const https = require('https');
const query = JSON.stringify({
  query: `{ pokemon_v2_pokemon(limit: 1, where: {name: {_eq: "pikachu"}}) { pokemon_v2_pokemonmoves(where: {pokemon_v2_versiongroup: {name: {_eq: "legends-za"}}}) { pokemon_v2_move { name } } } }`
});
const req = https.request({
  hostname: 'beta.pokeapi.co',
  path: '/graphql/v1beta',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log(JSON.stringify(JSON.parse(d), null, 2)));
});
req.write(query);
req.end();
