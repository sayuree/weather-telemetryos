export type ViewId =
  | "flamingo"
  | "sky"
  | "urban"
  | "watermelon"
  | "neapolitan"
  | "meadow"
  | "forest";

export interface ViewConfig {
  selectedView: ViewId;
}
