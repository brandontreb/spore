const config = require('../../config/config');
const catchAsync = require('../../utils/catchAsync');
const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');
const { indieWebService, postService, mediaService } = require('../../services');
// const SporeStore = require('../../store');

const create = catchAsync(async(req, res, next) => {
  let { body, query } = req;
  let blog = res.locals.blog;

  // check if get request
  if (req.method === 'GET') {
    if (req.query['q'] === 'config') {
      return res.json({
        "media-endpoint": `${blog.url}/indieWeb/micropub/media`,
        "syndicate-to": []
      });
    } else if (req.query['q'] === 'category') {
      return res.json([]);
    }
    return res.json([]);
  }


  // check if get request
  if (!body) {
    body = query;
  }

  let raw = JSON.stringify(body);

  logger.info('micropub request: %j', body);

  // Check the body type and process accordingly
  if (body) {
    if (req.is('json')) {
      body = indieWebService.processJsonEncodedBody(req.body);
    } else {
      body = indieWebService.processFormEncodedBody(req.body);
    }
  }

  let post = indieWebService.processMicropubDocument(body);

  post = {
    ...post,
    raw: raw,
    blog_id: blog.id,
    user_id: blog.user.id
  }

  let postObj = await postService.createPost(post);
  let url = `${blog.url}${postObj.permalink}`;
  await indieWebService.sendWebmentions(url, postObj.links);

  res.set('Location', `${url}`).status(httpStatus.CREATED).send();
});

// Create and endpoint called media that allows uploads
const media = catchAsync(async(req, res, next) => {
  let blog = res.locals.blog;

  logger.info('micropub media request: %j', req.files);

  if (!req.files || req.files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  let response = [];
  for (let file of req.files.file) {
    let mediaBody = {
      type: 'image', // TODO: Hardcoded for now, update when more media supported
      original_filename: file.originalname,
      path: file.path,
      mime_type: file.mimetype,
      filename: file.filename,
      size: file.size
    };

    let media = await mediaService.createMedia(mediaBody);

    response.push({
      url: `${blog.url}/${media.path}`,
      mime_type: media.mime_type,
      published: media.createdAt
    })
  }

  if (response.length === 1) {
    response = response[0];
  }

  return res.set({ 'Location': response.url }).status(httpStatus.CREATED).json(response);
});

const getMedia = catchAsync(async(req, res, next) => {
  const blog = res.locals.blog;
  const limit = req.query.limit || 10;
  if (req.query && req.query.q && req.query.q === 'source') {
    // Get the last upload media item
    let media = await mediaService.queryMedia({}, {
      limit: limit,
      order: [
        ['createdAt', 'DESC']
      ]
    });
    media = media.map(m => {
      return {
        url: `${blog.url}/${m.path}`,
        mime_type: m.mimeType,
        published: m.createdAt
      }
    });
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