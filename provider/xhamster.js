const Provider = require('../provider')
const cheerio = require('cheerio')

const pathMappings = {
  "Best (Daily)": "/best",
  "Best (Weekly)": "/best-of-week",
  "Best (Monthly)": "/best-of-month"
}

class Xhamster extends Provider {

  constructor() {
    super('https://xhamster.com', 'xhamster', 20)
  }

  async catalog({ extra, id }) {

    const genre = extra?.genre
    const skip = Number(extra?.skip) || 0
    const page = Math.floor(skip / 20) + 1

    const quality = id.includes('4k') ? '4k' : 'hd'

    let url

    if (quality === "4k") {
      url = `${this.baseUrl}/videos?quality=4k&page=${page}`
    } else {
      const path = pathMappings[genre] || "/best"
      url = `${this.baseUrl}${path}?page=${page}`
    }

    const html = await this.request(url)

    const $ = cheerio.load(html)

    const metas = []

    $('div.thumb-list__item').each((i, el) => {

      const node = $(el)
      const link = node.find('a').attr('href')

      if (!link) return

      const id = link.split('/').pop()
      const title = node.find('a').attr('title') || id

      const img = node.find('img')
      const poster =
        img.attr('src') ||
        img.attr('data-src') ||
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

}

module.exports = Xhamster