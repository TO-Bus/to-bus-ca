import { Button, Text } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { stopBookmarksSelectors } from "../../store/bookmarks/slice.js";
import { store, useAppSelector } from "../../store/index.js";
import { subwayDbSelectors } from "../../store/suwbayDb/slice.js";
import Bookmark from "../bookmarks/Bookmark.js";
import RawDisplay from "../rawDisplay/RawDisplay.js";
import { BookmarkCardEta } from "./BookmarkCardEta.js";
import style from "./FavouriteEta.module.css";

export default function FavouriteEta() {
  const stopBookmarks = stopBookmarksSelectors.selectAll(
    store.getState().stopBookmarks
  );
  const { t } = useTranslation();
  // const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(0);
  const unifiedEtaValue = useAppSelector(
    (state) => state.settings?.entities?.unifiedEta?.value === "true"
  );

  let fetchUrl = "";

  for (const item of stopBookmarks) {
    const ttcStop = item.ttcId;

    const lines = item.enabled ? item.enabled : item.lines;

    if (lines && lines.length > 0) {
      for (const line of lines) {
        if (Number.parseInt(line) > 6) {
          fetchUrl = fetchUrl.concat(
            `&stops=${Number.parseInt(line)}|${ttcStop}`
          );
        }
      }
    }
  }

  const EtaCards = [];
  if (unifiedEtaValue) {
    for (const item of stopBookmarks) {
      if (
        stopBookmarks.length > 0 ||
        (item.type === "ttc-subway" && (item.enabled?.length ?? 1) > 0)
      ) {
        const id = item.stopId;

        const name =
          item.type === "ttc-subway" && id
            ? (subwayDbSelectors.selectById(store.getState().subwayDb, id)?.stop
                ?.name ?? item.name)
            : item.name;

        EtaCards.push(
          <BookmarkCardEta
            key={`ttc-${id}`}
            item={{
              stopName: name,
              stopTag: id,
              line: item.enabled ? item.enabled : item.lines,
              type: item.type,
              direction: item.direction,
            }}
          />
        );
      }
    }
  } else {
    for (const item of stopBookmarks) {
      for (const line of item.lines) {
        const id = `bookmark-card-${line}-${item.direction}-${item.stopId}`;
        EtaCards.push(
          <BookmarkCardEta
            item={{ ...item, line, stopName: item.name, stopTag: item.stopId }}
            key={id}
          />
        );
      }
    }
  }

  return (
    <article className={style["favorite-eta"]}>
      {EtaCards.length > 0 ? (
        <>
          {navigator.onLine ? null : (
            <Text>Device seems to be offline. Results may be inaccurate.</Text>
          )}
          <ul>{EtaCards}</ul>
        </>
      ) : !navigator.onLine ? (
        <section>
          <p>
            {navigator.onLine
              ? t("home.homeNoEta")
              : "Your device seems to be offline."}
          </p>
          <Bookmark />
        </section>
      ) : null}
      <Link to={"/bookmarks"}>
        <Button>{t("buttons.bookmarkEdit")}</Button>
      </Link>
      {stopBookmarks && <RawDisplay data={stopBookmarks} />}
    </article>
  );
}
