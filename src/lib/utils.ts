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

export function generateCourseColor(courseName: string): { bg: string; text: string; border: string } {
  // Simple hash function to generate a number from string
  let hash = 0
  for (let i = 0; i < courseName.length; i++) {
    hash = courseName.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32bit integer
  }

  // Define color palette with good contrast
  const colors = [
    { bg: "bg-blue-500/15", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500/30" },
    { bg: "bg-purple-500/15", text: "text-purple-700 dark:text-purple-400", border: "border-purple-500/30" },
    { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-500/30" },
    { bg: "bg-indigo-500/15", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-500/30" },
    { bg: "bg-pink-500/15", text: "text-pink-700 dark:text-pink-400", border: "border-pink-500/30" },
    { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500/30" },
    { bg: "bg-teal-500/15", text: "text-teal-700 dark:text-teal-400", border: "border-teal-500/30" },
    { bg: "bg-rose-500/15", text: "text-rose-700 dark:text-rose-400", border: "border-rose-500/30" },
    { bg: "bg-cyan-500/15", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-500/30" },
    { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-400", border: "border-orange-500/30" },
    { bg: "bg-lime-500/15", text: "text-lime-700 dark:text-lime-400", border: "border-lime-500/30" },
    { bg: "bg-fuchsia-500/15", text: "text-fuchsia-700 dark:text-fuchsia-400", border: "border-fuchsia-500/30" },
  ]

  // Use hash to select a color from the palette
  const index = Math.abs(hash) % colors.length
  return colors[index]
}
