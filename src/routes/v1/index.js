const express = require("express");
const userRoute = require("./user.route");
const authRoute = require("./auth.route");
const companyRoute = require("./company.route");
const companyUserRoute = require("./company_user.route");
const invitationRoute = require("./invitation.route");
const clientGroupRoute = require("./client_group.route");
const clientRoute = require("./client.route");
const config = require("../../config/config");
const fileManagerRoute = require("../v1/file_manager.route");
const formRoute = require("../v1/form.route");
const graphRoute = require("../v1/graph.route");
const roleRoute = require("../v1/role.route");
const logsRoute = require("../v1/logs.route");
const appointmentRoute = require("../v1/appointment.route");
const kpiRoute = require("../v1/kpi.route");
const dashboardRoute = require("../v1/dashboard.route");
const leaderRoute = require("../v1/leader.route");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/company",
    route: companyRoute,
  },
  {
    path: "/companyUser",
    route: companyUserRoute,
  },
  {
    path: "/invitation",
    route: invitationRoute,
  },
  {
    path: "/clientGroup",
    route: clientGroupRoute,
  },
  {
    path: "/client",
    route: clientRoute,
  },
  {
    path: "/file",
    route: fileManagerRoute,
  },
  {
    path: "/form",
    route: formRoute,
  },
  {
    path: "/graph",
    route: graphRoute,
  },
  {
    path: "/roles",
    route: roleRoute,
  },
  {
    path: "/logs",
    route: logsRoute,
  },
  {
    path: "/appointment",
    route: appointmentRoute,
  },
  {
    path: "/kpi",
    route: kpiRoute,
  },
  {
    path: "/dashboard",
    route: dashboardRoute,
  },

   {
    path: "/leader",
    route: leaderRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  // {
  //   path: '/docs',
  //   route: docsRoute,
  // },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
  // console.log("Routes Loaded");
});

/* istanbul ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
