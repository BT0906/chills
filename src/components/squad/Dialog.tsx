"use client";

import { createSquad } from "@/app/actions/create-squad";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateSquadInput } from "@/types/squad";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FormSquadDialogProps {
  course: string;
  selectedUsers: string[]; // Array of ZIDs
  currentUser: {
    id: string;
    userId: string;
    zid: string;
    first_name: string;
    last_name: string;
  };
  students: Array<{
    id: string;
    zid: string;
    first_name: string;
    last_name: string;
  }>;
  onSuccess?: () => void;
}

export default function FormSquadDialog({
  course: initialCourse,
  selectedUsers,
  currentUser,
  students,
  onSuccess,
}: FormSquadDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState(initialCourse || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !course.trim()) {
      alert("Please fill in squad name and course");
      return;
    }

    setIsLoading(true);

    try {
      // Find selected students by ZID
      const selectedStudents = students.filter((s) =>
        selectedUsers.includes(s.zid)
      );

      const input: CreateSquadInput = {
        name: name.trim(),
        description: description.trim(),
        course: course.trim(),
        creator_id: currentUser.userId, // Use userId, not id
        user_ids: selectedStudents.map((s) => s.id), // all invited students
      };

      const result = await createSquad(input);

      if (result?.success) {
        setOpen(false); // close popup

        // Reset form
        setName("");
        setDescription("");
        setCourse(initialCourse || "");

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Navigate to squad
        router.push(`/${result.squad_id}`);
      } else {
        console.error("Error:", result?.error || "Unknown error");
        alert("Failed to create squad. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total members (current user + selected users)
  const totalMembers = 1 + selectedUsers.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={selectedUsers.length === 0}>
          Form Squad ({totalMembers} members)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Squad</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Squad Name */}
          <div>
            <label className="text-sm font-medium">Squad Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter squad name"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">
              Description (optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your squad's goals or study preferences"
              disabled={isLoading}
            />
          </div>

          {/* Course */}
          <div>
            <label className="text-sm font-medium">Course *</label>
            <Input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. COMP6080"
              disabled={isLoading}
            />
          </div>

          {/* Members Preview */}
          <div>
            <label className="text-sm font-medium">
              Members ({totalMembers})
            </label>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                • {currentUser.first_name} {currentUser.last_name} (You)
              </div>
              {students
                .filter((s) => selectedUsers.includes(s.zid))
                .map((student) => (
                  <div key={student.zid}>
                    • {student.first_name} {student.last_name}
                  </div>
                ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || !course.trim()}
          >
            {isLoading ? "Creating Squad..." : "Create Squad"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
