import { Ellipse, Line, Path, Rect, Shape } from "@svgdotjs/svg.js";
import { MutableRefObject } from "react";
import { ActionType } from "../../enums";
import { ShapeProps } from "../../types";

export const updateShape = (
  e: MouseEvent,
  currentAction: ActionType,
  currentShapeProps: MutableRefObject<ShapeProps>,
  selectedElement: MutableRefObject<Shape | undefined>,
  freeHandPoints: { x: number; y: number }[]
) => {
  let [x1, x2, y1, y2] = [currentShapeProps.current.x1, e.offsetX, currentShapeProps.current.y1, e.offsetY];
  let [width, height] = [x2 - x1, y2 - y1];

  if (currentAction !== ActionType.FREE_HAND && currentAction !== ActionType.LINE) {
    if (width < 0) {
      x1 = e.offsetX;
      x2 = currentShapeProps.current.x1;
      width = Math.abs(width);
    }

    if (height < 0) {
      y1 = e.offsetY;
      y2 = currentShapeProps.current.y1;
      height = Math.abs(height);
    }
  }

  if (currentAction === ActionType.ELLIPSE) {
    (selectedElement?.current as Ellipse).move(x1, y1).radius(width / 2, height / 2);
  } else if (currentAction === ActionType.SQUARE) {
    (selectedElement?.current as Rect).move(x1, y1).width(width).height(height);
  } else if (currentAction === ActionType.LINE) {
    (selectedElement?.current as Line).plot(x1, y1, x2, y2).stroke({ width: 1, color: "black" });
  } else if (currentAction === ActionType.FREE_HAND) {
    freeHandPoints.push({ x: e.offsetX, y: e.offsetY });
    (selectedElement?.current as Path)
      .plot(`M${x1} ${y1} ${freeHandPoints.map((point) => `L${point.x} ${point.y} M${point.x} ${point.y} `).join(" ")} Z`);
  }
};

export const downloadSvg = (svgElement: SVGSVGElement, fileName: string) => {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};