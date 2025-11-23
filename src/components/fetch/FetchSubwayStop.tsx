import { Button, LargeTitle, Text, Title1 } from "@fluentui/react-components";
import { ArrowClockwise24Regular } from "@fluentui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { type JSX, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { NextBusBasic } from "../../models/ttc.js";
import { store } from "../../store/index.js";
import { subwayDbSelectors } from "../../store/suwbayDb/slice.js";
import { TtcAlertList } from "../alerts/TtcAlertList.js";
import { BookmarkButton } from "../bookmarks/BookmarkButton.js";
import { CountdownSec } from "../countdown/CountdownSec.js";
import RawDisplay from "../rawDisplay/RawDisplay.js";
import { ttcBusPredictionsBasic, ttcSubwayPredictions } from "./queries.js";

function TtcBasicEtaInfo(props: {
  line: number;
  stopNum: number;
}): JSX.Element {
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(Date.now());

  const { t } = useTranslation();

  const ttcSubwayPredictionsResponse = useQuery({
    ...ttcSubwayPredictions(props.stopNum),
    queryKey: [`ttc-subway-stop-${props.stopNum}`, lastUpdatedAt.toString()],
    enabled: props.line <= 6,
  });

  const ttcBusPredictionsResponseBasic = useQuery({
    ...ttcBusPredictionsBasic({ stopNum: props.stopNum, lineNum: props.line }),
    queryKey: [
      `ttc-bus-basic-${props.line}-${props.stopNum}`,
      lastUpdatedAt.toString(),
    ],
    enabled: props.line > 6,
  });

  const data = useMemo(() => {
    if (ttcBusPredictionsResponseBasic.data) {
      return ttcBusPredictionsResponseBasic.data?.[0];
    }
    return ttcSubwayPredictionsResponse.data?.[0];
  }, [ttcSubwayPredictionsResponse.data, ttcBusPredictionsResponseBasic.data]);

  const etaArray = useMemo(() => {
    if (ttcBusPredictionsResponseBasic.data) {
      return ttcBusPredictionsResponseBasic.data;
    }
    return ttcSubwayPredictionsResponse.data?.[0].nextTrains.split(",");
  }, [ttcSubwayPredictionsResponse.data, ttcBusPredictionsResponseBasic.data]);

  const fetchPredictions = useCallback(() => {
    setLastUpdatedAt(Date.now());
  }, [lastUpdatedAt]);

  const fetchPredictionClick = useCallback(() => {
    fetchPredictions();
  }, []);

  const stationInfo = subwayDbSelectors.selectById(
    store.getState().subwayDb,
    props.stopNum
  );

  const etaElements = useMemo(() => {
    if (!etaArray || etaArray.length === 0) {
      return <Text> {t("reminder.noEta")}</Text>;
    }
    if (typeof etaArray[0] === "string") {
      return (etaArray as string[]).map((minute: string, index: number) => {
        return (
          <div key={`${index}-${minute}`}>
            <CountdownSec second={Number.parseInt(minute) * 60} />
          </div>
        );
      });
    }

    if ("nextBusMinutes" in etaArray[0]) {
      return (etaArray as NextBusBasic[]).map(
        (busEta: NextBusBasic, index: number) => {
          return (
            <div key={`${index}-${busEta.nextBusMinutes}`}>
              <CountdownSec
                second={Number.parseInt(busEta.nextBusMinutes) * 60}
              />
            </div>
          );
        }
      );
    }
  }, [etaArray]);

  if (!data) {
    return (
      <div className="directionsList list">
        <LargeTitle>{t("reminder.loading")}</LargeTitle>
        <RefreshButton onRefresh={fetchPredictionClick} />
      </div>
    );
  }

  if (data.Error) {
    return <LargeTitle>{t("reminder.failToLocate")}</LargeTitle>;
  }

  return (
    <div className="directionsList list">
      {props.line > 6 && <Title1>{data.destinationSign}</Title1>}
      {stationInfo && (
        <>
          <Title1>{stationInfo.stop.name.split(" - ")[0]}</Title1>
          <br />
          <Title1>{data.directionText}</Title1>
        </>
      )}
      <TtcAlertList lineNum={[props.line]} type="compact" />
      <div className="countdown-row">
        <RefreshButton onRefresh={fetchPredictionClick} />
        <BookmarkButton
          stopId={props.stopNum}
          name={data.directionText || props.stopNum}
          ttcId={props.stopNum}
          lines={[props.line.toString()]}
          type="ttc-subway"
        />
      </div>
      {etaElements}
      <RawDisplay data={data} />
    </div>
  );
}

function RefreshButton(props: { onRefresh: () => void }) {
  const { t } = useTranslation();

  return (
    <Button onClick={props.onRefresh} icon={<ArrowClockwise24Regular />}>
      {t("buttons.refresh")}
    </Button>
  );
}
export default TtcBasicEtaInfo;
