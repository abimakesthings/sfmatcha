const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const OUT = path.resolve(__dirname, '../public/images')

const downloads = [
  { dir: 'kiss-of-matcha-north-beach', file: 'photo-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/xu5bTRTWvueYgKKZUdGMFQ/o.jpg' },
  { dir: 'kiss-of-matcha-north-beach', file: 'photo-2', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/8oaTvjp4LtPZSJVnYQ5gTA/o.jpg' },
  { dir: 'kiss-of-matcha-north-beach', file: 'photo-3', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/w6b1rGHm-41nwKvOyB0v6A/o.jpg' },
  { dir: 'kiss-of-matcha-north-beach', file: 'photo-4', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/JIaO4ZMmbMtA65JqZzzfJw/o.jpg' },
  { dir: 'kiss-of-matcha-north-beach', file: 'photo-5', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/pPp9aaPwzGHeKUbQ8VLmeA/o.jpg' },
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
