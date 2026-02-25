import { Button, Title1 } from "@fluentui/react-components";
import { ArrowClockwise24Regular } from "@fluentui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { EtaBusWithID } from "../../models/etaObjects.js";
import { useAppSelector } from "../../store/index.js";
import { getStop } from "../../store/ttcStopsDb.js";
import { DirectionBadge } from "../badges.js";
import { BookmarkButton } from "../bookmarks/BookmarkButton.js";
import CountdownGroup from "../countdown/CountdownGroup.js";
import { CountdownRow } from "../countdown/CountdownRow.js";
import SMSButton from "../eta/SMSButton.js";
import { etaParser } from "../parser/etaParser.js";
import RawDisplay from "../rawDisplay/RawDisplay.js";
import LayoutToolbar from "../settings/LayoutToolbar.js";
import style from "./FetchStop.module.css";
import { ttcStopPrediction } from "./queries.js";

const TtcAlertList = lazy(() => import("../alerts/TtcAlertList.js"));
const StopVehiclesPosition = lazy(
  () => import("../map/StopVehiclesPosition.js")
);

function RefreshButton({
  handleRefreshClick,
}: {
  handleRefreshClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Button onClick={handleRefreshClick} icon={<ArrowClockwise24Regular />}>
      {t("buttons.refresh")}
    </Button>
  );
}

export default function StopPredictionInfo(props: {
  stopId: number;
}): JSX.Element {
  const stopData = useQuery({
    queryKey: ["stop-data"],
    queryFn: async () => {
      const stopData = await getStop(props.stopId.toString());
      return stopData ?? null;
    },
  });
  const stopId = props.stopId;
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(Date.now());
  const { t } = useTranslation();
  const ttcStopPredictionResponse = useQuery({
    ...ttcStopPrediction(stopId),
    queryKey: [`ttc-stop-${stopId}`, lastUpdatedAt.toString()],
  });

  const handleRefreshClick = useCallback(() => {
    setLastUpdatedAt(Date.now());
  }, []);

  const unifiedEtaValue = useAppSelector(
    (state) => state.settings?.entities?.unifiedEta?.value === "true"
  );

  const etaDb = useMemo(() => {
    if (ttcStopPredictionResponse.data) {
      return etaParser(ttcStopPredictionResponse.data);
    }
    return [];
  }, [ttcStopPredictionResponse.data]);

  const directionsList = useMemo(() => {
    return etaDb.flatMap((item) => {
      return { direction: item.direction, line: item.line };
    });
  }, [etaDb]);

  const unifiedEta = useMemo(() => {
    let templist: EtaBusWithID[] = [];
    for (const list of etaDb) {
      if (list.etas) {
        templist = templist.concat(list.etas);
      }
    }
    return templist.sort((a, b) => a.epochTime - b.epochTime);
  }, [etaDb]);

  const vehiclesList = useMemo(() => {
    return unifiedEta.map((eta) => eta.vehicle);
  }, [unifiedEta]);

  const lineList = useMemo(() => {
    return [
      ...new Set(etaDb.map((item) => Number.parseInt(item.line.toString()))),
    ];
  }, [etaDb]);

  if (ttcStopPredictionResponse.data) {
    const data = ttcStopPredictionResponse.data;
    if (data.Error === undefined) {
      let listContent: JSX.Element[] = [];
      if (unifiedEtaValue) {
        listContent = unifiedEta.map((element, index) => {
          return (
            <li key={element.tripTag}>
              <CountdownRow item={element} index={index} />
            </li>
          );
        });
      } else {
        listContent = etaDb
          .filter((element) => (element.etas ?? []).length > 0)
          .map((element) => {
            return (
              <CountdownGroup
                key={`line-group-${element.line}-${element.direction}-${element.stopTag}`}
                detail={element}
              />
            );
          });
      }

      const directions: Set<string> = new Set();

      for (const item of etaDb) {
        if (item.direction) {
          directions.add(item.direction);
        }
      }
      return (
        <div className="countdown-list-container">
          {etaDb[0] && (
            <>
              <span className={style["top-row"]}>
                Stop {stopId}
                {directions.size === 1 && (
                  <DirectionBadge
                    direction={Array.from(directions.values())[0]}
                  />
                )}
              </span>
              <div className={style["stop-name"]}>
                <Title1 as="h1">
                  {etaDb[0].stopName.replace("At", "\nAt")}
                </Title1>
              </div>
            </>
          )}
          <Suspense fallback={<div>Loading alerts...</div>}>
            <TtcAlertList lineNum={lineList} type="compact" />
          </Suspense>
          <details>
            <summary>See the vehicles on the map instead (BETA)</summary>
            <Suspense>
              {stopData.data && (
                <StopVehiclesPosition
                  vehicles={vehiclesList}
                  stop={stopData.data}
                />
              )}
            </Suspense>
          </details>
          {stopData?.data?.tag}
          <div className={style["countdown-button-group"]}>
            <RefreshButton handleRefreshClick={handleRefreshClick} />
            {etaDb[0] && (
              <BookmarkButton
                stopId={stopId}
                name={etaDb[0].stopName}
                ttcId={etaDb[0].stopTag}
                lines={etaDb.flatMap((item) => item.line)}
                directions={directionsList}
                direction={etaDb[0].direction}
              />
            )}
            <LayoutToolbar />
          </div>
          {navigator.onLine ? null : (
            <span>Device seems to be offline. Results may be inaccurate.</span>
          )}
          {listContent.length > 0 ? (
            <ul>{listContent}</ul>
          ) : (
            <>
              <Title1>{t("reminder.noEta")}</Title1>
              <br />
              <SMSButton stopId={stopId} />
            </>
          )}
          <RawDisplay data={ttcStopPredictionResponse.data} />
        </div>
      );
    }
    // if (data.Error)
    return (
      <div>
        <Title1>{t("reminder.failToLocate")}</Title1>
        <div className={style["countdown-button-group"]}>
          <RefreshButton handleRefreshClick={handleRefreshClick} />
          <SMSButton stopId={stopId} />
        </div>
        <span>{ttcStopPredictionResponse.data.Error?.["#text"]}</span>
        <RawDisplay data={ttcStopPredictionResponse.data} />
      </div>
    );
  }
  return (
    <div>
      {ttcStopPredictionResponse.status === "pending" ? (
        <Title1>{t("reminder.loading")}</Title1>
      ) : (
        <>
          <Title1>Stop {stopId}</Title1>
          <br />
          <Title1>Your device seems to be offline.</Title1>
        </>
      )}
      <div className={style["countdown-button-group"]}>
        <RefreshButton handleRefreshClick={handleRefreshClick} />
        <SMSButton stopId={stopId} />
      </div>
    </div>
  );
}
