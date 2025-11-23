import {
  Button,
  Card,
  CardHeader,
  Checkbox,
  Dialog,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from "@fluentui/react-components";
import { Dismiss12Filled, Edit12Filled } from "@fluentui/react-icons";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import type { EtaBusWithID } from "../../models/etaObjects.js";
import { editStopBookmark } from "../../store/bookmarks/slice.js";
import { useAppDispatch, useAppSelector } from "../../store/index.js";
import { DirectionBadge, TtcBadge } from "../badges.js";
import { CountdownSec } from "../countdown/CountdownSec.js";
import style from "./EtaCard.module.css";

export function EtaCard(props: {
  etas?: EtaBusWithID[];
  subwayEtas?: string[];
  lines: string[];
  name: string;
  editable: boolean;
  onDelete?: () => void;
  stopUrl: string;
  id: string;
  enabled?: string[];
  direction?: string;
}) {
  const etasNumber = useAppSelector(
    (state) => state.settings?.entities?.etasOnBookmarks?.value
  );
  const uniqueLines = [...new Set(props.lines)];
  const directionArray = props.direction?.split(", ") ?? [];
  return (
    <li
      className={[
        "eta-card",
        props.editable ? style["card-with-button"] : "",
      ].join(" ")}
    >
      <Link to={props.stopUrl} className={style["grid-item"]}>
        <Card className={style["clickable-card"]}>
          <CardHeader
            header={
              <>
                <div
                  className={
                    uniqueLines.length > 6
                      ? [style["badge-group"], style.overflow].join(" ")
                      : style["badge-group"]
                  }
                >
                  {uniqueLines.map((line: string) => {
                    return (
                      <TtcBadge key={`${props.id}-${line}`} lineNum={line} />
                    );
                  })}
                </div>
                <span className={style["multi-line"]}>
                  {directionArray.length > 0 &&
                    directionArray.map((direction) => (
                      <DirectionBadge
                        direction={direction}
                        key={`${props.id}-${direction}`}
                      />
                    ))}
                  <span>{props.name}</span>
                </span>
              </>
            }
            action={
              <div
                className={[
                  style["eta-card-countdown"],
                  (etasNumber ?? "1") === "3"
                    ? style["multi-etas"]
                    : style["single-eta"],
                ].join(" ")}
              >
                {props.subwayEtas
                  ?.slice(0, (etasNumber ?? "1") === "3" ? 3 : 1)
                  .map((eta, index) => {
                    return (
                      <CountdownSec
                        key={`${index}-${eta}`}
                        second={Number.parseInt(eta) * 60}
                      />
                    );
                  })}
                {props.etas
                  ?.slice(0, (etasNumber ?? "1") === "3" ? 3 : 1)
                  .map((eta) => {
                    return (
                      <CountdownSec
                        key={eta.vehicle}
                        second={eta.seconds}
                        epochTime={eta.epochTime}
                      />
                    );
                  })}
              </div>
            }
          />
        </Card>
      </Link>
      {props.editable && (
        <Dialog>
          <DialogTrigger>
            <Button
              className={style["edit-button"]}
              title="edit"
              icon={<Edit12Filled />}
            />
          </DialogTrigger>
          <DialogSurface
            mountNode={document.querySelector(".fui-FluentProvider")}
          >
            <DialogTrigger>
              <Button
                className={style["remove-button"]}
                title="Close"
                icon={<Dismiss12Filled />}
              />
            </DialogTrigger>
            <DialogTitle>Choose which bus(es) to show</DialogTitle>
            <FavouriteEditor
              id={props.id}
              lines={uniqueLines}
              enabled={props.enabled}
              onDelete={props.onDelete}
            />
          </DialogSurface>
        </Dialog>
      )}
    </li>
  );
}

function FavouriteEditor(props: {
  id: string;
  lines: string[];
  enabled?: string[];
  onDelete?: () => void;
}) {
  const uniqueLines = [...new Set(props.lines)];

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const onChangeFunction = useCallback(
    (line: string) => {
      if (!props.enabled) {
        const cutOffEnabled = [...uniqueLines];
        const cutOffIndex = cutOffEnabled.indexOf(line);
        cutOffEnabled.splice(cutOffIndex, 1);
        dispatch(
          editStopBookmark({
            id: Number.parseInt(props.id),
            changes: {
              enabled: cutOffEnabled,
            },
          })
        );
      } else {
        const lineArray = [...props.enabled];
        if (lineArray.includes(line)) {
          // Remove
          const lineIndex = lineArray.indexOf(line);
          lineArray.splice(lineIndex, 1);
          dispatch(
            editStopBookmark({
              id: Number.parseInt(props.id),
              changes: {
                enabled: lineArray,
              },
            })
          );
        } else {
          // Add
          lineArray.push(line);
          dispatch(
            editStopBookmark({
              id: Number.parseInt(props.id),
              changes: {
                enabled: lineArray,
              },
            })
          );
        }
      }
    },
    [uniqueLines, props.enabled]
  );

  return (
    <DialogContent>
      <div className={style["checkbox-list"]}>
        {uniqueLines.map((line) => (
          <LineCheckbox
            key={props.id + line}
            id={props.id}
            line={line}
            enabled={props.enabled}
            onChangeFunction={onChangeFunction}
          />
        ))}
      </div>

      <Button
        title={t("buttons.delete") ?? "delete"}
        icon={<Dismiss12Filled />}
        onClick={props.onDelete}
      >
        Delete this stop
      </Button>
    </DialogContent>
  );
}

function LineCheckbox(props: {
  id: string;
  line: string;
  enabled?: string[];
  onChangeFunction: (line: string) => void;
}) {
  const handleClick = useCallback(() => {
    props.onChangeFunction(props.line);
  }, [props.enabled]);
  return (
    <Checkbox
      key={props.id + props.line}
      label={<TtcBadge lineNum={props.line} />}
      checked={!props.enabled || props.enabled?.includes(props.line)}
      onChange={handleClick}
    />
  );
}
