import spots from './spots.json'

const photo = name => spots.find(s => s.name.includes(name))?.photo ?? null

const flavorStacks = [
  [{ id: 'kopiku-pandan',        flavor: 'Pandan matcha latte',            cafe: 'Kopiku',              photo: photo('Kopiku'),       photoUrl: '/images/kopiku/pandan-1.webp' }],
  [
    { id: 'wildwox-mango',       flavor: 'Matcha mango shizuku',           cafe: 'The Wild Fox',        photo: photo('Wild Fox'),     photoUrl: '/images/wild-fox/mango-1.webp' },
    { id: 'kissaten-mango-lassi', flavor: 'Mango lassi matcha',            cafe: 'Kissaten HiFi',       photo: photo('Kissaten'),     photoUrl: '/images/kissaten/mango-lassi-1.webp' },
    { id: 'oishii-mango',        flavor: 'Mango matcha latte',             cafe: 'OISHII MATCHA',       photo: photo('OISHII'),       photoUrl: '/images/oishii/mango-1.webp' },
    { id: 'komeya-mango',        flavor: 'Mango fresh milk matcha',        cafe: 'Komeya No Bento',     photo: photo('Komeya'),       photoUrl: '/images/komeya/mango-1.webp' },
    { id: 'junbi-mango',         flavor: 'Mango matcha',                   cafe: 'Junbi Matcha & Tea',  photo: photo('Junbi'),        photoUrl: '/images/junbi/mango-1.webp' },
    { id: 'maruwu-mango',        flavor: 'Mango matcha latte',             cafe: 'Maruwu Seicha',       photo: photo('Maruwu'),       photoUrl: '/images/maruwu/mango-1.webp' },
    { id: 'moriwa-mango',        flavor: 'Mango matcha latte',             cafe: 'Moriwa Matcha',       photo: photo('Moriwa'),       photoUrl: '/images/moriwa/mango-1.webp' },
  ],
  [{ id: 'sohn-melona',          flavor: 'Melona matcha latte',            cafe: 'SOHN',                photo: photo('SOHN'),         photoUrl: '/images/sohn/melona-1.webp' }],
  [
    { id: 'sohn-banana',         flavor: 'Banana matcha',                  cafe: 'SOHN',                photo: photo('SOHN'),         photoUrl: '/images/sohn/banana-1.webp' },
    { id: 'jadejava-banana',     flavor: 'Banana cream matcha',            cafe: 'Jade & Java Cafe',    photo: photo('Jade'),         photoUrl: '/images/jade-java/banana-1.webp' },
    { id: 'cere-banana',         flavor: 'Banana pudding matcha',          cafe: 'Ceré Tea',            photo: photo('Ceré Tea'),     photoUrl: '/images/cere-tea/banana-1.webp' },
  ],
  [{ id: 'jadejava-creme',       flavor: 'Crème brûlée matcha',            cafe: 'Jade & Java Cafe',    photo: photo('Jade'),         photoUrl: '/images/jade-java/creme-brulee-1.webp' }],
  [{ id: 'jadejava-black-sesame', flavor: 'Black sesame matcha',           cafe: 'Jade & Java Cafe',    photo: photo('Jade'),         photoUrl: '/images/jade-java/black-sesame-1.webp' }],
  [{ id: 'maiko-kuromitsu',      flavor: 'Matcha kuromitsu kinako',        cafe: 'Matcha Cafe Maiko',   photo: photo('Maiko'),        photoUrl: '/images/matcha-maiko-japantown/kuromitsu-1.webp' }],
  [{ id: 'tadaima-cheese',       flavor: 'Salted cheese cream matcha',     cafe: 'Tadaima',             photo: photo('Tadaima Inner'), photoUrl: '/images/tadaima-mission/cheese-1.webp' }],
  [{ id: 'tadaima-pistachio',    flavor: 'Pistachio cream matcha',         cafe: 'Tadaima',             photo: photo('Tadaima Inner'), photoUrl: '/images/tadaima-sunset/pistachio-1.webp' }],
  [{ id: 'progeny-blueberry',    flavor: 'Blueberry iced matcha',          cafe: 'Progeny Coffee',      photo: photo('Progeny'),      photoUrl: '/images/progeny/blueberry-1.webp' }],
  [{ id: 'stonemill-rose',       flavor: 'Rose matcha latte',              cafe: 'Stonemill Matcha',    photo: photo('Stonemill'),    photoUrl: '/images/stonemill/rose-1.webp' }],
  [{ id: 'asha-blood-orange',    flavor: 'Blood orange matcha latte',      cafe: 'Asha Tea House',      photo: photo('Asha'),         photoUrl: '/images/asha/blood-orange-1.webp' }],
  [{ id: 'junbi-vanilla',      flavor: 'Madagascar vanilla matcha latte', cafe: 'Junbi Matcha & Tea', photo: photo('Junbi'),        photoUrl: '/images/junbi/vanilla-1.webp' }],
  [
    { id: 'junbi-guava',         flavor: 'Guava matcha latte',             cafe: 'Junbi Matcha & Tea',  photo: photo('Junbi'),        photoUrl: '/images/junbi/guava-1.webp' },
    { id: 'cere-guava',          flavor: 'Matcha guava cloud',             cafe: 'Ceré Tea',            photo: photo('Ceré Tea'),     photoUrl: '/images/cere-tea/guava-1.webp' },
  ],
  [{ id: 'maruwu-guava-peach',   flavor: 'Hawaiian guava & peach matcha',  cafe: 'Maruwu Seicha',       photo: photo('Maruwu'),       photoUrl: '/images/maruwu/guava-peach-1.webp' }],
  [
    { id: 'blackbird-peach',     flavor: 'Peach matcha latte',             cafe: 'Black Bird',          photo: photo('Black Bird'),   photoUrl: '/images/black-bird/peach-1.webp' },
    { id: 'brewcha-peach',       flavor: 'Peach matcha latte',             cafe: 'Brew Cha',   photo: photo('Brew Cha'),     photoUrl: '/images/brew-cha/peach-1.webp' },
  ],
  [{ id: 'comptons-raspberry',   flavor: 'Raspberry matcha latte',         cafe: "Compton's Coffee House", photo: photo("Compton's"), photoUrl: '/images/comptons/raspberry-1.webp' }],
  [{ id: 'cere-osmanthus',       flavor: 'Osmanthus matcha latte',         cafe: 'Ceré Tea',            photo: photo('Ceré Tea'),     photoUrl: '/images/cere-tea/osmanthus-1.webp' }],
  [{ id: 'cere-black-sesame-einspanner', flavor: 'Black sesame matcha einspänner', cafe: 'Ceré Tea',   photo: photo('Ceré Tea'),     photoUrl: '/images/cere-tea/black-sesame-einspanner-1.webp' }],
  [{ id: 'tokyocream-sakura',    flavor: 'Sakura matcha latte',            cafe: 'Tokyo Cream',         photo: photo('Tokyo Cream'),  photoUrl: '/images/tokyo-cream/sakura-1.webp' }],
  [
    { id: 'kissaten-ichigo',     flavor: 'Ichigo matcha',                  cafe: 'Kissaten HiFi',       photo: photo('Kissaten'),     photoUrl: '/images/kissaten/ichigo-1.webp' },
    { id: 'maiko-strawberry',    flavor: 'Strawberry matcha latte',        cafe: 'Matcha Cafe Maiko',   photo: photo('Maiko'),        photoUrl: '/images/matcha-maiko-japantown/strawberry-1.webp' },
    { id: 'komeya-strawberry',   flavor: 'Strawberry matcha latte',        cafe: 'Komeya No Bento',     photo: photo('Komeya'),       photoUrl: '/images/komeya/strawberry-1.webp' },
    { id: 'cere-strawberry',     flavor: 'Strawberry matcha einspänner',   cafe: 'Ceré Tea',            photo: photo('Ceré Tea'),     photoUrl: '/images/cere-tea/strawberry-1.webp' },
    { id: 'kissofmatcha-strawberry', flavor: 'Strawberry matcha latte',    cafe: 'Kiss of Matcha',      photo: photo('Kiss of Matcha'), photoUrl: '/images/kiss-of-matcha/strawberry-1.webp' },
    { id: 'tadaima-strawberry',  flavor: 'Strawberry matcha latte',        cafe: 'Tadaima',             photo: photo('Tadaima Mission'), photoUrl: '/images/tadaima-sunset/strawberry-1.webp' },
    { id: 'jadejava-strawberry', flavor: 'Strawberry matcha latte',        cafe: 'Jade & Java Cafe',    photo: photo('Jade'),         photoUrl: '/images/jade-java/strawberry-1.webp' },
    { id: 'stonemill-strawberry', flavor: 'Strawberry matcha',             cafe: 'Stonemill Matcha',    photo: photo('Stonemill'),    photoUrl: '/images/stonemill/strawberry-1.webp' },
    { id: 'asha-strawberry',     flavor: 'Strawberry matcha latte',        cafe: 'Asha Tea House',      photo: photo('Asha'),         photoUrl: '/images/asha/strawberry-1.webp' },
    { id: 'nagomi-strawberry',   flavor: 'Strawberry matcha latte',        cafe: 'Nagomi',              photo: photo('Nagomi'),       photoUrl: '/images/nagomi/strawberry-1.webp' },
    { id: 'maruwu-strawberry',   flavor: 'Strawberry matcha latte',        cafe: 'Maruwu Seicha',       photo: photo('Maruwu'),       photoUrl: '/images/maruwu/strawberry-1.webp' },
    { id: 'moriwa-strawberry',   flavor: 'Strawberry matcha latte',        cafe: 'Moriwa Matcha',       photo: photo('Moriwa'),       photoUrl: '/images/moriwa/strawberry-1.webp' },
    { id: 'neighbors-strawberry', flavor: 'Strawberry matcha latte',       cafe: "Neighbor's Corner",   photo: photo("Neighbor's"),   photoUrl: '/images/neighbors-corner/strawberry-1.webp' },
  ],
  [
    { id: 'oishii-ube',          flavor: 'Ube matcha latte',               cafe: 'OISHII MATCHA',       photo: photo('OISHII'),       photoUrl: '/images/oishii/ube-1.webp' },
    { id: 'kissofmatcha-ube',    flavor: 'Matcha ube latte',               cafe: 'Kiss of Matcha',      photo: photo('Kiss of Matcha'), photoUrl: '/images/kiss-of-matcha/ube-1.webp' },
    { id: 'maruwu-ube',          flavor: 'Ube matcha latte',               cafe: 'Maruwu Seicha',       photo: photo('Maruwu'),       photoUrl: '/images/maruwu/ube-1.webp' },
  ],
  [
    { id: 'shoji-einspanner',    flavor: 'Matcha einspänner',              cafe: 'Shoji',               photo: photo('Shoji'),        photoUrl: '/images/shoji/einspanner-1.webp' },
    { id: 'kissaten-einspanner', flavor: 'Matcha einspänner',              cafe: 'Kissaten HiFi',       photo: photo('Kissaten'),     photoUrl: '/images/kissaten/einspanner-1.webp' },
  ],
  [{ id: 'shoji-affogato',       flavor: 'Matcha affogato',                cafe: 'Shoji',               photo: photo('Shoji'),        photoUrl: '/images/shoji/affogato-1.webp' }],
  [{ id: 'kissofmatcha-espresso', flavor: 'Matcha espresso latte',         cafe: 'Kiss of Matcha',      photo: photo('Kiss of Matcha'), photoUrl: '/images/kiss-of-matcha/espresso-1.webp' }],
  [{ id: 'urbanritual-toffee',   flavor: 'Matcha toffee brittle',          cafe: 'Urban Ritual Cafe',   photo: photo('Urban Ritual'), photoUrl: '/images/urban-ritual/toffee-1.webp' }],
  [{ id: 'maruwu-taro',          flavor: 'Taro matcha latte',              cafe: 'Maruwu Seicha',       photo: photo('Maruwu'),       photoUrl: '/images/maruwu/taro-1.webp' }],
  [
    { id: 'q-yuzu-cloud',        flavor: 'Triple matcha yuzu cloud',       cafe: 'Q Specialty Coffee',  photo: photo('Q Specialty'),  photoUrl: '/images/q-specialty/yuzu-1.webp' },
    { id: 'bestboy-yuzu',        flavor: 'Yuzu matcha tonic',              cafe: 'Best Boy Electric',   photo: photo('Best Boy'),     photoUrl: '/images/best-boy/yuzu-1.webp' },
  ],
  [{ id: 'q-sparkling',          flavor: 'Sparkling matcha cloud',         cafe: 'Q Specialty Coffee',  photo: photo('Q Specialty'),  photoUrl: '/images/q-specialty/sparkling-1.webp' }],
  [{ id: 'q-coco-wave',          flavor: 'Coco wave matcha cloud',         cafe: 'Q Specialty Coffee',  photo: photo('Q Specialty'),  photoUrl: '/images/q-specialty/coco-wave-1.webp' }],
]

export default flavorStacks
