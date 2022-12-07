const SporeStore = require('../store');

const queryMedia = async(filter, options) => {
  let media = await SporeStore.queryMedia(filter, options);
  return media;
};

const getMediaById = async(id) => {
  let media = await SporeStore.getMediaById(id);
  return media;
}

const getMediaByFilename = async(filename) => {
  let media = await SporeStore.getMediaByFilename(filename);
  return media;
}

const createMedia = async(body) => {
  let media = await SporeStore.createMedia(body);
  return media;
}

const updateMedia = async(id, body) => {
  let media = await SporeStore.updateMedia(id, body);
  return media;
}

const deleteMedia = async(id) => {
  let media = await SporeStore.getMediaById(id);

  // Delete the media file from disk
  const fs = require('fs');
  const path = require('path');
  const mediaPath = path.join(media.path);
  const filePath = path.join(mediaPath, media.path);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
    }
  });

  // Delete the media record from the database
  media = await SporeStore.deleteMedia(id);

  return media;
}

module.exports = {
  queryMedia,
  getMediaById,
  getMediaByFilename,
  createMedia,
  deleteMedia,
  updateMedia
}