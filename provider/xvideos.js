const Provider = require('../provider')
const cheerio = require('cheerio')

class XVideos extends Provider {

  constructor() {
    super('https://www.xvideos.com', 'xvideos', 10)
  }

  async search(query) {

    const url = `${this.baseUrl}/?k=${encodeURIComponent(query)}`
    const html = await this.request(url)

    const $ = cheerio.load(html)

    const results = []

    $('div.mozaique .thumb-block').each((i, el) => {

      const node = $(el)

      const link = node.find('a').attr('href')
      if (!link) return

      const id = link.split('/').pop()

      const title =
        node.find('a').attr('title') ||
        id

      const img = node.find('img')

      const poster =
        img.attr('data-src') ||
        img.attr('src') ||
        ''

      results.push({
        id,
        name: title.trim(),
        poster,
        type: 'movie'
      })

    })

    return results
  }

  async load(id) {

    const url = `${this.baseUrl}/video${id}`
    const html = await this.request(url)

    const streams = []

    const match = html.match(/https:\/\/[^"]+\.m3u8/g)

    if (match) {

      match.forEach(stream => {

        streams.push({
          title: 'XVideos',
          url: stream
        })

      })

    }

    return streams
  }

}

module.exports = XVideos