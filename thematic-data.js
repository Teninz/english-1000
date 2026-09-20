// Десять самостоятельных тематических маршрутов. Тематические слова заданы здесь,
// более сложные записи переиспользуют вычитанные переводы и примеры основного словаря.
const THEMATIC_META = [
  ["forest","Лес","🌲","Растения, животные, погода и безопасность","Лесной набор"],
  ["village","Деревня","🌾","Ферма, постройки, инструменты и быт","Деревенский набор"],
  ["travel","Туризм","🎒","Маршрут, транспорт, жильё и общение","Набор путешественника"],
  ["city","Город","🏙️","Улицы, учреждения, транспорт и услуги","Городской набор"],
  ["beach","Пляж","🏖️","Море, отдых, снаряжение и безопасность","Пляжный набор"],
  ["space","Космос","🚀","Астрономия, полёт и исследования","Космический набор"],
  ["science","Наука","🔬","Лаборатория, измерения и открытия","Научный набор"],
  ["rescue","Спасатели","🚒","Скорая, пожарные, полиция и первая помощь","Набор спасателя"],
  ["shops","Магазины","🛍️","Товары, размеры, оплата, возврат и доставка","Торговый набор"],
  ["home","Дом","🏠","Комнаты, мебель, техника, уборка и ремонт","Домашний набор"],
].map(([id,title,icon,description,reward])=>({id,title,icon,description,reward,equipmentSetId:`set_${id}`}));

const THEMATIC_BASIC_RAW = {
forest:`
tree|дерево|n|This tree is very old.|Это дерево очень старое.
forest|лес|n|We walked through the forest.|Мы шли через лес.
leaf|лист|n|A yellow leaf fell quietly.|Жёлтый лист тихо упал.
branch|ветка|n|A bird sat on the branch.|Птица сидела на ветке.
root|корень|n|The roots hold the tree firmly.|Корни крепко удерживают дерево.
moss|мох|n|Soft moss covered the stone.|Мягкий мох покрывал камень.
mushroom|гриб|n|Do not eat an unknown mushroom.|Не ешь незнакомый гриб.
berry|ягода|n|These red berries are edible.|Эти красные ягоды съедобны.
pine|сосна|n|A tall pine grows near the path.|У тропы растёт высокая сосна.
oak|дуб|n|The oak has a wide crown.|У дуба широкая крона.
fox|лиса|n|A fox crossed the clearing.|Лиса пересекла поляну.
deer|олень|n|We saw a deer at dawn.|На рассвете мы увидели оленя.
wolf|волк|n|The wolf stayed far away.|Волк держался далеко.
owl|сова|n|An owl called in the dark.|В темноте кричала сова.
squirrel|белка|n|The squirrel hid a nut.|Белка спрятала орех.
trail|тропа|n|Follow the marked trail.|Иди по отмеченной тропе.
clearing|поляна|n|We rested in a sunny clearing.|Мы отдохнули на солнечной поляне.
stream|ручей|n|The stream is safe to cross here.|Здесь ручей можно безопасно перейти.
campfire|костёр|n|Put out the campfire completely.|Полностью потуши костёр.
map|карта|n|Keep the map in a dry pocket.|Держи карту в сухом кармане.
compass|компас|n|The compass points north.|Компас указывает на север.
shadow|тень|n|The trees gave us cool shadow.|Деревья дали нам прохладную тень.
rustle|шелестеть|v|Dry leaves rustle under our feet.|Сухие листья шелестят под ногами.
get lost|заблудиться|v|Stay on the path so you do not get lost.|Оставайся на тропе, чтобы не заблудиться.
camp|разбить лагерь|v|We will camp beside the lake.|Мы разобьём лагерь у озера.
fern|папоротник|n|Tall ferns grew beside the stream.|Высокие папоротники росли у ручья.
bush|куст|n|Something moved behind the bush.|За кустом что-то двигалось.
grass|трава|n|The wet grass covered our boots.|Мокрая трава покрыла наши ботинки.
wildflower|полевой цветок|n|Do not pick this rare wildflower.|Не срывай этот редкий полевой цветок.
acorn|жёлудь|n|The squirrel carried an acorn.|Белка несла жёлудь.
pine cone|сосновая шишка|n|A pine cone fell onto the path.|Сосновая шишка упала на тропу.
bark|кора|n|The bark protects the tree.|Кора защищает дерево.
trunk|ствол|n|The trunk was too wide to hug.|Ствол был слишком широким, чтобы его обхватить.
log|бревно|n|We stepped over a fallen log.|Мы перешагнули через упавшее бревно.
woodland hill|лесной холм|n|We climbed a steep woodland hill.|Мы поднялись на крутой лесной холм.
valley|долина|n|Morning fog filled the valley.|Утренний туман заполнил долину.
cave|пещера|n|Never enter a cave without a light.|Никогда не входи в пещеру без фонаря.
woodland lake|лесное озеро|n|The woodland lake was perfectly still.|Лесное озеро было совершенно спокойным.
pond|пруд|n|Frogs live in this pond.|В этом пруду живут лягушки.
waterfall|водопад|n|We heard the waterfall before we saw it.|Мы услышали водопад раньше, чем увидели его.
nest|гнездо|n|Leave the bird's nest alone.|Не трогай птичье гнездо.
paw print|след лапы|n|A fresh paw print appeared in the mud.|В грязи появился свежий след лапы.
insect|насекомое|n|This insect hides under tree bark.|Это насекомое прячется под корой дерева.
ant|муравей|n|An ant carried a tiny leaf.|Муравей нёс крошечный лист.
bee|пчела|n|A bee landed on the flower.|Пчела села на цветок.
snake|змея|n|We watched the snake from a distance.|Мы наблюдали за змеёй издалека.
bear|медведь|n|Food must be kept away from bears.|Еду нужно хранить подальше от медведей.
wild boar|дикий кабан|n|A wild boar crossed the road at dusk.|В сумерках дорогу перешёл дикий кабан.
woodpecker|дятел|n|A woodpecker tapped the old tree.|Дятел стучал по старому дереву.
forest edge|опушка леса|n|Wildflowers grow along the forest edge.|Вдоль опушки леса растут полевые цветы.`,
village:`
village|деревня|n|My grandparents live in a small village.|Мои бабушка и дедушка живут в маленькой деревне.
farm|ферма|n|The farm grows vegetables and wheat.|На ферме выращивают овощи и пшеницу.
field|поле|n|The field is green after the rain.|После дождя поле зелёное.
barn|амбар|n|The hay is stored in the barn.|Сено хранится в амбаре.
stable|конюшня|n|The horses sleep in the stable.|Лошади спят в конюшне.
well|колодец|n|They draw clean water from the well.|Они набирают чистую воду из колодца.
tractor|трактор|n|The tractor is working in the field.|Трактор работает в поле.
farmer|фермер|n|The farmer gets up before sunrise.|Фермер встаёт до рассвета.
cow|корова|n|The cow is eating grass.|Корова ест траву.
goat|коза|n|The goat jumped over the fence.|Коза перепрыгнула через забор.
sheep|овца|n|The sheep have thick wool.|У овец густая шерсть.
chicken|курица|n|The chicken laid an egg.|Курица снесла яйцо.
hay|сено|n|Fresh hay smells sweet.|Свежее сено пахнет сладко.
wheat|пшеница|n|The wheat will be ready in August.|Пшеница созреет в августе.
seed|семя|n|Plant each seed in soft soil.|Посади каждое семя в мягкую землю.
garden|огород|n|We grow tomatoes in the garden.|Мы выращиваем помидоры в огороде.
bucket|ведро|n|Fill the bucket with water.|Наполни ведро водой.
shovel|лопата|n|Use a shovel to dig the hole.|Используй лопату, чтобы выкопать яму.
axe|топор|n|Keep the axe in a safe place.|Храни топор в безопасном месте.
cart|телега|n|The old cart carried sacks of grain.|Старая телега везла мешки зерна.
harvest time|время сбора урожая|n|Everyone helps at harvest time.|Во время сбора урожая помогают все.
feed|кормить|v|I feed the chickens every morning.|Я кормлю кур каждое утро.
milk|доить|v|She knows how to milk a cow.|Она умеет доить корову.
dig|копать|v|We need to dig a deeper ditch.|Нам нужно выкопать канаву глубже.
grow|выращивать|v|They grow potatoes behind the house.|Они выращивают картофель за домом.`,
travel:`
trip|поездка|n|Our trip begins on Monday.|Наша поездка начинается в понедельник.
tourist|турист|n|A tourist asked me for directions.|Турист спросил у меня дорогу.
passport|паспорт|n|Keep your passport in a safe place.|Храни паспорт в безопасном месте.
ticket|билет|n|I bought a train ticket online.|Я купил билет на поезд онлайн.
suitcase|чемодан|n|Her suitcase is light and small.|Её чемодан лёгкий и небольшой.
backpack|рюкзак|n|My backpack fits under the seat.|Мой рюкзак помещается под сиденьем.
hotel|отель|n|The hotel is near the station.|Отель находится рядом с вокзалом.
hostel|хостел|n|We booked a quiet hostel.|Мы забронировали тихий хостел.
airport|аэропорт|n|The bus goes directly to the airport.|Автобус идёт прямо в аэропорт.
station|вокзал|n|Meet me outside the station.|Встреть меня у вокзала.
train|поезд|n|The train leaves at nine.|Поезд отправляется в девять.
flight|рейс|n|Our flight was delayed by an hour.|Наш рейс задержали на час.
map|карта|n|Open the map and find our hotel.|Открой карту и найди наш отель.
route|маршрут|n|This route avoids the busy roads.|Этот маршрут обходит загруженные дороги.
guide|гид|n|The guide showed us the old town.|Гид показал нам старый город.
border|граница|n|They checked our passports at the border.|На границе проверили наши паспорта.
luggage|багаж|n|Your luggage is already on the bus.|Твой багаж уже в автобусе.
reservation|бронирование|n|I confirmed the hotel reservation.|Я подтвердил бронирование отеля.
check in|зарегистрироваться|v|We should check in two hours early.|Нам следует зарегистрироваться за два часа.
book|бронировать|v|Book the room before Friday.|Забронируй номер до пятницы.
pack|собирать вещи|v|I always pack the night before a trip.|Я всегда собираю вещи вечером перед поездкой.
miss the train|опоздать на поезд|v|Hurry or we will miss the train.|Поторопись, иначе мы опоздаем на поезд.
ask for directions|спросить дорогу|v|We can ask for directions at the café.|Мы можем спросить дорогу в кафе.
one-way ticket|билет в одну сторону|n|I need a one-way ticket to Oxford.|Мне нужен билет в одну сторону до Оксфорда.
return ticket|билет туда и обратно|n|A return ticket is cheaper today.|Сегодня билет туда и обратно дешевле.`,
city:`
city|город|n|The city is quiet early in the morning.|Рано утром город тихий.
street|улица|n|Their office is on King Street.|Их офис находится на Кинг-стрит.
square|площадь|n|People gathered in the main square.|Люди собрались на главной площади.
building|здание|n|That glass building is a library.|То стеклянное здание — библиотека.
bridge|мост|n|We crossed the river by the old bridge.|Мы перешли реку по старому мосту.
traffic light|светофор|n|Turn left at the traffic light.|Поверни налево у светофора.
bus stop|автобусная остановка|n|The bus stop is across the road.|Автобусная остановка через дорогу.
underground|метро|n|The underground is faster at rush hour.|В час пик метро быстрее.
library|библиотека|n|The library closes at eight.|Библиотека закрывается в восемь.
hospital|больница|n|The hospital is two blocks away.|Больница находится в двух кварталах.
police station|полицейский участок|n|Report the theft at the police station.|Сообщи о краже в полицейском участке.
town hall|мэрия|n|The meeting is at the town hall.|Встреча проходит в мэрии.
post office|почта|n|I sent the parcel from the post office.|Я отправил посылку с почты.
bank|банк|n|The bank opens at ten.|Банк открывается в десять.
park|парк|n|We had lunch in the park.|Мы пообедали в парке.
museum|музей|n|The museum has a new exhibition.|В музее новая выставка.
pharmacy|аптека|n|There is a pharmacy beside the clinic.|Рядом с клиникой есть аптека.
pavement|тротуар|n|Do not cycle on the pavement here.|Здесь нельзя ездить на велосипеде по тротуару.
block|квартал|n|Walk straight for one block.|Пройди прямо один квартал.
corner|угол|n|The café is on the corner.|Кафе находится на углу.
cross|переходить|v|Cross the street at the lights.|Переходи улицу на светофоре.
turn left|повернуть налево|v|Turn left after the bank.|Поверни налево после банка.
go straight|идти прямо|v|Go straight until you see the bridge.|Иди прямо, пока не увидишь мост.
crowded|многолюдный|adj|The centre is crowded on Saturdays.|По субботам в центре многолюдно.
nearby|поблизости|adv|Is there a cash machine nearby?|Поблизости есть банкомат?`,
beach:`
beach|пляж|n|The beach is empty at sunrise.|На рассвете пляж пуст.
sea|море|n|The sea is calm today.|Сегодня море спокойное.
wave|волна|n|A large wave reached our towels.|Большая волна дошла до наших полотенец.
sand|песок|n|The sand is warm under my feet.|Песок тёплый под ногами.
shell|ракушка|n|She found a white shell.|Она нашла белую ракушку.
rock|скала|n|Do not climb that wet rock.|Не взбирайся на ту мокрую скалу.
island|остров|n|We can see the island from here.|Отсюда виден остров.
coast|побережье|n|A path follows the coast.|Тропа идёт вдоль побережья.
towel|полотенце|n|Put your towel in the sun.|Положи полотенце на солнце.
swimsuit|купальник|n|Her swimsuit dried quickly.|Её купальник быстро высох.
sunscreen|солнцезащитный крем|n|Apply sunscreen every two hours.|Наноси солнцезащитный крем каждые два часа.
umbrella|зонт|n|We sat under a beach umbrella.|Мы сидели под пляжным зонтом.
lifeguard|спасатель на пляже|n|Ask the lifeguard about the current.|Спроси спасателя о течении.
sea current|морское течение|n|The sea current is strong near the rocks.|У скал сильное морское течение.
tide|прилив|n|The tide comes in quickly here.|Здесь прилив наступает быстро.
sunburn|солнечный ожог|n|The hat will help prevent sunburn.|Шляпа поможет избежать солнечного ожога.
shade|тень|n|Children should rest in the shade.|Детям следует отдыхать в тени.
boat|лодка|n|The small boat returned before dark.|Маленькая лодка вернулась до темноты.
swim|плавать|v|Never swim alone at night.|Никогда не плавай ночью в одиночку.
dive|нырять|v|It is not safe to dive here.|Здесь небезопасно нырять.
float|держаться на воде|v|This board helps beginners float.|Эта доска помогает новичкам держаться на воде.
sunbathe|загорать|v|We sunbathe only in the morning.|Мы загораем только утром.
waterproof|водонепроницаемый|adj|Keep your phone in a waterproof bag.|Держи телефон в водонепроницаемой сумке.
shallow|мелкий|adj|The water is shallow near the shore.|У берега вода мелкая.
deep|глубокий|adj|The sea becomes deep very quickly.|Море очень быстро становится глубоким.
shore|берег|n|Small waves reached the shore.|Небольшие волны доходили до берега.
ocean|океан|n|The ocean looks endless from here.|Отсюда океан кажется бесконечным.
seagull|чайка|n|A seagull flew over our picnic.|Чайка пролетела над нашим пикником.
crab|краб|n|A crab hid beneath a rock.|Краб спрятался под камнем.
jellyfish|медуза|n|Do not touch a jellyfish.|Не трогай медузу.
dolphin|дельфин|n|We saw a dolphin beyond the bay.|Мы увидели дельфина за бухтой.
seaweed|водоросли|n|Seaweed washed up after the storm.|После шторма на берег вынесло водоросли.
coral|коралл|n|The diver photographed the coral.|Ныряльщик сфотографировал коралл.
reef|риф|n|Boats must avoid the shallow reef.|Лодки должны обходить мелкий риф.
harbour|гавань|n|Fishing boats returned to the harbour.|Рыбацкие лодки вернулись в гавань.
pier|пирс|n|We watched the sunset from the pier.|Мы смотрели закат с пирса.
deck chair|шезлонг|n|I rented a deck chair for the afternoon.|Я арендовал шезлонг на вторую половину дня.
flip-flops|шлёпанцы|n|Wear flip-flops on the hot sand.|Надень шлёпанцы на горячем песке.
sunglasses|солнцезащитные очки|n|Her sunglasses protect her eyes.|Её солнцезащитные очки защищают глаза.
sun hat|панама|n|A wide sun hat covers your face.|Широкая панама закрывает лицо.
cooler|сумка-холодильник|n|Keep the drinks in the cooler.|Держи напитки в сумке-холодильнике.
water bottle|бутылка воды|n|Bring a full water bottle to the beach.|Возьми на пляж полную бутылку воды.
snorkel|дыхательная трубка|n|This snorkel is the right size.|Эта дыхательная трубка подходящего размера.
diving mask|маска для ныряния|n|Check the diving mask before entering the water.|Проверь маску для ныряния перед входом в воду.
fins|ласты|n|These fins are too loose.|Эти ласты слишком свободные.
surfboard|доска для сёрфинга|n|He carried his surfboard to the water.|Он отнёс доску для сёрфинга к воде.
kayak|каяк|n|The red kayak stayed close to shore.|Красный каяк держался близко к берегу.
paddle|весло|n|Hold the paddle with both hands.|Держи весло обеими руками.
sandcastle|замок из песка|n|The children built a tall sandcastle.|Дети построили высокий замок из песка.
beach ball|пляжный мяч|n|The wind carried away our beach ball.|Ветер унёс наш пляжный мяч.
horizon|горизонт|n|A ship appeared on the horizon.|На горизонте появился корабль.
sea breeze|морской бриз|n|A cool sea breeze arrived at noon.|В полдень подул прохладный морской бриз.
coastal storm|прибрежный шторм|n|The coastal storm closed the beach.|Из-за прибрежного шторма пляж закрыли.
thunder|гром|n|Leave the water when you hear thunder.|Выйди из воды, когда услышишь гром.
lightning|молния|n|Lightning is dangerous on an open beach.|Молния опасна на открытом пляже.
safety flag|сигнальный флаг|n|A red safety flag means danger.|Красный сигнальный флаг означает опасность.
warning sign|предупреждающий знак|n|Read the warning sign before swimming.|Прочитай предупреждающий знак перед купанием.
safe zone|безопасная зона|n|Children should swim inside the safe zone.|Детям следует плавать в безопасной зоне.
swimming area|зона для купания|n|Boats cannot enter the swimming area.|Лодкам нельзя входить в зону для купания.
high tide|прилив|n|The path disappears at high tide.|Во время прилива тропа исчезает.
low tide|отлив|n|We explored the rocks at low tide.|Во время отлива мы исследовали скалы.
dehydration|обезвоживание|n|Regular drinks help prevent dehydration.|Регулярное питьё помогает избежать обезвоживания.
drinking water|питьевая вода|n|There is free drinking water near the café.|Рядом с кафе есть бесплатная питьевая вода.
salt water|солёная вода|n|Do not drink salt water.|Не пей солёную воду.
wet|мокрый|adj|The steps are wet after each wave.|После каждой волны ступени мокрые.
slippery|скользкий|adj|The rocks are slippery near the water.|Камни у воды скользкие.
sunny|солнечный|adj|It will be sunny all afternoon.|Всю вторую половину дня будет солнечно.
windy|ветреный|adj|The beach is too windy for umbrellas.|На пляже слишком ветрено для зонтов.
relax|отдыхать|v|We came here to relax by the sea.|Мы приехали сюда отдохнуть у моря.
paddle out|отплыть от берега на доске|v|Surfers paddle out beyond the waves.|Сёрферы отплывают на досках за линию волн.
surf|заниматься сёрфингом|v|Beginners surf near the instructor.|Новички занимаются сёрфингом рядом с инструктором.
wade|идти по мелководью|v|We waded through the shallow water.|Мы шли по мелководью.
splash|плескаться|v|The children splashed in the sea.|Дети плескались в море.
rinse|ополаскивать|v|Rinse the sand off your feet.|Ополосни ноги от песка.
dry off|вытереться|v|Dry off before you enter the café.|Вытрись перед входом в кафе.`,
space:`
space|космос|n|Humans have always looked into space.|Люди всегда смотрели в космос.
planet|планета|n|Mars is a rocky planet.|Марс — каменистая планета.
star|звезда|n|This star is brighter than the others.|Эта звезда ярче остальных.
moon|луна|n|The moon has no air.|На Луне нет воздуха.
sun|солнце|n|The Earth moves around the sun.|Земля движется вокруг Солнца.
sky|небо|n|The night sky is very clear.|Ночное небо очень ясное.
rocket|ракета|n|The rocket launched on time.|Ракета стартовала вовремя.
astronaut|астронавт|n|The astronaut trained for many years.|Астронавт тренировался много лет.
spaceship|космический корабль|n|The spaceship entered orbit.|Космический корабль вышел на орбиту.
station|станция|n|Six people live on the space station.|На космической станции живут шесть человек.
orbit|орбита|n|The satellite is in a low orbit.|Спутник находится на низкой орбите.
satellite|спутник|n|The satellite sends weather images.|Спутник передаёт снимки погоды.
telescope|телескоп|n|We observed Jupiter through a telescope.|Мы наблюдали Юпитер через телескоп.
gravity|гравитация|n|Gravity keeps us on the ground.|Гравитация удерживает нас на земле.
crew|экипаж|n|The crew completed the repair.|Экипаж завершил ремонт.
spacesuit|скафандр|n|A spacesuit protects the astronaut.|Скафандр защищает астронавта.
launch|запуск|n|The launch was visible from the coast.|Запуск был виден с побережья.
crater|кратер|n|The rover photographed a deep crater.|Марсоход сфотографировал глубокий кратер.
comet|комета|n|The comet will pass the sun.|Комета пройдёт мимо Солнца.
galaxy|галактика|n|Our galaxy contains billions of stars.|Наша галактика содержит миллиарды звёзд.
land|приземляться|v|The capsule will land in the ocean.|Капсула приземлится в океане.
explore|исследовать|v|Robots can explore distant planets.|Роботы могут исследовать далёкие планеты.
rotate|вращаться|v|The Earth takes a day to rotate.|Земле нужны сутки, чтобы совершить оборот.
weightless|невесомый|adj|Objects seem weightless in orbit.|На орбите предметы кажутся невесомыми.
distant|далёкий|adj|The telescope detected a distant galaxy.|Телескоп обнаружил далёкую галактику.
universe|вселенная|n|The universe is still expanding.|Вселенная всё ещё расширяется.
Earth|Земля|n|Earth is our home planet.|Земля — наша родная планета.
Mars|Марс|n|Mars has two small moons.|У Марса два небольших спутника.
Venus|Венера|n|Venus has a thick atmosphere.|У Венеры плотная атмосфера.
Jupiter|Юпитер|n|Jupiter is the largest planet here.|Юпитер — самая большая планета здесь.
asteroid|астероид|n|The probe flew past an asteroid.|Зонд пролетел мимо астероида.
meteor|метеор|n|A bright meteor crossed the sky.|Яркий метеор пересёк небо.
solar system|Солнечная система|n|Eight planets orbit the sun in our solar system.|В нашей Солнечной системе восемь планет вращаются вокруг Солнца.
black hole|чёрная дыра|n|Light cannot escape a black hole.|Свет не может покинуть чёрную дыру.
nebula|туманность|n|New stars form inside the nebula.|Внутри туманности формируются новые звёзды.
space mission|космическая миссия|n|The space mission will last six months.|Космическая миссия продлится шесть месяцев.
capsule|капсула|n|The crew returned safely in the capsule.|Экипаж безопасно вернулся в капсуле.
rover|марсоход|n|The rover collected a soil sample.|Марсоход собрал образец грунта.
space probe|космический зонд|n|The space probe sent new images.|Космический зонд передал новые снимки.
module|модуль|n|The crew entered the new module.|Экипаж вошёл в новый модуль.
airlock|шлюз|n|The inner airlock door must stay closed.|Внутренняя дверь шлюза должна оставаться закрытой.
control room|центр управления|n|The control room followed every signal.|Центр управления отслеживал каждый сигнал.
countdown|обратный отсчёт|n|The countdown stopped at ten seconds.|Обратный отсчёт остановился на десяти секундах.
fuel tank|топливный бак|n|The empty fuel tank separated from the rocket.|Пустой топливный бак отделился от ракеты.
oxygen supply|запас кислорода|n|The oxygen supply will last three days.|Запаса кислорода хватит на три дня.
vacuum|вакуум|n|Sound cannot travel through a vacuum.|Звук не распространяется в вакууме.
space radiation|космическая радиация|n|The shield reduces space radiation.|Экран снижает воздействие космической радиации.
radio signal|радиосигнал|n|The radio signal took minutes to arrive.|Радиосигнал шёл несколько минут.
dock|стыковаться|v|The spacecraft will dock with the station.|Корабль состыкуется со станцией.
re-enter|войти в атмосферу|v|The capsule will re-enter the atmosphere tonight.|Капсула войдёт в атмосферу сегодня ночью.`,
science:`
science|наука|n|Science helps us test ideas.|Наука помогает нам проверять идеи.
scientist|учёный|n|The scientist recorded every result.|Учёный записал каждый результат.
lab|лаборатория|n|Wear safety glasses in the lab.|В лаборатории надевай защитные очки.
test tube|пробирка|n|Pour the liquid into a clean test tube.|Налей жидкость в чистую пробирку.
microscope|микроскоп|n|We saw the cells through a microscope.|Мы увидели клетки через микроскоп.
cell|клетка|n|A cell is a basic unit of life.|Клетка — основная единица жизни.
chemical|химическое вещество|n|Label every chemical clearly.|Чётко подпиши каждое химическое вещество.
reaction|реакция|n|The reaction produced heat.|Реакция выделила тепло.
temperature|температура|n|Measure the water temperature.|Измерь температуру воды.
weight|вес|n|Record the weight of each sample.|Запиши вес каждого образца.
length|длина|n|The length of the wire is one metre.|Длина провода — один метр.
number|число|n|Write each number in the table.|Запиши каждое число в таблицу.
result|результат|n|Our result matched the prediction.|Наш результат совпал с прогнозом.
question|вопрос|n|A good question can begin a study.|С хорошего вопроса может начаться исследование.
answer|ответ|n|The data may give us an answer.|Данные могут дать нам ответ.
fact|факт|n|Check whether the claim is a fact.|Проверь, является ли утверждение фактом.
idea|идея|n|They tested the idea with a model.|Они проверили идею на модели.
model|модель|n|This model shows how the heart works.|Эта модель показывает работу сердца.
compare|сравнивать|v|Compare the two sets of data.|Сравни два набора данных.
record|записывать|v|Record what you observe.|Запиши то, что наблюдаешь.
test|проверять|v|We need to test the material.|Нам нужно проверить материал.
mix|смешивать|v|Do not mix these chemicals.|Не смешивай эти вещества.
heat|нагревать|v|Heat the water slowly.|Нагревай воду медленно.
cool|охлаждать|v|Let the solution cool naturally.|Дай раствору остыть естественно.
safe|безопасный|adj|This experiment is safe for students.|Этот эксперимент безопасен для учеников.`,
rescue:`
help|помощь|n|Call for help immediately.|Немедленно позови на помощь.
fire|пожар|n|The fire started in the kitchen.|Пожар начался на кухне.
smoke|дым|n|Stay low under the smoke.|Пригнись ниже дыма.
firefighter|пожарный|n|A firefighter checked every room.|Пожарный проверил каждую комнату.
police officer|полицейский|n|The police officer blocked the road.|Полицейский перекрыл дорогу.
paramedic|фельдшер|n|The paramedic stopped the bleeding.|Фельдшер остановил кровотечение.
rescue team|спасательная команда|n|The rescue team arrived quickly.|Спасательная команда быстро прибыла.
first aid|первая помощь|n|Everyone should learn basic first aid.|Каждый должен знать основы первой помощи.
bandage|бинт|n|Put a clean bandage on the cut.|Наложи чистый бинт на порез.
stretcher|носилки|n|They carried the patient on a stretcher.|Пациента несли на носилках.
siren|сирена|n|We heard a siren behind us.|Мы услышали сирену позади.
alarm|сигнал тревоги|n|Leave the building when the alarm sounds.|Покинь здание, когда звучит тревога.
exit|выход|n|Keep the emergency exit clear.|Не загромождай аварийный выход.
danger|опасность|n|The sign warns people about danger.|Знак предупреждает людей об опасности.
accident|авария|n|Two cars were damaged in the accident.|В аварии пострадали две машины.
address|адрес|n|Tell the operator your exact address.|Назови оператору точный адрес.
breathing|дыхание|n|Check the person's breathing.|Проверь дыхание человека.
bleeding|кровотечение|n|Press firmly to control the bleeding.|Сильно прижми рану, чтобы остановить кровотечение.
burn|ожог|n|Cool the burn under running water.|Охлади ожог под проточной водой.
call an ambulance|вызвать скорую|v|Call an ambulance if they cannot breathe.|Вызови скорую, если человек не может дышать.
evacuate|эвакуировать|v|Police had to evacuate the area.|Полиции пришлось эвакуировать район.
rescue|спасать|v|The crew rescued three hikers.|Команда спасла трёх туристов.
stay calm|сохранять спокойствие|v|Stay calm and answer the operator.|Сохраняй спокойствие и отвечай оператору.
unconscious|без сознания|adj|The injured driver was unconscious.|Пострадавший водитель был без сознания.
urgent|срочный|adj|This patient needs urgent care.|Этому пациенту нужна срочная помощь.`,
shops:`
shop|магазин|n|This shop sells local food.|Этот магазин продаёт местные продукты.
price|цена|n|The price includes delivery.|Цена включает доставку.
money|деньги|n|I do not have enough money with me.|У меня с собой недостаточно денег.
cash|наличные|n|Can I pay in cash?|Можно заплатить наличными?
card|карта|n|I paid for it by card.|Я заплатил за это картой.
receipt|чек|n|Keep the receipt for thirty days.|Храни чек тридцать дней.
size|размер|n|Do you have this in my size?|У вас есть это моего размера?
colour|цвет|n|This jacket comes in another colour.|Эта куртка бывает другого цвета.
customer|покупатель|n|The customer asked for a refund.|Покупатель попросил вернуть деньги.
seller|продавец|n|The seller answered my question.|Продавец ответил на мой вопрос.
fitting room|примерочная|n|The fitting room is on the left.|Примерочная находится слева.
discount|скидка|n|Students get a ten percent discount.|Студенты получают скидку десять процентов.
sale|распродажа|n|The winter sale starts tomorrow.|Зимняя распродажа начинается завтра.
change|сдача|n|Here is your change and receipt.|Вот ваша сдача и чек.
total|итоговая сумма|n|The total is twenty pounds.|Итоговая сумма — двадцать фунтов.
online order|онлайн-заказ|n|My online order arrived early.|Мой онлайн-заказ пришёл раньше.
parcel|посылка|n|The parcel was left at reception.|Посылку оставили на стойке регистрации.
pay|платить|v|You can pay at the checkout.|Вы можете заплатить на кассе.
buy|покупать|v|I need to buy a warm coat.|Мне нужно купить тёплое пальто.
sell|продавать|v|They sell fresh bread here.|Здесь продают свежий хлеб.
cost|стоить|v|How much does this bag cost?|Сколько стоит эта сумка?
exchange|обменять|v|Can I exchange this shirt?|Можно обменять эту рубашку?
fit|подходить по размеру|v|These shoes fit me well.|Эти туфли хорошо подходят мне по размеру.
cheap|дешёвый|adj|The cheapest option is still reliable.|Самый дешёвый вариант всё ещё надёжный.
expensive|дорогой|adj|That brand is too expensive for me.|Этот бренд слишком дорогой для меня.`,
home:`
home|дом|n|It is good to be home.|Хорошо быть дома.
room|комната|n|This room gets plenty of light.|В этой комнате много света.
kitchen|кухня|n|Breakfast is ready in the kitchen.|Завтрак готов на кухне.
bedroom|спальня|n|The bedroom faces the garden.|Окна спальни выходят в сад.
bathroom|ванная|n|The bathroom is upstairs.|Ванная находится наверху.
living room|гостиная|n|We watch films in the living room.|Мы смотрим фильмы в гостиной.
door|дверь|n|Please lock the front door.|Пожалуйста, запри входную дверь.
window|окно|n|Open the window for some fresh air.|Открой окно, чтобы впустить свежий воздух.
wall|стена|n|We painted the wall white.|Мы покрасили стену в белый цвет.
floor|пол|n|The kitchen floor is wet.|Пол на кухне мокрый.
table|стол|n|Dinner is on the table.|Ужин на столе.
chair|стул|n|Pull up a chair and sit down.|Подвинь стул и садись.
bed|кровать|n|The cat is sleeping under the bed.|Кот спит под кроватью.
sofa|диван|n|This sofa can become a bed.|Этот диван можно превратить в кровать.
lamp|лампа|n|Turn on the lamp beside the sofa.|Включи лампу рядом с диваном.
key|ключ|n|I left the key on the shelf.|Я оставил ключ на полке.
washing machine|стиральная машина|n|The washing machine is very quiet.|Стиральная машина работает очень тихо.
dishwasher|посудомоечная машина|n|Load the plates into the dishwasher.|Поставь тарелки в посудомоечную машину.
clean|убирать|v|We clean the flat every Saturday.|Мы убираем квартиру каждую субботу.
wash|мыть|v|Please wash the cups.|Пожалуйста, вымой чашки.
fix|чинить|v|Can you fix the broken handle?|Ты можешь починить сломанную ручку?
move in|въехать|v|The new tenants move in tomorrow.|Новые жильцы въезжают завтра.
move out|съехать|v|We must move out by Friday.|Мы должны съехать до пятницы.
comfortable|удобный|adj|The armchair is old but comfortable.|Кресло старое, но удобное.
upstairs|наверху|adv|The spare towels are upstairs.|Запасные полотенца наверху.`
};

const THEMATIC_REUSE = {
  forest:[[350,50]],
  village:[[550,50],[600,25]],
  travel:[[500,50],[450,25]],
  city:[[500,25],[250,25],[650,25]],
  beach:[[350,25]],
  space:[[150,25],[200,25]],
  science:[[150,50],[200,25]],
  rescue:[[300,50],[250,25]],
  shops:[[650,50],[100,25]],
  home:[[550,50],[625,25]],
};

function thematicParseBasic(raw){
  return raw.trim().split(/\n+/).map((line,index)=>{
    const [en,ru,pos,example,exampleRu]=line.split("|");
    if(!exampleRu)throw Error(`Некорректная тематическая запись: ${line}`);
    return [en,ru,pos,example,exampleRu,null];
  });
}
const THEMATIC_SOURCE=[...WORDS_A,...WORDS_B];
const THEMATIC_WORDS=Object.fromEntries(THEMATIC_META.map(meta=>{
  const basics=thematicParseBasic(THEMATIC_BASIC_RAW[meta.id]);
  const reused=THEMATIC_REUSE[meta.id].flatMap(([start,count])=>THEMATIC_SOURCE.slice(start,start+count)).slice(0,100-basics.length).map(w=>[w[0],w[1],w[2],w[3],EX_RU[w[0]]||"",null]);
  const words=[...basics,...reused].map(w=>{w[5]=WordLevels.lookup(w[0],w[2])?.level||null;return w;});
  return [meta.id,words];
}));
