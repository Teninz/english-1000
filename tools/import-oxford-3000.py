"""Import the full Oxford 3000 list (A1–B2) from the official PDF into tools/oxford-3000.json.

Requires Python and pypdf. No network requests; the PDF is not redistributed.
Output units: [word, pos, level, sense, page]. `sense` is Oxford's own qualifier for
split headwords ("bank (money)" -> "money"); homograph numbers ("can1", "can2") are
kept as sense "1"/"2" only when Oxford gives no wording, so keys stay unique.
"""
import argparse
from collections import Counter
from datetime import date
import hashlib
import json
from pathlib import Path
import re
import unicodedata

from pypdf import PdfReader

POS_RE = (r'(?:n\.|v\.|adj\.|adv\.|prep\.|pron\.|conj\.|det\.|exclam\.|modal v\.|auxiliary v\.|'
          r'number|indefinite article|definite article|infinitive marker|linking v\.)')
POS_MAP = {'n.': 'n', 'v.': 'v', 'adj.': 'adj', 'adv.': 'adv', 'prep.': 'prep', 'pron.': 'pron',
           'conj.': 'conj', 'det.': 'det', 'exclam.': 'int', 'modal v.': 'modal', 'auxiliary v.': 'aux',
           'number': 'num', 'indefinite article': 'det', 'definite article': 'det',
           'infinitive marker': 'part', 'linking v.': 'v'}


def read_rows(pdf):
    rows = []
    for page, sheet in enumerate(PdfReader(pdf).pages, 1):
        pending = ''
        for raw in sheet.extract_text().splitlines():
            line = re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', raw)).strip()
            if not line or line.startswith(('©', 'The Oxford', '3000, it includes')):
                continue
            pending = (pending + ' ' + line).strip()
            if not re.search(r'\b[ABC][12]$', pending):
                continue
            rows.append((page, pending))
            pending = ''
    return rows


# Typos in the PDF itself, checked against oxfordlearnersdictionaries.com entries.
ROW_FIXES = {'produce v. A2, v. B2': 'produce v. A2, n. B2'}


def parse_units(rows):
    units = []
    for page, row in rows:
        row = ROW_FIXES.get(row, row)
        match = re.match(r'^(.+?)\s+(' + POS_RE + r'.*)$', row)
        if not match:
            raise SystemExit(f'Unparsed row: {row}')
        head, tail = match.groups()
        sense = None
        qualifier = re.search(r'\(([^)]*)\)\s*$', head)
        if qualifier:
            sense = qualifier.group(1).strip()
            head = head[:qualifier.start()].strip()
        number = re.search(r'(\d)$', head)
        if number:
            head = head[:number.start()]
            sense = sense or number.group(1)
        word = head.strip().lower()
        if word == 'a, an':
            word = 'a'
        for chunk in re.finditer(r'(.*?)([ABC][12])', tail):
            pos_text, level = chunk.groups()
            poses = re.findall(POS_RE, pos_text)
            if not poses:
                raise SystemExit(f'No part of speech in: {row}')
            for pos in poses:
                units.append([word, POS_MAP[pos], level, sense, page])
    return units


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pdf', type=Path)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parent / 'oxford-3000.json')
    parser.add_argument('--checked-at', default=date.today().isoformat())
    args = parser.parse_args()
    units = parse_units(read_rows(args.pdf))
    keys = Counter(f"{w}|{p}" + (f"|{s}" if s else '') for w, p, _, s, _ in units)
    duplicates = [k for k, n in keys.items() if n > 1]
    if duplicates:
        raise SystemExit(f'Duplicate keys: {duplicates}')
    data = {
        'checkedAt': args.checked_at,
        'source': {
            'title': 'The Oxford 3000',
            'url': 'https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_3000.pdf',
            'sha256': hashlib.sha256(args.pdf.read_bytes()).hexdigest(),
        },
        'fields': ['word', 'pos', 'level', 'sense', 'page'],
        'units': units,
    }
    args.output.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8', newline='\n')
    levels = Counter(u[2] for u in units)
    print(f'{len(units)} units, {len(set(u[0] for u in units))} headwords: ' +
          ', '.join(f'{k} {levels[k]}' for k in ('A1', 'A2', 'B1', 'B2')))


if __name__ == '__main__':
    main()
