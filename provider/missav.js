const Provider = require('../provider')
const cheerio = require('cheerio')

class MissAV extends Provider {

  constructor() {
    super('https://missav.ws', 'missav', 10)
    this.dataset = {}
    this.metas = {}
  }

  async search(query) {

    const url = `${this.baseUrl}/search/${encodeURIComponent(query)}`
    const html = await this.request(url)

    const $ = cheerio.load(html)

    const results = []

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

      results.push({
        id,
        name: title,
        poster,
        type: 'movie'
      })

    })

    return results
  }

  async load(id) {

    const url = `${this.baseUrl}/${id}`

    const html = await this.request(url)

    const streams = []

    // Extract m3u8 stream directly
    const match = html.match(/https:\/\/[^"]+playlist\.m3u8/g)

    if (match) {

      match.forEach(stream => {

        streams.push({
          title: 'MissAV',
          url: stream
        })

      })

    }

    return streams
  }

}

module.exports = MissAV