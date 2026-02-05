import { queryOptions } from "@tanstack/react-query";

import type {
  EtaPredictionJson,
  RouteJson,
  RoutesJson,
  SubwayClosureJson,
} from "../../models/etaJson.js";
import type {
  BasicLine,
  NextBusBasic,
  parsedVehicleLocation,
  SubwayStations,
  SubwayStop,
} from "../../models/ttc.js";

export const ttcStopPrediction = (stopId: number) =>
  queryOptions<EtaPredictionJson>({
    queryKey: [`ttc-stop-${stopId}`],
    queryFn: async () => {
      const response = await fetch(
        `https://webservices.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&stopId=${stopId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    },
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const fetchSubwayClosure = (date: string) =>
  queryOptions<SubwayClosureJson[]>({
    queryKey: [`ttc-subway-closure-${date}`],
    queryFn: async () => {
      const response = await fetch(
        `https://thomassth.github.io/to-bus-stations/data/ttc/subway-closures/${date}.json`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    },
    placeholderData: (prev) => prev,
  });

export const fetchSubwayClosureLastUpdated = queryOptions<string>({
  queryKey: ["ttc-subway-closure-last-updated"],
  staleTime: 60 * 60 * 1000,
  queryFn: async () => {
    const response = await fetch(
      "https://thomassth.github.io/to-bus-stations/data/ttc/subway-closures/lastupdated"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.text();
  },
});

/** @deprecated ttcBusPredictionsBasic */
export const ttcLineStopPrediction = (line: number, stopNum: number) =>
  queryOptions<EtaPredictionJson>({
    queryKey: [`ttc-line-stop-${line}-${stopNum}`],
    queryFn: async () => {
      const response = await fetch(
        `https://webservices.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&r=${line}&s=${stopNum}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const resp = await response.json();
      if (resp.Error) {
        return Promise.reject(resp);
      }

      return resp;
    },
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const ttcBusPredictionsBasic = (props: {
  stopNum: number;
  lineNum: number;
}) =>
  queryOptions<NextBusBasic[]>({
    queryKey: [`ttc-bus-basic-${props.lineNum}-${props.stopNum}`],
    queryFn: async () => {
      const response = await fetch(
        `https://www.ttc.ca/ttcapi/routedetail/GetNextBuses?routeId=${props.lineNum}&stopCode=${props.stopNum}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    },
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
  });

/** @deprecated use ttcLinesBasic */
export const ttcLines = queryOptions<RoutesJson["body"]>({
  queryKey: ["ttc-lines"],
  queryFn: async () => {
    const response = await fetch(
      "https://webservices.umoiq.com/service/publicJSONFeed?command=routeList&a=ttc"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  },
  staleTime: 24 * 60 * 60 * 1000,
  refetchInterval: 60 * 1000,
  placeholderData: (prev) => prev,
});

export const ttcLinesBasic = queryOptions<BasicLine[]>({
  queryKey: ["ttc-lines-basic"],
  queryFn: async () => {
    const response = await fetch(
      "https://www.ttc.ca/ttcapi/routedetail/listroutes"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  },
  staleTime: 24 * 60 * 60 * 1000,
  refetchInterval: 60 * 1000,
  placeholderData: (prev) => prev,
});

/** @deprecated use ttcRouteBasic */
export const ttcRoute = (line: number) =>
  queryOptions<RouteJson>({
    queryKey: [`ttc-route-${line}`],
    queryFn: async () => {
      const response = await fetch(
        `https://webservices.umoiq.com/service/publicJSONFeed?command=routeConfig&a=ttc&r=${line}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000,
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
  });

/** @deprecated no replacement :( */
export const ttcVehicleLocation = (vehicle: number) =>
  queryOptions<parsedVehicleLocation>({
    queryKey: ["ttc-vehicle-location", vehicle],
    queryFn: async () => {
      const response = await fetch(
        `https://webservices.umoiq.com/service/publicJSONFeed?command=vehicleLocation&a=ttc&v=${vehicle}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    },
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
  });

// inaccessible; CORS Missing Allow Origin
export const ttcBusTimeVehiclesLocation = (vehicle: number) =>
  queryOptions({
    queryKey: [`ttc-bustime-vehicle-location-${vehicle}`],
    queryFn: async () => {
      const response = await fetch(
        "https://bustime.ttc.ca/bustime/api/v3/getvehicles?requestType=getvehicles&rt=95&key=?????&format=json&xtime=1763846697196"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    },
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const ttcSubwayPredictions = (stopNum: number) =>
  queryOptions<SubwayStop[]>({
    queryKey: [`ttc-subway-predictions-${stopNum}`],
    queryFn: async () => {
      const response = await fetch(
        `https://ntas.ttc.ca/api/ntas/get-next-train-time/${stopNum}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    },
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const ttcRouteBasic = (lineNum: number) =>
  queryOptions<SubwayStations>({
    queryKey: [`ttc-subway-line-${lineNum}`],
    queryFn: async () => {
      try {
        const response = await fetch(
          `https://www.ttc.ca/ttcapi/routedetail/get?id=${lineNum}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      } catch (_error) {
        return { routeBranchesWithStops: [], Error: true };
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
  });

/**
 * currently not used due to bad handling of bad stop ids
 *  @deprecated no replacement :( */
export const ttcMultiStopsPredictions = (fetchUrl: string) =>
  queryOptions<EtaPredictionJson>({
    queryKey: [`ttc-multi-stops-predictions-${fetchUrl}`],
    queryFn: async () => {
      const response = await fetch(
        `https://webservices.umoiq.com/service/publicJSONFeed?command=predictionsForMultiStops&a=ttc${fetchUrl}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    },
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const getYrtStops = queryOptions<
  { stopId: string; stopPublicId: string }[]
>({
  queryKey: ["yrt-stops"],
  queryFn: async () => {
    const response = await fetch(
      "https://thomassth.github.io/to-bus-stations/data/yrt/stops.json"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  },
  staleTime: 24 * 60 * 60 * 1000,
});
