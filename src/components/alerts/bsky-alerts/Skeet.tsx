import type { AppBskyFeedDefs } from "@atproto/api";
import { formatDistanceStrict } from "date-fns";
import { ParsedTtcAlertText } from "../AlertUtils.js";

export type Skeet = AppBskyFeedDefs.FeedViewPost & {
  post: {
    cid: string;
    record: { text: string; createdAt: string };
  };
};

export const SkeetElement = ({
  skeet,
  badge,
}: {
  skeet: Skeet;
  badge: { highlightAll?: boolean; line?: string };
}) => {
  const cid = skeet.post.cid;
  const feedText = skeet.post.record.text;

  const time = new Date(skeet.post.record.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <li>
      <p className="time">
        <time dateTime={time}>{time}</time> (
        {formatDistanceStrict(skeet.post.record.createdAt, new Date(), {
          addSuffix: true,
        })}
        )
      </p>
      <span className="content">
        <ParsedTtcAlertText badge={badge} feedText={feedText} id={cid} />
      </span>
    </li>
  );
};
