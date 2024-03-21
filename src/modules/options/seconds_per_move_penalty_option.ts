import SelectOption from "./select_option";

export type SecondsPerMovePenalty = "game_loss" | "random_move";
export function isSecondsPerMovePenalty(
  string: string
): string is SecondsPerMovePenalty {
  return string === "game_loss" || string === "random_move";
}

export default class SecondsPerMovePenaltyOption extends SelectOption<SecondsPerMovePenalty> {
  constructor(defaultValue: SecondsPerMovePenalty) {
    super(
      defaultValue,
      "seconds_per_move_runout_penalty",
      isSecondsPerMovePenalty
    );
  }
}
