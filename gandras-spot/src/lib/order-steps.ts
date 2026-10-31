/** Nova 3-fazna porudžbina + pregled */
export const ORDER_PHASES = [
  { num: 1, label: "Dostava" },
  { num: 2, label: "Meni" },
  { num: 3, label: "Proizvod" },
  { num: 4, label: "Pregled" },
] as const;

/** 1 dostava, 2 kategorije, 3 lista proizvoda, 4 customize, 5 review */
export function stepperPhase(step: number): number {
  if (step <= 1) return 1;
  if (step === 2) return 2;
  if (step === 3 || step === 4) return 3;
  return 4;
}
