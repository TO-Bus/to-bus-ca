import { Agent } from "@atproto/api";
import { queryOptions } from "@tanstack/react-query";

const agent = new Agent("https://api.bsky.app");

export const atprotoTtcAlerts = queryOptions({
  queryKey: ["atproto-ttc-alerts"],
  queryFn: async () => {
    const response = await agent.getAuthorFeed({
      actor: "did:plc:jp63azhhbjm7hzse6bx6oq43",
      limit: 100,
    });
    if (!response.success) {
      throw new Error("Network response was not ok");
    }

    return response?.data?.feed;
  },
});

// using @atprotp/api methods instead
// export const ttcAlerts = queryOptions<{
//   feed: { post: { record: { text: string; createdAt: string } } }[];
// }>({
//   queryKey: ["bsky"],
//   queryFn: async () => {
//     const response = await fetch(
//       "https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=ttcalerts.bsky.social"
//     );
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }

//     return response.json();
//   },
//   staleTime: 60 * 1000,
//   refetchInterval: 60 * 1000,
// });
