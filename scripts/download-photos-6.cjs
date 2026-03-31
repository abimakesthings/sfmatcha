const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const OUT = path.resolve(__dirname, '../public/images')

const downloads = [
  { dir: 'kiss-of-matcha', file: 'ube-4',        url: 'https://s3-media0.fl.yelpcdn.com/bphoto/_MF3uSCAuM2-bmQzYm7vPw/o.jpg' },
  { dir: 'kiss-of-matcha', file: 'ube-5',        url: 'https://s3-media0.fl.yelpcdn.com/bphoto/D8NM9s0id_sk3aFdxlmqfQ/o.jpg' },
  { dir: 'kiss-of-matcha', file: 'ube-6',        url: 'https://s3-media0.fl.yelpcdn.com/bphoto/pXnVinWHSvzwqjst7CcX8Q/o.jpg' },
  { dir: 'kiss-of-matcha', file: 'strawberry-3', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/Xp9sPUyOR7r6hV9O_5l8EQ/o.jpg' },
  { dir: 'kiss-of-matcha', file: 'strawberry-4', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/HY7Ku2TZygeWCpOb-HSVQw/o.jpg' },
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
