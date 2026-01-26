import { queryOptions } from "@tanstack/react-query";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";

// inaccessible; CORS Missing Allow Origin
export const ttcGtfsAlerts = queryOptions({
  queryKey: ["ttc-gtfs-alerts"],
  queryFn: async () => {
    const response = await fetch(
      "https://gtfsrt.ttc.ca/alerts/all?format=binary"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );
    return feed;
  },
  staleTime: 60 * 1000,
  refetchInterval: 60 * 1000,
});

export const ttcGtfsTripUpdate = queryOptions({
  queryKey: ["ttc-gtfs-trip-update"],
  queryFn: async () => {
    const response = await fetch("https://bustime.ttc.ca/gtfsrt/trips");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );
    return feed;
  },
  staleTime: 60 * 1000,
  refetchInterval: 60 * 1000,
});
