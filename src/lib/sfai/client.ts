// The FileSecure app's backend client: login (Cognito), database, files and live
// updates, all on the SFAI Platform Module (AWS). It keeps the shape of the old
// Supabase client, so the app's existing calls work unchanged:
//   import { supabase } from "@/lib/supabase";   // or "@/integrations/supabase/client"
//   await supabase.from("documents").select("*").eq("id", id).single();
import { auth } from "./auth";
import { from, rpc } from "./db";
import { Channel } from "./realtime";
import { storage } from "./storage";
import { sfaiFunctions } from "../sfaiFunctions";

const channels = new Set<Channel>();

export const sfai = {
  auth,
  from,
  rpc,
  storage,
  functions: sfaiFunctions, // the old Edge Function names, re-pointed (see sfaiFunctions.ts)
  channel(topic: string) {
    const c = new Channel(topic);
    channels.add(c);
    return c;
  },
  removeChannel(c: Channel) {
    channels.delete(c);
    return c.unsubscribe();
  },
  removeAllChannels() {
    channels.forEach((c) => void c.unsubscribe());
    channels.clear();
    return Promise.resolve([]);
  },
};

export type { Session, User } from "./auth";
export type { Result as PostgrestResponse } from "./db";
