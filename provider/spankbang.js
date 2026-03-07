const Provider = require('../provider')
const cheerio = require('cheerio')

class Spankbang extends Provider {

  constructor() {
    super('https://spankbang.com', 'spankbang', 10)
  }

  async search(query) {

    const url = `${this.baseUrl}/s/${encodeURIComponent(query)}/`
    const html = await this.request(url)

    const $ = cheerio.load(html)
    const results = []

    $('div.video-item, div.thumb').each((i, el) => {

      const node = $(el)

      const link = node.find('a').attr('href')
      if (!link) return

      const id = link.split('/')[1]

      const title =
        node.find('a').attr('title') ||
        node.find('.name').text() ||
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

    const url = `${this.baseUrl}/${id}/video`
    const html = await this.request(url)

    const streams = []

    const match = html.match(/https:\/\/[^"]+\.m3u8/g)

    if (match) {

      match.forEach(stream => {

        streams.push({
          title: 'SpankBang',
          url: stream
        })

      })

    }

    return streams
  }

}

module.exports = Spankbang