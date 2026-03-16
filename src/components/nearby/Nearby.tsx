import { Button, Spinner, Switch, Tooltip } from "@fluentui/react-components";
import { Info16Regular } from "@fluentui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import useNavigate from "../../routes/navigate.js";
import { store, useAppDispatch } from "../../store/index.js";
import {
  changeSettings,
  settingsSelectors,
} from "../../store/settings/slice.js";
import { addStops, getSize } from "../../store/ttcStopsDb.js";
import {
  getGeolocation,
  getTtcStops,
  getTtcStopsSize,
} from "../fetch/queries.js";
import StopSearch from "../search/StopSearch.js";
import style from "./Nearby.module.css";
import NearbyList from "./NearbyList.js";

export default function Nearby() {
  const { t } = useTranslation();

  const number = useQuery(getTtcStopsSize);

  const { navigate } = useNavigate();

  const onSearchSubmit = useCallback(
    (input: string) => {
      navigate(`stops/${input}`);
    },
    [navigate]
  );

  const defaultProvideLocationValue = settingsSelectors.selectById(
    store.getState().settings,
    "defaultProvideLocation"
  );
  const [locationMode, setLocationMode] = useState(
    typeof defaultProvideLocationValue !== "undefined"
      ? defaultProvideLocationValue.value === "true"
      : false
  );
  const dispatch = useAppDispatch();

  const ttcStopsResp = useQuery(getTtcStops);

  const handleRefresh = useCallback(async () => {
    const data = (await ttcStopsResp.refetch()).data;

    addStops(data).then(() => {
      number.refetch();
    });
  }, []);

  const geolocationResp = useQuery(getGeolocation);

  const coordinate = useMemo(() => {
    return {
      lat: geolocationResp.data?.coords.latitude,
      lon: geolocationResp.data?.coords.longitude,
    };
  }, [geolocationResp]);

  const handleGeolocation = useCallback(async () => {
    const number = await getSize();
    if (number <= 0) {
      await handleRefresh();
    }

    if ("geolocation" in navigator) {
      geolocationResp.refetch();
    }
  }, []);

  useEffect(() => {
    if (locationMode) {
      handleGeolocation();
    }
  }, []);

  const locationModeChange = useCallback(
    (ev: {
      currentTarget: { checked: boolean | ((prevState: boolean) => boolean) };
    }) => {
      const valueString = ev.currentTarget.checked.toString();
      setLocationMode(ev.currentTarget.checked);
      dispatch(
        changeSettings({
          id: "defaultProvideLocation",
          name: "defaultProvideLocation",
          value: valueString,
        })
      );
    },
    [setLocationMode]
  );

  return (
    <div className={style.nearby}>
      <section className="item-info-placeholder">
        <StopSearch onValidSubmit={onSearchSubmit} />
      </section>
      {(number.data ?? 0) >= 0
        ? t("nearby.totalStopsSummary", { stopsTotal: number.data })
        : t("nearby.checkingDb")}
      <div className={style["nearby-controls"]}>
        <Button onClick={handleRefresh}>
          {ttcStopsResp.isFetching
            ? t("nearby.checkingDb")
            : t("nearby.checkDb")}
        </Button>
        <Button onClick={handleGeolocation}>
          {geolocationResp.isFetching
            ? t("nearby.checkingLocation")
            : coordinate.lat && coordinate.lon
              ? t("nearby.recheckLocation")
              : t("nearby.checkLocation")}
        </Button>
        <div className={style.spinner}>
          {(ttcStopsResp.isFetching || geolocationResp.isFetching) && (
            <Spinner />
          )}
        </div>
      </div>
      <div>
        <Switch
          checked={locationMode}
          onChange={locationModeChange}
          label={t("nearby.alwaysProvideLocation")}
        />
        <Tooltip
          content={{
            children: <Trans>nearby.locationPolicy</Trans>,
          }}
          relationship={"label"}
          mountNode={document.querySelector("#root .fui-FluentProvider")}
          withArrow
        >
          <Info16Regular />
        </Tooltip>
      </div>
      <NearbyList coordinate={coordinate} />
    </div>
  );
}
