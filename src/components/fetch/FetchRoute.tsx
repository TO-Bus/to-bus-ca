import type {
  SelectTabData,
  SelectTabEvent,
  TabValue,
} from "@fluentui/react-components";
import {
  Accordion,
  Link as LinkFluent,
  Tab,
  TabList,
  Text,
  Title1,
} from "@fluentui/react-components";
import { useQuery } from "@tanstack/react-query";
import { type JSX, useCallback, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import type { LineStopElement } from "../../models/etaObjects.js";
import { StopAccordions } from "../accordions/StopAccordions.js";
import { SubwayAccordions } from "../accordions/SubwayAccordions.js";
import { stopsParser } from "../parser/stopsParser.js";
import RawDisplay from "../rawDisplay/RawDisplay.js";
import style from "./FetchRoute.module.css";
import { ttcRoute, ttcRouteBasic } from "./queries.js";

function RouteInfo(props: { line: number }): JSX.Element {
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(Date.now());
  const [enabledDir, setEnabledDir] = useState<TabValue>("");
  const { t } = useTranslation();

  const ttcRouteResponse = useQuery({
    ...ttcRoute(props.line),
    queryKey: [`ttc-route-${props.line}`, lastUpdatedAt.toString()],
  });

  const ttcRouteBasicResponse = useQuery({
    ...ttcRouteBasic(props.line),
    enabled: !!ttcRouteResponse.error,
  });

  const stopDb = useMemo(() => {
    if (ttcRouteResponse.data) {
      return stopsParser(ttcRouteResponse.data);
    }
    return [];
  }, [ttcRouteResponse.data]);

  const createStopList = useCallback(
    (stuff: { stop: { tag: string }[] }) => {
      const result: LineStopElement[] = [];

      for (const element of stuff.stop) {
        const matchingStop = stopDb.find(
          (searching) => Number.parseInt(element.tag) === searching.id
        );

        // skip not found data
        if (!matchingStop) {
          continue;
        }

        result.push({
          ...matchingStop,
          key: matchingStop?.id ?? 0,
        });
      }
      return result;
    },
    [stopDb]
  );

  const handleFetchBusClick = useCallback(() => {
    setLastUpdatedAt(Date.now());
  }, [lastUpdatedAt]);

  const handleDirClick = useCallback(
    (_event: SelectTabEvent, data: SelectTabData) => setEnabledDir(data.value),
    [enabledDir]
  );

  if (ttcRouteBasicResponse.data) {
    const data = ttcRouteBasicResponse.data;
    if (!data.Error) {
      const accordionList: JSX.Element[] = data.routeBranchesWithStops
        .filter((element) => element.routeBranch.headsign)
        .map((element) => {
          return (
            <li key={element.routeBranch.gtfsId}>
              <SubwayAccordions
                title={element.routeBranch.headsign}
                lineNum={props.line}
                result={element.routeBranchStops}
                tag={element.routeBranch.gtfsId}
              />
            </li>
          );
        });

      return (
        <div className="stop-prediction-page">
          <Title1>{data.routeBranchesWithStops[0].routeBranch.headsign}</Title1>
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
          <li>
            <RawDisplay data={data} />
          </li>
        </ul>
      </div>
    );
  }
  if (ttcRouteResponse.data) {
    const data = ttcRouteResponse.data;
    if (!data.Error) {
      const directions: Set<string> = new Set();
      data.route.direction.forEach((line) => {
        directions.add(line.name);
      });
      const accordionList: (direction: string) => JSX.Element[] = (
        direction
      ) => {
        return data.route.direction
          .filter((line) => direction === line.name)
          .map((line, index) => {
            const list = createStopList(line);

            return (
              <StopAccordions
                key={line.tag}
                index={index.toString()}
                title={line.title}
                direction={line.name}
                lineNum={line.branch}
                result={list}
                tag={line.tag}
              />
            );
          });
      };
      const directionsArr = Array.from(directions.values());
      if (enabledDir === "") {
        setEnabledDir(directionsArr[0]);
      }

      return (
        <div className="stop-prediction-page">
          <TabList
            defaultSelectedValue={enabledDir}
            className="direction-buttons"
            onTabSelect={handleDirClick}
          >
            {directionsArr.map((direction) => {
              return (
                <Tab key={direction} value={direction}>
                  {direction}
                </Tab>
              );
            })}
          </TabList>

          {directionsArr.map((direction) => {
            const accordionItems = accordionList(direction);
            return (
              <Accordion
                collapsible
                defaultOpenItems={accordionItems.length === 1 ? "0" : ""}
                className={enabledDir !== direction ? style.hide : undefined}
                key={direction}
              >
                {accordionItems}
              </Accordion>
            );
          })}
          <RawDisplay data={data} />
        </div>
      );
    }
    const noRouteRegex = /Could not get route /;
    const errorString = data.Error?.["#text"];
    if (noRouteRegex.test(errorString)) {
      return (
        <div className="stop-prediction-page">
          <Text as="h1" weight="semibold">
            <Trans>{t("lines.noLineInDb")}</Trans>
          </Text>
          <RawDisplay data={data} />
        </div>
      );
    }
    return (
      <div className="stop-prediction-page">
        <LinkFluent onClick={handleFetchBusClick}>
          <Text as="h1" weight="semibold">
            {`Error: ${errorString}`}
          </Text>
        </LinkFluent>
        <RawDisplay data={data} />
      </div>
    );
  }
  if (navigator.onLine) {
    return (
      <LinkFluent appearance="subtle" onClick={handleFetchBusClick}>
        <Text as="h1" weight="semibold">
          {t("reminder.loading")}
        </Text>
      </LinkFluent>
    );
  }
  return (
    <Text>Your device seems to be offline, and no cache has been found.</Text>
  );
}
export default RouteInfo;
