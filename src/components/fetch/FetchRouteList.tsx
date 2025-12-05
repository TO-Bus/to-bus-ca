import { Card, Link as LinkFluent, Text } from "@fluentui/react-components";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link } from "react-router";

import { subwayLines } from "../../data/ttc.js";
import { TtcBadge } from "../badges.js";
import RawDisplay from "../rawDisplay/RawDisplay.js";
import style from "./FetchRouteList.module.css";
import { ttcLines, ttcLinesBasic } from "./queries.js";

const parseRouteTitle = (input: string) => {
  const routeTitleRegex = /\d+-/;
  if (routeTitleRegex.test(input)) {
    return input.replace(routeTitleRegex, "");
  }
  return input;
};

export function RoutesInfo() {
  const lineData = useQuery({ ...ttcLines, retry: 1 });
  const lineDataBasic = useQuery({
    ...ttcLinesBasic,
    enabled: !!lineData.error,
  });

  function lineType(text: string) {
    if (Number.parseInt(text) <= 6) {
      return "rail";
    }
    switch (true) {
      case /9[\d]{2}.*/.test(text):
        return "express";
      case /3[\d]{2}.*/.test(text):
        return "night";
      case /5[\d]{2}.*/.test(text):
        return "streetcar";
      case /^1$/.test(text):
      case /[2,4][\d]{2}.*/.test(text):
        return "seasonal";
      default:
        return "local";
    }
  }

  const routesCards = useMemo(() => {
    const idCount = {
      rail: 0,
      express: 0,
      night: 0,
      streetcar: 0,
      seasonal: 0,
      local: 0,
    };
    if (lineData.data) {
      return lineData.data?.route.map((routeItem) => {
        const type = lineType(routeItem.tag.toString());
        idCount[type]++;
        return (
          <li key={routeItem.tag} id={idCount[type] === 1 ? type : undefined}>
            <Card className="card-container clickableCard">
              <Link className="route-card" to={`/lines/${routeItem.tag}`}>
                <TtcBadge key={routeItem.tag} lineNum={`${routeItem.tag}`} />
                <Text>{parseRouteTitle(routeItem.title)}</Text>
              </Link>
            </Card>
          </li>
        );
      });
    }
    if (lineDataBasic.data) {
      return lineDataBasic.data.map((routeItem) => {
        const type = lineType(routeItem.shortName);
        idCount[type]++;
        return (
          <li
            key={routeItem.shortName}
            id={idCount[type] === 1 ? type : undefined}
          >
            <Card className="card-container clickableCard">
              <Link
                className="route-card"
                to={`/lines/${Number.parseInt(routeItem.shortName)}`}
              >
                <TtcBadge
                  key={routeItem.shortName}
                  lineNum={`${routeItem.shortName}`}
                />
                <Text>{parseRouteTitle(routeItem.longName)}</Text>
              </Link>
            </Card>
          </li>
        );
      });
    }
    return;
  }, [lineData.data, lineDataBasic.data]);

  return (
    <article className={style["ttc-route-list"]}>
      {/* <ul className="jumpbar">
        <li>
          <a href="#200">
            <LinkFluent><Button>
              Seasonal</Button></LinkFluent>
          </a>
        </li>
        <li><a href="#300"><LinkFluent><Button>Night</Button></LinkFluent></a></li>
        <li><a href="#300"><LinkFluent><Button>Community</Button></LinkFluent></a></li>
        <li><a href="#501"><LinkFluent><Button>Streetcar</Button></LinkFluent></a></li>
        <li><a href="#900"><LinkFluent><Button>Express</Button></LinkFluent></a></li>
      </ul> */}
      <JumpBar />
      <ul className="route-list">
        {lineData.data && <SubwayCards />}
        {routesCards}
      </ul>
      {lineData.data && <RawDisplay data={lineData.data} />}
    </article>
  );
}

function SubwayCards() {
  const result = subwayLines.map((subwayLine) => {
    return (
      <li key={subwayLine.line}>
        <Card className="card-container clickableCard">
          <Link className="route-card" to={`/lines/${subwayLine.line}`}>
            <TtcBadge
              key={subwayLine.line}
              lineNum={subwayLine.line.toString()}
            />
            <Text>{parseRouteTitle(subwayLine.name)}</Text>
          </Link>
        </Card>
      </li>
    );
  });
  return result;
}

function JumpBar() {
  const jumpbarMap = [
    ["", "Rail"],
    ["local", "Local"],
    ["seasonal", "Seasonal"],
    ["night", "Night"],
    ["streetcar", "Streetcar"],
    ["express", "Express"],
  ];

  const jumpbarItems = [];
  for (let index = 0; index < jumpbarMap.length; index++) {
    jumpbarItems.push(
      <li key={index} id={style[`jump-to-${jumpbarMap[index][0]}`]}>
        <a href={`#${jumpbarMap[index][0]}`}>
          <LinkFluent>{jumpbarMap[index][1]}</LinkFluent>
        </a>
      </li>
    );
  }
  return <ul className={style.jumpbar}>{jumpbarItems}</ul>;
}
