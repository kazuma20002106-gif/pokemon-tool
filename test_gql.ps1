$query = @{
  query = "query { pokemon_v2_pokemon(limit: 5) { id name pokemon_v2_pokemonspecy { pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 11}}) { name } } pokemon_v2_pokemonmoves(where: {pokemon_v2_versiongroup: {name: {_eq: `"scarlet-violet`"}}}) { pokemon_v2_move { pokemon_v2_movenames(where: {language_id: {_eq: 11}}) { name } } } } }"
}
Invoke-RestMethod -Uri "https://beta.pokeapi.co/graphql/v1beta" -Method Post -Body ($query | ConvertTo-Json) -ContentType "application/json" | ConvertTo-Json -Depth 6
