import { BaseResponse } from "./common";
import {
  PopupResponse,
  CreatePopupDto as GenCreatePopupDto,
  UpdatePopupDto as GenUpdatePopupDto,
  PopupsFindAllResponses, // or List
} from "@vibe/shared";

export enum PopupPosition {
  CENTER = "CENTER",
  FOOTER = "FOOTER",
  SIDEBAR = "SIDEBAR",
}

export type Popup = PopupResponse & {
  title?: string;
  description?: string;
  image_url?: string;
  promo_code?: string;
  is_active?: boolean;
};
export type CreatePopupDto = GenCreatePopupDto;
export type UpdatePopupDto = GenUpdatePopupDto;
