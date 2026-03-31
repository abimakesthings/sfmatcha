const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const OUT = path.resolve(__dirname, '../public/images')

const downloads = [
  // SOHN — melona (replacement)
  { dir: 'sohn',          file: 'melona-1',    url: 'https://s3-media0.fl.yelpcdn.com/bphoto/HjEnGPgQpuEw0wcse9gD4Q/o.jpg' },

  // Maruwu — taro (fresh URL)
  { dir: 'maruwu',        file: 'taro-1',      url: 'https://s3-media0.fl.yelpcdn.com/bphoto/jsYbPEuSSshkLIS6Wismcw/o.jpg' },

  // Black Bird
  { dir: 'black-bird',    file: 'interior-1',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/QynRY5NTgdl2t0HkA0KnEA/o.jpg' },
  { dir: 'black-bird',    file: 'interior-2',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/2ihwd-NlANtHJSTZb0OBrg/o.jpg' },
  { dir: 'black-bird',    file: 'peach-1',     url: 'https://s3-media0.fl.yelpcdn.com/bphoto/Dekv1iQE4uLchN_PsZIyBA/o.jpg' },

  // Shoji
  { dir: 'shoji',         file: 'affogato-1',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/X0yI4Mm9QiVxIe2mJjPIhQ/o.jpg' },
  { dir: 'shoji',         file: 'interior-1',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/Vq4rPottdnO96AuxpP6Mmw/o.jpg' },

  // OISHII
  { dir: 'oishii',        file: 'ube-1',       url: 'https://s3-media0.fl.yelpcdn.com/bphoto/JzbrCKYtVfS5LO72RS8UYw/o.jpg' },
  { dir: 'oishii',        file: 'interior-1',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/xDbqAe72oaFVEecAQ59JvQ/o.jpg' },
  { dir: 'oishii',        file: 'mango-1',     url: 'https://s3-media0.fl.yelpcdn.com/bphoto/YrT-ENFQCTYuLgQD-ClsLw/o.jpg' },
  { dir: 'oishii',        file: 'interior-2',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/4PS0TbuPJUMt5tU9Y_TmlA/o.jpg' },

  // Urban Ritual
  { dir: 'urban-ritual',  file: 'toffee-1',    url: 'https://s3-media0.fl.yelpcdn.com/bphoto/njHOtIwyHO7V1rbC98rpuw/o.jpg' },
  { dir: 'urban-ritual',  file: 'interior-1',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/plvngbTDdE2FdFABjAXTTA/o.jpg' },
  { dir: 'urban-ritual',  file: 'interior-2',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/n8qQ4UrbNoPqL7rasCMV8g/o.jpg' },
  { dir: 'urban-ritual',  file: 'interior-3',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/5hknWDDyPMJVLEcs-J47Bg/o.jpg' },

  // Q Specialty
  { dir: 'q-specialty',   file: 'interior-1',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/TeKBi2glGefDfPqo_4EHIg/o.jpg' },
  { dir: 'q-specialty',   file: 'coco-wave-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/hCfoeIcC0EHgIQE2d8QpRA/o.jpg' },
  { dir: 'q-specialty',   file: 'interior-2',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/E1_gt6JGrD8ZJUjOMeYZ2Q/o.jpg' },
  { dir: 'q-specialty',   file: 'yuzu-1',      url: 'https://s3-media0.fl.yelpcdn.com/bphoto/0BUrNmIomd__C1SsCBXRFg/o.jpg' },
  { dir: 'q-specialty',   file: 'sparkling-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/A3f6RwaQvWi-dHcwbiYqyA/o.jpg' },
]

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http
    const req = proto.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
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
