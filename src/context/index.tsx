import { createContext } from "react";
import { ActionType } from "../enums";

export const SelectActionContext = createContext(ActionType.TRANSFORM);