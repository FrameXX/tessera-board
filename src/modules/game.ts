import moveAudioEffectUrl from "../assets/audio/move.ogg";
import removeAudioEffectUrl from "../assets/audio/remove.ogg";
import { Howl } from "howler";
import { type Ref, watch, ref, computed, capitalize, reactive } from "vue";
import BoardStateData from "./user_data/board_state";
import type { MinSecTime } from "./utils/misc";
import {
  getMinsAndSecsTime,
  getRandomArrayValue,
  getRandomNumber,
  isEven,
} from "./utils/misc";
import RawBoardStateData from "./user_data/raw_board_state";
import PlayerTimer from "./player_timer";
import type { Piece, PieceId, PiecesImportance } from "./pieces/piece";
import { type Path } from "./pieces/piece";
import type { GamePausedState } from "./user_data/game_paused";
import type { PieceContext, BoardPosition } from "./board_manager";
import type Move from "./moves/move";
import NumberUserData from "./user_data/number_user_data";
import MoveListData from "./user_data/move_list";
import GameBoardManager from "./game_board_manager";
import { UserDataError } from "./user_data/user_data";
import DefaultBoardManager from "./default_board_manager";
import type { Theme } from "./theme_manager";
import ThemeManager, { isTheme } from "./theme_manager";
import type { Transitions } from "./transitions_manager";
import TransitionsManager, { isTransitions } from "./transitions_manager";
import type { PieceIconPack } from "./user_data/piece_set";
import PieceIconPackData from "./user_data/piece_set";
import UI from "./ui";
import UserDataManager from "./user_data_manager";
import BooleanUserData from "./user_data/boolean_user_data";
import HueData from "./user_data/hue";
import SelectUserData from "./user_data/select_user_data";
import GamePausedData from "./user_data/game_paused";
import PieceBorderData from "./user_data/piece_border";
import PiecePaddingData from "./user_data/piece_padding";
import type { PreferredPlayerColor } from "./user_data/preferred_player_color";
import PlayerColorOptionData from "./user_data/preferred_player_color";
import CellIndexOpacityData from "./user_data/cell_index_opacity";
import TransitionDurationData from "./user_data/transition_duration";
import CapturedPiecesData from "./user_data/captured_pieces";
import {
  hideSplashscreen,
  setPrimaryHue,
  setSaturationMultiplier,
  updatePieceColors,
} from "./utils/elements";
import type {
  Player,
  PlayerColor,
  SecondsPerMovePenalty,
  WinReason,
  Winner,
} from "./utils/game";
import {
  getAllpieceContext as getAllPiecesContext,
  getGuardedPieces,
  getOpossitePlayerColor,
  invalidatePiecesCache,
  isGuardedPieceChecked,
  isPlayerColor,
  isSecondsPerMovePenalty,
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

export type GameAudioEffects = Game["audioEffects"];
export type GameSettings = Game["settings"];

export default class Game {
  /**
   * Holds vue references to all user configurable values.
   */
  public readonly settings = {
    preferredFirstMoveColor: ref<PreferredPlayerColor>("white"),
    preferredPlayerColor: ref<PreferredPlayerColor>("random"),
    primaryPlayerSecondsPerMove: ref<number>(0),
    secondaryPlayerSecondsPerMove: ref<number>(0),
    primaryPlayerSecondsPerMatch: ref<number>(0),
    secondaryPlayerSecondsPerMatch: ref<number>(0),
    secondsMoveLimitRunOutPunishment: ref<SecondsPerMovePenalty>("random_move"),
    reviveFromCapturedPieces: ref(false),
    audioEffectsEnabled: ref(true),
    vibrationsEnabled: ref(true),
    secondCheckboardEnabled: ref(false),
    ignorePiecesGuardedProperty: ref(false),
    markCellCapturingPieces: ref(true),
    autoPauseGame: ref(true),
    markUnactivePlayerAvailibleMoves: ref(false),
    tableModeEnabled: ref(false),
    pawnImportance: ref(1),
    knightImportance: ref(3),
    bishopImportance: ref(3.25),
    rookImportance: ref(5),
    queenImportance: ref(9),
    kingImportance: ref(25),
    theme: ref<Theme>("auto"),
    transitions: ref<Transitions>("auto"),
    primaryPlayerHue: ref(37),
    secondaryPlayerHue: ref(200),
    pieceIconPack: ref<PieceIconPack>("font_awesome"),
    piecePadding: ref(10),
    pieceBorder: ref(1.1),
    transitionDuration: ref(100),
    cellIndexOpacity: ref(90),
    pieceLongPressTimeout: ref(0),
    requireMoveConfirm: ref(false),
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

  /**
   * Audio effects in the game are working thanks to Howl library. Audio won't play until user touches the interface at least once. This a browser restriction.
   */
  public readonly audioEffects = {
    pieceMove: new Howl({
      src: [moveAudioEffectUrl],
    }),
    pieceRemove: new Howl({
      src: [removeAudioEffectUrl],
    }),
  };

  public readonly boardState: (Piece | null)[][] = reactive([
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ]);

  public readonly paused = ref<GamePausedState>("not");
  public readonly ui = new UI(this);
  public readonly whiteCapturingPaths = ref<Path[]>([]);
  public readonly blackCapturingPaths = ref<Path[]>([]);
  public readonly primaryPlayerColor = ref<PlayerColor>("white");
  public readonly secondaryPlayerColor = ref<PlayerColor>("black");
  public readonly winReason = ref<WinReason>("none");
  public readonly blackCapturedPieces = ref<PieceId[]>([]);
  public readonly whiteCapturedPieces = ref<PieceId[]>([]);
  public readonly lastMoveIndex = ref(-1);
  public readonly moveList = ref([]) as Ref<Move[]>;
  public readonly moveListData = new MoveListData(
    "move_list",
    this.moveList.value,
    this.moveList
  );

  public readonly piecesImportance: PiecesImportance = {
    rook: this.settings.rookImportance,
    knight: this.settings.knightImportance,
    bishop: this.settings.bishopImportance,
    pawn: this.settings.pawnImportance,
    queen: this.settings.queenImportance,
    king: this.settings.kingImportance,
  };

  public readonly firstMoveColor = ref<PlayerColor>("white");
  public readonly lastMove: Ref<Move | null> = ref(null);
  public readonly winner = ref<Winner>("none");
  public readonly playingColor = ref<PlayerColor>("white");
  public readonly primaryPlayerPlaying = ref<boolean>(true);
  public readonly playingPlayer = ref<Player>("primary");
  public readonly notPlayingPlayer = ref<Player>("secondary");

  public readonly timers = {
    primaryPlayerMove: new PlayerTimer(
      this,
      true,
      true,
      this.settings.primaryPlayerSecondsPerMove
    ),
    primaryPlayerMatch: new PlayerTimer(
      this,
      true,
      false,
      this.settings.primaryPlayerSecondsPerMatch
    ),
    secondaryPlayerMove: new PlayerTimer(
      this,
      false,
      true,
      this.settings.secondaryPlayerSecondsPerMove
    ),
    secondaryPlayerMatch: new PlayerTimer(
      this,
      false,
      false,
      this.settings.secondaryPlayerSecondsPerMatch
    ),
  };

  public readonly status = computed(() => {
    switch (this.winner.value) {
    case "none":
      return `${capitalize(this.playingColor.value)} plays`;
    case "draw":
      return "Draw";
    case "secondary":
      return `${capitalize(this.secondaryPlayerColor.value)} won`;
    case "primary":
      return `${capitalize(this.primaryPlayerColor.value)} won`;
    default:
      throw new UserDataError(
        `Winner value is of an invalid type. value: ${this.winner.value}`
      );
    }
  });

  public readonly primaryPlayerRemainingMoveTime = computed<MinSecTime>(() => {
    return getMinsAndSecsTime(
      this.timers.primaryPlayerMove.remainingSeconds.value
    );
  });
  public readonly primaryPlayerRemainingMatchTime = computed<MinSecTime>(() => {
    return getMinsAndSecsTime(
      this.timers.primaryPlayerMatch.remainingSeconds.value
    );
  });
  public readonly secondaryPlayerRemainingMoveTime = computed<MinSecTime>(
    () => {
      return getMinsAndSecsTime(
        this.timers.secondaryPlayerMove.remainingSeconds.value
      );
    }
  );
  public readonly secondaryPlayerRemainingMatchTime = computed<MinSecTime>(
    () => {
      return getMinsAndSecsTime(
        this.timers.secondaryPlayerMatch.remainingSeconds.value
      );
    }
  );

  public readonly primaryPlayerMoveTime = computed<MinSecTime>(() => {
    return getMinsAndSecsTime(this.timers.primaryPlayerMove.seconds.value);
  });
  public readonly primaryPlayerMatchTime = computed<MinSecTime>(() => {
    return getMinsAndSecsTime(this.timers.primaryPlayerMatch.seconds.value);
  });
  public readonly secondaryPlayerMoveTime = computed<MinSecTime>(() => {
    return getMinsAndSecsTime(this.timers.secondaryPlayerMove.seconds.value);
  });
  public readonly secondaryPlayerMatchTime = computed<MinSecTime>(() => {
    return getMinsAndSecsTime(this.timers.secondaryPlayerMatch.seconds.value);
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
  public readonly whiteCapturedPiecesData = new CapturedPiecesData(
    this.whiteCapturedPieces.value,
    this.whiteCapturedPieces,
    "white"
  );
  public readonly blackCapturedPiecesData = new CapturedPiecesData(
    this.blackCapturedPieces.value,
    this.blackCapturedPieces,
    "black"
  );

  public readonly defaultBoardConfigInventory = new ConfigInventory(
    "default-board",
    predefinedDefaultBoardConfigs,
    this.ui.toastManager
  );
  public readonly defaultBoardConfigManager = new ConfigManager(
    this.defaultBoardConfigInventory,
    [this.defaultBoardStateData],
    this.ui.toastManager
  );

  /**
   * User data manager takes care of dumping and loading data to and from localStorage.
   */
  userDataManager = new UserDataManager(
    [
      new BooleanUserData(
        "vibrations_enabled",
        this.settings.vibrationsEnabled.value,
        this.settings.vibrationsEnabled
      ),
      new BooleanUserData(
        "auto_pause",
        this.settings.autoPauseGame.value,
        this.settings.autoPauseGame
      ),
      new HueData(
        this.settings.primaryPlayerHue.value,
        this.settings.primaryPlayerHue,
        false
      ),
      new HueData(
        this.settings.secondaryPlayerHue.value,
        this.settings.secondaryPlayerHue,
        true
      ),
      new PieceIconPackData(
        this.settings.pieceIconPack.value,
        this.settings.pieceIconPack
      ),
      new PiecePaddingData(
        this.settings.piecePadding.value,
        this.settings.piecePadding
      ),
      new PieceBorderData(
        this.settings.pieceBorder.value,
        this.settings.pieceBorder
      ),
      new TransitionDurationData(
        this.settings.transitionDuration.value,
        this.settings.transitionDuration
      ),
      new CellIndexOpacityData(
        this.settings.cellIndexOpacity.value,
        this.settings.cellIndexOpacity
      ),
      new PlayerColorOptionData(
        "preferred_player_color",
        this.settings.preferredPlayerColor.value,
        this.settings.preferredPlayerColor
      ),
      new PlayerColorOptionData(
        "preferred_first_move_color",
        this.settings.preferredFirstMoveColor.value,
        this.settings.preferredFirstMoveColor
      ),
      new BooleanUserData(
        "show_capturing_pieces",
        this.settings.markCellCapturingPieces.value,
        this.settings.markCellCapturingPieces
      ),
      new BooleanUserData(
        "second_checkboard",
        this.settings.secondCheckboardEnabled.value,
        this.settings.secondCheckboardEnabled
      ),
      new NumberUserData(
        "piece_long_press_timeout",
        this.settings.pieceLongPressTimeout.value,
        this.settings.pieceLongPressTimeout,
        0,
        600
      ),
      new BooleanUserData(
        "table_mode",
        this.settings.tableModeEnabled.value,
        this.settings.tableModeEnabled
      ),
      new BooleanUserData(
        "ignore_pieces_guarded_property",
        this.settings.ignorePiecesGuardedProperty.value,
        this.settings.ignorePiecesGuardedProperty
      ),
      new BooleanUserData(
        "require_move_confirm",
        this.settings.requireMoveConfirm.value,
        this.settings.requireMoveConfirm
      ),
      new SelectUserData(
        "primary_player_color",
        this.primaryPlayerColor.value,
        isPlayerColor,
        this.primaryPlayerColor
      ),
      new SelectUserData(
        "theme",
        this.settings.theme.value,
        isTheme,
        this.settings.theme
      ),
      new SelectUserData(
        "transitions_enabled",
        this.settings.transitions.value,
        isTransitions,
        this.settings.transitions
      ),
      new SelectUserData(
        "game_over_reason",
        this.winReason.value,
        isWinReason,
        this.winReason
      ),
      new SelectUserData(
        "seconds_per_move_runout_punishment",
        "random_move",
        isSecondsPerMovePenalty,
        this.settings.secondsMoveLimitRunOutPunishment
      ),
      new GamePausedData(this.paused.value, this.paused),
      new BooleanUserData(
        "revive_from_captured_pieces",
        this.settings.reviveFromCapturedPieces.value,
        this.settings.reviveFromCapturedPieces
      ),
      new BooleanUserData(
        "audio_effects_enabled",
        this.settings.audioEffectsEnabled.value,
        this.settings.audioEffectsEnabled
      ),
      new NumberUserData(
        "primary_player_seconds_per_move",
        this.settings.primaryPlayerSecondsPerMove.value,
        this.settings.primaryPlayerSecondsPerMove
      ),
      new NumberUserData(
        "secondary_player_seconds_per_move",
        this.settings.secondaryPlayerSecondsPerMove.value,
        this.settings.secondaryPlayerSecondsPerMove
      ),
      new NumberUserData(
        "primary_player_seconds_per_match",
        this.settings.primaryPlayerSecondsPerMatch.value,
        this.settings.primaryPlayerSecondsPerMatch
      ),
      new NumberUserData(
        "secondary_player_seconds_per_match",
        this.settings.secondaryPlayerSecondsPerMatch.value,
        this.settings.secondaryPlayerSecondsPerMatch
      ),
      new NumberUserData(
        "primary_player_move_seconds",
        0,
        this.timers.primaryPlayerMove.seconds
      ),
      new NumberUserData(
        "secondary_player_move_seconds",
        0,
        this.timers.secondaryPlayerMove.seconds
      ),
      new NumberUserData(
        "primary_player_match_seconds",
        0,
        this.timers.primaryPlayerMatch.seconds
      ),
      new NumberUserData(
        "secondary_player_match_seconds",
        0,
        this.timers.secondaryPlayerMatch.seconds
      ),
      new NumberUserData(
        "pawn_importance",
        this.settings.pawnImportance.value,
        this.settings.pawnImportance
      ),
      new NumberUserData(
        "knight_importance",
        this.settings.knightImportance.value,
        this.settings.knightImportance
      ),
      new NumberUserData(
        "bishop_importance",
        this.settings.bishopImportance.value,
        this.settings.bishopImportance
      ),
      new NumberUserData(
        "rook_importance",
        this.settings.rookImportance.value,
        this.settings.rookImportance
      ),
      new NumberUserData(
        "queen_importance",
        this.settings.queenImportance.value,
        this.settings.queenImportance
      ),
      new NumberUserData(
        "king_importance",
        this.settings.kingImportance.value,
        this.settings.kingImportance
      ),
      new NumberUserData(
        "knight_importance",
        this.settings.knightImportance.value,
        this.settings.knightImportance
      ),
      new BooleanUserData(
        "show_other_availible_moves",
        this.settings.markUnactivePlayerAvailibleMoves.value,
        this.settings.markUnactivePlayerAvailibleMoves
      ),
      new SelectUserData(
        "first_move_color",
        this.firstMoveColor.value,
        isPlayerColor,
        this.firstMoveColor
      ),
      this.defaultBoardStateData,
      this.gameBoardStateData,
      this.lastMoveIndexData,
      this.moveListData,
      this.whiteCapturedPiecesData,
      this.blackCapturedPiecesData,
    ],
    this.ui.confirmDialog,
    this.ui.toastManager
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
      this.ui.tryRecoverData();
    }
    this.userDataManager.onRecoverCheck();
    this.userDataManager.applyData();
    this.userDataManager.updateReferences();

    watch(
      this.settings.defaultBoardState,
      this.updateDefaultBoardAllPiecesContext
    );
  }

  public mount = () => {
    setSaturationMultiplier(1);
    this.ui.updatePrimaryHue(
      this.primaryPlayerPlaying.value,
      this.winner.value
    );

    // Let the app wait another 600ms to make sure its fully loaded.
    setTimeout(() => {
      this.visited === null ? this.restart() : this.restore();
      hideSplashscreen(
        this.transitionsManager.getApplyedTransitions(
          this.settings.transitions.value
        )
      );
    }, 600);
  };

  public async performMove(move: Move) {
    await move.perform(this);
    this.onMovePerform(move);
  }

  public playerWin(player: Player, reason: WinReason) {
    const winnerColor =
      player === "primary"
        ? this.primaryPlayerColor.value
        : this.secondaryPlayerColor.value;
    this.ui.toastManager.showToast(
      `${capitalize(winnerColor)} won.`,
      "crown-outline"
    );
    this.winner.value = player;
    this.winReason.value = reason;
    setPrimaryHue(player === "primary");
  }

  private clearCapturedPieces() {
    this.whiteCapturedPieces.value = [];
    this.blackCapturedPieces.value = [];
  }

  private draw(reason: WinReason) {
    this.ui.toastManager.showToast("Draw.", "sword-cross");
    this.winner.value = "draw";
    this.winReason.value = reason;
  }

  public getRandomMove(pieceColor?: PlayerColor) {
    let randomPieceContext: PieceContext;
    let moves: Move[];
    do {
      do {
        randomPieceContext = getRandomArrayValue(
          this.gameBoardAllPiecesContext.value
        );
      } while (
        typeof pieceColor === "undefined" ||
        randomPieceContext.piece.color !== pieceColor
      );
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
        ? this.secondaryPlayerColor.value
        : this.primaryPlayerColor.value;
    this.ui.toastManager.showToast(
      `${capitalize(loserColor)} is back in the game.`,
      "keyboard-return"
    );
  }

  private setupDefaultBoardState() {
    this.gameBoardStateData.load(
      this.defaultBoardStateData.dump(),
      this.ui.toastManager,
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
    return this.playingColor.value === this.primaryPlayerColor.value;
  }

  private getPlayingColor(): PlayerColor {
    return (isEven(this.lastMoveIndex.value) &&
      this.firstMoveColor.value === "black") ||
      (!isEven(this.lastMoveIndex.value) &&
        this.firstMoveColor.value === "white")
      ? "white"
      : "black";
  }

  private getPlayingPlayer(): Player {
    return this.primaryPlayerPlaying.value ? "primary" : "secondary";
  }

  private getNotPlayingPlayer(): Player {
    return this.primaryPlayerPlaying.value ? "secondary" : "primary";
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

  private resetTimers() {
    for (const timer of Object.values(this.timers)) {
      timer.reset();
    }
  }

  private get notPlayingPlayerColor(): PlayerColor {
    return this.primaryPlayerPlaying.value
      ? this.primaryPlayerColor.value
      : this.secondaryPlayerColor.value;
  }

  public async requestResign() {
    if (this.winner.value !== "none") {
      this.ui.toastManager.showToast(
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
    this.ui.toastManager.showToast(
      `${capitalize(this.notPlayingPlayerColor)} resigned`,

      "flag"
    );
    this.playerWin(this.notPlayingPlayer.value, "resign");
  }

  private initPlayerColors() {
    this.primaryPlayerColor.value = this.choosePrimaryPlayerColor();
    this.secondaryPlayerColor.value = getOpossitePlayerColor(
      this.primaryPlayerColor.value
    );
    updatePieceColors(this.primaryPlayerColor.value);
  }

  private initFirstMoveColor() {
    this.firstMoveColor.value = this.chooseFirstMoveColor();
  }

  private clearWinner() {
    this.winner.value = "none";
    this.winReason.value = "none";
  }

  public restart() {
    this.clearWinner();
    this.clearCapturedPieces();
    this.lastMoveIndex.value = -1;
    this.moveList.value = [];
    this.setupDefaultBoardState();
    this.updateGameBoardAllPiecesContext();
    this.initFirstMoveColor();
    this.initPlayerColors();
    this.updateStateRefs();
    this.resetTimers();
    this.updateCapturingPaths();
    this.updateBackendBoardStateData();
    this.updateWinner();
    this.saveMove();
    this.primaryBoardManager.unselectAll();
    this.secondaryBoardManager.unselectAll();
    this.ui.toastManager.showToast("New match started.", "flag-checkered");
  }

  public restore() {
    this.initPlayerColors();
    this.updateStateRefs();
    updatePieceColors(this.primaryPlayerColor.value);
    this.updateGameBoardAllPiecesContext();
    this.updateCapturingPaths();
    this.updateBackendBoardStateData();
    this.updateWinner();
    if (this.winReason.value === "resign") this.resign();
  }

  private spliceReversedMoves(listIndexDiff: number) {
    this.moveList.value.splice(this.lastMoveIndex.value, listIndexDiff);
  }

  private reverseMove() {
    const reversedMove = this.moveList.value[this.lastMoveIndex.value];
    reversedMove.reverse(this.boardState, this, true);
    this.onMoveReverse();
  }

  private forwardMove() {
    const forwardedMove = this.moveList.value[this.lastMoveIndex.value + 1];
    forwardedMove.forward(this.boardState, this, true);
    this.onMoveForward();
  }

  public redoMove() {
    if (this.moveList.value.length - this.lastMoveIndex.value < 2) {
      this.ui.toastManager.showToast(
        "You reached the last move. You cannot go further.",
        "cancel",
        "error"
      );
      if (this.settings.vibrationsEnabled) navigator.vibrate(30);
      return;
    }
    this.forwardMove();
  }

  public undoMove() {
    if (this.lastMoveIndex.value === -1) {
      this.ui.toastManager.showToast(
        "You reached the first move. You cannot go further.",
        "cancel",
        "error"
      );
      if (this.settings.vibrationsEnabled) navigator.vibrate(30);
      return;
    }
    this.reverseMove();
  }

  private updateStateRefs() {
    this.lastMove.value = this.getLastMove();
    this.playingColor.value = this.getPlayingColor();
    this.primaryPlayerPlaying.value = this.getPrimaryPlayerPlaying();
    this.ui.updatePrimaryHue(
      this.primaryPlayerPlaying.value,
      this.winner.value
    );
    this.playingPlayer.value = this.getPlayingPlayer();
    this.notPlayingPlayer.value = this.getNotPlayingPlayer();
  }

  public updateDefaultBoardAllPiecesContext = () => {
    this.defaultBoardAllPiecesContext.value = getAllPiecesContext(
      this.settings.defaultBoardState
    );
  };

  public updateGameBoardAllPiecesContext() {
    this.gameBoardAllPiecesContext.value = getAllPiecesContext(this.boardState);
  }

  public requestPrimaryPlayerMoveTimerReset() {
    this.timers.primaryPlayerMove.reset();
    this.ui.toastManager.showToast(
      "Primary player move timer reset.",
      "numeric-0-box-outline"
    );
  }

  public requestSecondaryPlayerMoveTimerReset() {
    this.timers.secondaryPlayerMove.reset();
    this.ui.toastManager.showToast(
      "Secondary player move timer reset.",
      "numeric-0-box-outline"
    );
  }

  public requestPrimaryPlayerMatchTimerReset() {
    this.timers.primaryPlayerMatch.reset();
    this.ui.toastManager.showToast(
      "Primary player match timer reset.",
      "numeric-0-box-outline"
    );
  }

  public requestSecondaryPlayerMatchTimerReset() {
    this.timers.secondaryPlayerMatch.reset();
    this.ui.toastManager.showToast(
      "Secondary player match timer reset.",
      "numeric-0-box-outline"
    );
  }

  private resetNotPlayingPlayerMoveTimer() {
    if (this.primaryPlayerPlaying.value) {
      this.timers.secondaryPlayerMove.reset();
    } else {
      this.timers.primaryPlayerMove.reset();
    }
  }

  private updateBackendBoardStateData() {
    this.backendBoardStateData.load(
      this.gameBoardStateData.dump(),
      this.ui.toastManager
    );
  }

  public onMove() {
    this.updateGameBoardAllPiecesContext();
    invalidatePiecesCache(this.gameBoardAllPiecesContext.value);
    this.updateStateRefs();
    this.updateCapturingPaths();
    this.updateBackendBoardStateData();
    this.resetNotPlayingPlayerMoveTimer();
    this.updateWinner();
  }

  private saveMove() {
    this.gameBoardStateData.save();
    this.lastMoveIndexData.save();
    this.moveListData.save();
    this.whiteCapturedPiecesData.save();
    this.blackCapturedPiecesData.save();
  }

  private onMoveReverse() {
    this.lastMoveIndex.value--;
    this.onMove();
  }

  private onMoveForward() {
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
      this.playingColor.value
    );
    const activePlayerChecked = isGuardedPieceChecked(
      this.boardState,
      this.playingColor.value,
      this.gameBoardAllPiecesContext.value,
      activePlayerGuardedPieces
    );

    if (activePlayerChecked) this.ui.toastManager.showToast("Check!", "cross");

    const canActivePlayerMove = this.canActivePlayerMove(
      this.playingColor.value,
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
      this.playerWin(this.notPlayingPlayer.value, winReason);
      return;
    }
    this.draw("stalemate");
  }

  private canActivePlayerMove(
    color: PlayerColor,
    allPiecesContext: PieceContext[]
  ) {
    for (const pieceContext of allPiecesContext) {
      if (pieceContext.piece.color !== color) continue;
      const moves = pieceContext.piece.getPossibleMoves(this, pieceContext);
      if (moves.length !== 0) {
        return true;
      }
    }
    return false;
  }

  public updateCapturingPaths() {
    let whiteCapturingPaths: Path[] = [];
    let blackCapturingPaths: Path[] = [];
    for (const pieceContext of this.gameBoardAllPiecesContext.value) {
      const piece = pieceContext.piece;
      const origin: BoardPosition = {
        row: +pieceContext.row,
        col: +pieceContext.col,
      };
      if (piece.color === "white") {
        whiteCapturingPaths = [
          ...whiteCapturingPaths,
          ...positionsToPath(
            piece.getCapturingPositions(origin, this.boardState),
            origin
          ),
        ];
      } else {
        blackCapturingPaths = [
          ...blackCapturingPaths,
          ...positionsToPath(
            piece.getCapturingPositions(origin, this.boardState),
            origin
          ),
        ];
      }
    }
    this.whiteCapturingPaths.value = whiteCapturingPaths;
    this.blackCapturingPaths.value = blackCapturingPaths;
  }
}
