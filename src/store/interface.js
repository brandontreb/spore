module.exports = class ISporeStore {
  constructor() {
    this.db = null
  }

  async init(callback) {
    throw new Error('Not implemented')
  }

  createPost(post) {
    throw new Error('Not implemented')
  }

  createMedia(media) {
    throw new Error('Not implemented')
  }
}