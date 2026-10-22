# ShadowFox Eng — осенние UI-ассеты

Создано встроенным инструментом **image_gen**, 22 октября 2026 года.
Исключение — `paper-light.webp`: равномерное зерно модели не даётся, поэтому текстура посчитана
процедурно (шум с заворотом по краям), за счёт чего тайлится точно и несёт настоящую альфу.
Ровно 14 изображений; код приложения не менялся, ничего не подключено.

Откройте [preview.html](preview.html) прямо с диска, без сервера и интернета.
Все ассеты показаны на фоне #14171C и #F6F1EA. Бумага и искры дополнительно показаны реальным повторением 2×2, с масштабом 1:1 и необязательным указателем стыков.

## Файлы

Размеры относятся к итоговым WebP. Вес: 1 КиБ = 1024 байта.

| Файл | Размер, px | Вес, КиБ | Альфа | Назначение |
| --- | --- | ---: | :---: | --- |
| [paper-dark.webp](paper-dark.webp) | 512×512 | 35.89 | да | Мелкое бумажное зерно для тёмной поверхности |
| [paper-light.webp](paper-light.webp) | 512×512 | 40.73 | да | Мелкое бумажное зерно для бежевой поверхности |
| [hero-dark.webp](hero-dark.webp) | 1200×600 | 11.98 | — | Мягкое осеннее боке для тёмной главной карточки |
| [hero-light.webp](hero-light.webp) | 1200×600 | 8.46 | — | Мягкое осеннее боке для светлой главной карточки |
| [leaf-maple.webp](leaf-maple.webp) | 512×512 | 40.06 | да | Один кленовый лист: угловой декор карточек |
| [leaf-oak.webp](leaf-oak.webp) | 512×512 | 39.54 | да | Один дубовый лист: угловой декор карточек |
| [leaf-birch.webp](leaf-birch.webp) | 512×512 | 29.14 | да | Один берёзовый лист: угловой декор карточек |
| [leaf-rowan.webp](leaf-rowan.webp) | 512×512 | 56.19 | да | Один сложный лист рябины, без ягод и древесной ветки |
| [milestone-bronze.webp](milestone-bronze.webp) | 256×256 | 15.92 | да | Бронзовая веха Пути Oxford 3000 с лавровой ветвью |
| [milestone-silver.webp](milestone-silver.webp) | 256×256 | 15.74 | да | Серебряная веха Пути Oxford 3000 с лавровой ветвью |
| [milestone-gold.webp](milestone-gold.webp) | 256×256 | 15.75 | да | Золотая веха Пути Oxford 3000 с лавровой ветвью |
| [empty-done.webp](empty-done.webp) | 800×600 | 84.99 | да | Всё повторено: вечерняя поляна с тёплым фонарём |
| [empty-friends.webp](empty-friends.webp) | 800×600 | 100.08 | да | Пока нет друзей: две пустые скамейки у тропинки |
| [sparks.webp](sparks.webp) | 1024×1024 | 44.21 | да | Редкие мягкие тёплые точки света для фонового слоя |

**Изображения: 551 620 байт (538.69 КиБ).**

## CSS-примеры для каждого файла

Ниже только примеры для будущего ручного подключения. Пути предполагают CSS в корне проекта; при переносе правил скорректируйте url(). Декоративным img задавайте пустой alt, а смысл пустого состояния сообщайте обычным текстом интерфейса.

Бумага на отдельном декоративном слое — так прозрачность не затрагивает текст:

~~~css
.paper-card { position: relative; isolation: isolate; overflow: hidden; background: #1F232B; }
.paper-card::before {
  content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-repeat: repeat; background-size: 512px 512px;
}
.paper-card.dark::before { background-image: url("art/ui/paper-dark.webp"); opacity: .16; }
.paper-card.light { background: #F6F1EA; }
.paper-card.light::before { background-image: url("art/ui/paper-light.webp"); opacity: .20; }
~~~

Подложки hero, с приглушёнными пятнами света под отдельным текстовым слоем:

~~~css
.hero { position: relative; isolation: isolate; overflow: hidden; background: #1F232B; }
.hero::before {
  content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-position: center; background-size: cover; background-repeat: no-repeat;
}
.hero.dark::before { background-image: url("art/ui/hero-dark.webp"); opacity: .38; }
.hero.light { background: #F6F1EA; }
.hero.light::before { background-image: url("art/ui/hero-light.webp"); opacity: .28; }
~~~

Листья — по одному объекту на файл. Рябина: один ботанически сложный лист с парными листочками, без ягод и древесной ветки.

~~~css
.leaf { width: 72px; height: 72px; background: center / contain no-repeat; pointer-events: none; opacity: .65; }
.leaf.maple { background-image: url("art/ui/leaf-maple.webp"); }
.leaf.oak { background-image: url("art/ui/leaf-oak.webp"); }
.leaf.birch { background-image: url("art/ui/leaf-birch.webp"); }
.leaf.rowan { background-image: url("art/ui/leaf-rowan.webp"); }
~~~

Вехи с прозрачными полями, без цифр и надписей:

~~~css
.milestone { width: 64px; height: 64px; background: center / contain no-repeat; }
.milestone.bronze { background-image: url("art/ui/milestone-bronze.webp"); }
.milestone.silver { background-image: url("art/ui/milestone-silver.webp"); }
.milestone.gold { background-image: url("art/ui/milestone-gold.webp"); }
~~~

Пейзажные виньетки с прозрачным фоном:

~~~css
.empty-art { width: min(100%, 400px); aspect-ratio: 4 / 3; background: center / contain no-repeat; }
.empty-art.done { background-image: url("art/ui/empty-done.webp"); }
.empty-art.friends { background-image: url("art/ui/empty-friends.webp"); }
~~~

Искры — спокойный повторяемый фон:

~~~css
.spark-surface { position: relative; isolation: isolate; background: #14171C; }
.spark-surface::before {
  content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: url("art/ui/sparks.webp") repeat;
  background-size: 1024px 1024px; opacity: .30;
}
~~~

## Производство и проверка

- Встроенный image_gen, отдельный вызов для каждого изображения. Внешний API не использован.
- Генерация с запасом разрешения; экспорт в точные заданные размеры. Ради веса размеры не уменьшались.
- WebP: quality 82 для декора, светлой бумаги, hero и искр; quality 75 для тёмной бумаги, quality 70 для двух пейзажей; method 6. Качество альфа-канала 85, для едва заметного зерна тёмной бумаги — 50. Настоящая прозрачность и мягкие края сохранены; белая или чёрная подложка не добавлялась.
- Все 14 итоговых WebP повторно декодированы. Размеры проверены; альфа проверена по реальным прозрачным и полупрозрачным пикселям.
- Декор просмотрен на тёмном и светлом фоне. Бумага и искры проверены сеткой 2×2 из экспортированных файлов.
- В изображениях нет текста, цифр, логотипов, персонажей и предметов лисьего домика.
- paper-light перегенерирован один раз: на первой сетке 2×2 был заметен перепад яркости у границ. Итоговая светлая бумага очень слабо контрастна; резких швов при повторении не видно.
- paper-dark перегенерирован три раза: в непрозрачных вариантах оставалась полоса от неравномерного освещения. Итог — прозрачное тонкое зерно поверх тёмной поверхности, без собственного перепада фоновой яркости. Его нужно класть на #1F232B или #14171C. На светлом фоне тёмное зерно заметнее, для светлой темы предназначен paper-light.
- Остальные 12 изображений повторно генерировать не потребовалось. Пейзажи дополнительно сжаты качеством 70; размеры остались 800×600.
- Итоговые бумага и искры повторно просмотрены сеткой 2×2. Резких стыков и обрезанных частиц не видно.
- Тёмная бумага намеренно имеет альфа-канал: цвет поверхности задаёт интерфейс, а файл добавляет только слабое зерно. Остальные заявленные прозрачные изображения также имеют настоящую альфу.
- Превью проверено статически: все локальные ссылки, 28 показов 14 WebP, заявленные размеры, CSS замощения и синтаксис встроенного JavaScript. Браузерная визуальная проверка не выполнена: запуск Puppeteer заблокирован окружением (EPERM), открытие file:// через browser-use отклонено политикой безопасности. Сами итоговые изображения просмотрены отдельно, включая сетки 2×2.
- GNU du в этом Windows-окружении завершился ошибкой CreateFileMapping (доступ запрещён). Размер проверен суммой фактических длин всех 16 файлов и Windows GetCompressedFileSizeW; лимит 600 000 байт соблюдён.

## Промпты итоговых генераций

Полные промпты встроенного image_gen сохранены для воспроизводимости направления. Повторный вызов генератора не гарантирует идентичные пиксели.

<details>
<summary>14 итоговых промптов</summary>

### paper-dark.webp

~~~text
Use case: stylized-concept. Generate ONE truly TRANSPARENT tile of fine delicate paper grain, to overlay a dark charcoal #1F232B UI surface. Target 512x512 square, actual alpha channel. IMPORTANT: do NOT render the charcoal surface itself. All empty space must be fully alpha=0 with no painted background, no broad shading or gradients. Only fine tiny scattered soft PAPER FIBERS and 1-pixel micrograin specks, muted gray #A3A8B3 with very low semitransparent opacity. Texture should be barely perceptible over dark UI, not dust motes, not sparks, not large scratches. Uniformly distributed isotropic micro-fibers with a fully TRANSPARENT 24-pixel safety margin on all four edges, fading fine micrograin gently into this margin; no clipped fibers. This creates a seamless tiling overlay with no edge brightness mismatch. Do not create large cloudy translucent paint areas. Full sheet of extremely faint fine micrograin only. No text, letters, digits, logos, objects, border or characters.
~~~

### paper-light.webp

~~~text
Use case: stylized-concept. Production UI texture, ONE square perfectly seamless paper-light tile. Target 512x512. CRITICAL: previous generation had edge brightness differences when repeated 2x2; eliminate all lighting variation. It must look almost like a FLAT SOLID fill warm beige #F6F1EA (RGB 246,241,234), with only barely perceptible fine paper micrograin of plus/minus ONE RGB level at most. No visible diagonal fibers. Absolutely uniform average color in every region. No light source, no shading, no vignette, no gradient, no darkened corners or center, no uneven exposure. All four edges and 32-pixel boundary strips must match the same uniform base color seamlessly, smoothly entering microscopic interior grain without visible bands. True seamless tile repeated horizontally and vertically, no border. Texture is under UI text; prioritize almost invisible grain and uniformity over visible artistry. Entire canvas opaque. No text, letters, digits, logos, symbols, objects, characters or fox.
~~~

### hero-dark.webp

~~~text
Use case: stylized-concept. ONE image hero-dark, horizontal 2:1 composition target 1200x600, an extremely soft defocused autumn evening light bokeh background for a calm learning-app card. Main base charcoal #14171C and #1F232B with muted #2A2F39 haze. Very few dim warm blurred light spots in orange #E8853A and warm peach #F4B070, amber #EFA537, mostly toward outer edges. Quiet dark central negative space for future UI text; no text actually rendered. Soft painterly washes, restrained contrast and saturation, no hard outlines, no distinguishable objects, no trees in focus, no people or fox or house furnishings. Full bleed opaque abstract texture, no text, letters, digits, logos, watermark or border.
~~~

### hero-light.webp

~~~text
Use case: stylized-concept. ONE image hero-light, horizontal 2:1 composition target 1200x600. An extremely soft defocused autumn light bokeh background for a calm learning-app card in light mode. Main base warm cream beige #F6F1EA with muted warm ivory washes. Very few soft broad light spots in pale peach #F4B070, softly muted orange #E8853A, amber #EFA537, restrained saturation and low contrast. Quiet pale central negative space for future dark UI text; no text actually rendered. Soft painterly wash, no distinct objects, no hard outlines, no people or fox or furnishings. Full bleed opaque abstract background. No text, letters, digits, logos, watermark or border.
~~~

### leaf-maple.webp

~~~text
Use case: illustration-story. Generate ONE isolated autumn maple leaf for a quiet autumn-themed learning app, target 512x512 square, TRUE transparent alpha background. A single recognizable five-lobed maple leaf, stem included, gently diagonal and fully within frame with 12% clear padding. Soft painterly gouache and watercolor, delicate veins and softly feathered edges without hard black outlines. Warm muted burnt orange #E8853A, warm amber #EFA537 and golden yellow #F2C230 highlights, subtle warm peach #F4B070. Calm natural organic shape, not shiny 3D or flat vector. One leaf only, no twig, no other objects, no cast ground shadow, no background paint wash. No text, digits, letters, logos, foxes or characters.
~~~

### leaf-oak.webp

~~~text
Use case: illustration-story. Generate ONE isolated autumn leaf for a calm learning app. Target 512x512 square, TRUE transparent alpha background, no opaque backdrop or ground shadow. Soft painterly watercolor and gouache with delicate veins, softly feathered edges, no hard black outline, warm muted autumn palette #E8853A #F4B070 #EFA537 #F2C230. Complete leaf and stem inside frame with 12% transparent padding, gentle diagonal composition. No text, digits, letters, logos, fox, characters or extra objects. Subject: ONE oak leaf with unmistakable rounded lobes along both sides and a short thin stem. Muted copper orange and ochre, slight olive green undertone. Exactly one leaf, not a branch.
~~~

### leaf-birch.webp

~~~text
Use case: illustration-story. Generate ONE isolated autumn leaf for a calm learning app. Target 512x512 square, TRUE transparent alpha background, no opaque backdrop or ground shadow. Soft painterly watercolor and gouache with delicate veins, softly feathered edges, no hard black outline, warm muted autumn palette #E8853A #F4B070 #EFA537 #F2C230. Complete leaf and stem inside frame with 12% transparent padding, gentle diagonal composition. No text, digits, letters, logos, fox, characters or extra objects. Subject: ONE birch leaf, small triangular-ovate pointed shape with fine double-serrated edge and slender short petiole. Mostly soft golden yellow #F2C230 and warm light ochre, subtly amber veins. Exactly one leaf, not a branch.
~~~

### leaf-rowan.webp

~~~text
Use case: illustration-story. Generate ONE isolated autumn leaf for a calm learning app. Target 512x512 square, TRUE transparent alpha background, no opaque backdrop or ground shadow. Soft painterly watercolor and gouache with delicate veins, softly feathered edges, no hard black outline, warm muted autumn palette #E8853A #F4B070 #EFA537 #F2C230. Complete leaf and stem inside frame with 12% transparent padding, gentle diagonal composition. No text, digits, letters, logos, fox, characters or extra objects. Subject: ONE botanically recognizable complete compound rowan leaf (Sorbus aucuparia), a single slender central rachis with 11 narrow serrated leaflets paired along it and a terminal leaflet. This is one compound LEAF, no wood twig, no berries, no extra detached leaves. Muted orange-copper #E8853A, warm amber #EFA537, a few subdued yellow accents. Entire elongated pinnate leaf fits square canvas diagonally.
~~~

### milestone-bronze.webp

~~~text
Use case: stylized-concept. ONE milestone medal icon for a quiet autumn learning app, target 256x256 square. TRUE transparent alpha background. Round circular medallion, straight-on front view, balanced centered silhouette with 12% clear padding. One small curved laurel branch embossed elegantly across the center of a plain circular face, no other central symbol; shallow rim and gentle brushed-metal shading. Hand-painted gouache illustration, softly lit, no hard black outlines, restrained rather than shiny or flashy. No ribbon, no pedestal, no background or ground shadow. Absolutely no text, numbers, letters, logos, stars, fox, characters or furnishings. Material/color: warm antique BRONZE, muted copper #A8683D with autumn orange #E8853A and soft peach #F4B070 highlight, dark brown patina. Clearly bronze, not gold.
~~~

### milestone-silver.webp

~~~text
Use case: stylized-concept. ONE milestone medal icon for a quiet autumn learning app, target 256x256 square. TRUE transparent alpha background. Round circular medallion, straight-on front view, balanced centered silhouette with 12% clear padding. One small curved laurel branch embossed elegantly across the center of a plain circular face, no other central symbol; shallow rim and gentle brushed-metal shading. Hand-painted gouache illustration, softly lit, no hard black outlines, restrained rather than shiny or flashy. No ribbon, no pedestal, no background or ground shadow. Absolutely no text, numbers, letters, logos, stars, fox, characters or furnishings. Material/color: muted soft SILVER, silver-gray #A3A8B3 and warm off-white #F1ECE3 highlights, subtle charcoal #383E4A shadows; tiny warm amber reflected edge. Clearly silver. No gold face.
~~~

### milestone-gold.webp

~~~text
Use case: stylized-concept. ONE milestone medal icon for a quiet autumn learning app, target 256x256 square. TRUE transparent alpha background. Round circular medallion, straight-on front view, balanced centered silhouette with 12% clear padding. One small curved laurel branch embossed elegantly across the center of a plain circular face, no other central symbol; shallow rim and gentle brushed-metal shading. Hand-painted gouache illustration, softly lit, no hard black outlines, restrained rather than shiny or flashy. No ribbon, no pedestal, no background or ground shadow. Absolutely no text, numbers, letters, logos, stars, fox, characters or furnishings. Material/color: subdued antique GOLD, warm amber #EFA537 and soft golden yellow #F2C230, warm peach #F4B070 highlights and muted ochre shadows. Clearly gold, no glitter.
~~~

### empty-done.webp

~~~text
Use case: illustration-story. ONE transparent cutout landscape vignette for a calm autumn learning-app empty state meaning all reviews finished, time to rest. Target 800x600, 4:3 composition, TRUE transparent alpha outside the painted vignette, including upper corners. Scene: small peaceful evening forest clearing with a single warm glowing outdoor lantern resting on a low mossy stone, short grass and a few fallen autumn leaves; distant soft autumn tree silhouettes behind. Self-contained small oval island of landscape, brushy organic irregular silhouette and softly feathered painted edges, NOT a full rectangular scene. Main scene fills 75% width and 70% height with clear transparent margins. Soft painterly gouache/watercolor, muted charcoal blue #1F232B #2A2F39 twilight with #7BC47F subdued moss and warm orange #E8853A, peach #F4B070, amber #EFA537 lantern light. Restrained calm and restful, no bright hard outlines. No humans, no animals, no fox character, no house, no furniture or interior props. No text, numbers, letters, logos, border or watermark. Light glow must have true semitransparent alpha, not black background.
~~~

### empty-friends.webp

~~~text
Use case: illustration-story. ONE transparent cutout landscape vignette for a calm autumn learning-app empty state meaning there are no friends in the ranking yet. Target 800x600, 4:3 composition, TRUE transparent alpha outside painted vignette including upper corners. Scene: EXACTLY TWO EMPTY simple wooden outdoor park benches near a gently winding path in a quiet autumn forest at evening. Both benches clearly visible and separate, inviting and peaceful, no people or animals. Fallen ochre leaves, a little subdued mossy grass, soft distant autumn tree silhouettes. Small oval landscape island, painterly organic irregular silhouette with softly feathered edges, NOT a rectangular painted background. Main scene fills 75% width and 70% height, with clear transparent margins. Soft gouache/watercolor, subdued blue charcoal #1F232B #2A2F39 twilight, autumn orange #E8853A warm peach #F4B070 amber #EFA537 and muted #7BC47F. Gentle warm evening light. No fox character, no house, no interior objects. No text, numbers, letters, logos, signs, border or watermark.
~~~

### sparks.webp

~~~text
Use case: stylized-concept. ONE seamless tile of sparse soft tiny warm light particles, asset sparks, target 1024x1024 square. TRUE transparent alpha background; empty areas must be fully transparent, absolutely no black/white/gray painted backdrop. Approximately 20-28 tiny irregularly scattered soft round points of warm orange #E8853A, peach #F4B070 and muted amber #EFA537 light, 2-6 pixels at target size with only a few gently diffused 8-12 pixel glows. Very sparse, calm, understated, 98% empty transparent canvas, irregular non-grid spacing. No star shapes, no spikes, no streaks, no haze clouds, no large bokeh circles. Match all four edges for seamless repetition in both directions; keep a 24 pixel totally transparent safety margin on all sides so glow is never clipped, distribute points near all parts of canvas without centered cluster or visible border. Soft brushy luminous dots only. No text, letters, digits, logos, recognizable objects, characters or foxes.
~~~

</details>
