"""Generate responsive photos: python -m pip install Pillow; python scripts/optimize-images.py.

Run from the repository root. Originals in referencia/ stay untouched and are not
needed by the deployed page. EXIF orientation is applied before metadata removal.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/img/photos'
REFERENCES = {
    '020A6174': 'recepcao-alliance-city-america',
    '020A6756': 'fachada-alliance-city-america',
    '020A6761': 'loja-kimonos-alliance',
    '020A6778': 'convivencia-vista-tatame',
    '020A6780': 'bancada-acompanhamento-treinos',
    '020A6800': 'tatame-alliance-city-america',
    '020A6821': 'panorama-tatame-city-america',
    '020A6387': 'turma-infantil-jiu-jitsu',
    '020A6429': 'professor-orientacao-criancas',
    '020A6449': 'coworking-area-convivencia',
    '020A6479': 'demonstracao-tecnica-infantil',
    '020A6509': 'pratica-em-dupla-infantil',
    '020A6514': 'atencao-individual-aluno',
    '020A6559': 'exercicios-tatame-infantil',
    '020A6576': 'roda-aprendizado-infantil',
    '020A6588': 'participacao-turma-infantil',
    '020A6622': 'encontro-area-convivencia',
    '020A6713': 'demonstracao-tecnica-adultos',
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sources = []
    for code, slug in REFERENCES.items():
        matches = list((ROOT / 'referencia').rglob(code + '.jpg'))
        if len(matches) != 1:
            raise FileNotFoundError(f'Expected one reference photo: {code}')
        sources.append((matches[0], slug))
    for name in ['aula-experimental.jpg', 'iniciantes.jpeg', 'intermediarios.jpeg',
                 'avancados.jpg', 'competicao2.jpg', 'no-gi.jpeg', 'time.jpg']:
        sources.append((ROOT / 'assets/img' / name, Path(name).stem))
    for name in ['alexandre', 'christian', 'mauricio', 'wallaf 2']:
        sources.append((ROOT / 'assets/img/professores' / (name + '.jpeg'),
                        'professor-' + name.replace(' 2', '')))
    manifest = {}
    for source, slug in sources:
        with Image.open(source) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
            widths = sorted(set(min(w, image.width) for w in [480, 960, 1600]))
            for width in widths:
                height = round(image.height * width / image.width)
                resized = image.resize((width, height), Image.Resampling.LANCZOS)
                resized.save(OUT / f'{slug}-{width}.webp', quality=78, method=6)
                resized.save(OUT / f'{slug}-{width}.jpg', quality=80, optimize=True, progressive=True)
            manifest[slug] = {'width': image.width, 'height': image.height, 'widths': widths,
                              'source': source.relative_to(ROOT).as_posix()}
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(sources)} photos optimized in {OUT}')


if __name__ == '__main__':
    main()
