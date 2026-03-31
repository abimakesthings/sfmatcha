// scripts/download-photos.js
// Downloads and converts all curated spot photos to WebP
// Run with: node scripts/download-photos.js

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const OUT = path.resolve(__dirname, '../public/images')

// Each entry: { dir, file, url }
const downloads = [

  // ── SHOJI ──────────────────────────────────────────────
  { dir: 'shoji', file: 'einspanner-1', url: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepPQWXC17ADRQlXCeqFobevg_Eeu_NAHgOMeOwU1BNizKDJ2VO_YH1JcnKr_-TMsMV4EQcdM06EB-YZrtfvCjuKvFcOWSTjN86l-WE5vSd1KqQsh57Na6wXcH89HDQuUQf2AEKDxL7sJ3Ya=w1200' },
  { dir: 'shoji', file: 'einspanner-2', url: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepJ0sqlyJXOxd2JSejmRCNaKQID6aMG_hHriyOrkObh0Zj1mJwU6sPO64XuOMWFUYOwk4Ba87a-2UtcELsTdIuw-jQJjIdDvDzjo5EDJzh9BRg9qD0gSBvfIx6pPrH9IdurhCY777g6EsYd=w1200' },
  { dir: 'shoji', file: 'einspanner-3', url: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweoLGcgPQud67weBhTE2AYgiGDnsQlSeFNvCHUPzAa5XgOPsqDfDvMPf_TPKp2j5qGc6msRZFVxet4AOw767j0geDpoP98CQuKXyVkjQmZvZo9epd4gylLhoG_1kGkWx7qQSDK1K4LxtyoXU=w1200' },

  // ── KOPIKU ─────────────────────────────────────────────
  { dir: 'kopiku', file: 'interior-1',  url: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepjkuSELsbrbLbTt_sQEVblzqcFIf2s1bu2gAzpiuTmdSEJcb6qPtjgyx3ZZEprypDy_3ruiVpQ_Pv4CbWSO_4tM8fOEgUreLGbKzX8lewkvOtxTGx7qAyNtub3w_xWgGymaCSfk9AKMu6c=w1200' },
  { dir: 'kopiku', file: 'pandan-1',    url: 'https://s3-media0.fl.yelpcdn.com/bphoto/pIBy3qCXQQEjhvPAF7-kwA/o.jpg' },
  { dir: 'kopiku', file: 'pandan-2',    url: 'https://s3-media0.fl.yelpcdn.com/bphoto/kdKylUT4HOt8_bI1CNsT9g/o.jpg' },

  // ── WILD FOX ───────────────────────────────────────────
  { dir: 'wild-fox', file: 'interior-1', url: 'https://lh3.googleusercontent.com/geougc-cs/ABOP9pv6fDBfdzkuTGhxSrEots9ly0vC5QggSrQfnxqR1Gmoc_ggFZfiBsRijxMSGBYPcMf3Q31xsYu0Zx8mxdu7s_WFmOygrGkBsY9fhBhGvRGR3SHJ-TH1N38XqatSsRkGZphHRk1w7D5hJWY1=w1200' },
  { dir: 'wild-fox', file: 'mango-1',    url: 'https://lh3.googleusercontent.com/geougc-cs/ABOP9ptwzMrFskJ8D_B10mM-H_4koBP_HO-TVwte5yRlBJxda1YTZ3gUYC6YaXy0uWmePb2zNCypplfIkD3WOTfeEpc1WBpCxE2gB8lCRxWK-VAoKHKPh_iwbGYYUniIT4ZrFhpFzoM_zafIgnmu=w1200' },

  // ── KISSATEN HIFI ──────────────────────────────────────
  { dir: 'kissaten', file: 'ichigo-1',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/joclQubuQwOSwNnbILNsVQ/o.jpg' },
  { dir: 'kissaten', file: 'interior-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/d50Ik8hmYwP-Hp5JJK2-Aw/o.jpg' },

  // ── SOHN ───────────────────────────────────────────────
  { dir: 'sohn', file: 'interior-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/KfectTAF_t8HfIH291wUvg/o.jpg' },
  { dir: 'sohn', file: 'interior-2', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/AdYt3L0sgiquJaQnhcdw8Q/o.jpg' },
  { dir: 'sohn', file: 'interior-3', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/GBC7rW7qYTdrDo6HgeThfA/o.jpg' },
  { dir: 'sohn', file: 'banana-1',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/jYXGVFquGRvXegG3FBcjFA/o.jpg' },
  { dir: 'sohn', file: 'melona-1',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/EIyO0O7u5BUPfRJJbnms2A/o.jpg' },
  { dir: 'sohn', file: 'food-1',     url: 'https://s3-media0.fl.yelpcdn.com/bphoto/v1uSpC8qUFXaPEVAwuH-7A/o.jpg' },

  // ── JADE & JAVA ────────────────────────────────────────
  { dir: 'jade-java', file: 'banana-1',       url: 'https://s3-media0.fl.yelpcdn.com/bphoto/vWIuWg20ZTC0qNNmxUOSgQ/o.jpg' },
  { dir: 'jade-java', file: 'creme-brulee-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/_lq_705anG5GT3Yomfctyw/o.jpg' },
  { dir: 'jade-java', file: 'strawberry-1',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/jt3KZdFyzASulyIgzVKZsw/o.jpg' },
  { dir: 'jade-java', file: 'black-sesame-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/6jSleSQQsn3lIt1LUtFsNA/o.jpg' },

  // ── MATCHA CAFE MAIKO — Japantown ──────────────────────
  { dir: 'matcha-maiko-japantown', file: 'interior-1',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/LE8aaThCgUJDABVn8HR9lw/o.jpg' },
  { dir: 'matcha-maiko-japantown', file: 'interior-2',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/Eihwx854EIMcHmRoAr20oA/o.jpg' },
  { dir: 'matcha-maiko-japantown', file: 'interior-3',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/xjCNlH3QUC7UGcu7T9DCAA/o.jpg' },
  { dir: 'matcha-maiko-japantown', file: 'interior-4',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/rZzNH1cWOebWPGfM6_r06w/o.jpg' },
  { dir: 'matcha-maiko-japantown', file: 'kuromitsu-1',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/RvDF-J--XvQf5d8K9EjwYQ/o.jpg' },

  // ── MATCHA CAFE MAIKO — Stonestown ─────────────────────
  { dir: 'matcha-maiko-stonestown', file: 'interior-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/Wo9tMqB2HQrDKS4TiljWpA/o.jpg' },
  { dir: 'matcha-maiko-stonestown', file: 'interior-2', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/knuq_ogD_Vu0MYl7wP6D5w/o.jpg' },
  { dir: 'matcha-maiko-stonestown', file: 'interior-3', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/ISHxA0midKmBhde51QD_bA/o.jpg' },

  // ── MATCHA CAFE MAIKO — Chinatown ──────────────────────
  { dir: 'matcha-maiko-chinatown', file: 'interior-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/iG6-qbuj5lGlS_cTPWBtiw/o.jpg' },
  { dir: 'matcha-maiko-chinatown', file: 'interior-2', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/b8oGI_tS0VAj3_zrO3dZfw/o.jpg' },
  { dir: 'matcha-maiko-chinatown', file: 'interior-3', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/8wrFZoHyEeKenYK2wddxVw/o.jpg' },

  // ── TADAIMA — Inner Sunset ─────────────────────────────
  { dir: 'tadaima-sunset', file: 'interior-1',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/1e_B8zIK1K7Nyep94dc1Wg/o.jpg' },
  { dir: 'tadaima-sunset', file: 'strawberry-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/MTWpbZ-ow25E4vZLGh1Z6A/o.jpg' },
  { dir: 'tadaima-sunset', file: 'drink-1',      url: 'https://s3-media0.fl.yelpcdn.com/bphoto/wjatEEaCT9sPEwip8gzNxg/o.jpg' },
  { dir: 'tadaima-sunset', file: 'drink-2',      url: 'https://s3-media0.fl.yelpcdn.com/bphoto/lWKubhBNEz8OZvHFZcgNsg/o.jpg' },
  { dir: 'tadaima-sunset', file: 'pistachio-1',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/Er5sgFdFlcqsM60NCuWxUQ/o.jpg' },

  // ── TADAIMA — Mission ──────────────────────────────────
  { dir: 'tadaima-mission', file: 'interior-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/-s9MLPH3AKdzYzNAf0HmIA/o.jpg' },
  { dir: 'tadaima-mission', file: 'interior-2', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/eI6M-1w8GBj0xpN9PEWqnw/o.jpg' },
  { dir: 'tadaima-mission', file: 'interior-3', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/nNCoLYo8Op2iVqV--7nxvw/o.jpg' },
  { dir: 'tadaima-mission', file: 'cheese-1',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/kJ8mL47W6OYyzwik9Zd1Sw/o.jpg' },

  // ── TADAIMA — Marina (no spots.json entry yet) ─────────
  { dir: 'tadaima-marina', file: 'interior-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/6qV6Vqf6lVpE_YqDeE8JwQ/o.jpg' },
  { dir: 'tadaima-marina', file: 'interior-2', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/caTqstU-A9ylCGz4UwxZ2Q/o.jpg' },
  { dir: 'tadaima-marina', file: 'interior-3', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/X1b4UFyUnYATSUl_lZO84Q/o.jpg' },
  { dir: 'tadaima-marina', file: 'interior-4', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/vSJcyGPpbOdu9Yj0oWfbsA/o.jpg' },

  // ── PROGENY ────────────────────────────────────────────
  { dir: 'progeny', file: 'blueberry-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/o4znq1GGEz031Q8lbXTtrA/o.jpg' },
  { dir: 'progeny', file: 'blueberry-2', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/lZdcXcZiy_YLla52ZAuhdQ/o.jpg' },
  { dir: 'progeny', file: 'blueberry-3', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/iJ7dnVcdgx61b5MlqSFggw/o.jpg' },
  { dir: 'progeny', file: 'interior-1',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/hlhEG8mFRvCIYq7GkKnnhw/o.jpg' },
  { dir: 'progeny', file: 'interior-2',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/TQSBxFK9IABH6D9l2LMhDg/o.jpg' },

  // ── STONEMILL MATCHA ───────────────────────────────────
  { dir: 'stonemill', file: 'rose-1',        url: 'https://s3-media0.fl.yelpcdn.com/bphoto/s1DthGyTYGM8k7zyjathKQ/o.jpg' },
  { dir: 'stonemill', file: 'rose-2',        url: 'https://s3-media0.fl.yelpcdn.com/bphoto/jsU93LJ8MchRHdeLPDUbIQ/o.jpg' },
  { dir: 'stonemill', file: 'rose-3',        url: 'https://s3-media0.fl.yelpcdn.com/bphoto/Jt-O_zYXYt-4AyDQOULeaA/o.jpg' },
  { dir: 'stonemill', file: 'rose-4',        url: 'https://s3-media0.fl.yelpcdn.com/bphoto/I1APsMyYjd9IiNxvOz5xqA/o.jpg' },
  { dir: 'stonemill', file: 'strawberry-1',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/5cHSqek7_i4EO_Tw4kuOQw/o.jpg' },
  { dir: 'stonemill', file: 'strawberry-2',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/i4PS6EiA0x2GXbQZ4hRloA/o.jpg' },

  // ── ASHA TEA HOUSE ─────────────────────────────────────
  { dir: 'asha', file: 'strawberry-1',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/GopwCNRBp0cE_Lz7V1TCmQ/o.jpg' },
  { dir: 'asha', file: 'strawberry-2',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/rq9UHWPCCdoW6wBL9u3GFg/o.jpg' },
  { dir: 'asha', file: 'strawberry-3',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/6SKffw_77uK2ZTDQXURClA/o.jpg' },
  { dir: 'asha', file: 'blood-orange-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/aoeSc6aF9UsgXUQwnBonDQ/o.jpg' },

  // ── JUNBI ──────────────────────────────────────────────
  { dir: 'junbi', file: 'guava-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/VKZSbhfrAjVoTe2cXVnteA/o.jpg' },
  { dir: 'junbi', file: 'guava-2', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/Kz6tkJ0-qgqB_zMwaM0X-w/o.jpg' },
  { dir: 'junbi', file: 'guava-3', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/n8I38XhDqcYjaqvsIVTsvA/o.jpg' },
  { dir: 'junbi', file: 'mango-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/ZqXEsXh0-EugzdNFjiGhIg/o.jpg' },
  { dir: 'junbi', file: 'mango-2', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/3am7m11AT_JoorHAVplWjg/o.jpg' },

  // ── MARUWU SEICHA ──────────────────────────────────────
  { dir: 'maruwu', file: 'mango-1',       url: 'https://s3-media0.fl.yelpcdn.com/bphoto/ihEB_5pzDV3GFwR_Z48V9Q/o.jpg' },
  { dir: 'maruwu', file: 'mango-2',       url: 'https://s3-media0.fl.yelpcdn.com/bphoto/r_KGG2S0qTJBjDI7dBG_QQ/o.jpg' },
  { dir: 'maruwu', file: 'strawberry-1',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/lF6JpmnY2EZnsqlxtcMkSg/o.jpg' },
  { dir: 'maruwu', file: 'strawberry-2',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/jNF5yEvcF5b-BgM4RqCQpA/o.jpg' },
  { dir: 'maruwu', file: 'strawberry-3',  url: 'https://s3-media0.fl.yelpcdn.com/bphoto/pIK7XbvZ6MaUYPosRukcjw/o.jpg' },
  { dir: 'maruwu', file: 'guava-peach-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/Fwr5R_BhdY3AQm_ERG29fQ/o.jpg' },
  { dir: 'maruwu', file: 'general-1',     url: 'https://s3-media0.fl.yelpcdn.com/bphoto/ZClIMnCpRPGYOP8LZ7Ohzg/o.jpg' },
  { dir: 'maruwu', file: 'taro-1',        url: 'https://s3-media0.fl.yelpcdn.com/bphoto/jsYbPEuSSshkLIS6Wismcw/o.jpg' },

  // ── NAGOMI ─────────────────────────────────────────────
  { dir: 'nagomi', file: 'interior-1',   url: 'https://s3-media0.fl.yelpcdn.com/bphoto/eTebmRcR8CbPl6kEaFU1UQ/o.jpg' },
  { dir: 'nagomi', file: 'strawberry-1', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/BVeIozL2qf0xWlJqsUF4Zw/o.jpg' },
  { dir: 'nagomi', file: 'strawberry-2', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/S2nMSybi3aldHIEJPuPUCw/o.jpg' },
  { dir: 'nagomi', file: 'strawberry-3', url: 'https://s3-media0.fl.yelpcdn.com/bphoto/C4VJSvEvG_sxYDMiV44Uyg/o.jpg' },
]

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      }
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        fs.unlinkSync(dest)
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        file.close()
        try { fs.unlinkSync(dest) } catch {}
        return reject(new Error(`HTTP ${res.statusCode}`))
      }
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
      file.on('error', reject)
    })
    req.on('error', reject)
  })
}

async function main() {
  let ok = 0, skip = 0, fail = 0

  for (const { dir, file, url } of downloads) {
    const dirPath = path.join(OUT, dir)
    fs.mkdirSync(dirPath, { recursive: true })

    const outPath = path.join(dirPath, `${file}.webp`)
    if (fs.existsSync(outPath)) {
      process.stdout.write(`  skip  ${dir}/${file}.webp\n`)
      skip++
      continue
    }

    const tmpPath = path.join(dirPath, `${file}.tmp`)
    try {
      process.stdout.write(`  dl    ${dir}/${file} ...`)
      await download(url, tmpPath)
      await sharp(tmpPath).webp({ quality: 85 }).toFile(outPath)
      fs.unlinkSync(tmpPath)
      const size = Math.round(fs.statSync(outPath).size / 1024)
      process.stdout.write(` ✓ ${size}KB\n`)
      ok++
    } catch (err) {
      process.stdout.write(` ✗ ${err.message}\n`)
      try { fs.unlinkSync(tmpPath) } catch {}
      fail++
    }
  }

  console.log(`\nDone: ${ok} downloaded, ${skip} skipped, ${fail} failed`)
}

main().catch(console.error)
