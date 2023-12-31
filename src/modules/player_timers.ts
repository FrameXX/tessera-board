import type Game from "./game";
import PlayerTimer from "./player_timer";

export default class PlayerTimers {
  primaryPlayerMove: PlayerTimer;
  primaryPlayerMatch: PlayerTimer;
  secondaryPlayerMove: PlayerTimer;
  secondaryPlayerMatch: PlayerTimer;

  constructor(private readonly game: Game) {
    this.primaryPlayerMove = new PlayerTimer(
      this.game,
      true,
      true,
      this.game.settings.primaryPlayerSecondsPerMove
    );
    this.primaryPlayerMatch = new PlayerTimer(
      this.game,
      true,
      false,
      this.game.settings.primaryPlayerSecondsPerMatch
    );
    this.secondaryPlayerMove = new PlayerTimer(
      this.game,
      false,
      true,
      this.game.settings.secondaryPlayerSecondsPerMove
    );
    this.secondaryPlayerMatch = new PlayerTimer(
      this.game,
      false,
      false,
      this.game.settings.secondaryPlayerSecondsPerMatch
    );
  }

  public resetAll() {
    this.primaryPlayerMove.reset();
    this.secondaryPlayerMove.reset();
    this.primaryPlayerMatch.reset();
    this.secondaryPlayerMatch.reset();
  }

  public resetNotPlayingPlayerMove() {
    if (this.game.primaryPlayerPlaying.value) {
      this.secondaryPlayerMove.reset();
    } else {
      this.primaryPlayerMove.reset();
    }
  }
}
