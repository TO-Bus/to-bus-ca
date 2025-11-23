export interface RouteBranchStops {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  code: string;
}

export interface SubwayStopInfo {
  id: number;
  routeBranchStops: RouteBranchStops[];
  routeBranch: {
    id: number;
    headsign: string;
    routeId: number;
    gtfsId: string;
  };
}

export interface NextBusBasic {
  nextBusMinutes: string; // number
}

export interface BasicLine {
  shortName: string;
  longName: string;
}

export interface SubwayStations {
  routeBranchesWithStops: SubwayStopInfo[];
  Error?: boolean;
}

export interface SubwayStop {
  nextTrains: string;
  directionText: string;
  Error?: boolean;
}

export interface parsedVehicleLocation {
  Error?: { content: string };
  vehicle?: {
    id: string;
    heading: string; // number
    speedKmHr: string; // number
    routeTag: string;
    lat: string; // number
    lon: string; // number
    line: string;
    secsSinceReport: string; // number
  };
}
