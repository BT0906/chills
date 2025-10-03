"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Users } from "lucide-react";
import { useState } from "react";

interface Student {
  zid: string;
  first_name: string;
  last_name: string;
  profile_url: string;
}

interface SquadFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    description: string,
    course: string,
    currentUserId: string
  ) => Promise<void>;
  selectedStudents: Student[];
  squadCourse: string | null;
  commonCoursesIntersection: string[];
  currentUserId: string;
}

export function SquadFormDialog({
  isOpen,
  onClose,
  onSubmit,
  selectedStudents,
  squadCourse,
  commonCoursesIntersection,
  currentUserId,
}: SquadFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(squadCourse || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedCourse) return;

    setIsSubmitting(true);
    try {
      await onSubmit(
        name.trim(),
        description.trim(),
        selectedCourse,
        currentUserId
      );
      onClose();
      // Reset form
      setName("");
      setDescription("");
      setSelectedCourse(squadCourse || "");
    } catch (error) {
      console.error("Error creating squad:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Squad
          </DialogTitle>
          <DialogDescription>
            Create a study squad with {selectedStudents.length} selected
            classmates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected Members Preview */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Squad Members ({selectedStudents.length + 1})
            </Label>
            <div className="flex flex-wrap gap-2">
              {/* Current user */}
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">Me</AvatarFallback>
                </Avatar>
                <span className="font-medium">You (Creator)</span>
              </div>

              {/* Selected students */}
              {selectedStudents.map((student) => (
                <div
                  key={student.zid}
                  className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={student.profile_url} />
                    <AvatarFallback className="text-xs">
                      {student.first_name[0]}
                      {student.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {student.first_name} {student.last_name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Squad Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Squad Name*</Label>
            <Input
              id="name"
              placeholder="Enter squad name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Squad Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this squad about? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Course Selection */}
          <div className="space-y-2">
            <Label>Course*</Label>
            {squadCourse ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1">
                  {squadCourse}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  (Auto-selected based on common courses)
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Select a course for this squad:
                </p>
                <div className="flex flex-wrap gap-2">
                  {commonCoursesIntersection.map((course) => (
                    <Button
                      key={course}
                      type="button"
                      variant={
                        selectedCourse === course ? "default" : "outline"
                      }
                      onClick={() => setSelectedCourse(course)}
                      className="text-sm"
                    >
                      {course}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !selectedCourse || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Squad"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
