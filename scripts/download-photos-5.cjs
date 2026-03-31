const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const OUT = path.resolve(__dirname, '../public/images')

const downloads = [
  { dir: 'maruwu',   file: 'ube-1',          url: 'https://s3-media0.fl.yelpcdn.com/bphoto/ZClIMnCpRPGYOP8LZ7Ohzg/o.jpg' },
  { dir: 'kissaten', file: 'interior-1',      url: 'https://s3-media0.fl.yelpcdn.com/bphoto/bFkXAwpYt2EtVDgiBwGsow/o.jpg' },
  { dir: 'kissaten', file: 'interior-2',      url: 'https://s3-media0.fl.yelpcdn.com/bphoto/cG9EtR_fWud9PYX6kR7TiQ/o.jpg' },
  { dir: 'kissaten', file: 'interior-3',      url: 'https://s3-media0.fl.yelpcdn.com/bphoto/Y6YH2NusnfmEo7tdsaAX_g/o.jpg' },
  { dir: 'shoji',    file: 'einspanner-4',    url: 'https://s3-media0.fl.yelpcdn.com/bphoto/XMAgmBHX1uGhlVVfgnKh2Q/o.jpg' },
  { dir: 'shoji',    file: 'einspanner-5',    url: 'https://s3-media0.fl.yelpcdn.com/bphoto/hBwkiCvR5V7WEYL2hURVVg/o.jpg' },
  { dir: 'misc',     file: 'mango-lassi-1',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/uBbROq7Yc5Fb-WmFdfgvZw/o.jpg' },
  { dir: 'junbi',    file: 'vanilla-1',       url: 'https://s3-media0.fl.yelpcdn.com/bphoto/8Yr8gFuYlxDKCeqpXIRliQ/o.jpg' },
]

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http
    const req = proto.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) return download(res.headers.location, dest).then(resolve).catch(reject)
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
    } catch(e) {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)
      console.log(`FAILED: ${e.message}`)
    }
  }
  console.log('done')
}
main()
