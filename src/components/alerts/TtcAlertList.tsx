import { useQuery } from "@tanstack/react-query";

import { atprotoTtcAlerts } from "../fetch/queries.js";
import type { Skeet } from "./bsky-alerts/Skeet.js";
import { SkeetList } from "./bsky-alerts/SkeetList.js";

export function TtcAlertList({
  lineNum,
  type,
}: {
  lineNum: number[];
  type?: string;
}) {
  const bskyAlerts = useQuery(atprotoTtcAlerts);

  const filteredBskyAlerts =
    ((bskyAlerts.data ?? []) as Skeet[]).filter((skeet) =>
      lineNum.some((line) => {
        const text = skeet.post.record.text as string;
        return line <= 6
          ? text.match(`Line ${line}`)
          : text.startsWith(`${line}`);
      }),
    ) ?? [];
  return (
    <>
      {filteredBskyAlerts.length > 0 && (
        <SkeetList
          skeetList={filteredBskyAlerts}
          line={lineNum.length > 1 ? "all" : `${lineNum[0]}`}
          type={type}
        />
      )}
    </>
  );
}
