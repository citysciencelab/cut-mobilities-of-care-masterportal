export const routeMobilityModes = {
  WALK: "walk",
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
