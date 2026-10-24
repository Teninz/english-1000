// Осенние сцены-фоны: три растровых слоя на сцену — дальний план, средний и передний.
// Слои едут вбок с разной скоростью, отсюда ощущение глубины. Мастера (2048×1280 PNG)
// лежат в art/scenes/<ключ>/, в приложение попадают только WebP-уровни из
// tools/build-scene-mips.py. Разметку слоёв строит sceneHtml(), движение задаёт CSS.
// На вертикальном экране в кадр попадает примерно центральная треть мастера по ширине.
// focus сдвигает эту «форточку», если главный объект сцены оказался не по центру.
const SCENES = {
  none:     { title: "Без фона" },
  forest:   { title: "Осенний лес" },
  town:     { title: "Осенний город", glow: true },
  village:  { title: "Деревенский домик", focus: "40%", glow: true },
  sea:      { title: "Море и хижина", focus: "80%", glow: true },
  mountain: { title: "Горный хребет", focus: "28%" },
};
const SCENE_LAYERS = ["sky", "mid", "near"];
const SCENE_MIPS = [768, 1152];
const sceneUrl = (key, variant, layer, width) => `art/scenes/${key}/${variant}-${layer}-${width}.webp`;
// image-set: браузер сам берёт уровень по плотности экрана — веб-эквивалент мипмаппинга.
// На узком экране не грузится лишнее, при масштабировании не рябят детали.
const sceneLayerImage = (key, variant, layer) =>
  // одинарные кавычки обязательны: разметка слоя уезжает в атрибут style="..."
  `image-set(${SCENE_MIPS.map((w, i) => `url('${sceneUrl(key, variant, layer, w)}') ${i + 1}x`).join(",")})`;

// детерминированный «случайный» генератор, чтобы сцена была одинаковой при каждом открытии
const rng = seed => { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };

// падающие листья поверх сцены — те самые «живые детали» из настроек
const SCENE_LEAVES = ["maple", "oak", "birch", "rowan"];
function leavesHtml(n = 9, seed = 7){
  const rnd = rng(seed);
  return `<div class="leaves">` + Array.from({length: n}, (_, k) => {
    const x = (rnd() * 100).toFixed(1), t = (16 + rnd() * 12).toFixed(1), d = (-rnd() * 28).toFixed(1), size = Math.round(11 + rnd() * 11);
    return `<b style="left:${x}%;width:${size}px;height:${size}px;--t:${t}s;--d:${d}s;background-image:url('art/ui/leaf-${SCENE_LEAVES[k % 4]}.webp')"></b>`;
  }).join("") + `</div>`;
}

// Обе половины суток лежат в разметке сразу, видимую выбирает тема через CSS.
// Скрытые display:none слои браузер не загружает, поэтому вторая половина ничего не стоит.
function sceneHtml(key){
  if(!SCENES[key] || key === "none") return "";
  const focus = SCENES[key].focus || "center";
  return ["night", "day"].map(variant => {
    const layers = SCENE_LAYERS.map(layer => `<i class="${layer}" style="background-image:${sceneLayerImage(key, variant, layer)}"></i>`);
    // Тёплые окна и фонари ночью дышат: два слоя света из того же среднего плана,
    // разведённые по фазе, — целый город, мигающий в такт, выглядел бы механическим.
    if(variant === "night" && SCENES[key].glow)
      layers.splice(2, 0, ...["glowa", "glowb"].map(layer => `<i class="glow ${layer}" style="background-image:${sceneLayerImage(key, variant, layer)}"></i>`));
    return `<div class="scene-var ${variant}" style="--focus:${focus}">${layers.join("")}</div>`;
  }).join("") + `<div class="mist"></div>` + leavesHtml();
}

// Превью для настроек: те же три слоя, сложенные в один элемент фоновыми картинками.
function sceneThumbStyle(key, variant){
  if(!SCENES[key] || key === "none") return "";
  const images = ["near", "mid", "sky"].map(layer => `url('${sceneUrl(key, variant, layer, 768)}')`);
  return `background-image:${images.join(",")};background-position:${SCENES[key].focus || "center"} bottom`;
}
