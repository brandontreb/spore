const catchAsync = require('../utils/catchAsync');
const AdmZip = require("adm-zip");
const { importService, postService } = require('../services');

const index = catchAsync(async(req, res) => {
  res.render('admin/pages/import', {
    admin_title: 'Import',
  });
});

const markdown = catchAsync(async(req, res) => {
  let blog = res.locals.blog;
  let file = req.file;
  let zip = new AdmZip(file.buffer);
  let zipEntries = zip.getEntries();
  for (let i = 0; i < zipEntries.length; i++) {
    let entry = zipEntries[i];
    let name = entry.entryName;
    let content = entry.getData().toString("utf8");
    let postObj = await importService.importMarkdown(name, content);

    // Dont try to import failed posts
    if (!postObj) {
      continue;
    }

    postObj.blog_id = blog.id;
    postObj.user_id = blog.user.id;
    let photo = postObj.media.photo;
    delete postObj.media;
    let post = await postService.createPost(postObj);
    await importService.associateMediaFilesWithPost(post, photo);
  }
  res.flash('success', 'Imported markdown files');
  res.redirect('/admin/import');
});

module.exports = {
  index,
  markdown
}