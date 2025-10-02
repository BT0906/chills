import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "./supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUserName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
) {
  return `${firstName ?? "Unknown"} ${lastName ?? "User"}`.trim();
}

export function formatInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined
) {
  if (!firstName && !lastName) return "NN";
  return `${firstName?.charAt(0)}${lastName?.charAt(0)}`.toUpperCase();
}

export async function getUserProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

export function getSquadChannelName(squadId: number) {
  return `chat-squad-${squadId}`;
}
