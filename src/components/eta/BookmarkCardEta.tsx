import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { EtaBusWithID, LineStopEta } from "../../models/etaObjects.js";
import { store } from "../../store/index.js";
import { subwayDbSelectors } from "../../store/suwbayDb/slice.js";
import { EtaCard } from "../etaCard/EtaCard.js";
import { ttcStopPrediction, ttcSubwayPredictions } from "../fetch/queries.js";
import { etaParser } from "../parser/etaParser.js";

export function BookmarkCardEta(props: { item: LineStopEta }) {
  const stationType =
    Number.parseInt(props.item.line.toString()) > 6 ? "bus" : "subway";

  const getSubwayPredictionsResponse = useQuery({
    ...ttcSubwayPredictions(props.item.stopTag),
    queryKey: [`subway-${props.item.stopTag}`],
    enabled: stationType === "subway",
    refetchInterval: 60 * 1000,
  });

  const getStopPredictionsResponse = useQuery({
    ...ttcStopPrediction(props.item.stopTag),
    queryKey: [`nearby-stop-${props.item.stopTag}`],
    enabled: stationType === "bus",
    refetchInterval: 60 * 1000,
  });

  const dataFetched = useMemo(
    () =>
      stationType === "bus"
        ? getStopPredictionsResponse.isSuccess
        : getSubwayPredictionsResponse.isSuccess,
    [
      getStopPredictionsResponse.isSuccess,
      getSubwayPredictionsResponse.isSuccess,
    ]
  );

  const unifiedEta = useMemo(() => {
    const data =
      stationType === "bus"
        ? getStopPredictionsResponse.data
        : getSubwayPredictionsResponse.data;
    if (data) {
      if (!Array.isArray(data)) {
        const etaDb = etaParser(data);

        let templist: EtaBusWithID[] = [];
        for (const list of etaDb) {
          if (list.etas) {
            templist = templist.concat(list.etas);
          }
        }
        return templist.sort((a, b) => a.epochTime - b.epochTime);
      }
    }
    return [];
  }, [getStopPredictionsResponse.data]);

  const filteredEta = useMemo(() => {
    if (stationType === "bus") {
      if (Array.isArray(props.item.line)) {
        return unifiedEta.filter((eta) =>
          props.item.line.includes(Number.parseInt(eta.branch).toString())
        );
      }
      return unifiedEta.filter(
        (eta) => Number.parseInt(eta.branch).toString() === props.item.line
      );
    }
    return undefined;
  }, [props.item.line, unifiedEta]);

  const subwayEtas = useMemo(() => {
    if (stationType === "subway") {
      return getSubwayPredictionsResponse.data?.[0].nextTrains.split(",");
    }
    return undefined;
  }, [getSubwayPredictionsResponse.data]);

  const useLineStopPage =
    props.item.type === "ttc-subway" ||
    !Array.isArray(props.item.line) ||
    props.item.line.length === 1;

  const stopUrl = useLineStopPage
    ? `/ttc/lines/${props.item.type === "ttc-subway" ? props.item.line[0] : props.item.line}/${props.item.stopTag}`
    : `/stops/${props.item.stopTag}`;

  const item = props.item;

  const name =
    item.type === "ttc-subway" && props.item.stopTag
      ? (subwayDbSelectors.selectById(
          store.getState().subwayDb,
          props.item.stopTag
        )?.stop?.name ?? props.item.routeName)
      : props.item.stopName;

  const direction = useMemo(() => {
    if (!item.directions) {
      return item.direction;
    }
    return (
      item.directions.find((line) => line.line === props.item.line)
        ?.direction ?? item.direction
    );
  }, [item, props.item.line]);

  if (item.type !== "ttc-subway" && dataFetched && filteredEta?.length === 0) {
    return null;
  }
  return (
    <EtaCard
      id={props.item.stopName + props.item.stopTag}
      etas={filteredEta}
      subwayEtas={subwayEtas}
      lines={
        Array.isArray(props.item.line) ? props.item.line : [props.item.line]
      }
      direction={direction}
      name={name}
      editable={false}
      onDelete={undefined}
      stopUrl={stopUrl}
    />
  );
}
