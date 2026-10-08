import { TZDate } from "@date-fns/tz";
import {
  type SelectTabData,
  type SelectTabEvent,
  Tab,
  TabList,
  type TabValue,
} from "@fluentui/react-components";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import style from "./AlertsPage.module.css";

const AllBskyAlerts = lazy(() => import("./bsky-alerts/AllBskyAlerts.js"));

import { parse } from "date-fns";
// import CurrentAlerts from "./CurrentAlerts.js";
import { SubwayClosures } from "./subway-closures/SubwayClosures.js";

export default function TtcAlertList() {
  const [enabledTab, setEnabledTab] = useState<TabValue>("now");
  const handleTabClick = useCallback(
    (_event: SelectTabEvent, data: SelectTabData) => {
      setEnabledTab(data.value);
    },
    [enabledTab]
  );
  const { t } = useTranslation();
  const currentTime = new TZDate(new Date(), "America/Toronto");
  const currentDate = useMemo(() => {
    console.log("current time rerun");
    return currentTime.toISOString().split("T")[0];
  }, [currentTime]);
  // get saturday's date
  const weekendDate = useMemo(() => {
    const handlingDate = parse(currentDate, "yyyy-MM-dd", new Date());
    if (handlingDate.getDay() === 6) {
      // show Sunday data on Saturdays, otherwise show the next Sunday
      handlingDate.setDate(handlingDate.getDate() + 1);
    } else {
      handlingDate.setDate(
        handlingDate.getDate() + ((6 - handlingDate.getDay()) % 7)
      );
    }
    return handlingDate.toISOString().split("T")[0];
  }, [currentDate]);

  return (
    <div className="alert-page">
      <TabList defaultSelectedValue="now" onTabSelect={handleTabClick}>
        <Tab value="now">{t("alerts.now")}</Tab>
        {/* <Tab value="later">{t("alerts.later")}</Tab> */}
        {/* <Tab value="now">{t("alerts.today")}</Tab> */}
        <Tab value="weekend">{t("alerts.thisWeekend")}</Tab>
        {/* <Tab value="all">{t("alerts.allAlerts")}</Tab> */}
      </TabList>
      <div className={enabledTab === "now" ? "" : style.hidden}>
        <SubwayClosures startDate={currentDate} />
        {/*<CurrentAlerts />*/}
        <Suspense fallback={<div>Loading alerts...</div>}>
          <AllBskyAlerts />
        </Suspense>
      </div>
      <div className={enabledTab === "weekend" ? "" : style.hidden}>
        <SubwayClosures startDate={weekendDate} />
      </div>
    </div>
  );
}
