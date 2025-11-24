// import { useQuery } from "@tanstack/react-query";

// import { ttcGtfsAlerts } from "../fetch/queries.js";
// import { ParsedTtcAlertText } from "./AlertUtils.js";

// export default function CurrentAlerts() {
//   const gtfsAlertsResp = useQuery(ttcGtfsAlerts);

//   return (
//     <div className="gtfs-alerts">
//       {Array.isArray(gtfsAlertsResp.data?.entity) && (
//         <details>
//           <summary>
//             <h3>Current alerts</h3>
//           </summary>
//           {gtfsAlertsResp.data?.entity.map((item) => {
//             const string = item.alert?.headerText?.translation?.[0].text;

//             if (string) {
//               return (
//                 <p key={string} id={string}>
//                   <ParsedTtcAlertText
//                     badge={{ highlightAll: true }}
//                     feedText={string}
//                     id={string}
//                   />
//                 </p>
//               );
//             }
//             return null;
//           })}
//         </details>
//       )}
//       {}
//     </div>
//   );
// }
