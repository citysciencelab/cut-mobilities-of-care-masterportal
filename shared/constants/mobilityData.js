export const routeMobilityModes = {
  WALK: "walk",
  WHEEL: "wheel",
  BICYCLE: "bicycle",
  CAR: "car",
  BUS: "bus",
  TRAIN: "train",
};

export const stopMobilityModes = {
  POI: "poi",
};

export const mobilityModes = {
  ...routeMobilityModes,
  ...stopMobilityModes,
};
