import { useQuery } from "@tanstack/react-query";

import { ttcGtfsAlerts } from "../fetch/gtfs.js";
import { ttcBusTimeVehiclesLocation } from "../fetch/queries.js";
import { ParsedTtcAlertText } from "./AlertUtils.js";

export default function CurrentAlerts() {
  const gtfsAlertsResp = useQuery(ttcGtfsAlerts);
  const busTimeVehicleLocation = useQuery(ttcBusTimeVehiclesLocation(0));

  return (
    <main>
      <h1>API Checks</h1>
      <div className="gtfs-alerts">
        {!gtfsAlertsResp.isSuccess && <h2>GTFS feed check likely failed</h2>}
        {gtfsAlertsResp.isSuccess && (
          <h2>If this is visible, notify the dev!</h2>
        )}
        {Array.isArray(gtfsAlertsResp.data?.entity) && (
          <details>
            <summary>
              <h3>Current alerts</h3>
            </summary>
            {gtfsAlertsResp.data?.entity.map((item) => {
              const string = item.alert?.headerText?.translation?.[0].text;

              if (string) {
                return (
                  <p key={string} id={string}>
                    <ParsedTtcAlertText
                      badge={{ highlightAll: true }}
                      feedText={string}
                      id={string}
                    />
                  </p>
                );
              }
              return null;
            })}
          </details>
        )}
        {}
      </div>
      <div className="bustime-info">
        {!busTimeVehicleLocation.isSuccess && (
          <h2>Bustime API check likely failed</h2>
        )}
        {busTimeVehicleLocation.isSuccess && (
          <h2>If this is visible, bustime API is available!</h2>
        )}
      </div>
    </main>
  );
}
