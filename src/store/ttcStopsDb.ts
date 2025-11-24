import { type DBSchema, openDB } from "idb";

import { distanceOfTwoCoordinates } from "../components/nearby/coordinate-utils.js";
import type { StopWithDistance } from "../models/db.js";

interface TTCStop extends DBSchema {
  stops: {
    key: string;
    value: { stopId: string; lat: string; lon: string; tag: string };
    indexes: { stopId: string; lat: string; lon: string; tag: string };
  };
}

const dbPromise = openDB<TTCStop[]>("TTCStops", 2, {
  async upgrade(db, oldVersion) {
    const store = db.createObjectStore("stops", {
      // The 'id' property of the object will be the key.
      keyPath: "id",
      // If it isn't explicitly set, create a value by auto incrementing.
      autoIncrement: true,
    });
    if ((oldVersion ?? 0) < 1) {
      // Create an index on the 'lat' & 'lon' property of the objects.
      store.createIndex("lat", "lat");
      store.createIndex("lon", "lon");
    }
    if (oldVersion < 2) {
      if (store) {
        store.createIndex("tag", "tag");
        store.createIndex("stopId", "stopId");
      }
    }
  },
});

// Done with Google Gemini
export async function getStopsWithinRange(
  lat: number,
  lon: number,
  range: number
): Promise<StopWithDistance[]> {
  const store = (await dbPromise)
    .transaction("stops", "readonly")
    .objectStore("stops");

  const results = [];

  const lowerLat = lat - range;
  const upperLat = lat + range;
  const lowerLon = lon - range;
  const upperLon = lon + range;

  const latIndex = store.index("lat");
  const latCursor = await latIndex.openCursor(
    IDBKeyRange.bound(lowerLat, upperLat)
  );

  let cursor = latCursor;

  while (cursor) {
    const stop = cursor.value;
    if (stop.lon >= lowerLon && stop.lon <= upperLon) {
      // Basic distance check (can be improved with Haversine formula)
      const distance = Math.sqrt((stop.lat - lat) ** 2 + (stop.lon - lon) ** 2);
      // in meters
      // TODO: make the formula better / use libs
      const realDistance = distanceOfTwoCoordinates({ lat, lon }, stop);
      if (distance <= range) {
        results.push({ ...stop, distance, realDistance });
      }
    }
    cursor = await cursor.continue();
  }

  return results.sort((a, b) => a.realDistance - b.realDistance);
}

export async function getStopFromStopId(
  id: number
): Promise<{ title: string; tag: string } | undefined> {
  const db = await dbPromise;
  const indexes = db.transaction("stops").objectStore("stops").indexNames;
  if (indexes.contains("stopId")) {
    return db.getFromIndex("stops", "stopId", id.toString());
  }
  return undefined;
}

export async function getStop(key) {
  return (await dbPromise).get("stops", key);
}
export async function addStop(val) {
  return (await dbPromise).put("stops", val);
}
export async function addStops(vals) {
  await clear();
  const store = (await dbPromise)
    .transaction("stops", "readwrite")
    .objectStore("stops");
  vals.forEach((item) => {
    store.put({
      ...item,
      lon: Number.parseFloat(item.lon),
      lat: Number.parseFloat(item.lat),
    });
  });
}
export async function del(key) {
  return (await dbPromise).delete("stops", key);
}
export async function clear() {
  return (await dbPromise).clear("stops");
}
export async function keys() {
  return (await dbPromise).getAllKeys("stops");
}
export async function getSize() {
  return (await dbPromise).count("stops");
}
