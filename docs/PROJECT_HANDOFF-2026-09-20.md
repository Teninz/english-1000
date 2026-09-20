# ShadowFox Eng — передача проекта в новый чат (20 сентября 2026)

Этот файл — единая точка входа для нового чата. Читать первым, затем по ссылкам. Пользователь — Teninz; общение на русском, обращение «Teninz», пуш в GitHub только по команде, правки обратимые, команды `bash` отдельными блоками.

## 1. Что это за приложение

**ShadowFox Eng** — Android-приложение (и сайт) для расширения английского словаря до уровня B1–B2: 1000 слов в 20 уровнях с интервальными повторениями, восемь видов проверки, голосовой режим «В дороге» без рук, тематические маршруты (10 тем по 100 слов с блиц-экзаменом), задания дня, 31 достижение, виджеты и **лиса-компаньон** — нарисованный персонаж, который живёт по часам телефона (утро/день/вечер/ночь), спит ночью, грустит и обижается при пропусках занятий. Без регистрации, рекламы и аналитики; прогресс только на устройстве.

Полное описание возможностей — `about.js` (`ABOUT_SECTIONS`) и `docs/SRS.md`.

## 2. Ссылки

| Что | Ссылка |
|---|---|
| Репозиторий | https://github.com/Teninz/english-1000 |
| Рабочая ветка (всё актуальное) | `fox-reference-chain` — https://github.com/Teninz/english-1000/tree/fox-reference-chain |
| Ветка `main` | отстаёт (1.0.3.4); сайт GitHub Pages деплоится из неё: https://teninz.github.io/english-1000/ |
| Сборка APK (GitHub Actions) | https://github.com/Teninz/english-1000/actions/workflows/android.yml |
| Последний успешный run 1.0.3.7b (сборка 23) | https://github.com/Teninz/english-1000/actions/runs/35313603174 |
| Набор анимаций лисы (релиз, сейчас не используется приложением) | https://github.com/Teninz/english-1000/releases/tag/fox-pack-3 |
| Политика конфиденциальности | https://teninz.github.io/english-1000/privacy.html |
| RuStore, консоль | https://console.rustore.ru/apps/2063756811 (приложение «ShadowFox Eng — 1000 английских слов», id 2063756811) |
| Digital Asset Links (нужны только TWA-версии 1.0) | репо `Teninz/teninz.github.io`, `.well-known/assetlinks.json` |

## 3. Состояние на 20.09.2026

- В RuStore **опубликована 1.0** (TWA-обёртка). **1.0.3.7b (versionCode 23) отправлена на модерацию 18.09** с автоматической публикацией; заполнены «Что нового», обоснование разрешений, новые описания и 8 скриншотов — см. `store/rustore-listing.md`.
- Текущая рабочая сборка: `apk/ShadowFoxEng-1.0.3.7b.apk` (40,5 МБ, всё внутри APK). Проверена на телефоне: лиса и фон играют.
- Локальные коммиты все запушены в `fox-reference-chain` (HEAD `8e56663`). Ветка `main` не обновлялась — после одобрения версии стоит сделать `git checkout main; git merge --ff-only fox-reference-chain; git push origin main` (обновит сайт).

## 4. Как устроено и как собирается

- **Веб-часть** (чистый JS, без фреймворков) в корне: `index.html`, `learning-core.js` (логика и валидация данных), `journey.js` (лиса, занятие дня, плеер клипов), `companion.css`, `thematic*.js/css`, `words-a.js`/`words-b.js`/`ex-ru.js` (словарь), `tts.js`, `ach.js`, `daily.js`, `about.js` (версия и changelog), `native.js` (мост к Android), `sw.js` (service worker сайта, кэш `shadowfox-v19`).
- **Android-оболочка** — Capacitor 8, папка `android/`: `app/src/main/java/io/github/teninz/shadowfox/` (`MainActivity.java`, `WordWidget.kt`, `CompanionWidget.kt`, `CompanionStore.kt`, `WidgetPlugin.java`, `RoadService.kt`, `SpeakService.kt`). WebView показывает `dist/` с `https://localhost`.
- **Сборка**: `npm run build:web` (→ `dist/`, фильтр в `tools/build-web.js`), `npx cap sync android`, затем GitHub Actions (`.github/workflows/android.yml`, Node 22 + Java 21, подпись ключом из секретов). Локально JDK нет.
  - запуск сборки без `gh`: `python tools/gh-actions.py dispatch fox-reference-chain`; статус: `… runs`; скачать: `… artifacts <run_id> apk`; публикация набора: `… publish-pack` (использует токен Git Credential Manager).
- **Версии**: `versionCode`/`versionName` в `android/app/build.gradle` (сейчас 23 / `1.0.3.7b`), `APP_VERSION` и `CHANGELOG` в `about.js` (все версии с 1.0), `"version"` в `package.json`. Процедура выпуска — `docs/HANDOFF.md`, раздел «Как выпустить новую версию».
- **Тесты**: `npm test` (37 тестов, `tests/learning.test.js`) — проверяют логику, манифест набора лисы, ресурсы, виджет.
- **Локальный просмотр**: `python -m http.server 8766` из корня → http://localhost:8766/index.html; демо-режим для скриншотов `?demo=1&screen=home|companion|choose|thematic|card|quiz|gap|road|words`.
- **Ключ подписи**: `apk/signing.keystore` + `apk/signing-key-info.txt` (в gitignore, хранить!), копии в секретах GitHub.

## 5. Лиса-компаньон — где что лежит

| Что | Где |
|---|---|
| План и история решений по лисе | `docs/FOX_COMPANION_PLAN.md` (разделы «Состояние реализации», «Набор 17.09», «Загрузка по кнопке», «Настроения и петли покоя») |
| Следующие шаги | `docs/NEXT_STEPS.md` |
| Референсы (картинки) | `art/companion-references/04/image/` — `04-boy-bold_greenscreen.png` (покой), `pre_sleep.png`, `sleep.png`, `Sad.png`, `Offended.png`; **`padded/`** — те же с запасом по краям (лиса 72 % кадра) — генерировать клипы только по ним. Лисы 01–03: `01/`, `02/`, `03/` (только постеры, клипов в приложении нет) |
| Сгенерированные видео (Hailuo Minimax / Seedance 2.5, Keyframes) | `art/companion-references/04/video/` (22 файла, имена русские/с «(замена)»); соответствие именам клипов — `FOX_CLIPS` в `tools/build-companion-pack.py` |
| Фон домика | `art/Фон/`: `Forest.png`, `Forest_утро/вечер/ночь.png` и видео-петли/переходы `Forest утро1.mp4` … `Forest переход ночь-утро.mp4` |
| Иконка ручки | `art/companion-references/icon.png` → `art/companion-v2/handle.png` |
| Готовый набор (в APK) | `art/companion-v2/`: `04-boy-bold/*.webm` (16 клипов VP9+alpha 768×768), постеры `poster*.webp`, `scene/*.webm|webp` (петли и переходы по времени суток), `manifest.json` + `manifest.js` (`FOX_PACK`, `bundled: true`) |
| Промежуточные кадры (в gitignore) | `tools/companion-source/clips-v2/<клип>/frames|keyed`, `scene-v2/src/` |
| Виджет | `android/app/src/main/res/drawable-nodpi/companion_{idle,sad_1,sad_2,withdrawn,sleep}.png` (256×256), `res/layout/companion_widget.xml` |

**Конвейер клипов** (Python 3.14 + `pillow numpy imageio imageio-ffmpeg`; ffmpeg внутри пакета):
1. положить MP4 в `tools/companion-source/clips-v2/src/04-boy-bold_<имя>.mp4`;
2. `python tools/inspect-companion-clips.py --src tools/companion-source/clips-v2/src --out tools/companion-source/clips-v2 <имя>` — кадры и контактные листы;
3. добавить клип в `FOX_CLIPS`/`SETS` в `tools/build-companion-pack.py` (`framing`: `padded` или `orig`, диапазон кадров, канонические кадры `from`/`to`);
4. `python tools/build-companion-pack.py --only fox` (≈15 мин), поднять `PACK_VERSION` при смене состава; `--only manifest` — только манифест;
5. `npm test`, `npm run build:web`, `npx cap sync android`, коммит, сборка в Actions.

Вспомогательные скрипты: `key-companion-clips.py` (хромакей: фон по краям кадра, восстановление бликов, despill), `compose-companion-scene.py` (проба композиции лисы на фоне), `export-companion-loops.py` (сравнение форматов), `store-screens.js` (скриншоты 1080×1920 локальным Chrome через puppeteer-core).

**Поведение в приложении** (`journey.js`): периоды по часам телефона — утро 07:30, день 12:30, вечер 19:30, ночь 23:30; наборы по числу пропущенных дней — `calm` (0), `sad` (1–2), `offended` (3+); ночью сон в любом настроении; переход фона показывается при открытии, если период сменился с прошлого визита (`S.journey.foxSeen`); плеер на двух `<video>` с предзагрузкой; касание лисы — реакция; кнопок еды/воды/ласки больше нет. Состояние: `S.companion.fox`, `S.companion.adopted`, `S.companion.identity` (имя постоянное).

## 6. Уроки, которые стоит помнить

- В Android WebView пустой `<video>` без `src` рисуется серым прямоугольником с кнопкой Play — запасные элементы прятать через `opacity:0` (`.fox-scene:not(.on)`). Из-за этого «серый фон» держался несколько сборок и был ошибочно приписан хранилищу.
- Кроссфейд между клипами с альфа-каналом даёт ореол по контуру — переключение жёсткое, на канонических кадрах покоя/сна с подшитыми растворениями.
- Растровые анимации (APNG, WebP) в 5–20 раз тяжелее VP9 для шерсти; VP9+alpha в WebView работает.
- Генерация клипов: только Keyframes с одинаковым кадром в начале и в конце, ровный зелёный, референсы `padded/` (иначе обрезаются уши и хвост); модели склонны «оживлять» камеру и добавлять движение.
- Механизм загрузки набора по кнопке (`@capacitor/filesystem`, GitHub Releases `fox-pack-N`) остался в коде и включается `bundled: false` в манифесте; папку назначения нужно создавать до `downloadFile`.
- Прокси на второй машине рвёт большие загрузки на `uploads.github.com` — `publish-pack` повторяет попытки.

## 7. Что дальше (приоритеты)

1. Дождаться модерации 1.0.3.7b; при отказе — ответить по обоснованию разрешений (`store/rustore-listing.md`).
2. Влить `fox-reference-chain` в `main` (обновит сайт).
3. Лиса 04: спокойная петля покоя `calm-idle` без мерцающего фона (промт в переписке — «просто сидит и дышит»), `offended2`, переходы в сон из грусти/обиды, реакции «накормить/напоить/погладить» (промты готовы, кнопки убраны — можно повесить на касание).
4. Наборы для лис 01–03 (сейчас заперты, только постеры).
5. Предметы за достижения — три уровня (статичный PNG, редкая анимация, анимация по тапу), вещи в сцене вокруг лисы, а не на ней; черновик привязки к достижениям — в переписке 18.09, план — раздел «Долгосрочная прогрессия» в `FOX_COMPANION_PLAN.md`.
6. Проверить на Android блиц тематических маршрутов при сворачивании/закрытии (`docs/NEXT_STEPS.md`, шаг 5).

## 8. Окружение второй машины (E:\)

Проект: `E:\english-1000\english-1000` (основная машина — `C:\Claude\english-1000`). Установлены git (вход через Credential Manager), Node 24, Python 3.14 с `pillow numpy imageio imageio-ffmpeg`, `node_modules` (включая `puppeteer-core`), Chrome. Нет JDK/Android SDK — APK только через Actions. Прокси для CLI при необходимости: `HTTP_PROXY=HTTPS_PROXY=http://127.0.0.1:10809`.

Другие документы: `docs/HANDOFF.md` (журнал решений с 13.09), `docs/SRS.md`, `docs/THEMATIC_LEARNING_SPEC.md`, `docs/PIXEL_FOX_SPEC.md` и `docs/FOX_LAYER_PROTOTYPE.md` (устаревшие подходы к анимации — для истории), `docs/TEST_APK_HANDOFF-1.0.3.5.md`.
