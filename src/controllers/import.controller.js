const catchAsync = require('../utils/catchAsync');
const AdmZip = require("adm-zip");
const { importService } = require('../services');

const index = catchAsync(async(req, res) => {
  res.render('admin/pages/import', {
    admin_title: 'Import',
  });
});

const markdown = catchAsync(async(req, res) => {
  let file = req.file;
  let zip = new AdmZip(file.buffer);
  let zipEntries = zip.getEntries();
  for (let i = 0; i < zipEntries.length; i++) {
    let entry = zipEntries[i];
    let name = entry.entryName;
    let content = entry.getData().toString("utf8");
    await importService.importMarkdown(name, content);
  }
  // zipEntries.forEach(async(zipEntry) => {
  //   let name = zipEntry.entryName;
  //   let content = zipEntry.getData().toString("utf8");
  //   await importService.importMarkdown(name, content);    
  // });
  res.flash('success', 'Imported markdown files');
  res.redirect('/admin/import');
});

module.exports = {
  index,
  markdown
}