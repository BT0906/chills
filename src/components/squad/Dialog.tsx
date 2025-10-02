"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function FormSquadDialog({ course, selectedUsers, currentUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // const [course, setCourse] = useState(course);

  const handleSubmit = async () => {
    const selectedStudents = students.filter((s) =>
      selectedUsers.includes(s.zid)
    );

    const input = {
      name,
      description,
      course,
      creator_id: currentUser.id,
      user_ids: selectedStudents.map((s) => s.id), // all invited students
    };

    const result = await createSquad(input);

    if (result.success) {
      setOpen(false); // close popup
      router.push(`/squad/${result.squad_id}/success`);
    } else {
      console.error("Error:", result.error);
      alert("Failed to create squad.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Form Squad</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Squad</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Squad Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter squad name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Course</label>
            <Input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. COMP6080"
            />
          </div>

          <Button className="w-full" onClick={handleSubmit}>
            Create Squad
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
