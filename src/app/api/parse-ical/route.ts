// // src/app/api/parse-ical/route.ts

// import axios from "axios";
// import ICAL from "ical.js";
// import { NextRequest, NextResponse } from "next/server";

// // Define the event type
// interface ScheduleEvent {
//   course: string;
//   startDate: string;
//   endDate: string;
//   location: string;
// }

// // Handle GET requests to this API route
// export async function GET(req: NextRequest) {
//   try {
//     const url = req.nextUrl.searchParams.get("icalUrl");

//     if (!url) {
//       return NextResponse.json({ error: "Invalid iCal URL" }, { status: 400 });
//     }

//     // Convert 'webcal://' to 'https://'
//     const icalUrl = url.replace(/^webcal:/, "https:");

//     // Fetch iCal data using axios
//     const response = await axios.get(icalUrl, { responseType: "text" });
//     console.log(response.data);
//     // If the response status is not OK, return an error
//     if (response.status !== 200) {
//       return NextResponse.json(
//         { error: "Failed to fetch iCal data" },
//         { status: 500 }
//       );
//     }

//     const icalText = response.data;

//     // Parse the iCal data using ICAL.js
//     const jcalData = ICAL.parse(icalText);
//     console.log(jcalData);
//     const comp = new ICAL.Component(jcalData);
//     const events = comp.getAllSubcomponents("vevent");

//     // Map events to a readable schedule
//     const schedule: ScheduleEvent[] = events.map((event) => {
//       const e = new ICAL.Event(event);
//       return {
//         course: e.summary,
//         startDate: e.startDate.toString(),
//         endDate: e.endDate.toString(),
//         location: e.location || "No location",
//       };
//     });
//     console.log(schedule);

//     return NextResponse.json({ schedule });
//   } catch (error) {
//     console.error("Error parsing iCal:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { createClient } from "@/lib/supabase/server";
import { Enums } from "@/types/database.types";
import axios from "axios";
import ICAL from "ical.js";
import { NextRequest, NextResponse } from "next/server";

// Define the event type
interface ScheduleEvent {
  course: string;
  startDate: string;
  endDate: string;
  location: string;
  class: Enums<"class_type">;
}
async function getRoomIdByName(roomName: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room")
    .select("id")
    .eq("name", roomName)
    .single();

  if (error || !data) {
    console.error(`Error fetching room ID for ${roomName}:`, error);
    throw new Error(`Room '${roomName}' not found in the database`);
  }

  return data.id;
}

export async function GET(req: NextRequest) {
  try {
    // Initialize the Supabase client
    const supabase = await createClient();
    const url = req.nextUrl.searchParams.get("icalUrl");
    console.log("the url is:", url);
    if (!url) {
      return NextResponse.json({ error: "Invalid iCal URL" }, { status: 400 });
    }

    // Convert 'webcal://' to 'https://'
    const icalUrl = url.replace(/^webcal:/, "https:");

    // Fetch iCal data using axios
    const response = await axios.get(icalUrl, { responseType: "text" });

    if (response.status !== 200) {
      return NextResponse.json(
        { error: "Failed to fetch iCal data" },
        { status: 500 }
      );
    }

    const icalText = response.data;

    // Parse the iCal data using ICAL.js
    const jcalData = ICAL.parse(icalText);
    const comp = new ICAL.Component(jcalData);
    const events = comp.getAllSubcomponents("vevent");
    // Filter and map events to a readable schedule
    const schedule: ScheduleEvent[] = events
      .map((event) => {
        const e = new ICAL.Event(event);
        const courseCodeRegex = /^[A-Za-z]{4}\d{4}$/; // Regex for course codes like COMP4920, FINS2615, etc.

        const [course, type] = e.summary.split(" ");
        if (!course.match(courseCodeRegex)) {
          return null; // Skip events that don't match the course code format
        }

        const className: Enums<"class_type"> = type.includes("Lecture")
          ? "lec"
          : type.includes("Tutorial")
          ? "tut"
          : type.includes("Lab")
          ? "lab"
          : "other"; // Class is derived from the event summary text

        if (e.summary.includes("Final")) {
          return null; // Skip events with 'Final' in the summary
        }
        return {
          course: course, // Store course code (e.g., COMP4920)
          startDate: e.startDate.toString(),
          endDate: e.endDate.toString(),
          location: e.location || "No location", // Default location if none exists
          class: className,
        };
      })
      .filter((event) => event !== null); // filter null values
    // If no events to store, return an error
    if (schedule.length === 0) {
      return NextResponse.json(
        { error: "No valid course events found" },
        { status: 400 }
      );
    }

    // Get the user ID
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.log(userError);
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;
    for (const event of schedule) {
      try {
        // Get room_id by room_name
        const roomId = await getRoomIdByName(event.location);

        if (!roomId) {
          console.error(`Room with name ${event.location} not found.`);
          continue; // Skip this event if no room is found
        }

        // Check if this event already exists in the enrolment table
        const { data: existingEvent, error: checkError } = await supabase
          .from("enrolment")
          .select("*")
          .eq("course", event.course)
          .eq("class", event.class as "lec" | "tut" | "lab")
          .eq("room_id", roomId)
          .eq("user_id", userId)
          .maybeSingle();

        if (checkError) {
          console.error("Error checking existing event:", checkError);
          continue; // Skip this event if there was an error checking
        }

        if (existingEvent) {
          console.log("Event already exists. Skipping insert.");
          continue; // Skip insert if event already exists
        }

        // Now perform the upsert operation
        const { error } = await supabase.from("enrolment").upsert({
          user_id: userId,
          course: event.course,
          class: event.class,
          section: null, // Nullable column
          start_time: event.startDate,
          end_time: event.endDate,
          room_id: roomId, // Use the room_id fetched from the room table
        });

        if (error) {
          console.error("Error inserting event:", error);
        }
      } catch (error) {
        console.error("Error inserting event with room:", error);
      }
    }
    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Error parsing iCal:", error);
    return NextResponse.json(
      { error: "Internal server error111" },
      { status: 500 }
    );
  }
}
