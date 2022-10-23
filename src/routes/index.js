const express = require('express');
const indieAuthRoute = require('./indieAuth.route');
const micropubRoute = require('./micropub.route');

const router = express.Router();

const defaultRoutes = [{
  path: '/micropub',
  route: micropubRoute,
}, {
  path: '/indieAuth',
  route: indieAuthRoute,
}, ];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;