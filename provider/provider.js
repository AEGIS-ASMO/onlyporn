const m3u8 = require('m3u8-parser');
const logger = require('../logger');
const { event, track } = require('../analytics');

class Provider {
  static LIMIT = 50;
  static TYPE = 'movie';
  static TRANSPORT_URL = 'https://07b88951aaab-jaxxx-v2.baby-beamup.club/manifest.json';

  constructor(baseUrl, name, limit) {
    this.baseUrl = baseUrl;
    this.name = name;
    this.limit = limit || Provider.LIMIT;
  }

  getName() {
    return this.name;
  }

  activate(catalogId) {
    return catalogId.indexOf(this.getName()) !== -1;
  }

  getInitialUrl(catalogId) {
    return this.baseUrl;
  }

  static create() {
    return new Provider('', 'default');
  }

  async fetchHtml(url) {
    console.info('fetching url', url);
    try {
      const response = await fetch(url);
      const text = await response.text();
      return text;
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  page(skip) {
    if (skip) {
      const page = Math.ceil((skip || 0) / this.limit);
      if (page === 0) return '';
      return `${page}`;
    }
    return '';
  }

  handleSearch({ extra: { search: keyword } }) {
    return `/search/${keyword}/`;
  }

  handleGenre({ extra: { genre } }) {
    return '?genre=' + genre;
  }

  handlePagination(url, { extra: { skip } }) {
    return `?skip=${skip}`;
  }

  getCatalogMetas(html) {
    return [];
  }

  getAnalyticEvent(eventName, id) {
    if (id) {
      return `${eventName}-${id}`;
    }
    return `${eventName}-${this.getName()}`;
  }

  async handleCatalog(args) {
    if (args.type === Provider.TYPE && this.activate(args.id)) {
      this.track(this.getAnalyticEvent(event.CATALOG, args.id), args);
      logger.info({ args }, 'handleCatalog');

      let url = this.getInitialUrl(args.id);

      if (args.extra) {
        if (args.extra.search) {
          url = this.handleSearch(args);
        }

        if (args.extra.genre) {
          url = this.handleGenre(args);
        }
      }

      if (args.extra?.skip) {
        url += this.handlePagination(url, args);
      }

      const html = await this.fetchHtml(url).catch(() => '');
      const metas = this.getCatalogMetas(html);

      logger.debug({ metasSize: metas.length }, 'catalog');
      return { metas };
    }

    return { metas: [] };
  }

  async handleMeta(args) {
    if (args.type === Provider.TYPE && this.activate(args.id)) {
      this.track(this.getAnalyticEvent(event.METADATA), args);

      const meta = await this.getMetadata(args);
      return { meta };
    }

    return { meta: {} };
  }

  async getMetadata(args) {
    logger.info({ args }, 'getMetadata');

    const { id } = args;

    const html = await this.fetchHtml(id);
    return this.parseVideoPage({ id, html });
  }

  async handleStream(args) {
    const { id } = args;

    if (args.type === Provider.TYPE && this.activate(id)) {
      this.track(this.getAnalyticEvent(event.STREAM), args);
      logger.info({ args }, 'handleStream');

      return this.processStreams(args);
    }

    return { streams: [] };
  }

  async processStreams({ id }) {
    const html = await this.fetchHtml(id);
    const meta = await this.parseVideoPage({ id, html });

    return this.getStreams(meta);
  }

  async getStreams(meta) {
    const content = await this.fetchHtml(meta.videoPageUrl);

    const streams = this.parseM3u8(content)
      .map(stream => this.transformStream(meta.videoPageUrl, stream));

    return { streams };
  }

  transformStream(url, stream) {
    return stream;
  }

  parseM3u8(content) {
    const streams = [];

    try {
      const parser = new m3u8.Parser();
      parser.push(content);
      parser.end();

      if (!parser.manifest.playlists) {
        return [];
      }

      parser.manifest.playlists.forEach(playlist => {
        streams.push({
          resolution: playlist.attributes.RESOLUTION.height + 'p',
          uri: playlist.uri,
        });
      });

      streams.sort(
        (a, b) =>
          parseInt(b.resolution) - parseInt(a.resolution)
      );

      logger.debug({ streams }, 'streams');

      return streams.map(stream => ({
        type: 'movie',
        url: stream.uri,
        name: stream.resolution,
      }));

    } catch (e) {
      console.error('parseM3u8 error', e);
      return [];
    }
  }

  parseVideoPage(args) {
    return {};
  }

  track(a1, a2) {
    try {
      track(a1, a2);
    } catch (e) {
      console.warn('analytics disabled');
    }
  }
}

module.exports = Provider;