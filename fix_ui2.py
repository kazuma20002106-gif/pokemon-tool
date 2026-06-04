import os
import json

selector_file = 'src/components/TeamSelector.tsx'
with open(selector_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix clipping
content = content.replace(
"""      <div className="flex gap-2 overflow-x-auto pb-2 snap-x">""",
"""      <div className="flex gap-2 overflow-x-auto py-2 px-2 snap-x">"""
)

# Fix mega image src
content = content.replace(
"""import { Plus, X, Search } from 'lucide-react';
import { MyPokemon, Pokemon } from './PokemonDetailModal';""",
"""import { Plus, X, Search } from 'lucide-react';
import { MyPokemon, Pokemon } from './PokemonDetailModal';
import megaIds from '../data/megaIds.json';"""
)

content = content.replace(
"""                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.base.id}.png`}
                  alt={poke.base.name}""",
"""                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${(megaIds as any)[poke.base.name] || poke.base.id}.png`}
                  alt={poke.base.name}"""
)

with open(selector_file, 'w', encoding='utf-8') as f:
    f.write(content)
