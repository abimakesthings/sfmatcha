const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const OUT = path.resolve(__dirname, '../public/images')

const downloads = [
  // Matcha Maiko Japantown
  { dir: 'matcha-maiko-japantown', file: 'strawberry-1',             url: 'https://s3-media0.fl.yelpcdn.com/bphoto/UfSYQPbvuBAQZP7OI5WhmQ/o.jpg' },

  // Komeya No Bento
  { dir: 'komeya',  file: 'strawberry-1',                            url: 'https://s3-media0.fl.yelpcdn.com/bphoto/A_du0r2z6eIepqu1E5XTHA/o.jpg' },
  { dir: 'komeya',  file: 'mango-1',                                 url: 'https://s3-media0.fl.yelpcdn.com/bphoto/h6oqd-aPNV5jyIexxr4jhQ/o.jpg' },
  { dir: 'komeya',  file: 'mango-2',                                 url: 'https://s3-media0.fl.yelpcdn.com/bphoto/LbBbviZ_I3uHzeDsFzq6Lg/o.jpg' },
  { dir: 'komeya',  file: 'mango-3',                                 url: 'https://s3-media0.fl.yelpcdn.com/bphoto/5Zo33i-DcsyAEV7fkOr2zA/o.jpg' },

  // Kiss of Matcha
  { dir: 'kiss-of-matcha', file: 'ube-1',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/_MF3uSCAuM2-bmQzYm7vPw/o.jpg' },
  { dir: 'kiss-of-matcha', file: 'ube-2',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/D8NM9s0id_sk3aFdxlmqfQ/o.jpg' },
  { dir: 'kiss-of-matcha', file: 'ube-3',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/pXnVinWHSvzwqjst7CcX8Q/o.jpg' },
  { dir: 'kiss-of-matcha', file: 'strawberry-1',                    url: 'https://s3-media0.fl.yelpcdn.com/bphoto/Xp9sPUyOR7r6hV9O_5l8EQ/o.jpg' },
  { dir: 'kiss-of-matcha', file: 'strawberry-2',                    url: 'https://s3-media0.fl.yelpcdn.com/bphoto/HY7Ku2TZygeWCpOb-HSVQw/o.jpg' },

  // Compton's Coffee House
  { dir: 'comptons', file: 'raspberry-1',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/ESG6kGf9zMfgUwFaRmpeAw/o.jpg' },
  { dir: 'comptons', file: 'raspberry-2',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/zXYAwInakjVGRV9F20m_tw/o.jpg' },
  { dir: 'comptons', file: 'raspberry-3',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/NzZLky1c23cysk5N0UF4PQ/o.jpg' },

  // Brew Cha & Matcha
  { dir: 'brew-cha', file: 'peach-1',                               url: 'https://s3-media0.fl.yelpcdn.com/bphoto/7omIaEEWZmb7NVo61gcqjw/o.jpg' },
  { dir: 'brew-cha', file: 'peach-2',                               url: 'https://s3-media0.fl.yelpcdn.com/bphoto/HtVBl5HjalCxL6txf8YfJA/o.jpg' },
  { dir: 'brew-cha', file: 'peach-3',                               url: 'https://s3-media0.fl.yelpcdn.com/bphoto/i6z75MSqK3mQ9phsMF5Q8Q/o.jpg' },
  { dir: 'brew-cha', file: 'peach-4',                               url: 'https://s3-media0.fl.yelpcdn.com/bphoto/4POq5VxMwY8laYmi6mKyHA/o.jpg' },

  // Cere Tea
  { dir: 'cere-tea', file: 'interior-1',                            url: 'https://s3-media0.fl.yelpcdn.com/bphoto/68DO_EOGoNDJGkGmi3993w/o.jpg' },
  { dir: 'cere-tea', file: 'strawberry-1',                          url: 'https://s3-media0.fl.yelpcdn.com/bphoto/FyxfBoQIbOedgsTuDB53-g/o.jpg' },
  { dir: 'cere-tea', file: 'banana-1',                              url: 'https://s3-media0.fl.yelpcdn.com/bphoto/MVm1jATvKOxktKhWxBDPfw/o.jpg' },
  { dir: 'cere-tea', file: 'guava-1',                               url: 'https://s3-media0.fl.yelpcdn.com/bphoto/0d3wbfLxRf4cOz_t1R_kog/o.jpg' },
  { dir: 'cere-tea', file: 'osmanthus-1',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/fONCLE_4WRjeqEVPOalEDA/o.jpg' },
  { dir: 'cere-tea', file: 'black-sesame-einspanner-1',             url: 'https://s3-media0.fl.yelpcdn.com/bphoto/2iTgxdR3sCyh-gKxEc1nhg/o.jpg' },
  { dir: 'cere-tea', file: 'black-sesame-einspanner-2',             url: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwerscAwxF1Gqe0ptvcr3eI1rIBORaAT02vJzw9d4WYzSAzk2K8xt_2qwT4F2mOKqVqRJwjXbFwSHouVsgK9bA5qnT_J-_Oj6bmFo9zV2J4J9oH0Xd_gToDS8YMPtap6etwir-Tu21qDV010=s1360-w1360-h1020-rw' },

  // Third Wheel Coffee
  { dir: 'third-wheel', file: 'interior-1',                         url: 'https://s3-media0.fl.yelpcdn.com/bphoto/NISN9sQ1EvrA_FEujum3nA/o.jpg' },

  // Best Boy Electric
  { dir: 'best-boy', file: 'yuzu-1',                                url: 'https://s3-media0.fl.yelpcdn.com/bphoto/D_iYGS1N4-3lW8Z3fXUN7w/o.jpg' },
  { dir: 'best-boy', file: 'yuzu-2',                                url: 'https://s3-media0.fl.yelpcdn.com/bphoto/SrArC9BwhouNoqgIwE6HKg/o.jpg' },

  // Breadbelly
  { dir: 'breadbelly', file: 'interior-1',                          url: 'https://s3-media0.fl.yelpcdn.com/bphoto/EmfPOOOhxX2JP4_ybdM9bw/o.jpg' },
  { dir: 'breadbelly', file: 'interior-2',                          url: 'https://s3-media0.fl.yelpcdn.com/bphoto/r8P9OQh3kZmXBi1Ui6tAdg/o.jpg' },
  { dir: 'breadbelly', file: 'interior-3',                          url: 'https://s3-media0.fl.yelpcdn.com/bphoto/q7Gqkut0V6te1Sl6FNPdHA/o.jpg' },
  { dir: 'breadbelly', file: 'interior-4',                          url: 'https://s3-media0.fl.yelpcdn.com/bphoto/EVvMFAKSAG-jawyIq9FyOw/o.jpg' },

  // Paper Son Dogpatch
  { dir: 'paper-son', file: 'interior-1',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/a69b0EfV8knl13y2Bcj1CQ/o.jpg' },
  { dir: 'paper-son', file: 'interior-2',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/jP3WS5kfZ8aqVCFS7qg57g/o.jpg' },
  { dir: 'paper-son', file: 'interior-3',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/xGdB-AJrfJMdSEGuSW6rqg/o.jpg' },

  // Tokyo Cream
  { dir: 'tokyo-cream', file: 'sakura-1',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/seSq00PrlcokC2pIndqg0w/o.jpg' },
  { dir: 'tokyo-cream', file: 'sakura-2',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/JXlDLi861UJa1bt_-xzIBA/o.jpg' },
  { dir: 'tokyo-cream', file: 'sakura-3',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/8Z-6qjFyumF1uUdAgZXHyw/o.jpg' },
  { dir: 'tokyo-cream', file: 'sakura-4',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/MVKl32i0zBMnxHWY4oIqiw/o.jpg' },
  { dir: 'tokyo-cream', file: 'sakura-5',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/XE6RCQeL8Ei1nFnM7swHbA/o.jpg' },
  { dir: 'tokyo-cream', file: 'sakura-6',                           url: 'https://s3-media0.fl.yelpcdn.com/bphoto/5e83eSol7rEvJYKaLTde5Q/o.jpg' },
]

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http
    const req = proto.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
      const out = fs.createWriteStream(dest)
      res.pipe(out)
      out.on('finish', resolve)
      out.on('error', reject)
    })
    req.on('error', reject)
  })
}

async function main() {
  for (const { dir, file, url } of downloads) {
    const outDir = path.join(OUT, dir)
    fs.mkdirSync(outDir, { recursive: true })
    const webpPath = path.join(outDir, `${file}.webp`)
    const tmpPath = webpPath + '.tmp'
    process.stdout.write(`  ${dir}/${file}.webp ... `)
    try {
      await download(url, tmpPath)
      await sharp(tmpPath).webp({ quality: 85 }).toFile(webpPath)
      fs.unlinkSync(tmpPath)
      console.log('ok')
    } catch (e) {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)
      console.log(`FAILED: ${e.message}`)
    }
  }
  console.log('done')
}

main()
