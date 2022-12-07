const axios = require('axios');
const fs = require('fs');
const fm = require('front-matter');
const moment = require('moment');
const logger = require('../config/logger');
const SporeStore = require('../store');
const { markdownToTxt } = require('markdown-to-txt');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const download = async(url, path) => {
  try {
    let response = await axios({
      method: "get",
      url: url,
      responseType: "stream"
    });
    response.data.pipe(fs.createWriteStream(path));

    let media = {
      type: 'image',
      mime_type: response.headers['content-type'],
      size: response.headers['content-length'],
      originalname: path.split('/').pop(),
      filename: path.split('/').pop(),
      path: path
    }
    return media;
  } catch (err) {
    console.log(err);
  }
};

const downloadMediaFile = async(url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  let fileName = url.split('/').pop();
  let path = `${__dirname}/../../data/uploads/${fileName}`;
  console.log(path);

  try {
    return await download(
      url,
      `${path}`
    );
  } catch (err) {
    console.error(err);
  }
}

const importMarkdown = async(name, markdown) => {
  let frontMatter = fm(markdown);

  let title = frontMatter.attributes.title;
  let published = frontMatter.attributes.date;
  if (!published) {
    // Check if name contains a date in the format yyyy-mm-dd
    let date = name.match(/\d{4}-\d{2}-\d{2}/);
    if (date) {
      published = date[0];
    }
  }

  let postTags = frontMatter.attributes.tags;
  let postCategories = frontMatter.attributes.categories;

  if (typeof frontMatter.attributes.tags === 'array') {
    postTags = frontMatter.attributes.tags.join(',');
  }

  if (typeof frontMatter.attributes.categories === 'array') {
    postCategories = frontMatter.attributes.categories.join(',');
  }

  if (typeof frontMatter.attributes.categories === 'object') {
    postCategories = Object.values(frontMatter.attributes.categories).join(',');
  }
  if (typeof frontMatter.attributes.tags === 'object') {
    postTags = Object.values(frontMatter.attributes.tags).join(',');
  }
  let tags = [
    postTags ? postTags.split(',').map(tag => tag.trim()) : "",
    postCategories ? postCategories.split(',').map(category => category.trim()) : ""
  ];
  // remove empty tags
  tags = tags.filter(t => t !== '')
  tags = tags.join(',');

  let slug = frontMatter.attributes.slug;
  let permalink = frontMatter.attributes.permalink;

  if (!slug) {
    slug = permalink;
  }

  if (!permalink) {
    permalink = slug;
  }

  let postContent = frontMatter.body;

  let type = title && title.length > 0 ? 'article' : 'note';
  let photo = frontMatter.attributes['mf-photo'];

  if (photo) {
    type = 'photo';
  }

  postObject = {
    name: title,
    categories: tags.split(','),
    slug: slug,
    permalink: permalink,
    content_md: postContent,
    content_html: md.render(postContent),
    content_text: markdownToTxt(postContent),
    status: 'published',
    type: type,
    published: moment(published).format('YYYY-MM-DD HH:mm:ss'),
  }

  let post;
  try {
    post = await SporeStore.createPost(postObject);
  } catch (e) {
    console.log(e);
  }

  // Download the media files

  if (photo) {
    let media = await downloadMediaFile(photo[0]);
    if (media) {
      const pathRegex = new RegExp(/\.\.\/\.\.\/(.*)/, "g");
      const match = pathRegex.exec(media.path);
      media.path = match[1];
      media.post_id = post ? post.id : 1;
      await associateMediaFilesWithPost(post, [media]);
      console.log(media);
    } else {
      logger.debug(`Could not download media file ${photo[0]}`);
    }
  }
};

const associateMediaFilesWithPost = async(post, mediaFiles) => {
  // Create the media objects if necessary
  if (mediaFiles) {
    mediaFiles.forEach(async(media) => {
      let mediaBody = {
        post_id: post.id,
        type: 'image', // TODO: Hardcoded for now, update when more media supported
        original_filename: media.originalname,
        path: media.path,
        mime_type: media.mime_type,
        filename: media.filename,
        size: media.size
      };
      await SporeStore.saveMedia(mediaBody);
    });
  }
}

module.exports = {
  downloadMediaFile,
  importMarkdown
}