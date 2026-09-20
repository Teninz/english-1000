"""Import supported word/POS CEFR facts from local official Oxford PDFs.

Requires Python, pypdf and Node.js. No network requests; source PDFs are not
redistributed. Qualified or conflicting senses are deliberately left unlabelled.
"""
import argparse
from collections import defaultdict
from datetime import date
import hashlib
import json
from pathlib import Path
import re
import subprocess
import unicodedata

from pypdf import PdfReader


def read_entries(pdf, source):
    entries = defaultdict(list)
    for page, sheet in enumerate(PdfReader(pdf).pages, 1):
        pending = ''
        for raw_line in sheet.extract_text().splitlines():
            line = re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', raw_line)).strip()
            if not line or line.startswith(('©', 'The Oxford', '3000, it includes')):
                continue
            pending = (pending + ' ' + line).strip()
            if not re.search(r'\b[ABC][12]$', pending):
                continue
            row, pending = pending, ''
            match = re.match(r'^(.+?)\s+((?:n\.|v\.|adj\.|adv\.|prep\.|pron\.|conj\.|det\.|exclam\.|modal|auxiliary|number|indefinite).*)$', row)
            if not match:
                continue
            word, tail = match.groups()
            if '(' in word or ',' in word:
                continue
            word = re.sub(r'[12]$', '', word).lower()
            for chunk in re.finditer(r'(.*?)([ABC][12])', tail):
                pos_text, level = chunk.groups()
                for pos in re.findall(r'\b(n|v|adj|adv)\.', pos_text):
                    entries[f'{word}|{pos}'].append({'level': level, 'source': source, 'page': page, 'entry': row})
    return entries


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('oxford3000', type=Path)
    parser.add_argument('oxford5000', type=Path)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--output', type=Path)
    parser.add_argument('--checked-at', default=date.today().isoformat())
    args = parser.parse_args()
    # Load only our lexical data; existing CEFR labels are not an input.
    script = '''const fs=require('fs'),vm=require('vm');const c={WordLevels:{lookup:()=>null}};vm.createContext(c);
for(const f of ['words-a.js','words-b.js','ex-ru.js','oxford-a1.js','oxford-a2.js','oxford-b1.js','oxford-b2.js','words-extra.js','program.js','thematic-data.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
console.log(vm.runInContext('JSON.stringify(THEMATIC_WORDS)',c));'''
    groups = json.loads(subprocess.check_output(['node', '-e', script], cwd=args.root, encoding='utf-8'))
    needed = {f'{w[0].lower()}|{w[2]}' for group in groups.values() for w in group}
    entries, sources = defaultdict(list), {}
    for number, pdf in ((3000, args.oxford3000), (5000, args.oxford5000)):
        source = f'oxford{number}'
        sources[source] = {
            'title': f'Oxford {number}',
            'url': f'https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_{number}.pdf',
            'sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(),
        }
        for key, rows in read_entries(pdf, source).items():
            entries[key].extend(rows)
    matched = {key: entries[key][0] for key in sorted(needed) if entries[key] and len({r['level'] for r in entries[key]}) == 1}
    data = {'checkedAt': args.checked_at, 'sources': sources, 'entries': matched}
    js = '// Verified word/POS levels, not card positions. Sources and update procedure: docs/WORD_LEVELS.md.\nconst WordLevels = (() => {\n'
    js += '  const data = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
    js += '''  const lookup = (word, pos) => data.entries[String(word).normalize("NFKC").toLowerCase().trim()+"|"+pos] || null;
  return {...data, lookup};
})();
if(typeof module!=="undefined")module.exports=WordLevels;
'''
    output = args.output or args.root / 'word-levels.js'
    output.write_text(js, encoding='utf-8', newline='\n')
    cards = sum(f'{w[0].lower()}|{w[2]}' in matched for group in groups.values() for w in group)
    print(f'Confirmed: {len(matched)}/{len(needed)} word/POS pairs; {cards}/1000 cards. No label: {1000-cards}.')


if __name__ == '__main__':
    main()
