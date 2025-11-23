import { Link as LinkFluent, Title2 } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";

import TtcBasicEtaInfo from "../components/fetch/FetchSubwayStop.js";

export default function LineStopPrediction() {
  const params = useParams();
  const lineNum = Number.parseInt(`${params.lineId}`);
  const stopNum = Number.parseInt(`${params.stopNum}`);

  const { t } = useTranslation();
  return (
    <main>
      <Link to={".."} className="router-link">
        <LinkFluent>
          Back to {lineNum < 6 && "Line "}
          {lineNum}
        </LinkFluent>
      </Link>
      <Title2>{t("lines.lineAndStopInfo", { lineNum, stopNum })}</Title2>
      {<TtcBasicEtaInfo line={lineNum} stopNum={stopNum} />}
    </main>
  );
}
