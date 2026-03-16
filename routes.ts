/**
 * Routes that don't require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  "/",
  "/products",
  "/products/:path*",
  "/about",
  "/contact",
];

/**
 * Routes that are used for authentication
 * These routes will redirect logged in users to the default redirect
 * @type {string[]}
 */
export const authRoutes = [
  "/login",
  "/register",
  "/error",
  "/reset",
  "/new-password",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/";
