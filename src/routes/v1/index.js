const express = require('express');
// const micropubRoute = require('./micropub.route');

const router = express.Router();

const defaultRoutes = [
  // {
  //   path: '/webmentions',
  //   route: webmentionRoute,
  // },
  // {
  //   path: '/micropub',
  //   route: micropubRoute,
  // },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;