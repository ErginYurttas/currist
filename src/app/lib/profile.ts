import { supabase } from "./supabase";

export type UserPlan =
  | "basic"
  | "standard"
  | "advanced";

export type UserProfile = {
  id: string;
  fullName: string | null;
  plan: UserPlan;
  subscriptionStatus:
    | "active"
    | "trialing"
    | "past_due"
    | "cancelled";
  role: "user" | "admin";
  trialEndsAt: string | null;
  lastSeenAt: string | null;
};

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        plan,
        subscription_status,
        role,
        trial_ends_at,
        last_seen_at
      `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    fullName: data.full_name,
    plan: data.plan,
    subscriptionStatus: data.subscription_status,
    role: data.role,
    trialEndsAt: data.trial_ends_at,
    lastSeenAt: data.last_seen_at,
  };
}