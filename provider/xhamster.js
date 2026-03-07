const Provider = require('../provider')
const cheerio = require('cheerio')

class XHamster extends Provider {

  constructor() {
    super('https://xhamster.com', 'xhamster', 10)
  }

  getInitialUrl(catalogId) {

    if (catalogId.includes('4k')) {
      return `${this.baseUrl}/videos?quality=4k`
    }

    if (catalogId.includes('HD+')) {
      return `${this.baseUrl}/videos?quality=hd`
    }

    return `${this.baseUrl}/newest`
  }

  async search(query) {

    const url = `${this.baseUrl}/search/${encodeURIComponent(query)}`
    const html = await this.request(url)

    const $ = cheerio.load(html)

    const results = []

    $('div.thumb-list__item, div.video-thumb').each((i, el) => {

      const node = $(el)

      const link = node.find('a').attr('href')
      if (!link) return

      const id = link.split('/').pop()

      const title =
        node.find('a').attr('title') ||
        node.find('.video-thumb-info__name').text() ||
        id

      const img = node.find('img')

      const poster =
        img.attr('src') ||
        img.attr('data-src') ||
        img.attr('data-preview') ||
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

    const url = `${this.baseUrl}/videos/${id}`
    const html = await this.request(url)

    const streams = []

    // updated JSON extraction
    const regex = /window\.initials\s*=\s*(\{.*?\})\s*;/s
    const match = html.match(regex)

    if (!match) {
      throw new Error('XHamster metadata not found')
    }

    const json = JSON.parse(match[1])

    const sources =
      json?.videoModel?.sources?.hls ||
      json?.videoModel?.sources?.standard ||
      []

    if (Array.isArray(sources)) {

      sources.forEach(src => {

        if (src.url) {

          streams.push({
            title: `XHamster ${src.quality || ''}`.trim(),
            url: src.url
          })

        }

      })

    } else if (sources.url) {

      streams.push({
        title: 'XHamster',
        url: sources.url
      })

    }

    return streams
  }

}

module.exports = XHamster