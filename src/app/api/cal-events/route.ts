import { createClient } from "@/lib/supabase/server";
import axios from "axios";
import ICAL from "ical.js";
import { NextRequest, NextResponse } from "next/server";

// Define the event type
interface ScheduleEvent {
  course: string;
  startDate: string;
  endDate: string;
  location: string;
  class: string; // Added class to event
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

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error parsing iCal:", error);
    return NextResponse.json(
      { error: "Internal server error111" },
      { status: 500 }
    );
  }
}
