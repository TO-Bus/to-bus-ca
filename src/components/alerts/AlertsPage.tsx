import {
  type SelectTabData,
  type SelectTabEvent,
  Tab,
  TabList,
  type TabValue,
} from "@fluentui/react-components";
import { lazy, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import style from "./AlertsPage.module.css";

const AllBskyAlerts = lazy(() => import("./bsky-alerts/AllBskyAlerts.js"));

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
  const currentDate = new Date().toISOString().split("T")[0];
  // get saturday's date
  const weekend = new Date();
  if (weekend.getDay() === 6) {
    // show Sunday data on Saturdays, otherwise show the next Sunday
    weekend.setDate(weekend.getDate() + 1);
  } else {
    weekend.setDate(weekend.getDate() + ((6 - weekend.getDay()) % 7));
  }

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
        <AllBskyAlerts />
      </div>
      <div className={enabledTab === "weekend" ? "" : style.hidden}>
        <SubwayClosures startDate={weekend.toISOString().split("T")[0]} />
      </div>
    </div>
  );
}
