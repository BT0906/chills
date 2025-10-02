"use client";

import { useEffect, useState } from "react";
import { useContext } from "react";
import { UserContext } from "@/contexts/user-context";
import { createClient } from "@/lib/supabase/client"; // make sure this is set up
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export function CreateMeetingDialog() {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const squadId = Number(params.id);
  const { user, loading } = useContext(UserContext);
  const supabase = createClient();
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [roomId, setRoomId] = useState("ONLINE"); // default to online
  const [rooms, setRooms] = useState<any[]>([]);

  // fetch available rooms from Supabase
  useEffect(() => {
    async function fetchRooms() {
      const { data, error } = await supabase.from("room").select("id, name, abbr");
      if (error) console.error(error);
      else setRooms(data || []);
    }
    fetchRooms();
  }, []);

  // handle form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to create a meeting");
      return;
    }

    const { error } = await supabase.from("meeting").insert([
      {
        squad_id: squadId,
        description,
        start_time: startTime,
        end_time: endTime,
        room_id: roomId,
        creator_id: user.id,
      },
    ]);

    if (error) {
      alert("Error creating meeting: " + error.message);
    } else {
      router.refresh(); // reload meetings list
      setOpen(false); 
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">+ Create Meeting</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Meeting</DialogTitle>
            <DialogDescription>
              Set up a new study session for your squad.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Weekly study session"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>End Time</Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Room</Label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="ONLINE">Online (Zoom/Discord/etc.)</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.abbr || r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
