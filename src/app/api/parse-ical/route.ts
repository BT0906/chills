// src/app/api/parse-ical/route.ts

import axios from "axios";
import ICAL from "ical.js";
import { NextRequest, NextResponse } from "next/server";

// Define the event type
interface ScheduleEvent {
  course: string;
  startDate: string;
  endDate: string;
  location: string;
}

// Handle GET requests to this API route
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("icalUrl");

    if (!url) {
      return NextResponse.json({ error: "Invalid iCal URL" }, { status: 400 });
    }

    // Convert 'webcal://' to 'https://'
    const icalUrl = url.replace(/^webcal:/, "https:");

    // Fetch iCal data using axios
    const response = await axios.get(icalUrl, { responseType: "text" });
    console.log(response.data);
    // If the response status is not OK, return an error
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

    // Map events to a readable schedule
    const schedule: ScheduleEvent[] = events.map((event) => {
      const e = new ICAL.Event(event);
      return {
        course: e.summary,
        startDate: e.startDate.toString(),
        endDate: e.endDate.toString(),
        location: e.location || "No location",
      };
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Error parsing iCal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
