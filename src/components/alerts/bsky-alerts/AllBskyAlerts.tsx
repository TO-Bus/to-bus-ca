import {
  Dropdown,
  Option,
  type OptionOnSelectData,
  type SelectionEvents,
  type SelectTabData,
  type SelectTabEvent,
  Tab,
  TabList,
} from "@fluentui/react-components";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { useCallback, useId, useMemo, useState } from "react";

import { TtcBadge } from "../../badges.js";
import { atprotoTtcAlerts } from "../../fetch/atproto.js";
import { getLineNumber } from "../AlertUtils.js";
import style from "./AllBskyAlerts.module.css";
import type { Skeet } from "./Skeet.js";
import { SkeetList } from "./SkeetList.js";

const AllBskyAlerts = () => {
  const bskyAlerts = useQuery(atprotoTtcAlerts);

  const bskyAlertWithLines = useMemo(() => {
    return (
      ((bskyAlerts.data ?? []) as Skeet[]).map((alert) => {
        const line = Number.parseInt(
          getLineNumber(alert.post.record.text as string)
        );
        return {
          ...alert,
          line,
        };
      }) ?? []
    );
  }, [bskyAlerts.data]);

  const [enabledTab, setEnabledTab] = useState("all");

  const handleTabClick = useCallback(
    (_event: SelectTabEvent, data: SelectTabData) => {
      setEnabledTab(data.value as string);
    },
    [enabledTab]
  );

  const lastSkeetTime = useMemo(() => {
    if (!bskyAlerts.data?.length) {
      return null;
    }
    const lastSkeet = bskyAlerts.data[bskyAlerts.data.length - 1];
    return formatDistanceToNowStrict(
      lastSkeet.post.record.createdAt as string,
      { unit: "hour" }
    );
  }, [bskyAlerts.data]);
  const options = new Map([
    ["lastHour", "Last hour"],
    ["last3Hours", "Last 3 hours"],
    ["last24Hours", "Last 24 hours"],
    ["all", `Last ${lastSkeetTime}`],
  ]);

  const [timeframe, setTimeframe] = useState<string | undefined>("last3Hours");

  const bskyAlertsWithinTimeframe = useMemo(() => {
    if (!bskyAlertWithLines?.length) {
      return [];
    }
    const now = new Date();

    return bskyAlertWithLines.filter((skeet) => {
      const createdAt = new Date(skeet.post.record.createdAt as string);
      const diff = now.getTime() - createdAt.getTime();
      const diffInHours = diff / (1000 * 60 * 60);
      if (timeframe === "lastHour") {
        return diffInHours < 1;
      }
      if (timeframe === "last3Hours") {
        return diffInHours < 3;
      }
      if (timeframe === "last24Hours") {
        return diffInHours < 24;
      }
      return true;
    });
  }, [bskyAlertWithLines, timeframe]);

  const bskyAlertLines = useMemo(() => {
    const lines = bskyAlertsWithinTimeframe?.map((alert) => {
      return Number.parseInt(getLineNumber(alert.post.record.text as string));
    });

    return Array.from(new Set(lines)).sort((a, b) => (a > b ? 1 : -1));
  }, [bskyAlertsWithinTimeframe]);

  const filteredBskyAlerts = useMemo(() => {
    if (enabledTab === "all") {
      return bskyAlertsWithinTimeframe;
    }
    return bskyAlertsWithinTimeframe.filter((skeet) => {
      return skeet.line === Number.parseInt(enabledTab);
    });
  }, [enabledTab, bskyAlertsWithinTimeframe]);

  const handleOptionSelect = useCallback(
    (_event: SelectionEvents, data: OptionOnSelectData) => {
      const option = data.optionValue;
      if (option) {
        setTimeframe(option);
      }
    },
    [timeframe]
  );

  return (
    <div className="all-alerts">
      <h2 className={style.title}>
        Recent alerts
        <Dropdown
          defaultValue={options.get(`${timeframe}`)}
          className={style.dropdown}
          onOptionSelect={handleOptionSelect}
        >
          {Array.from(options.keys()).map((option) => (
            <Option key={option} text={options.get(option)} value={option}>
              {`${options.get(option)}`}
            </Option>
          ))}
        </Dropdown>
      </h2>
      <TabList
        defaultSelectedValue="all"
        onTabSelect={handleTabClick}
        className={style.tablist}
      >
        <Tab value="all" id={useId()}>
          All
        </Tab>
        {bskyAlertLines?.map((line) => {
          return (
            <Tab key={line} value={line} id={line.toString()}>
              <TtcBadge lineNum={line.toString()} type="standalone" />
            </Tab>
          );
        })}
      </TabList>
      <p>
        Source:{" "}
        <a href="https://bsky.app/profile/ttcalerts.bsky.social">
          https://bsky.app/profile/ttcalerts.bsky.social
        </a>
      </p>
      {bskyAlerts.data && (
        <SkeetList skeetList={filteredBskyAlerts ?? []} line={"all"} />
      )}
    </div>
  );
};

export default AllBskyAlerts;
