"use client";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TimetablePreviewPage() {
  const [icalLink, setIcalLink] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]); // State to hold the schedule events
  const router = useRouter();

  const supabase = createClient();

  // Event type structure
  interface ScheduleEvent {
    course: string;
    startDate: string;
    endDate: string;
    location: string;
  }
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the authenticated user from Supabase
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data?.user) {
          throw new Error("User not authenticated");
        }

        // Fetch the user's profile data from the "profile" table
        const { data: profileData, error: profileError } = await supabase
          .from("profile")
          .select("ics_link")
          .eq("user_id", data.user.id) // Match the profile with the authenticated user
          .maybeSingle();

        if (profileError || !profileData) {
          throw new Error("Failed to fetch profile data");
        }

        // Set the iCal link from the profile data
        setIcalLink(profileData.ics_link || " ");
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("An error occurred while fetching the iCal link.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Function to fetch timetable data
  const handleSubmit = async (e?: React.FormEvent) => {
    // Only prevent the default behavior if this is called from a form submission
    if (e) e.preventDefault();

    setLoading(true);
    setError(null);
    try {
      console.log("link im sending is", icalLink);
      const response = await axios.get(
        `/api/parse-ical?icalUrl=${encodeURIComponent(icalLink)}`
      );

      if (response.status === 200) {
        // Assuming the API returns the schedule in { schedule: ScheduleEvent[] }
        setSchedule(response.data.schedule);
      } else {
        setError("Failed to fetch timetable data");
      }
    } catch (err) {
      console.error("Error fetching iCal data:", err);
      setError("An error occurred while fetching the timetable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(schedule);
  }, [schedule]);
  const uniqueCourses = Array.from(
    new Set(schedule.map((item) => item.course))
  );

  // Automatically call handleSubmit when the component mounts
  useEffect(() => {
    if (icalLink && icalLink.trim() !== " " && !loading) {
      handleSubmit();
    }
  }, [icalLink]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                C
              </span>
            </div>
            <span className="text-xl font-semibold text-foreground">
              Chills
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Step 3 of 3
            </span>
            <span className="text-sm text-muted-foreground">
              Review Timetable
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-12">
        <div className="container mx-auto max-w-5xl">
          {/* Loader */}
          {loading && (
            <div className="flex justify-center items-center h-full">
              <div className="w-16 h-16 border-4 border-t-4 border-primary rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="text-center text-red-500 mb-4">
              <p>{error}</p>
            </div>
          )}

          {/* Content after loading */}
          {!loading && !error && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Timetable imported successfully
                </h1>
                <p className="text-muted-foreground text-lg">
                  We found {uniqueCourses.length} courses in your schedule
                </p>
              </div>

              {/* Courses */}
              <div className="mb-15 ">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Your Courses
                </h2>
                <div className="grid md:grid-cols-3 gap-4 h-6">
                  {uniqueCourses.map((item, index) => (
                    <div
                      key={index}
                      className="bg-card rounded-xl p-4 border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index % 3 === 0
                              ? "bg-red-500"
                              : index % 3 === 1
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                        />
                        <div className="font-semibold text-foreground">
                          {item}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-50">
                {/* <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 bg-transparent"
                  asChild
                >
                  <Link href="/onboarding/timetable">Back</Link>
                </Button> */}
                <Button className="flex-1 h-12" asChild>
                  <Link href="/dashboard">Continue to Dashboard</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
