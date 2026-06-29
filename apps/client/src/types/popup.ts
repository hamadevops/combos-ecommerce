import { BaseResponse } from "./common";
import {
  PopupResponse,
  CreatePopupDto as GenCreatePopupDto,
  UpdatePopupDto as GenUpdatePopupDto,
  PopupsFindAllResponses, // or List
} from "@/generated/api";

export enum PopupPosition {
  CENTER = "CENTER",
  FOOTER = "FOOTER",
  SIDEBAR = "SIDEBAR",
}

export type Popup = PopupResponse;
export type CreatePopupDto = GenCreatePopupDto;
export type UpdatePopupDto = GenUpdatePopupDto;
