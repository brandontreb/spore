const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { micropubService } = require('../services');
const SporeStore = require('../store');
const { slugify } = require('../utils/utils');

const create = catchAsync(async(req, res, next) => {
  let { body, query } = req;
  let blog = config.blog;

  // check if get request
  if (req.method === 'GET' && req.query['q'] === 'config') {
    return res.json({
      "media-endpoint": `${blog.url}/micropub/media`,
      "syndicate-to": []
    });
  }

  // check if get request
  if (!body) {
    body = query;
  }

  let raw = JSON.stringify(body);

  // Check the body type and process accordingly
  if (body) {
    if (req.is('json')) {
      body = micropubService.processJsonEncodedBody(req.body);
    } else {
      body = micropubService.processFormEncodedBody(req.body);
    }
  }
  logger.info('Micropub request: %j', body);

  let post = micropubService.processMicropubDocument(body);

  // TODO: Check if published in future and update the slug
  post.blogId = blog.id;
  let now = new Date();
  const date = now.toISOString().split('T')[0].replaceAll('-', '/');
  post.permalink = `/${date}/${post.slug}`;

  // handle categories
  if (post.categories && post.categories.length) {
    post.categories = post.categories.map((category) => {
      return {
        blogId: blog.id,
        name: category,
        slug: slugify(category)
      };
    });
  }

  let postObj = await SporeStore.savePost({...post, _raw: raw });

  // Enumerate the post photos
  if (post.media && post.media.photo && post.media.photo.length > 0) {
    for (let photo of post.media.photo) {
      let altText = '';
      if (typeof photo === 'object') {
        if (photo.alt) {
          altText = photo.alt;
        }
        photo = photo.value;
      } else {
        continue;
      }
      let filename = photo.split('/').pop();
      let media = await SporeStore.getMediaByFilename(filename);
      if (media) {
        await SporeStore.updateMedia({...media, postId: postObj.id, altText: altText });
      }
    }
  }

  res.set('Location', `${blog.url}${postObj.permalink}`).status(httpStatus.CREATED).send();
});

// Create and endpoint called media that allows uploads
const media = catchAsync(async(req, res, next) => {
  let blog = config.blog;

  if (!req.files || req.files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  let response = [];
  for (let file of req.files.file) {
    let mediaBody = {
      blogId: blog.id,
      type: 'image', // TODO: Hardcoded for now, update when more media supported
      originalFilename: file.originalname,
      path: file.path,
      mimeType: file.mimetype,
      filename: file.filename,
      size: file.size
    };

    let media = await SporeStore.saveMedia(mediaBody);

    response.push({
      url: `${blog.url}/${media.path}`,
      mime_type: media.mimeType,
      published: media.createdAt
    })
  }

  if (response.length === 1) {
    response = response[0];
  }

  return res.set({ 'Location': response.url }).status(httpStatus.CREATED).json(response);
});

const getMedia = catchAsync(async(req, res, next) => {
  const blog = config.blog;
  if (req.query && req.query.q && req.query.q === 'source') {
    // Get the last upload media item
    // let media = await mediaService.queryMedia({}, {
    //   limit: 1,
    //   order: [
    //     ['createdAt', 'DESC']
    //   ]
    // });
    // media = media.map(m => {
    //   return {
    //     url: `${blog.url}/${m.path}`,
    //     mime_type: m.mimeType,
    //     published: m.createdAt
    //   }
    // });
    let media = {};
    return res.json(media);
  }
  // throw error if not source
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid query');
});

module.exports = {
  create,
  media,
  getMedia,
};