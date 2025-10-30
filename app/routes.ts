import { type RouteConfig, index, route } from "@react-router/dev/routes";

// React Router config (for the framework)
export const appRoutes: RouteConfig = [
  index("routes/auth.tsx"),

  // Routes wrapped in MainLayout
  route("/app", "routes/_main.tsx", [
    route("dashboard", "routes/_main.dashboard.tsx"),
    route("help", "routes/_main.help.tsx"),
    route("profile", "routes/_main.profile.tsx"),
    /*Settings*/
    route("settings", "routes/_main.settings.tsx"),
    route("settings/locations", "routes/settings/_main.locations.tsx"),
    route("settings/locations/provinces", "routes/settings/_main.location.provinces.tsx"),
    route("settings/locations/districts", "routes/settings/_main.location.districts.tsx"),
    route("settings/locations/facilities", "routes/settings/_main.location.facilities.tsx"),
    route("settings/network", "routes/settings/_main.network.tsx"),
    /*Programs*/
    route("programs", "routes/_main.programs.tsx"),
    /*SI Unit*/
    route("strategic_info", "routes/_main.strategic_info.tsx"),
    route("strategic_info/templates", "routes/strategic_info/_main.templates.tsx"),
    route("strategic_info/reports", "routes/strategic_info/_main.reports.tsx")
  ]),

  // Other routes...
];

// Named route map (to use in <Link> etc.)
export const routes = {
  auth: "/",
  app: {
    dashboard: "/app/dashboard",
    programs: "/app/programs",
    help: "/app/help",
    profile: "/app/profile",
    /*Settings*/
    settings: "/app/settings",
    settings_locations: "/app/settings/locations",
    settings_network: "/app/settings/network",
    /*SI Unit*/
    strategic_info: "/app/strategic_info",
    strategic_info_templates: "/app/strategic_info/templates",
    strategic_info_reports: "/app/strategic_info/reports",
  },
} as const;

// Helper if you prefer function-based lookups
export function getRoute(name: keyof typeof routes.app | "auth") {
  if (name === "auth") return routes.auth;
  return routes.app[name];
}

export default appRoutes;
