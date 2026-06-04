import urllib.request
import json
import time

req = urllib.request.Request('https://pokeapi.co/api/v2/pokemon?limit=10000', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode('utf-8'))

megas = [m for m in data['results'] if '-mega' in m['name'] or '-primal' in m['name']]
res = {}

for m in megas:
    p_id = m['url'].split('/')[-2]
    base_name = m['name'].split('-')[0]
    # Special cases
    if base_name == 'mr': base_name = 'mr-mime'
    if base_name == 'ho': base_name = 'ho-oh'
    
    req2 = urllib.request.Request(f'https://pokeapi.co/api/v2/pokemon-species/{base_name}', headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req2) as response2:
            s_data = json.loads(response2.read().decode('utf-8'))
        j_name = next(n['name'] for n in s_data['names'] if n['language']['name'] in ['ja-hrkt', 'ja'])
        
        prefix = 'ゲンシ' if '-primal' in m['name'] else 'メガ'
        suffix = 'X' if '-x' in m['name'] else 'Y' if '-y' in m['name'] else ''
        res[prefix + j_name + suffix] = p_id
    except Exception as e:
        pass
    time.sleep(0.1) # Be nice to API

with open('src/data/megaIds.json', 'w', encoding='utf-8') as f:
    json.dump(res, f, ensure_ascii=False, indent=2)
