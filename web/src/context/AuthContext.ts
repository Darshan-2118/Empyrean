// AuthContext — the single provider that wraps the entire app.
// Import { AuthProvider, useAuth } from here everywhere.
// The hook (useAuth) is also re-exported here for convenience.
export { AuthProvider, useAuth } from '../services/useAuth';
export type { UserProfile } from '../services/useAuth';
