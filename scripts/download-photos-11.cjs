const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const OUT = path.resolve(__dirname, '../public/images')

const downloads = [
  { dir: 'neighbors-corner', file: 'photo-1',     url: 'https://lh3.googleusercontent.com/geougc-cs/ABOP9pv0t578neZFrIMGaTiH87Vam2huaR-Tutnaf879Y89rZpo7dYu3sGTHS3TnecQx50jD5YAXk1zW9J5L6D3UiDd3wUyHay0QiyhZzq0B33BugVwmB4T2ExEFSgOj_d-KduPiYSIY' },
  { dir: 'neighbors-corner', file: 'photo-2',     url: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepubFKLCAIX7k7Ufr2vt_aX4A2aZfGQfSHPZi4wtYHJBWucwdMZgn0qghpGYt0JpZ1YiMUYEBqD9XZBt60TVTyDk5SV47dC9BgFtcCepQn2oToW8Nad8UzqF0JlO33nABpwyU0z4ojtw5g=w1200-h1600-k-no' },
  { dir: 'neighbors-corner', file: 'photo-3',     url: 'https://s3-media0.fl.yelpcdn.com/bphoto/odv4KKAUAz_ngAoUiQ8HAw/o.jpg' },
  { dir: 'neighbors-corner', file: 'strawberry-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/cTbFVPj9BjyvMJzPXc-dlQ/o.jpg' },
  { dir: 'neighbors-corner', file: 'photo-4',     url: 'https://s3-media0.fl.yelpcdn.com/bphoto/fgNLAOxuHLHyao3cUMaX4w/o.jpg' },
  { dir: 'neighbors-corner', file: 'photo-5',     url: 'https://s3-media0.fl.yelpcdn.com/bphoto/YnrwrwEMLNTHxUj3zzJy6g/o.jpg' },
  { dir: 'neighbors-corner', file: 'photo-6',     url: 'https://s3-media0.fl.yelpcdn.com/bphoto/ZyiTOP_YFsF7krkz57oEgw/o.jpg' },
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
