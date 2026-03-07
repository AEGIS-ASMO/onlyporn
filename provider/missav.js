const Provider = require('../provider')
const cheerio = require('cheerio')

const pathMappings = {
  "Uncensored leak": "/uncensored-leak",
  "Most viewed today": "/today-hot",
  "Weekly hot": "/weekly-hot",
  "Monthly hot": "/monthly-hot"
}

class MissAV extends Provider {

  constructor() {
    super('https://missav.ws', 'missav', 20)
  }

  async catalog({ extra }) {

    const genre = extra?.genre
    const skip = Number(extra?.skip) || 0

    const path = pathMappings[genre] || "/today-hot"
    const page = Math.floor(skip / 20) + 1

    const url = `${this.baseUrl}${path}?page=${page}`
    const html = await this.request(url)

    const $ = cheerio.load(html)

    const metas = []

    $('div.thumbnail').each((i, el) => {

      const node = $(el)
      const link = node.find('a').attr('href')

      if (!link) return

      const id = link.split('/').pop()

      const title = node.find('a').attr('title') || id
      const img = node.find('img')

      const poster =
        img.attr('data-src') ||
        img.attr('src') ||
        ''

      metas.push({
        id,
        name: title,
        poster,
        type: 'movie'
      })

    })

    return { metas }

  }

  async stream({ id }) {

    const url = `${this.baseUrl}/${id}`
    const html = await this.request(url)

    const streams = []
    const match = html.match(/https:\/\/[^"]+playlist\.m3u8/g)

    if (match) {
      match.forEach(stream => {
        streams.push({ title: "MissAV", url: stream })
      })
    }

    return { streams }

  }

}

module.exports = MissAV