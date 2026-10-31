

export type ExtraSelection = {
  code: string;
  decision?: "ACCEPT" | "DISMISS";
  bay_id?: string | null;
  leaf_id?: string | null;
  sides?: ("TOP" | "RIGHT" | "BOTTOM" | "LEFT")[] | null;
  overhang_left_mm?: string;
  overhang_right_mm?: string;
  zone?: string | null;
};