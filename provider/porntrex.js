const Provider = require('../provider')
const cheerio = require('cheerio')

const pathMappings = {
  "4K porn": "/category/4k/",
  "HD porn": "/category/hd/",
  "Jav": "/category/jav/",
  "Teen": "/category/teen/",
  "Asian": "/category/asian/",
  "Cuckold": "/category/cuckold/",
  "Hot wife": "/category/hot-wife/"
}

class Porntrex extends Provider {

  constructor() {
    super('https://porntrex.com', 'porntrex', 20)
  }

  async catalog({ extra }) {

    const genre = extra?.genre
    const skip = Number(extra?.skip) || 0
    const page = Math.floor(skip / 20) + 1

    const path = pathMappings[genre] || "/videos/"

    const url = `${this.baseUrl}${path}${page}/`

    const html = await this.request(url)

    const $ = cheerio.load(html)

    const metas = []

    $('div.thumb').each((i, el) => {

      const node = $(el)

      const link = node.find('a').attr('href')
      if (!link) return

      const id = link.split('/').pop()

      const title = node.find('img').attr('alt')

      const poster =
        node.find('img').attr('data-src') ||
        node.find('img').attr('src')

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

module.exports = Porntrex