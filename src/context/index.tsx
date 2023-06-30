import { createContext } from "react";
import { ActionType, ShapeConfigActionType } from "../enums";

export const SelectActionContext = createContext(ActionType.EDIT);

export const SelectConfigActionContext = createContext(ShapeConfigActionType.COLOR);