module.exports = class ISporeStore {
  constructor() {
    this.db = null
  }

  async init(callback) {
    throw new Error('Not implemented')
  }

  savePost(post) {
    throw new Error('Not implemented')
  }
}