import spots from './spots.json'

const photo = name => spots.find(s => s.name.includes(name))?.photo ?? null

const flavorStacks = [
  [{ id: 'kopiku-pandan',      flavor: 'Pandan matcha latte',       cafe: 'Kopiku',              photo: photo('Kopiku') }],
  [{ id: 'wildwox-mango',      flavor: 'Matcha mango shizuku',      cafe: 'The Wild Fox',         photo: photo('Wild Fox') }],
  [{ id: 'wildwox-kikuyu',     flavor: 'Kikuyu kinako matcha',      cafe: 'The Wild Fox',         photo: photo('Wild Fox') }],
  [{ id: 'sohn-melona',        flavor: 'Melona matcha latte',       cafe: 'SOHN',                 photo: photo('SOHN') }],
  [
    { id: 'sohn-banana',       flavor: 'Banana matcha',             cafe: 'SOHN',                 photo: photo('SOHN') },
    { id: 'jadejava-banana',   flavor: 'Banana cream matcha',       cafe: 'Jade & Java Cafe',     photo: photo('Jade') },
  ],
  [{ id: 'jadejava-creme',     flavor: 'Crème brûlée matcha',       cafe: 'Jade & Java Cafe',     photo: photo('Jade') }],
  [{ id: 'maiko-kuromitsu',    flavor: 'Matcha kuromitsu kinako',   cafe: 'Matcha Cafe Maiko',    photo: photo('Maiko') }],
  [{ id: 'tadaima-cheese',     flavor: 'Salted cheese cream matcha', cafe: 'Tadaima',             photo: photo('Tadaima Inner') }],
  [{ id: 'progeny-blueberry',  flavor: 'Blueberry iced matcha',     cafe: 'Progeny Coffee',       photo: photo('Progeny') }],
  [{ id: 'stonemill-rose',     flavor: 'Rose matcha latte',         cafe: 'Stonemill Matcha',     photo: photo('Stonemill') }],
  [{ id: 'asha-lavender',      flavor: 'Lavender matcha latte',     cafe: 'Asha Tea House',       photo: photo('Asha') }],
  [{ id: 'junbi-guava',        flavor: 'Guava matcha latte',        cafe: 'Junbi Matcha & Tea',   photo: photo('Junbi') }],
  [{ id: 'maruwu-cheese',      flavor: 'Matcha cheese tart',        cafe: 'Maruwu Seicha',        photo: photo('Maruwu') }],
  [{ id: 'blackbird-peach',    flavor: 'Peach matcha latte',        cafe: 'Black Bird',           photo: photo('Black Bird') }],
  [{ id: 'shoji-cocktail',     flavor: 'Matcha negroni',            cafe: 'Shoji',                photo: photo('Shoji') }],
  [
    { id: 'kissaten-ichigo',    flavor: 'Ichigo matcha',             cafe: 'Kissaten HiFi',        photo: photo('Kissaten') },
    { id: 'maiko-strawberry',   flavor: 'Strawberry matcha latte',  cafe: 'Matcha Cafe Maiko',    photo: photo('Maiko') },
    { id: 'komeya-strawberry',  flavor: 'Strawberry matcha latte',  cafe: 'Komeya No Bento',      photo: photo('Komeya') },
    { id: 'tadaima-strawberry', flavor: 'Strawberry matcha latte',  cafe: 'Tadaima',              photo: photo('Tadaima Mission') },
    { id: 'jadejava-strawberry', flavor: 'Strawberry matcha latte', cafe: 'Jade & Java Cafe',    photo: photo('Jade') },
  ],
  [
    { id: 'oishii-ube',         flavor: 'Ube matcha latte',         cafe: 'OISHII MATCHA',        photo: photo('OISHII') },
    { id: 'maruwu-ube',         flavor: 'Ube matcha latte',         cafe: 'Maruwu Seicha',        photo: photo('Maruwu') },
  ],
  [{ id: 'shoji-einspanner',   flavor: 'Matcha einspänner',         cafe: 'Shoji',                photo: photo('Shoji') }],
  [{ id: 'shoji-affogato',     flavor: 'Matcha affogato',           cafe: 'Shoji',                photo: photo('Shoji') }],
  [{ id: 'urbanritual-toffee', flavor: 'Matcha toffee brittle',     cafe: 'Urban Ritual Cafe',    photo: photo('Urban Ritual') }],
  [{ id: 'maruwu-taro',        flavor: 'Ube matcha latte',          cafe: 'Maruwu Seicha',        photo: photo('Maruwu') }],
  [{ id: 'q-yuzu-cloud',      flavor: 'Triple matcha yuzu cloud',  cafe: 'Q Specialty Coffee',   photo: photo('Q Specialty') }],
  [{ id: 'q-sparkling',       flavor: 'Sparkling matcha cloud',    cafe: 'Q Specialty Coffee',   photo: photo('Q Specialty') }],
]

export default flavorStacks
