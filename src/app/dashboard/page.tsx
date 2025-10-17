"use client";

import { WeeklyCalendar } from "@/components/dashboard-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCourseStats } from "../../hooks/use-course-enrolement"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { profile } = useProfile(user?.id);

  const { courses, totalClasses, loading: courseLoading } = useCourseStats(user?.id);
  const [invitationCount, setInvitationCount] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <header className="border-b backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to chills {profile?.first_name} {profile?.last_name}!</h1>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/squads">My Squads</Link>
            </Button>
            {invitationCount > 0 && (
              <Button asChild variant="outline">
                <Link href="/invitations">
                  Invitations
                  <Badge className="ml-2" variant="destructive">
                    {invitationCount}
                  </Badge>
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/invites">Pending Invites</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-row grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">Your Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {courses.length === 0 ? (
                    <span className="text-muted-foreground text-sm">No courses</span>
                  ) : (
                    courses.map((courseGroup) => (
                      <Badge 
                        key={courseGroup.course} 
                        variant="secondary"
                        className="text-sm"
                      >
                        {courseGroup.course}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg">Your Degree</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{profile?.degree}</div>
            </CardContent>
          </Card>
        </div>

        {user && (
          <WeeklyCalendar userId={user.id} />
        )}

        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">
              Ready to Find Your Squad?
            </CardTitle>
            <CardDescription className="text-blue-100">
              Discover students in your courses and form study groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" variant="secondary">
              <Link href="/discover">Find Classmates</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
