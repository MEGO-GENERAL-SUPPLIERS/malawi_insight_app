import { type RouteConfig, index, route } from "@react-router/dev/routes";

// React Router config (for the framework)
export const appRoutes: RouteConfig = [
  index("routes/auth.tsx"),

  // Routes wrapped in MainLayout
  route("/app", "routes/_main.tsx", [
    route("dashboard", "routes/_main.dashboard.tsx"),
    route("templates", "routes/_main.templates.tsx"),
    route("reports", "routes/_main.reports.tsx"),
    route("settings", "routes/_main.settings.tsx"),
    route("help", "routes/_main.help.tsx"),
    route("profile", "routes/_main.profile.tsx"),
  ]),

  // Other routes...
];

// Named route map (to use in <Link> etc.)
export const routes = {
  auth: "/",
  app: {
    dashboard: "/app/dashboard",
    templates: "/app/templates",
    reports: "/app/reports",
    settings: "/app/settings",
    help: "/app/help",
    profile: "/app/profile",
  },
} as const;

// Helper if you prefer function-based lookups
export function getRoute(name: keyof typeof routes.app | "auth") {
  if (name === "auth") return routes.auth;
  return routes.app[name];
}

export default appRoutes;
