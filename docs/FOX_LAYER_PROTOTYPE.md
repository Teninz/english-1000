# Послойный прототип лисёнка — 15 сентября 2026

Результат этапа — редактируемая сборка из 12 слоёв и пятисекундная проба движения. Это исходники для дальнейшей работы, **не финальная анимация и не замена ресурсов APK**.

## Что сохранено

Все результаты находятся в `tools/companion-source/layer-prototype-v1/`:

- `parts-master-2k.png` — 16 деталей на прозрачном листе 2048×2048.
- `parts/` и `parts.json` — отдельные исходные объекты и измеренные границы.
- `layers/` и `rig.json` — 12 слоёв на общем холсте 256×256, порядок наложения, центры вращения и предварительные точки крепления одежды.
- `fox-layer-master.ora` — редактируемый OpenRaster-файл со слоями.
- `assembled.png` — сборка в исходной позе.
- `motion-study.png` — анимированный PNG, 100 кадров по 50 мс.
- `atlas-0.webp` … `atlas-3.webp` — четыре атласа по 25 кадров, каждый 1280×1280.
- `animation.json`, `validation.json`, `provenance.json` — параметры и результаты проверки.
- `preview.html` — автономный просмотр с паузой, ползунком и замедлением; генерируется локально и не хранится в Git.
- `frames/` — 100 исходных PNG; воспроизводимы скриптом и исключены из Git.

Пересборка без API-запросов:

```powershell
python tools/build-fox-layer-prototype.py
```

Нужен Pillow из `tools/requirements-art.txt`. Скрипт читает сохранённый прозрачный мастер, поэтому сетевой доступ и API-ключ не нужны.

## Генерация и фактический размер

Для исходного листа выполнен один успешный вызов штатного imagegen CLI с `--model gpt-image-2 --quality high --size 1536x1024`. Ранее запрос `gpt-image-2.5-sunburst` был отвергнут сервером как неизвестная модель. Название фактической серверной модели независимо не подтверждалось; в отчёте фиксируется отправленный идентификатор.

API вернул **1225×1284**, несмотря на запрошенный размер. Оригинал сохранён без изменений в `tools/companion-source/fox-layer-master-sheet-v1-source.png`, зелёный фон удалён штатным `remove_chroma_key.py`, результат — `fox-layer-master-sheet-v1-alpha.png`.

Лист 2048×2048 получен локальной перепаковкой целых объектов в ячейки 512×512. Это не новая генерация и не увеличение детализации. Исходный файл в `output/imagegen/` также сохранён.

Промпт успешного запроса:

```text
Use case: stylized-concept
Asset type: production master sheet for a layered 2D pixel-art mobile companion
Primary request: create one economical packed sheet containing reusable separated parts and expression variants for the exact ShadowFox fox from the input reference
Input image: reference-keyframes-preview.png is the exact character identity, palette, proportions and animation pose reference
Scene/backdrop: perfectly flat solid chroma green background #00FF00, no shadows and no texture
Subject: one consistent dark blue-gray fox with amber eyes, burnt-orange chest fur, orange scarf and maple leaf
Style/medium: crisp polished pixel art, intentional pixel clusters, no antialias blur
Composition/framing: a clean 4 by 4 inventory grid with generous empty spacing; each cell contains exactly one isolated reusable object, centered and fully visible: neutral head, happy raised head, blink eyes, focused eyes, left ear, right ear, neutral muzzle, smiling muzzle, seated body without head, chest patch, neutral tail, lifted tail, scarf, maple leaf, front legs, rear body. Same scale and perspective, three-quarter front view. No grid lines and no labels.
Constraints: preserve character identity exactly; objects must not overlap; every object complete with padding; stable palette; flat green visible between every object; no text; no watermark
Avoid: full duplicate foxes, cropped objects, merged parts, lighting changes, gradients, extra accessories, bowls, clothes, background scenery
```

## Проверка

- Найдено 16 целых объектов по связным областям, без разрезания по условной сетке.
- Выделены 12 непустых слоёв: хвост, тело, грудка, передние лапы, шарф, голова, два уха, две области глаз, морда, лист.
- Проверено точное восстановление исходных частей из непересекающихся масок до добавления пробных припусков на стыках.
- Во всех 100 кадрах выдержано прозрачное поле 16 px.
- Кадры 0 и 99 совпадают попиксельно; всего 99 разных кадров.
- Экспортированный APNG имеет 100 кадров и длительность 5000 мс, декодированные кадры совпадают с исходными.
- Декодированные WebP-атласы совпадают с кадрами при наложении на непрозрачный фон.
- Четыре WebP-атласа суммарно занимают около 3,1 МБ. Это размер файлов, не расход оперативной памяти.

## Ограничения и следующий проход

Движение запечено из преобразований отдельных частей, а не дорисовано в 100 новых позах. Раздельные глаза и морда пока следуют черепу; моргание, движение зрачков и радостная мимика ещё не реализованы. В области груди и основания ушей возможны заметные швы: скрытую шерсть надо дорисовать.

Пропорции нового сборного персонажа отличаются от утверждённого эталона. Перед подключением в APK нужно согласовать их по силуэту, дорисовать закрытые области, подготовить варианты век и морды, обеспечить плавные переходы между ними. Поворот головы нельзя заменить простым вращением плоской детали.

Точки `head`, `body`, `gear` — пока разметка для будущего гардероба. Деформации одежды и одновременное ношение трёх предметов не проверялись.

Исходные картинки и этот прототип находятся в `tools/`, который не копируется сборщиком в APK. Рабочие APNG, уроки, прогресс, имя компаньона и виджет этим этапом не изменены. Плавность и потребление памяти на телефоне ещё не измерены.
