import { Button, LargeTitle, Text, Title1 } from "@fluentui/react-components";
import { ArrowClockwise24Regular } from "@fluentui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { type JSX, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { NextBusBasic } from "../../models/ttc.js";
import { store } from "../../store/index.js";
import { subwayDbSelectors } from "../../store/suwbayDb/slice.js";
import { getStopFromStopId } from "../../store/ttcStopsDb.js";
import { TtcAlertList } from "../alerts/TtcAlertList.js";
import { BookmarkButton } from "../bookmarks/BookmarkButton.js";
import { CountdownSec } from "../countdown/CountdownSec.js";
import RawDisplay from "../rawDisplay/RawDisplay.js";
import {
  ttcBusPredictionsBasic,
  ttcLineStopPrediction,
  ttcSubwayPredictions,
} from "./queries.js";
import { etaParser } from "../parser/etaParser.js";
import CountdownGroup from "../countdown/CountdownGroup.js";

function FetchTtcLineStop(props: {
  line: number;
  stopNum: number;
}): JSX.Element {
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(Date.now());

  const { t } = useTranslation();

  const stopData = useQuery({
    queryKey: ["stop-data"],
    queryFn: async () => {
      const stopData = await getStopFromStopId(props.stopNum);
      return stopData ?? null;
    },
  });

  const ttcSubwayPredictionsResponse = useQuery({
    ...ttcSubwayPredictions(props.stopNum),
    queryKey: [`ttc-subway-stop-${props.stopNum}`, lastUpdatedAt.toString()],
    enabled: props.line <= 6,
  });

  const ttcBusPredictionsResponse = useQuery({
    ...ttcLineStopPrediction(props.line, stopData.data?.tag),
    queryKey: [
      `ttc-line-stop-${props.line}-${props.stopNum}`,
      lastUpdatedAt.toString(),
    ],
    enabled: props.line > 6,
  });

  const ttcBusPredictionsResponseBasic = useQuery({
    ...ttcBusPredictionsBasic({ stopNum: props.stopNum, lineNum: props.line }),
    queryKey: [
      `ttc-bus-basic-${props.line}-${props.stopNum}`,
      lastUpdatedAt.toString(),
    ],
    enabled: props.line > 6 && !!ttcBusPredictionsResponse.error,
  });

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

  const ttcSubwayEtas = useMemo(() => {
    const data = ttcSubwayPredictionsResponse.data?.[0];
    const etaArray =
      ttcSubwayPredictionsResponse.data?.[0].nextTrains.split(",");
    if (!data) {
      return;
    }

    if (data.Error) {
      return;
    }

    if (!etaArray || etaArray.length === 0) {
      return <Text> {t("reminder.noEta")}</Text>;
    }
    return etaArray.map((minute: string, index: number) => {
      return (
        <div key={`${index}-${minute}`}>
          <CountdownSec second={Number.parseInt(minute) * 60} />
        </div>
      );
    });
  }, [ttcSubwayPredictionsResponse.data]);

  const ttcBusEtaBasic = useMemo(() => {
    const data = ttcBusPredictionsResponseBasic.data?.[0];
    const etaArray = ttcBusPredictionsResponseBasic.data;
    if (!data) {
      return;
    }

    if (!etaArray || etaArray.length === 0) {
      return <Text> {t("reminder.noEta")}</Text>;
    }
    return etaArray.map((busEta: NextBusBasic, index: number) => {
      return (
        <div key={`${index}-${busEta.nextBusMinutes}`}>
          <CountdownSec second={Number.parseInt(busEta.nextBusMinutes) * 60} />
        </div>
      );
    });
  }, [ttcBusPredictionsResponseBasic.data]);

  const ttcBusEta = useMemo(() => {
    if (!ttcBusPredictionsResponse.data?.predictions) {
      return;
    }

    const etaDb = etaParser(ttcBusPredictionsResponse.data);

    return etaDb.map((element) => {
      return (
        <CountdownGroup
          key={`line-group-${element.line}-${element.direction}-${element.stopTag}`}
          detail={element}
        />
      );
    });
  }, [ttcBusPredictionsResponse.data]);

  const stopName = useMemo(() => {
    if (props.line <= 6) {
      return ttcSubwayPredictionsResponse.data?.[0].directionText ?? "";
    }
    return stopData.data?.title ?? "";
  }, [props.line, stopData.data, ttcSubwayPredictionsResponse.data]);

  return (
    <div className="directionsList list">
      {props.line > 6 && <Title1>{stopData.data?.title}</Title1>}
      {stationInfo && (
        <>
          <Title1>{stationInfo.stop.name.split(" - ")[0]}</Title1>
          <br />
          <Title1>{stopName}</Title1>
        </>
      )}
      <TtcAlertList lineNum={[props.line]} type="compact" />
      <div className="countdown-row">
        <RefreshButton onRefresh={fetchPredictionClick} />
        <BookmarkButton
          stopId={props.stopNum}
          name={stopName}
          ttcId={props.stopNum}
          lines={[props.line.toString()]}
          type={props.line <= 6 ? "ttc-subway" : undefined}
        />
      </div>
      {ttcSubwayEtas}
      {ttcBusEtaBasic}
      {ttcBusEta}
      <RawDisplay
        data={
          ttcBusPredictionsResponseBasic.data ||
          ttcSubwayPredictionsResponse.data ||
          ttcBusPredictionsResponse.data
        }
      />
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
export default FetchTtcLineStop;
