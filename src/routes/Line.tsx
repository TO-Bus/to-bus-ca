import { Accordion, Title1 } from "@fluentui/react-components";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { TtcAlertList } from "../components/alerts/TtcAlertList.js";
import RouteInfo from "../components/fetch/FetchRoute.js";
import SubwayRouteInfo from "../components/fetch/FetchSubwayRoute.js";

export default function Line() {
  const params = useParams();
  const { t } = useTranslation();

  const lineNum = Number.parseInt(`${params.lineId}`);

  useEffect(() => {
    document.title = t("lines.browserTitle", { lineNum });
  });

  return (
    <main className="line-page">
      <TtcAlertList lineNum={[lineNum]} type="compact" />
      <Title1>{t("lines.number", { lineNum })}</Title1>
      <Accordion defaultOpenItems collapsible>
        {lineNum <= 6 && <SubwayRouteInfo line={lineNum} />}
        {lineNum > 6 && <RouteInfo line={lineNum} />}
      </Accordion>
    </main>
  );
}
