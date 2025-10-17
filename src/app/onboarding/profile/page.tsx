"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TablesInsert } from "@/types/database.types";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingStepOne() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [zid, setZid] = useState<string>("");
  const [degree, setDegree] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [age, setAge] = useState<number | string>("");
  const [bio, setBio] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate the inputs
    if (!firstName || !lastName || !zid || !degree) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      // Save the data to localStorage
      const profileData: TablesInsert<"profile"> = {
        first_name: firstName,
        last_name: lastName,
        zid,
        degree,
        gender,
        age: age ? Number(age) : null,
        bio,
        ics_link: "", // Will be updated in the next step
      };
      localStorage.setItem("profileStep1", JSON.stringify(profileData));

      // Redirect to step 2 (where we will collect the iCal link)
      router.push("/onboarding/timetable"); // Adjust the path as needed
    } catch (error) {
      console.error("Error during submit:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Progress Bar */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Step 1 of 3
            </span>
            <span className="text-sm text-muted-foreground">
              Complete your profile
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: "33%" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              Fill in your details to get chilling!
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
            </div>
              <div className="space-y-2">
                <Label htmlFor="zid">zID (Student ID)</Label>
                <Input
                  id="zid"
                  type="text"
                  placeholder="z1234567"
                  value={zid}
                  onChange={(e) => setZid(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="degree">Degree Program</Label>
                <Input
                  id="degree"
                  type="text"
                  placeholder="Computer Science"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Gender (Optional)</Label>
                <div className="flex gap-3">
                  {['Male', 'Female', 'Other'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setGender(option)}
                      className={`h-12 flex-1 rounded-lg border transition-colors
                        ${
                          gender === option
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age (Optional)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Input
                  id="bio"
                  type="text"
                  placeholder="Tell us about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Error message */}
              {error && <p className="text-red-500 text-center">{error}</p>}

              <div className="flex gap-3">
                {/* <Button type="button" variant="outline" className="flex-1 h-12 bg-transparent" asChild>
                  <Link href="/onboarding/welcome">Back</Link>
                </Button> */}
                <Button
                  type="submit"
                  className="flex-1 h-12"
                  disabled={loading}
                >
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
