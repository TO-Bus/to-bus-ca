import { Badge } from "@fluentui/react-components";

import style from "./badges.module.css";

const badgeColor = (text: string) => {
  switch (true) {
    case /9[\d]{2}.*/.test(text):
      return "success";
    case /3[\d]{2}.*/.test(text):
      return "brand";
    case /^1$/.test(text):
    case /[2,4][\d]{2}.*/.test(text):
      return "important";
    default:
      return "danger";
  }
};

const customBgColor = (text: string) => {
  switch (true) {
    case /^1$/.test(text):
      return "yellow";
    case /^2$/.test(text):
      return "green";
    case /^4$/.test(text):
      return "purple";
    case /^5$/.test(text):
      return "orange";
    case /^6$/.test(text):
      return "gray";
    case /2[\d]{2}.*/.test(text):
      return "pink";
    default:
      return "";
  }
};

const badgeOutline = (text: string) => {
  const occasional = new Set([10, 99, 101, 115, 119, 160, 162, 167, 169, 176]);
  switch (true) {
    case /[9][\d]{2}.*/.test(text):
      return "filled";
    case /[3,4][\d]{2}.*/.test(text):
      return "outline";
    default:
      for (const item of occasional) {
        if (text.toString().startsWith(item.toString())) {
          return "outline";
        }
      }
      return "filled";
  }
};

export function DirectionBadge(props: { direction: string }) {
  return <Badge className={style["line-badge"]}>{props.direction}</Badge>;
}

export function TtcBadge(props: { lineNum: string; type?: string }) {
  const classList =
    props.type === "standalone"
      ? [style["line-badge"], style.standalone]
      : [style["line-badge"]];
  return (
    <Badge
      style={{ backgroundColor: customBgColor(props.lineNum) }}
      className={classList.join(" ")}
      color={badgeColor(props.lineNum)}
      appearance={badgeOutline(props.lineNum)}
      shape="rounded"
    >
      {props.lineNum}
    </Badge>
  );
}

export function YRTBadge(props: { lineAbbr: string; color?: string }) {
  const vivaBgColor = new Map([
    ["601", "#009cdb"],
    ["603", "#9461a8"],
    ["605", "#fbaf33"],
  ]);
  const vivaColor = new Map([
    ["008", "white"],
    ["720", "white"],
    ["760", "white"],
  ]);

  const bgColor = vivaBgColor.get(props.lineAbbr);
  const textColor = vivaColor.get(props.lineAbbr);

  return (
    <Badge
      style={{
        backgroundColor: props.color ? props.color : bgColor,
        color: textColor || "black",
      }}
    >
      {props.lineAbbr}
    </Badge>
  );
}
