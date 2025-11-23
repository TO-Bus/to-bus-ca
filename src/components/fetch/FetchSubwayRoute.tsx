import {
  Accordion,
  Link as LinkFluent,
  Text,
  Title1,
} from "@fluentui/react-components";
import { useQuery } from "@tanstack/react-query";
import { type JSX, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { SubwayStopInfo } from "../../models/ttc.js";
import { useAppDispatch } from "../../store/index.js";
import { addStop } from "../../store/suwbayDb/slice.js";
import { SubwayAccordions } from "../accordions/SubwayAccordions.js";
import RawDisplay from "../rawDisplay/RawDisplay.js";
import styles from "./FetchSubwayRoute.module.css";
import { ttcRouteBasic } from "./queries.js";

const filterSubwayDirection = (input: string) => {
  return input.replace(/LINE \d \([\w-]+\) /, "").toLowerCase();
};

const filterSubwayTitle = (input: string) => {
  return `${input.split(/\(|\)/)[1].toLowerCase()} Line`;
};

const line3Tribute = () => {
  const lines = new Map([
    [0, "It is no more."],
    [1, "It has ceased to be."],
    [2, "Bereft of life, it rests in peace."],
    [3, "It is an ex-line."],
    [4, "It is pining for the fjords."],
    [5, "It has kicked the bucket."],
    [
      6,
      "It has shuffled off its mortal coil, run down the curtain and joined the choir invisible.",
    ],
    [7, "Its metallic processes are now history."],
    [8, "It's definitely deceased."],
    [9, "It is expired and gone to meet its maker."],
    [10, "It's passed on."],
  ]);

  return lines.get(Math.floor(Math.random() * 11));
};

function RouteInfo(props: { line: number }): JSX.Element {
  const lineNum = props.line;
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(Date.now());
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const ttcSubwayLineResponse = useQuery({
    ...ttcRouteBasic(lineNum),
    queryKey: [`ttc-subway-line-${lineNum}`, lastUpdatedAt.toString()],
  });

  useEffect(() => {
    const controller = new AbortController();

    const setSubwayDb = (subwayApiRes: SubwayStopInfo[]) => {
      subwayApiRes
        .filter((element) => element.routeBranch.headsign)
        .forEach((route) => {
          route.routeBranchStops.forEach((stop) => {
            dispatch(
              addStop({
                id: Number.parseInt(stop.code),
                stop,
              })
            );
          });
        });
    };

    if (lineNum !== 3 && ttcSubwayLineResponse.data) {
      setSubwayDb(ttcSubwayLineResponse.data?.routeBranchesWithStops);
    }

    // when useEffect is called, the following clean-up fn will run first
    return () => {
      controller.abort();
    };
  }, [lastUpdatedAt, ttcSubwayLineResponse.data]);

  const handleFetchBusClick = useCallback(() => {
    setLastUpdatedAt(Date.now());
  }, [lastUpdatedAt]);

  if (ttcSubwayLineResponse.data) {
    const data = ttcSubwayLineResponse.data;
    if (!data.Error) {
      const accordionList: JSX.Element[] = data.routeBranchesWithStops
        .filter((element) => element.routeBranch.headsign)
        .map((element) => {
          return (
            <li key={element.routeBranch.gtfsId}>
              <SubwayAccordions
                title={filterSubwayDirection(element.routeBranch.headsign)}
                lineNum={props.line}
                result={element.routeBranchStops}
                tag={element.routeBranch.gtfsId}
              />
            </li>
          );
        });

      return (
        <div className="stop-prediction-page">
          <Title1 className={styles["subway-title"]}>
            {filterSubwayTitle(
              data.routeBranchesWithStops[0].routeBranch.headsign
            )}
          </Title1>
          <ul>
            <Accordion collapsible>{accordionList}</Accordion>
            <li>
              <RawDisplay data={data} />
            </li>
          </ul>
        </div>
      );
    }
    return (
      <div className="stop-prediction-page">
        <ul>
          {props.line === 3 && (
            <li>
              Line 3 is permanently closed. <br />
              {line3Tribute()}
            </li>
          )}
          <li>
            <RawDisplay data={data} />
          </li>
        </ul>
      </div>
    );
  }
  if (navigator.onLine) {
    return (
      <LinkFluent appearance="subtle" onClick={handleFetchBusClick}>
        <Text as="h1" weight="semibold">
          <div className="stop-prediction-page">
            <ul>
              {props.line === 3 && (
                <li>
                  Line 3 is permanently closed. <br />
                  {line3Tribute()}
                </li>
              )}
              {props.line !== 3 && t("reminder.loading")}
            </ul>
          </div>
        </Text>
      </LinkFluent>
    );
  }
  return (
    <Text>Your device seems to be offline, and no cache has been found.</Text>
  );
}
export default RouteInfo;
