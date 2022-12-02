const express = require('express');
const indieWebRoutes = require('./indieWeb');
const adminRoutes = require('./admin.route');
const blogRoutes = require('./blog.route');

const router = express.Router();

const defaultRoutes = [{
    path: '/indieWeb',
    route: indieWebRoutes,
    middleware: [],
  },
  {
    path: '/admin',
    route: adminRoutes,
    middleware: [],
  },
  // All other paths routed to blog routes
  {
    path: '/',
    route: blogRoutes,
    middleware: [],
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, ...route.middleware, route.route);
});

module.exports = router;