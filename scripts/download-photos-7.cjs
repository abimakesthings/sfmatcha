const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const OUT = path.resolve(__dirname, '../public/images')

const downloads = [
  { dir: 'cere-tea', file: 'interior-1',               url: 'https://s3-media0.fl.yelpcdn.com/bphoto/68DO_EOGoNDJGkGmi3993w/o.jpg' },
  { dir: 'cere-tea', file: 'strawberry-1',              url: 'https://s3-media0.fl.yelpcdn.com/bphoto/FyxfBoQIbOedgsTuDB53-g/o.jpg' },
  { dir: 'cere-tea', file: 'banana-1',                  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/MVm1jATvKOxktKhWxBDPfw/o.jpg' },
  { dir: 'cere-tea', file: 'guava-1',                   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/0d3wbfLxRf4cOz_t1R_kog/o.jpg' },
  { dir: 'cere-tea', file: 'osmanthus-1',               url: 'https://s3-media0.fl.yelpcdn.com/bphoto/fONCLE_4WRjeqEVPOalEDA/o.jpg' },
  { dir: 'cere-tea', file: 'black-sesame-einspanner-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/2iTgxdR3sCyh-gKxEc1nhg/o.jpg' },
  { dir: 'cere-tea', file: 'black-sesame-einspanner-2', url: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwerscAwxF1Gqe0ptvcr3eI1rIBORaAT02vJzw9d4WYzSAzk2K8xt_2qwT4F2mOKqVqRJwjXbFwSHouVsgK9bA5qnT_J-_Oj6bmFo9zV2J4J9oH0Xd_gToDS8YMPtap6etwir-Tu21qDV010=s1360-w1360-h1020-rw' },
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
