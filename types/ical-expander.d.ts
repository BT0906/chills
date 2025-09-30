declare module "ical-expander" {
  import { Event as ICalEvent, Time } from "ical.js";

  export interface Occurrence {
    startDate: Time;
    endDate: Time;
    item: ICalEvent;
  }

  export interface IcalExpanderOptions {
    ics: string;
    maxIterations?: number;
    skipInvalidDates?: boolean;   // 👈 added this
  }

  export default class IcalExpander {
    constructor(options: IcalExpanderOptions);
    between(
      start: Date,
      end: Date
    ): {
      events: ICalEvent[];
      occurrences: Occurrence[];
    };
  }
}
