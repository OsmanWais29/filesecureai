// Kept so existing imports keep working. The app no longer uses Supabase:
// this is the AWS client (src/lib/sfai/client.ts) under its old name.
export { sfai as supabase } from "./sfai/client";
export type { Session, User } from "./sfai/client";
