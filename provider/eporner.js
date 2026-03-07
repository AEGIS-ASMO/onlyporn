const Provider = require('../provider')
const cheerio = require('cheerio')

class Eporner extends Provider {

  constructor() {
    super('https://www.eporner.com', 'eporner', 20)
  }

  buildUrl(genre, page) {

    if (!genre) return `${this.baseUrl}/latest/${page}`

    if (genre.includes("4k Porn")) {

      if (genre.includes("Weekly Top"))
        return `${this.baseUrl}/top-weekly/4k/${page}`

      if (genre.includes("Most Viewed"))
        return `${this.baseUrl}/most-viewed/4k/${page}`

      return `${this.baseUrl}/4k-porn/${page}`

    }

    if (genre.includes("HD 1080p"))
      return `${this.baseUrl}/hd-porn/${page}`

    if (genre.includes("60fps"))
      return `${this.baseUrl}/60fps/${page}`

    return `${this.baseUrl}/latest/${page}`

  }

  async catalog({ extra }) {

    const genre = extra?.genre
    const skip = Number(extra?.skip) || 0
    const page = Math.floor(skip / 20) + 1

    const url = this.buildUrl(genre, page)

    const html = await this.request(url)

    const $ = cheerio.load(html)

    const metas = []

    $('div.mb').each((i, el) => {

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

module.exports = Eporner