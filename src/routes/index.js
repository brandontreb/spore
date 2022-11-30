const express = require('express');
const indieWebRoutes = require('./indieWeb');
const adminRoute = require('./admin.route');

const router = express.Router();

const defaultRoutes = [{
    path: '/indieWeb',
    route: indieWebRoutes,
    middleware: [],
  },
  {
    path: '/admin',
    route: adminRoute,
    middleware: [],
  },

];

defaultRoutes.forEach((route) => {
  router.use(route.path, ...route.middleware, route.route);
});

module.exports = router;