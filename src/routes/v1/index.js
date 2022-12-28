const express = require('express');
const micropubRoute = require('../indieWeb/micropub.route');

const router = express.Router();

const defaultRoutes = [{
  path: '/micropub',
  route: micropubRoute,
}, ];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;