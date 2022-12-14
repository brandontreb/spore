const express = require('express');
const indieAuthRoute = require('./indieAuth.route');
const micropubRoute = require('./micropub.route');

const router = express.Router();

const defaultRoutes = [{
  path: '/micropub',
  route: micropubRoute,
  middleware: [],
}, {
  path: '/indieAuth',
  route: indieAuthRoute,
  middleware: [],
}, ];

defaultRoutes.forEach((route) => {
  router.use(route.path, ...route.middleware, route.route);
});

module.exports = router;