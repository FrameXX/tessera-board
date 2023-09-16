import { type Ref } from "vue";
import type { PlayerColor } from "./pieces";
import type BoardStateData from "./user_data/board_state";
import type { PreferredPlayerColorValue } from "./user_data/preferred_player_color";
import { getRandomNumber } from "./utils/misc";

class Game {
  constructor(
    private readonly gameBoardStateData: BoardStateData,
    private readonly defaultBoardStateData: BoardStateData,
    private readonly playerColor: Ref<PlayerColor>,
    private readonly preferredPlayerColor: Ref<PreferredPlayerColorValue>
  ) {}

  private setupDefaultBoardState() {
    // Copy default checkboard
    this.gameBoardStateData.load(this.defaultBoardStateData.dump());
    this.gameBoardStateData.updateReference();
  }

  private choosePlayerColor() {
    if (this.preferredPlayerColor.value === "random") {
      getRandomNumber(0, 1)
        ? (this.playerColor.value = "white")
        : (this.playerColor.value = "black");
    } else {
      this.playerColor.value = this.preferredPlayerColor.value;
    }
  }

  public restart() {
    this.setupDefaultBoardState();
    this.choosePlayerColor();
  }

  public turn() {}
}

export default Game;
