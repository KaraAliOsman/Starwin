export type PanelType =
    | "fixed" | "sliding"
    | "casement-left" | "casement-right"
    | "tilt-turn-left" | "tilt-turn-right"
    | "awning"
    | "door-casement-left" | "door-casement-right" | "door-sliding";

export type SplitType = "horizontal" | "vertical" | "none";

export interface WindowPanel {
    id: string;
    type: PanelType;
    splitType: SplitType;
    splitPos: number;
    children: WindowPanel[];
}

export type FrameSystem = "SLIDING" | "CASEMENT";
export type VentanaColor = "BLANCO" | "ANTRACITA" | "NEGRO" | "NOGAL" | "ROBLE_DORADO" | "WINCHESTER" | "ROBLE_MONTANA";
export type VentanaVidrio = "TERMOPANEL" | "CONTROL_SOLAR" | "TRIPLE" | "LAMINADO" | "SIMPLE";

export interface CoupledModule {
    id: string;
    system: FrameSystem;
    width: number;   // mm
    height: number;  // mm
    rootPanel: WindowPanel;
    angleWithNext: number; // 90, 120, 135, 180
}

export interface AdvancedVentanaConfig {
    id: string;
    modules: CoupledModule[];
    color: VentanaColor;
    vidrio: VentanaVidrio;
    extras: {
        mosquitero: boolean;
        premarco: boolean;
        ventilacion: boolean;
        manillaLlave: boolean;
        vidrioOpaco: boolean;
    };
    precio: number;
}

