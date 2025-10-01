"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Define the profile data type (including ics_link)
interface ProfileData {
  first_name: string;
  last_name: string;
  zid: string;
  profile_url: string;
  degree: string;
  gender?: string;
  age?: number;
  bio?: string;
  ics_link?: string; // Add ics_link to the profile data type
}

export default function TimetableSetupPage() {
  const [icalLink, setIcalLink] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const supabase = createClient();
  const router = useRouter();

  // Get the profile data from local storage
  useEffect(() => {
    const savedProfileData = localStorage.getItem("profileStep1");
    if (savedProfileData) {
      setProfileData(JSON.parse(savedProfileData)); // Parse the saved profile data
    } else {
      router.push("/onboarding/profile"); // If no profile data found, redirect to the first step
    }
  }, []);

  const handleIcalLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIcalLink(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the user object from Supabase
      const { data, error: userError } = await supabase.auth.getUser();

      if (userError || !data?.user) {
        throw new Error("User not authenticated");
      }

      const user = data.user;

      if (!profileData) {
        throw new Error("Profile data is missing.");
      }

      // Combine profile data from local storage with the iCal link
      const profileUpdateData: ProfileData = {
        ...profileData,  // All the profile data from local storage
        ics_link: icalLink,  // Add the ical link
      };

      // Update the user's profile in the database
      const { data: profileDataResponse, error: updateError } = await supabase
        .from("profile")
        .upsert({ id: user.id, ...profileUpdateData });

      if (updateError) {
        throw updateError;
      }

      // Clear local storage after successful submission
      localStorage.removeItem("profileData");

      // Redirect to the next step or success page
      router.push("/onboarding/timetable-preview"); // Adjust the path as needed

    } catch (error: unknown) {
      console.error("Error during submit:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-foreground">Chills</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Step 2 of 3</span>
            <span className="text-sm text-muted-foreground">Setup Timetable</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: "66%" }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Upload your timetable</h1>
            <p className="text-muted-foreground text-lg">
              Paste your iCal link to automatically sync your courses and schedule
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="ical-link">iCal Link</Label>
                <Input
                  id="ical-link"
                  type="url"
                  placeholder="https://timetable.university.edu/ical/..."
                  value={icalLink}
                  onChange={handleIcalLinkChange}
                  className="h-12"
                />
                <p className="text-sm text-muted-foreground">
                  Find your iCal link in your university timetable settings
                </p>
              </div>

              {/* Error message */}
              {error && <p className="text-red-500 text-center">{error}</p>}

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-12 bg-transparent" asChild>
                  <Link href="/onboarding/profile">Back</Link>
                </Button>
                <Button type="submit" className="flex-1 h-12" disabled={loading}>
                  {loading ? "Saving..." : "Continue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
