import { supabase } from "./supabase";

export type UserPlan =
  | "basic"
  | "standard"
  | "advanced";

export type UserProfile = {
  id: string;

  fullName: string | null;

  accountType:
    | "individual"
    | "company"
    | null;

  companyName: string | null;

  country: string | null;

  profession: string | null;

  plan: UserPlan;

  subscriptionStatus:
    | "active"
    | "trialing"
    | "past_due"
    | "cancelled";

  role: "user" | "admin";

  trialEndsAt: string | null;

  lastSeenAt: string | null;

  createdAt: string | null;

  updatedAt: string | null;
};

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        account_type,
        company_name,
        country,
        profession,
        plan,
        subscription_status,
        role,
        trial_ends_at,
        last_seen_at,
        created_at,
        updated_at
      `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,

    fullName: data.full_name,

    accountType: data.account_type,

    companyName: data.company_name,

    country: data.country,

    profession: data.profession,

    plan: data.plan,

    subscriptionStatus: data.subscription_status,

    role: data.role,

    trialEndsAt: data.trial_ends_at,

    lastSeenAt: data.last_seen_at,

    createdAt: data.created_at,

    updatedAt: data.updated_at,
  };
}