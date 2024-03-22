import moveAudioEffectUrl from "../assets/audio/move.ogg";
import removeAudioEffectUrl from "../assets/audio/remove.ogg";
import { Howl } from "howler";
import { type Ref, watch, ref, computed, capitalize, reactive } from "vue";
import BoardStateData from "./user_data/board_state";
import { getRandomArrayValue, getRandomNumber, isEven } from "./utils/misc";
import RawBoardStateData from "./user_data/raw_board_state";
import type { Piece, PieceId } from "./pieces/piece";
import { type Path } from "./pieces/piece";
import type { GamePausedState } from "./user_data/game_paused";
import type { PieceContext, BoardPosition } from "./board_manager";
import type Move from "./moves/move";
import NumberUserData from "./user_data/number_user_data";
import MoveListData from "./user_data/move_list";
import GameBoardManager from "./game_board_manager";
import { UserDataError } from "./user_data/user_data";
import DefaultBoardManager from "./default_board_manager";
import ThemeManager from "./theme_manager";
import TransitionsManager from "./transitions_manager";
import UI from "./ui";
import UserDataManager from "./user_data_manager";
import HueOption from "./options/hue_option";
import SelectUserData from "./user_data/select_user_data";
import GamePausedData from "./user_data/game_paused";
import PieceIdListData from "./user_data/piece_id_list";
import {
  getElementInstanceById,
  hideSplashscreen,
  setPrimaryHue,
  setSaturationMultiplier,
  updatePieceColors,
  waitForTransitionEnd,
} from "./utils/elements";
import type { PlayerId, WinReason, Winner } from "./utils/game";
import {
  GameLogicError,
  getAllpiecesContext as getAllPiecesContext,
  sumpieceImportances,
  getGuardedPieces,
  getOpossitePlayerColor,
  getPieceIdsWithColor,
  invalidatePiecesCache as invalidatePieceContextCache,
  getCheckedGuardedPieces,
  isWinReason,
  positionsToPath,
} from "./utils/game";
import { predefinedDefaultBoardConfigs } from "./predefined_configs";
import ConfigInventory from "./config_inventory";
import ConfigManager from "./config_manager";
import Rook from "./pieces/rook";
import Knight from "./pieces/knight";
import Bishop from "./pieces/bishop";
import Queen from "./pieces/queen";
import King from "./pieces/king";
import Pawn from "./pieces/pawn";
import PlayerTimers from "./player_timers";
import CapturedPieces from "./capturedPieces";
import PieceImportances from "./piece_importances";
import { movePositionValue } from "./moves/move";
import BooleanOption from "./options/boolean_option";
import NumberOption from "./options/number_option";
import { PlayerColor } from "./options/player_color_option";
import PreferredPlayerColorOption from "./options/preferred_player_color_option";
import SecondsPerMovePenaltyOption from "./options/seconds_per_move_penalty_option";
import PiecePaddingOption from "./options/piece_padding_option";
import ThemeOption from "./options/theme_option";
import TransitionsOption from "./options/transitions_option";
import PieceIconPackOption from "./options/piece_icon_pack_option";
import TransitionsDurationOption from "./options/transitions_duration_option";

export type GameAudioEffects = Game["audioEffects"];
export type GameSettings = Game["settings"];

export interface Player {
  id: PlayerId;
  color: Ref<PlayerColor>;
  unitExtent: Ref<number>;
  maxUnitExtent: Ref<number>;
  initialPieces: Ref<PieceId[]>;
}

export default class Game {
  public readonly settings = {
    primaryPlayerHue: reactive(new HueOption(37, true)),
    secondaryPlayerHue: reactive(new HueOption(200, false)),
    primaryPlayerComputer: reactive(
      new BooleanOption(false, "computer-primary")
    ),
    primaryPlayerComputerPrecision: reactive(
      new NumberOption(100, "computer-precision-primary")
    ),
    primaryPlayerDynamicComputerPrecision: reactive(
      new BooleanOption(true, "computer-precision-dynamic-primary")
    ),
    primaryPlayerDynamicComputerPrecisionStrenght: reactive(
      new NumberOption(80, "computer-precision-dynamic-strenght-primary")
    ),
    primaryPlayerComputerLookAdheadTurns: reactive(
      new NumberOption(3, "computer-look-adhead-turns-primary")
    ),
    primaryPlayerComputerAggressivity: reactive(
      new NumberOption(80, "computer-aggressity-primary")
    ),
    secondaryPlayerComputer: reactive(
      new BooleanOption(false, "computer-secondary")
    ),
    secondaryPlayerComputerPrecision: reactive(
      new NumberOption(100, "computer-precision-secondary")
    ),
    secondaryPlayerDynamicComputerPrecision: reactive(
      new BooleanOption(true, "computer-precision-dynamic-secondary")
    ),
    secondaryPlayerDynamicComputerPrecisionStrenght: reactive(
      new NumberOption(80, "computer-precision-dynamic-strenght-secondary")
    ),
    secondaryPlayerComputerLookAdheadTurns: reactive(
      new NumberOption(3, "computer-look-adhead-turns-secondary")
    ),
    secondaryPlayerComputerAggressivity: reactive(
      new NumberOption(80, "computer-aggressity-secondary")
    ),
    pieceImportances: new PieceImportances(),
    preferredFirstMoveColor: reactive(
      new PreferredPlayerColorOption("white", "color-preferred-first-move")
    ),
    preferredPlayerColor: reactive(
      new PreferredPlayerColorOption("random", "color-preferred-primary")
    ),
    primaryPlayerSecondsPerMove: reactive(
      new NumberOption(0, "seconds-per-move-primary")
    ),
    secondaryPlayerSecondsPerMove: reactive(
      new NumberOption(0, "seconds-per-move-secondary")
    ),
    primaryPlayerSecondsPerMatch: reactive(
      new NumberOption(0, "seconds-per-match-primary")
    ),
    secondaryPlayerSecondsPerMatch: reactive(
      new NumberOption(0, "seconds-per-match-secondary")
    ),
    secondsMoveLimitRunOutPenalty: reactive(
      new SecondsPerMovePenaltyOption("random_move")
    ),
    reviveFromCapturedPieces: reactive(
      new BooleanOption(false, "revive-from-captured-pieces")
    ),
    audioEffectsEnabled: reactive(
      new BooleanOption(true, "audio-effects-enabled")
    ),
    hapticFeedbackEnabled: reactive(
      new BooleanOption(true, "haptick-feedback-enabled")
    ),
    secondCheckboardEnabled: reactive(
      new BooleanOption(false, "second-checkboard-enabled")
    ),
    ignorePiecesGuardedProperty: reactive(
      new BooleanOption(false, "ignore-pieces-guarded-property-enabled")
    ),
    markCellCapturingPieces: reactive(
      new BooleanOption(true, "mark-cell-capturing-pieces-enabled")
    ),
    autoPauseGame: reactive(new BooleanOption(true, "auto-pause-game-enabled")),
    markUnactivePlayerAvailableMoves: reactive(
      new BooleanOption(false, "mark-unactive-player-available-moves-enabled")
    ),
    tableModeEnabled: reactive(new BooleanOption(false, "table-mode-enabled")),
    theme: reactive(new ThemeOption("auto")) as ThemeOption,
    transitions: reactive(new TransitionsOption("auto")) as TransitionsOption,
    pieceIconPack: reactive(new PieceIconPackOption("font_awesome")),
    piecePadding: reactive(new PiecePaddingOption(20)),
    pieceBorder: reactive(new NumberOption(1, "piece-border")),
    transitionsDuration: reactive(new TransitionsDurationOption(100)),
    cellIndexOpacity: reactive(new NumberOption(90, "cell-index-opacity")),
    pieceLongPressTimeout: reactive(
      new NumberOption(0, "piece-long-press-timeout")
    ),
    defaultBoardState: reactive<(Piece | null)[][]>([
      [
        new Rook("white"),
        new Knight("white"),
        new Bishop("white"),
        new Queen("white"),
        new King("white"),
        new Bishop("white"),
        new Knight("white"),
        new Rook("white"),
      ],
      [
        new Pawn("white"),
        new Pawn("white"),
        new Pawn("white"),
        new Pawn("white"),
        new Pawn("white"),
        new Pawn("white"),
        new Pawn("white"),
        new Pawn("white"),
      ],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [
        new Pawn("black"),
        new Pawn("black"),
        new Pawn("black"),
        new Pawn("black"),
        new Pawn("black"),
        new Pawn("black"),
        new Pawn("black"),
        new Pawn("black"),
      ],
      [
        new Rook("black"),
        new Knight("black"),
        new Bishop("black"),
        new Queen("black"),
        new King("black"),
        new Bishop("black"),
        new Knight("black"),
        new Rook("black"),
      ],
    ]),
  };

  public readonly audioEffects = {
    pieceMove: new Howl({
      src: [moveAudioEffectUrl],
    }),
    pieceRemove: new Howl({
      src: [removeAudioEffectUrl],
    }),
  };

  private performing = false;

  public readonly boardState: (Piece | null)[][] = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ];

  public readonly paused = ref<GamePausedState>("not");
  public readonly ui = new UI(this);
  public readonly primaryPlayerCapturingPaths = ref<Path[]>([]);
  public readonly secondaryPlayerCapturingPaths = ref<Path[]>([]);
  public readonly winReason = ref<WinReason>("none");
  public readonly capturedPieces = new CapturedPieces();
  public readonly lastMoveIndex = ref(-1);
  public readonly moveList = ref([]) as Ref<Move[]>;
  public readonly moveListData = new MoveListData(
    "move_list",
    this.moveList.value,
    this.moveList
  );

  public readonly primaryPlayer: Player = {
    id: "primary",
    color: ref<PlayerColor>("white"),
    unitExtent: ref(0),
    maxUnitExtent: ref(0),
    initialPieces: ref<PieceId[]>([]),
  };

  public readonly secondaryPlayer: Player = {
    id: "secondary",
    color: ref<PlayerColor>("white"),
    unitExtent: ref(0),
    maxUnitExtent: ref(0),
    initialPieces: ref<PieceId[]>([]),
  };

  public readonly firstMoveColor = ref<PlayerColor>("white");
  public readonly lastMove: Ref<Move | null> = ref(null);
  public readonly winner = ref<Winner>("none");
  public playingPlayer = this.primaryPlayer;
  public notPlayingPlayer = this.secondaryPlayer;
  public readonly primaryPlayerPlaying = ref<boolean>(true);

  public readonly status = computed(() => {
    switch (this.winner.value) {
      case "none":
        return `${capitalize(this.playingPlayer.color.value)} plays`;
      case "draw":
        return "Draw";
      case "secondary":
        return `${capitalize(this.secondaryPlayer.color.value)} won`;
      case "primary":
        return `${capitalize(this.primaryPlayer.color.value)} won`;
      default:
        throw new UserDataError(
          `Winner value is of an invalid type. value: ${this.winner.value}`
        );
    }
  });

  public readonly highlightedCells = computed(() => {
    if (!this.lastMove.value) {
      return [];
    }
    return this.lastMove.value.highlightedBoardPositions;
  });

  public readonly gameBoardAllPiecesContext: Ref<PieceContext[]>;
  public readonly defaultBoardAllPiecesContext: Ref<PieceContext[]>;
  public readonly primaryBoardManager: GameBoardManager;
  public readonly secondaryBoardManager: GameBoardManager;
  public readonly defaultBoardManager = new DefaultBoardManager(this);
  private readonly transitionsManager = new TransitionsManager(
    this.settings.transitions
  );
  public playerTimers = new PlayerTimers(this);

  public readonly gameBoardStateData = new BoardStateData(
    this.boardState,
    this.boardState,
    false
  );
  public readonly defaultBoardStateData = new RawBoardStateData(
    this.settings.defaultBoardState,
    this.settings.defaultBoardState
  );
  public backendBoardStateData = new BoardStateData([], []);
  public readonly lastMoveIndexData = new NumberUserData(
    "move_index",
    this.lastMoveIndex.value,
    this.lastMoveIndex,
    undefined,
    undefined,
    false
  );
  public readonly whiteCapturedPiecesData = new PieceIdListData(
    "white_captured_pieces",
    this.capturedPieces.white.value,
    this.capturedPieces.white,
    false
  );
  public readonly blackCapturedPiecesData = new PieceIdListData(
    "black_captured_pieces",
    this.capturedPieces.black.value,
    this.capturedPieces.black,
    false
  );

  public readonly defaultBoardConfigInventory = new ConfigInventory(
    "default-board",
    predefinedDefaultBoardConfigs,
    this.ui.toaster
  );
  public readonly defaultBoardConfigManager = new ConfigManager(
    this.defaultBoardConfigInventory,
    [this.defaultBoardStateData],
    this.ui.toaster
  );

  /**
   * User data manager takes care of dumping and loading data to and from localStorage.
   */
  public userDataManager = new UserDataManager(
    [
      new SelectUserData(
        "game_over_reason",
        this.winReason.value,
        isWinReason,
        this.winReason
      ),
      new GamePausedData(this.paused.value, this.paused),
      new NumberUserData(
        "primary_player_move_seconds",
        0,
        this.playerTimers.primaryPlayerMove.seconds
      ),
      new NumberUserData(
        "secondary_player_move_seconds",
        0,
        this.playerTimers.secondaryPlayerMove.seconds
      ),
      new NumberUserData(
        "primary_player_match_seconds",
        0,
        this.playerTimers.primaryPlayerMatch.seconds
      ),
      new NumberUserData(
        "secondary_player_match_seconds",
        0,
        this.playerTimers.secondaryPlayerMatch.seconds
      ),
      new NumberUserData(
        "primary_player_unit_extent",
        this.primaryPlayer.unitExtent.value,
        this.primaryPlayer.unitExtent
      ),
      new NumberUserData(
        "secondary_player_unit_extent",
        this.secondaryPlayer.unitExtent.value,
        this.secondaryPlayer.unitExtent
      ),
      new PieceIdListData(
        "primary_player_initial_pieces",
        this.primaryPlayer.initialPieces.value,
        this.primaryPlayer.initialPieces
      ),
      new PieceIdListData(
        "secondary_player_initial_pieces",
        this.secondaryPlayer.initialPieces.value,
        this.secondaryPlayer.initialPieces
      ),
      this.defaultBoardStateData,
      this.gameBoardStateData,
      this.lastMoveIndexData,
      this.moveListData,
      this.whiteCapturedPiecesData,
      this.blackCapturedPiecesData,
    ],
    this.ui.confirmDialog,
    this.ui.toaster
  );
  private visited: string | null;

  constructor() {
    new ThemeManager(this.settings.theme);
    this.gameBoardAllPiecesContext = ref(getAllPiecesContext(this.boardState));
    this.defaultBoardAllPiecesContext = ref(
      getAllPiecesContext(this.settings.defaultBoardState)
    );
    this.primaryBoardManager = new GameBoardManager(this, true);
    this.secondaryBoardManager = new GameBoardManager(this, false);

    this.visited = localStorage.getItem("tessera_board-visited");
    if (this.visited === null) {
      localStorage.setItem("tessera_board-visited", "1");
    } else {
      this.tryToRecoverData();
    }
    this.userDataManager.onRecoverCheck();
    this.userDataManager.applyData();
    this.userDataManager.updateReferences();

    watch(
      this.settings.defaultBoardState,
      this.updateDefaultBoardAllPiecesContext
    );

    for (const pieceId in this.settings.pieceImportances.values) {
      const option = this.settings.pieceImportances.values[pieceId as PieceId];
      option.addEventListener("change", this.updateUnitExtents);
    }
  }

  private tryToRecoverData() {
    if (!navigator.cookieEnabled) {
      this.ui.toaster.bake(
        "Cookies are disabled. -> No changes will be restored in next session.",

        "cookie-alert"
      );
      return;
    }
    this.userDataManager.recoverData();
  }

  public onMount = () => {
    this.visited === null ? this.restart() : this.restore();
    setSaturationMultiplier(1);

    // Let the app wait another 400ms to make sure its fully loaded.
    setTimeout(() => {
      hideSplashscreen(
        this.transitionsManager.getApplyedTransitions(
          this.settings.transitions.value
        )
      );
    }, 400);
  };

  public async performMove(move: Move) {
    this.performing = true;
    await move.perform(this);
    this.onMovePerform(move);
    this.performing = false;
  }

  public playerWin(player: PlayerId, reason: WinReason) {
    const winnerColor =
      player === "primary"
        ? this.primaryPlayer.color.value
        : this.secondaryPlayer.color.value;
    this.ui.toaster.bake(`${capitalize(winnerColor)} won.`, "crown-outline");
    this.winner.value = player;
    this.winReason.value = reason;
    setPrimaryHue(player === "primary");
  }

  private draw(reason: WinReason) {
    this.ui.toaster.bake("Draw.", "sword-cross");
    this.winner.value = "draw";
    this.winReason.value = reason;
  }

  public getRandomMove(pieceColor: PlayerColor) {
    let randomPieceContext: PieceContext;
    let moves: Move[];
    do {
      do {
        randomPieceContext = getRandomArrayValue(
          this.gameBoardAllPiecesContext.value
        );
      } while (randomPieceContext.piece.color !== pieceColor);
      moves = randomPieceContext.piece.getPossibleMoves(
        this,
        randomPieceContext
      );
    } while (moves.length === 0);
    const chosenMove = getRandomArrayValue(moves);
    return chosenMove;
  }

  public cancelWin() {
    const wasWinner = this.winner.value;
    const winnerWasDraw = wasWinner === "draw";

    this.clearWinner();

    if (winnerWasDraw) return;

    const loserColor =
      wasWinner === "primary"
        ? this.secondaryPlayer.color.value
        : this.primaryPlayer.color.value;
    this.ui.toaster.bake(
      `${capitalize(loserColor)} is back in the game.`,
      "keyboard-return"
    );
  }

  private setupInitialBoardState() {
    this.gameBoardStateData.load(
      this.defaultBoardStateData.dump(),
      this.ui.toaster,
      true
    );
    this.gameBoardStateData.updateReference();
  }

  private getLastMove() {
    if (this.lastMoveIndex.value === -1) {
      return null;
    }
    return this.moveList.value[this.lastMoveIndex.value];
  }

  private getPrimaryPlayerPlaying() {
    return this.playingPlayer.color.value === this.primaryPlayer.color.value;
  }

  private getPlayingPlayer(): Player {
    return (isEven(this.lastMoveIndex.value) &&
      this.firstMoveColor.value === "black") ||
      (!isEven(this.lastMoveIndex.value) &&
        this.firstMoveColor.value === "white")
      ? this.getPlayerWithColor("white")
      : this.getPlayerWithColor("black");
  }

  private getPlayerWithColor(color: PlayerColor) {
    return this.primaryPlayer.color.value === color
      ? this.primaryPlayer
      : this.secondaryPlayer;
  }

  private getNotPlayingPlayer(): Player {
    return this.playingPlayer.id === "primary"
      ? this.secondaryPlayer
      : this.primaryPlayer;
  }

  private chooseFirstMoveColor(): PlayerColor {
    if (this.settings.preferredFirstMoveColor.value === "random") {
      return getRandomNumber(0, 1) ? "white" : "black";
    } else {
      return this.settings.preferredFirstMoveColor.value;
    }
  }

  private choosePrimaryPlayerColor(): PlayerColor {
    if (this.settings.preferredPlayerColor.value === "random") {
      return getRandomNumber(0, 1) ? "white" : "black";
    } else {
      return this.settings.preferredPlayerColor.value;
    }
  }

  private get notPlayingPlayerColor(): PlayerColor {
    return this.primaryPlayerPlaying.value
      ? this.primaryPlayer.color.value
      : this.secondaryPlayer.color.value;
  }

  public async requestResign() {
    if (this.winner.value !== "none") {
      this.ui.toaster.bake(
        "You cannot resign. The game ending was already decided.",
        "flag-off",
        "error"
      );
      return;
    }
    const confirmed = await this.ui.confirmDialog.show(
      "Do you really want to give up this match? You are responsible for your decisions and this cannot be undone."
    );
    if (!confirmed) {
      return;
    }
    this.resign();
  }

  private resign() {
    this.ui.toaster.bake(
      `${capitalize(this.notPlayingPlayerColor)} resigned`,

      "flag"
    );
    this.playerWin(this.notPlayingPlayer.id, "resign");
  }

  private initPlayerColors() {
    this.primaryPlayer.color.value = this.choosePrimaryPlayerColor();
    this.initSecondaryPlayerColor();
  }

  private initSecondaryPlayerColor() {
    this.secondaryPlayer.color.value = getOpossitePlayerColor(
      this.primaryPlayer.color.value
    );
    updatePieceColors(this.primaryPlayer.color.value);
  }

  private initFirstMoveColor() {
    this.firstMoveColor.value = this.chooseFirstMoveColor();
  }

  private clearWinner() {
    this.winner.value = "none";
    this.winReason.value = "none";
  }

  private unselectBoardsContent() {
    this.primaryBoardManager.unselectAll();
    this.secondaryBoardManager.unselectAll();
  }

  public restart() {
    this.clearWinner();
    this.capturedPieces.clearAll();
    this.lastMoveIndex.value = -1;
    this.moveList.value = [];
    this.setupInitialBoardState();
    this.updateGameBoardAllPiecesContext();
    this.initFirstMoveColor();
    this.initPlayerColors();
    this.updateInitialUnits();
    this.updateStateRefs();
    this.playerTimers.resetAll();
    this.updateCapturingPaths();
    this.updateBackendBoardStateData();
    this.updateWinner();
    this.saveMove();
    this.unselectBoardsContent();
    this.ui.toaster.bake("New match started.", "flag-checkered");
  }

  public restore() {
    this.initSecondaryPlayerColor();
    this.updateGameBoardAllPiecesContext();
    this.updateDefaultBoardAllPiecesContext();
    this.updateStateRefs();
    updatePieceColors(this.primaryPlayer.color.value);
    this.updateCapturingPaths();
    this.updateBackendBoardStateData();
    this.updateWinner();
    if (this.winReason.value === "resign") this.resign();
  }

  private spliceReversedMoves(listIndexDiff: number) {
    this.moveList.value.splice(this.lastMoveIndex.value, listIndexDiff);
  }

  private async undoMove() {
    this.performing = true;
    this.unselectBoardsContent();
    const reversedMove = this.moveList.value[this.lastMoveIndex.value];
    await reversedMove.undo(this);
    this.onMoveUndo();
    this.performing = false;
  }

  private async redoMove() {
    this.performing = true;
    this.unselectBoardsContent();
    const forwardedMove = this.moveList.value[this.lastMoveIndex.value + 1];
    await forwardedMove.redo(this);
    this.onMoveRedo();
    this.performing = false;
  }

  public requestRedoMove() {
    if (this.performing) return;
    if (this.moveList.value.length - this.lastMoveIndex.value < 2) {
      this.ui.toaster.bake(
        "You reached the last move. You cannot go further.",
        "cancel",
        "error"
      );
      if (this.settings.hapticFeedbackEnabled) navigator.vibrate(30);
      return;
    }
    this.redoMove();
  }

  public requestUndoMove() {
    if (this.performing) return;
    if (this.lastMoveIndex.value === -1) {
      this.ui.toaster.bake(
        "You reached the first move. You cannot go further.",
        "cancel",
        "error"
      );
      if (this.settings.hapticFeedbackEnabled) navigator.vibrate(30);
      return;
    }
    this.undoMove();
  }

  private updateInitialUnits() {
    this.primaryPlayer.initialPieces.value = getPieceIdsWithColor(
      this.primaryPlayer.color.value,
      this.gameBoardAllPiecesContext.value
    );
    this.secondaryPlayer.initialPieces.value = getPieceIdsWithColor(
      this.primaryPlayer.color.value,
      this.gameBoardAllPiecesContext.value
    );
  }

  private updateUnitExtents = () => {
    this.primaryPlayer.unitExtent.value = sumpieceImportances(
      getPieceIdsWithColor(
        this.primaryPlayer.color.value,
        this.gameBoardAllPiecesContext.value
      ),
      this.settings.pieceImportances
    );
    this.secondaryPlayer.unitExtent.value = sumpieceImportances(
      getPieceIdsWithColor(
        this.secondaryPlayer.color.value,
        this.gameBoardAllPiecesContext.value
      ),
      this.settings.pieceImportances
    );

    this.primaryPlayer.maxUnitExtent.value = sumpieceImportances(
      this.primaryPlayer.initialPieces.value,
      this.settings.pieceImportances
    );
    this.secondaryPlayer.maxUnitExtent.value = sumpieceImportances(
      this.secondaryPlayer.initialPieces.value,
      this.settings.pieceImportances
    );
  };

  private updateStateRefs() {
    this.lastMove.value = this.getLastMove();
    this.playingPlayer = this.getPlayingPlayer();
    this.primaryPlayerPlaying.value = this.getPrimaryPlayerPlaying();
    this.ui.updatePrimaryHue(
      this.primaryPlayerPlaying.value,
      this.winner.value
    );
    this.notPlayingPlayer = this.getNotPlayingPlayer();
    this.updateUnitExtents();
  }

  public updateDefaultBoardAllPiecesContext = () => {
    this.defaultBoardAllPiecesContext.value = getAllPiecesContext(
      this.settings.defaultBoardState
    );
  };

  public updateGameBoardAllPiecesContext() {
    this.gameBoardAllPiecesContext.value = getAllPiecesContext(this.boardState);
  }

  private updateBackendBoardStateData() {
    this.backendBoardStateData.load(
      this.gameBoardStateData.dump(),
      this.ui.toaster
    );
  }

  public onMove() {
    this.updateGameBoardAllPiecesContext();
    invalidatePieceContextCache(this.gameBoardAllPiecesContext.value);
    this.updateStateRefs();
    this.updateCapturingPaths();
    this.updateBackendBoardStateData();
    this.playerTimers.resetNotPlayingPlayerMove();
    this.updateWinner();
  }

  private saveMove() {
    this.gameBoardStateData.save();
    this.lastMoveIndexData.save();
    this.moveListData.save();
    this.whiteCapturedPiecesData.save();
    this.blackCapturedPiecesData.save();
  }

  private onMoveUndo() {
    this.lastMoveIndex.value--;
    this.onMove();
  }

  private onMoveRedo() {
    this.lastMoveIndex.value++;
    this.onMove();
    this.saveMove();
  }

  private onMovePerform(move: Move) {
    this.lastMoveIndex.value++;
    const moveListIndexShift =
      this.moveList.value.length - this.lastMoveIndex.value;
    if (moveListIndexShift > 0) {
      this.spliceReversedMoves(moveListIndexShift);
    }
    this.moveList.value.push(move);
    this.onMove();
    this.saveMove();
  }

  private updateWinner() {
    const activePlayerGuardedPieces = getGuardedPieces(
      this.gameBoardAllPiecesContext.value,
      this.playingPlayer.color.value
    );
    const activePlayerChecked =
      getCheckedGuardedPieces(
        this.boardState,
        this.playingPlayer.color.value,
        this.gameBoardAllPiecesContext.value,
        activePlayerGuardedPieces
      ).length !== 0;

    if (activePlayerChecked) this.ui.toaster.bake("Check!", "cross");

    const canActivePlayerMove = this.canPlayerMove(
      this.playingPlayer.color.value,
      this.gameBoardAllPiecesContext.value
    );

    if (canActivePlayerMove) {
      if (
        this.winReason.value === "checkmate" ||
        this.winReason.value === "block" ||
        this.winReason.value === "stalemate"
      )
        this.cancelWin();
      return;
    }

    if (activePlayerChecked || activePlayerGuardedPieces.length === 0) {
      const winReason: WinReason =
        activePlayerGuardedPieces.length === 0 ? "block" : "checkmate";
      this.playerWin(this.notPlayingPlayer.id, winReason);
      return;
    }
    this.draw("stalemate");
  }

  private canPlayerMove(color: PlayerColor, allPiecesContext: PieceContext[]) {
    for (const pieceContext of allPiecesContext) {
      if (pieceContext.piece.color !== color) continue;
      const moves = pieceContext.piece.getPossibleMoves(this, pieceContext);
      if (moves.length !== 0) return true;
    }
    return false;
  }

  public updateCapturingPaths() {
    let primaryPlayerCapturingPaths: Path[] = [];
    let secondaryPlayerCapturingPaths: Path[] = [];
    for (const pieceContext of this.gameBoardAllPiecesContext.value) {
      const piece = pieceContext.piece;
      const origin: BoardPosition = {
        row: +pieceContext.row,
        col: +pieceContext.col,
      };
      if (piece.color === this.primaryPlayer.color.value) {
        primaryPlayerCapturingPaths = [
          ...primaryPlayerCapturingPaths,
          ...positionsToPath(
            piece.getCapturingPositions(origin, this.boardState),
            origin
          ),
        ];
      } else {
        secondaryPlayerCapturingPaths = [
          ...secondaryPlayerCapturingPaths,
          ...positionsToPath(
            piece.getCapturingPositions(origin, this.boardState),
            origin
          ),
        ];
      }
    }
    this.primaryPlayerCapturingPaths.value = primaryPlayerCapturingPaths;
    this.secondaryPlayerCapturingPaths.value = secondaryPlayerCapturingPaths;
  }

  public capturePosition(position: BoardPosition) {
    const piece = this.boardState[position.row][position.col];
    if (!piece) {
      throw new GameLogicError(
        `Provided position has no piece to capture: ${JSON.stringify(position)}`
      );
    }
    this.boardState[position.row][position.col] = null;
    this.capturedPieces.add(piece);
  }

  public unCapturePosition(position: BoardPosition, piece: Piece) {
    const value = this.boardState[position.row][position.col];
    if (value) {
      throw new GameLogicError(
        `Provided position already has a piece: ${JSON.stringify(value)}`
      );
    }
    this.boardState[position.row][position.col] = piece;
    this.capturedPieces.remove(piece);
  }

  public async movePiece(
    piece: Piece,
    origin: BoardPosition,
    target: BoardPosition,
    defaultBoard = false
  ) {
    const boardState = defaultBoard
      ? this.settings.defaultBoardState
      : this.boardState;
    movePositionValue(piece, origin, target, boardState);
    defaultBoard
      ? this.updateDefaultBoardAllPiecesContext()
      : this.updateGameBoardAllPiecesContext();

    const boardId = defaultBoard ? "default-board" : "primary-board";
    const board = getElementInstanceById(boardId);
    const pieceElement = board.querySelector(`[data-id="piece-${piece.id}"]`);
    if (!(pieceElement instanceof SVGElement)) {
      console.error("Could not find SVG element of piece", piece);
      return;
    }
    await waitForTransitionEnd(pieceElement, "transform");
  }
}
