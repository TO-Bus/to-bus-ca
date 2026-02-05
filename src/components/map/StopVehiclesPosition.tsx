import { Point } from "ol/geom.js";
import "ol/ol.css";
import { useQueries } from "@tanstack/react-query";
import { fromLonLat } from "ol/proj.js";
import { useMemo } from "react";
import { RFeature, RLayerVector, RMap, ROSMWebGL, ROverlay } from "rlayers";
import arrow from "../../../public/arrow.svg";
import { ttcVehicleLocation } from "../fetch/queries.js";

interface lonlat {
  lon: number;
  lat: number;
  heading?: number;
}

export default function StopVehiclesPosition(props: {
  stop: lonlat;
  vehicles: number[];
}) {
  const queriesList = props.vehicles.map((vehicleId) => ({
    ...ttcVehicleLocation(vehicleId),
    queryKey: ["ttc-vehicle-location", vehicleId],
  }));

  const ttcVehicleLocationResponses = useQueries({
    queries: queriesList,
  });

  const lonLatList = useMemo(() => {
    return ttcVehicleLocationResponses.map((resp) => ({
      lon: resp.data?.vehicle?.lon,
      lat: resp.data?.vehicle?.lat,
      heading: resp.data?.vehicle?.heading,
    }));
  }, [ttcVehicleLocationResponses]);

  // const closestVehicle = useMemo(() => {
  //   let minDist = 0;
  //   let closest: lonlat;
  //   for (const vehicle of lonLatList) {
  //     if (vehicle.lon && vehicle.lat) {
  //       const dist = distanceOfTwoCoordinates(props.stop, {
  //         lon: Number.parseFloat(vehicle.lon),
  //         lat: Number.parseFloat(vehicle.lat),
  //       });
  //       if (dist < minDist) {
  //         minDist = dist;
  //         closest = vehicle;
  //       }
  //     }
  //   }
  //   return closest;
  // }, [lonLatList]);

  const stopCorr = fromLonLat([props.stop.lon, props.stop.lat]);
  return (
    <div>
      <RMap
        width={"100%"}
        height={"60vh"}
        initial={{
          center: stopCorr,
          zoom: 15,
        }}
      >
        <ROSMWebGL />
        <RLayerVector zIndex={10}>
          <RFeature geometry={new Point(stopCorr)}>
            <ROverlay className="no-interaction" />
          </RFeature>
          {lonLatList.length > 0 &&
            lonLatList.map((lonlat, index) => {
              if (!lonlat.lon || !lonlat.lat) {
                return null;
              }
              const vehicleCoor = fromLonLat([
                Number.parseFloat(lonlat.lon),
                Number.parseFloat(lonlat.lat),
              ]);
              return (
                <RFeature
                  geometry={new Point(vehicleCoor)}
                  key={`${lonlat.lon}${lonlat.lat}`}
                >
                  <ROverlay className="no-interaction">
                    <img
                      src={arrow}
                      style={{
                        position: "relative",
                        top: -12,
                        left: -12,
                        userSelect: "none",
                        pointerEvents: "none",
                        transform: `rotate(${lonlat.heading ?? 0}deg)`,
                        filter: `opacity(${100 - index * 10}%)`,
                      }}
                      width={24}
                      height={24}
                      alt="bus icon"
                    />
                  </ROverlay>
                </RFeature>
              );
            })}
        </RLayerVector>
      </RMap>
    </div>
  );
}
