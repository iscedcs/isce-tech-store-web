/**
 * Nigerian States to GIGStateId Mapping
 * Maps state names to their corresponding GIG StateId
 */

export const NIGERIAN_STATES: Record<string, number> = {
  // A
  ABIA: 1,
  ADAMAWA: 2,
  "AKWA IBOM": 3,
  ANAMBRA: 4,

  // B
  BAUCHI: 5,
  BAYELSA: 6,
  BENUE: 7,
  BORNO: 8,

  // C
  "CROSS RIVER": 9,

  // D
  DELTA: 10,

  // E
  EBONYI: 11,
  EDO: 12,
  EKITI: 13,
  ENUGU: 14,

  // F
  FCT: 37, // Federal Capital Territory

  // G
  GOMBE: 15,

  // J
  JIGAWA: 17,

  // K
  KADUNA: 18,
  KANO: 19,
  KATSINA: 20,
  KEBBI: 21,
  KOGI: 22,
  KWARA: 23,

  // L
  LAGOS: 24,

  // N
  NASARAWA: 25,
  NIGER: 26,

  // O
  OGUN: 27,
  ONDO: 28,
  OSUN: 29,
  OYO: 30,

  // P
  PLATEAU: 31,

  // R
  RIVERS: 32,

  // S
  SOKOTO: 33,

  // T
  TARABA: 34,

  // Y
  YOBE: 35,

  // Z
  ZAMFARA: 36,
};

/**
 * Reverse mapping: GIGStateId to State Name
 */
export const STATE_ID_TO_NAME: Record<number, string> = Object.entries(
  NIGERIAN_STATES,
).reduce(
  (acc, [name, id]) => {
    acc[id] = name;
    return acc;
  },
  {} as Record<number, string>,
);

/**
 * Get GIG StateId from state name
 */
export function getStateIdByName(stateName: string): number | null {
  if (!stateName) return null;

  const normalized = stateName.toUpperCase().trim();
  return NIGERIAN_STATES[normalized] || null;
}

/**
 * Get state name from GIG StateId
 */
export function getStateNameById(stateId: number): string | null {
  return STATE_ID_TO_NAME[stateId] || null;
}

/**
 * Get all available states as dropdown options
 */
export function getAllStatesForDropdown(): Array<{
  value: number;
  label: string;
}> {
  return Object.entries(NIGERIAN_STATES)
    .map(([name, id]) => ({
      value: id,
      label: name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Validate if a state ID is valid
 */
export function isValidStateId(stateId: number): boolean {
  return !!STATE_ID_TO_NAME[stateId];
}

/**
 * Get formatted state display name
 * Converts "LAGOS" to "Lagos"
 */
export function formatStateName(stateName: string): string {
  if (!stateName) return "";

  return stateName
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
