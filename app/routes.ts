// routes.config.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

// Single source of truth
export const routeDefinitions = {
  auth: { path: "/", file: "routes/auth.tsx" },
  app: {
    dashboard: { path: "/app/dashboard", file: "routes/_main.dashboard.tsx" },
    programs: { path: "/app/programs", file: "routes/_main.programs.tsx" },
    help: { path: "/app/help", file: "routes/_main.help.tsx" },
    profile: { path: "/app/profile", file: "routes/_main.profile.tsx" },

    /*Settings*/
    settings: { path: "/app/settings", file: "routes/_main.settings.tsx" },
    settings_locations: { path: "/app/settings/locations", file: "routes/settings/_main.locations.tsx" },
    settings_provinces: { path: "/app/settings/locations/provinces", file: "routes/settings/_main.location.provinces.tsx" },
    settings_districts: { path: "/app/settings/locations/districts", file: "routes/settings/_main.location.districts.tsx" },
    settings_facilities: { path: "/app/settings/locations/facilities", file: "routes/settings/_main.location.facilities.tsx" },
    settings_network: { path: "/app/settings/network", file: "routes/settings/_main.network.tsx" },
    settings_roles: { path: "/app/settings/roles", file: "routes/settings/_main.role_management.tsx" },
    settings_users: { path: "/app/settings/users", file: "routes/settings/_main.user_management.tsx" },

    /*SI Unit*/
    strategic_info: { path: "/app/strategic_info", file: "routes/_main.strategic_info.tsx" },
    strategic_info_templates: { path: "/app/strategic_info/templates", file: "routes/strategic_info/_main.templates.tsx" },
    strategic_info_reports: { path: "/app/strategic_info/reports", file: "routes/strategic_info/_main.reports.tsx" },

    /*Prevention*/
    programs_prevention_dashboard: { path: "/app/programs/prevention", file: "routes/programs/prevention/_main.prevention_dashboard.tsx" },
    programs_prevention_tb_screening: { path: "/app/programs/prevention/tb_screening", file: "routes/programs/prevention/_main.prevention_tb_screening.tsx" },
    programs_prevention_tpt_report_form: { path: "/app/programs/prevention/tpt_report_form", file: "routes/programs/prevention/_main.prevention_tpt_report_form.tsx" },
  },
} as const;

// Type for safety
export type RouteKey = keyof typeof routeDefinitions.app | "auth";

// Flexible route resolver
export function resolveRoute(key: RouteKey | string): string {
  // If it's a raw path string, return as-is
  if (key.startsWith("/")) return key;

  // If it's "auth", return auth path
  if (key === "auth") return routeDefinitions.auth.path;

  // Otherwise, it must be a key of app
  return routeDefinitions.app[key as keyof typeof routeDefinitions.app].path;
}

// Generate React Router config automatically
function generateRoutes(): RouteConfig {
  const config: RouteConfig = [];

  // Auth route
  config.push(index(routeDefinitions.auth.file));

  // App routes under main layout
  const appChildren = Object.values(routeDefinitions.app).map(r =>
    route(r.path.replace("/app/", ""), r.file)
  );

  config.push(route("/app", "routes/_main.tsx", appChildren));

  // Catch-all 404
  config.push(route("*", "routes/404.tsx"));

  return config;
}

export const appRoutes = generateRoutes();
export default appRoutes;
