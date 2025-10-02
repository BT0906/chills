import { createClient } from "@/lib/supabase/server";

/**
 * Server-side utility to check if a user is a member of a squad
 * This should be used in API routes and server components
 */
export async function validateSquadMembership(
  squadId: number,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("member")
      .select("status")
      .eq("squad_id", squadId)
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error) {
      console.error("Error checking squad membership:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error validating squad membership:", error);
    return false;
  }
}

/**
 * Client-side utility to check if a user can send messages to a squad
 */
export function canSendMessage(
  isMember: boolean,
  isConnected: boolean
): boolean {
  return isMember && isConnected;
}

/**
 * Client-side utility to check if a user can view squad messages
 */
export function canViewSquad(isMember: boolean): boolean {
  return isMember;
}
