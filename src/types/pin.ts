export type PinLocation = {
  floorPlanKey: string;
  xPercent: number;
  yPercent: number;
  floorPlanUrl?: string;
};

export type FixedPin = {
  x: number;
  y: number;
  taskId: string;
  title: string;
  index: number;
};

export type PinnedTask = {
  taskId: string;
  taskTitle: string;
  pinLocation: PinLocation[] | null;
};

export type FlatPin = PinLocation & {
  taskId: string;
  taskTitle: string;
  index: number;
};
