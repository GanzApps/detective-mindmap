export interface GraphMinimapPoint {
  id: string;
  x: number;
  y: number;
  color: string;
  active?: boolean;
  dimmed?: boolean;
}

export interface GraphMinimapViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GraphMinimapState {
  label: string;
  points: GraphMinimapPoint[];
  viewport: GraphMinimapViewport;
}
