const Provider = require('../provider')
const cheerio = require('cheerio')

const baseMappings = {
  "New": "/new_videos/",
  "Trending": "/trending_videos/",
  "Upcoming": "/upcoming_videos/",
  "Popular": "/popular_videos/"
}

const tagMappings = {
  "4k Porn": "/tag/4k/",
  "HD 1080p": "/tag/1080p/",
  "Amateur": "/tag/amateur/",
  "Students": "/tag/students/",
  "Japanese": "/tag/japanese/",
  "Asian Porn": "/tag/asian/",
  "Big Tits": "/tag/big-tits/",
  "Teens": "/tag/teen/",
  "Family": "/tag/family/",
  "Creampie": "/tag/creampie/",
  "Small Tits": "/tag/small-tits/"
}

class Spankbang extends Provider {

  constructor() {
    super('https://spankbang.com', 'spankbang', 20)
  }

  async catalog({ extra }) {

    const genre = extra?.genre
    const skip = Number(extra?.skip) || 0
    const page = Math.floor(skip / 20) + 1

    let url

    if (baseMappings[genre]) {
      url = `${this.baseUrl}${baseMappings[genre]}${page}/`
    } else {

      for (const tag in tagMappings) {
        if (genre?.includes(tag)) {
          url = `${this.baseUrl}${tagMappings[tag]}${page}/`
          break
        }
      }

    }

    if (!url) url = `${this.baseUrl}/new_videos/${page}/`

    const html = await this.request(url)

    const $ = cheerio.load(html)

    const metas = []

    $('div.video-item').each((i, el) => {

      const node = $(el)
      const link = node.find('a').attr('href')

      if (!link) return

      const id = link.split('/')[1]
      const title = node.find('a').attr('title') || id

      const img = node.find('img')
      const poster =
        img.attr('data-src') ||
        img.attr('src')

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

module.exports = Spankbang