import moveAudioEffectUrl from "../assets/audio/move.ogg";
import removeAudioEffectUrl from "../assets/audio/remove.ogg";
import { Howl } from "howler";
import { type Ref, watch, ref, computed } from "vue";
import BoardStateData from "./user_data/board_state";
import { getRandomArrayValue, getRandomNumber, isEven } from "./utils/misc";
import RawBoardStateData from "./user_data/raw_board_state";
import Timer from "./timer";
import type { PieceId, PiecesImportance } from "./pieces/piece";
import { type Path } from "./pieces/piece";
import type { GamePausedState } from "./user_data/game_paused";
import type { PieceContext, BoardPosition } from "./board_manager";
import type Move from "./moves/move";
import NumberUserData from "./user_data/number_user_data";
import MoveListData from "./user_data/move_list";
import type { MovePerformContext } from "./moves/move";
import GameBoardManager from "./game_board_manager";
import { UserDataError } from "./user_data/user_data";
import DefaultBoardManager from "./default_board_manager";
import ThemeManager, { isTheme } from "./theme_manager";
import TransitionsManager, { isTransitions } from "./transitions_manager";
import PieceIconPackData from "./user_data/piece_set";
import UI from "./ui";
import UserDataManager from "./user_data_manager";
import BooleanUserData from "./user_data/boolean_user_data";
import HueData from "./user_data/hue";
import SelectUserData from "./user_data/select_user_data";
import GamePausedData from "./user_data/game_paused";
import PieceBorderData from "./user_data/piece_border";
import PiecePaddingData from "./user_data/piece_padding";
import PlayerColorOptionData from "./user_data/preferred_player_color";
import CellIndexOpacityData from "./user_data/cell_index_opacity";
import TransitionDurationData from "./user_data/transition_duration";
import CapturedPiecesData from "./user_data/captured_pieces";
import {
  hideSplashscreen,
  setSaturationMultiplier,
  updatePieceColors,
} from "./utils/elements";
import defualtSettings from "./user_data/default_settings";
import type {
  MoveExecution,
  PlayerColor,
  WinReason,
  Winner,
} from "./utils/game";
import {
  getAllpieceContext as getAllPiecesContext,
  getColorTeamName,
  getGuardedPieces,
  getOpossitePlayerColor,
  getOpossiteTeamName,
  getPlayerTeamName,
  invalidatePiecesCache,
  isGuardedPieceChecked,
  isPlayer,
  isPlayerColor,
  isSecondsPerMovePenalty,
  isWinReason,
  positionsToPath,
} from "./utils/game";
import { predefinedDefaultBoardConfigs } from "./predefined_configs";
import ConfigInventory from "./config_inventory";
import ConfigManager from "./config_manager";

class Game {
  public readonly pieceMoveAudioEffect = new Howl({
    src: [moveAudioEffectUrl],
  });
  public readonly pieceRemoveAudioEffect = new Howl({
    src: [removeAudioEffectUrl],
  });

  public readonly playerRemainingMoveSeconds = computed(() => {
    return (
      this.settings.playerSecondsPerMove.value - this.playerMoveSeconds.value
    );
  });
  public readonly opponentRemainingMoveSeconds = computed(() => {
    return (
      this.settings.opponentSecondsPerMove.value -
      this.opponentMoveSeconds.value
    );
  });
  public readonly playerRemainingMatchSeconds = computed(() => {
    return (
      this.settings.playerSecondsPerMatch.value - this.playerMatchSeconds.value
    );
  });
  public readonly opponentRemainingMatchSeconds = computed(() => {
    return (
      this.settings.opponentSecondsPerMatch.value -
      this.opponentMatchSeconds.value
    );
  });

  public readonly ui = new UI(this);

  public readonly settings = defualtSettings;
  public readonly gameBoardState = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ];
  public readonly gameBoardStateData = new BoardStateData(
    this.gameBoardState,
    this.gameBoardState,
    false
  );
  public readonly defaultBoardStateData = new RawBoardStateData(
    this.settings.defaultBoardState,
    this.settings.defaultBoardState
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

  public readonly whiteCapturingPaths = ref<Path[]>([]);
  public readonly blackCapturingPaths = ref<Path[]>([]);
  public readonly playerColor = ref<PlayerColor>("white");
  public readonly playerMoveSeconds = ref(0);
  public readonly opponentMoveSeconds = ref(0);
  public readonly playerMatchSeconds = ref(0);
  public readonly opponentMatchSeconds = ref(0);
  public readonly winReason = ref<WinReason>("none");
  public readonly blackCapturedPieces = ref<PieceId[]>([]);
  public readonly whiteCapturedPieces = ref<PieceId[]>([]);
  public readonly lastMoveIndex = ref(0);
  public readonly paused = ref<GamePausedState>("not");
  public readonly lastMoveIndexData = new NumberUserData(
    "move_index",
    this.lastMoveIndex.value,
    this.lastMoveIndex,
    undefined,
    undefined,
    false
  );
  public readonly moveList = ref([]) as Ref<Move[]>;
  public readonly moveListData = new MoveListData(
    "move_list",
    this.moveList.value,
    this.moveList
  );
  public readonly lastMove = computed(() => {
    if (this.lastMoveIndex.value === -1) {
      return null;
    }
    return this.moveList.value[this.lastMoveIndex.value];
  });

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
        this.settings.playerHue.value,
        this.settings.playerHue,
        false
      ),
      new HueData(
        this.settings.opponentHue.value,
        this.settings.opponentHue,
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
        "player_color",
        this.playerColor.value,
        isPlayerColor,
        this.playerColor
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
      new CapturedPiecesData(
        this.whiteCapturedPieces.value,
        this.whiteCapturedPieces,
        "white"
      ),
      new CapturedPiecesData(
        this.blackCapturedPieces.value,
        this.blackCapturedPieces,
        "black"
      ),
      new NumberUserData(
        "player_seconds_per_move",
        this.settings.playerSecondsPerMove.value,
        this.settings.playerSecondsPerMove
      ),
      new NumberUserData(
        "opponent_seconds_per_move",
        this.settings.opponentSecondsPerMove.value,
        this.settings.opponentSecondsPerMove
      ),
      new NumberUserData(
        "player_seconds_per_match",
        this.settings.playerSecondsPerMatch.value,
        this.settings.playerSecondsPerMatch
      ),
      new NumberUserData(
        "opponent_seconds_per_match",
        this.settings.opponentSecondsPerMatch.value,
        this.settings.opponentSecondsPerMatch
      ),
      new NumberUserData("player_move_seconds", 0, this.playerMoveSeconds),
      new NumberUserData("opponent_move_seconds", 0, this.opponentMoveSeconds),
      new NumberUserData("player_match_seconds", 0, this.playerMatchSeconds),
      new NumberUserData(
        "opponent_match_seconds",
        0,
        this.opponentMatchSeconds
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
      this.defaultBoardStateData,
      this.gameBoardStateData,
      this.lastMoveIndexData,
      this.moveListData,
    ],
    this.ui.confirmDialog,
    this.ui.toastManager
  );

  public readonly piecesImportance: PiecesImportance = {
    rook: this.settings.rookImportance,
    knight: this.settings.knightImportance,
    bishop: this.settings.bishopImportance,
    pawn: this.settings.pawnImportance,
    queen: this.settings.queenImportance,
    king: this.settings.kingImportance,
  };

  public readonly playerMoveSecondsTimer: Timer;
  public readonly opponentMoveSecondsTimer: Timer;
  public readonly playerMatchSecondsTimer: Timer;
  public readonly opponentMatchSecondsTimer: Timer;
  public readonly winner = ref<Winner>("none");
  public readonly playingColor = computed(() => {
    const color: PlayerColor =
      (isEven(this.lastMoveIndex.value) &&
        this.settings.preferredFirstMoveColor.value === "black") ||
      (!isEven(this.lastMoveIndex.value) &&
        this.settings.preferredFirstMoveColor.value === "white")
        ? "white"
        : "black";
    return color;
  });

  public readonly playerPlaying = computed(() => {
    return this.playerColor.value === this.playingColor.value;
  });

  public readonly status = computed(() => {
    let text: string;
    switch (this.winner.value) {
      case "none":
        text =
          this.playerColor.value === "white" ? "White plays" : "Black plays";
        break;
      case "draw":
        text = "Draw";
        break;
      case "opponent":
        text = this.playerColor.value === "white" ? "Black won" : "White won";
        break;
      case "player":
        text = this.playerColor.value === "white" ? "White won" : "Black won";
        break;
      default:
        throw new UserDataError(
          `Winner value is of an invalid type. value: ${this.winner.value}`
        );
    }
    return text;
  });

  public readonly highlightedCells = computed(() => {
    if (!this.lastMove.value) {
      return [];
    }
    return this.lastMove.value.highlightedBoardPositions;
  });

  public readonly gameBoardAllPiecesContext: Ref<PieceContext[]>;
  public readonly defaultBoardAllPiecesContext: Ref<PieceContext[]>;
  public readonly playerBoardManager: GameBoardManager;
  public readonly opponentBoardManager: GameBoardManager;
  public readonly defaultBoardManager = new DefaultBoardManager(
    this.settings.defaultBoardState,
    this.ui.configPieceDialog,
    this.settings.audioEffectsEnabled,
    this.pieceMoveAudioEffect,
    this.pieceRemoveAudioEffect,
    this.settings.vibrationsEnabled
  );

  public readonly rotated = computed(() => {
    if (!this.settings.tableModeEnabled.value) {
      return false;
    }
    const rotated = this.playingColor.value === "black";
    return rotated;
  });

  private readonly transitionsManager = new TransitionsManager(
    this.settings.transitions
  );
  private visited: string | null;

  constructor() {
    new ThemeManager(this.settings.theme);
    this.gameBoardAllPiecesContext = ref(
      getAllPiecesContext(this.gameBoardState)
    );
    this.defaultBoardAllPiecesContext = ref(
      getAllPiecesContext(this.settings.defaultBoardState)
    );
    this.playerBoardManager = new GameBoardManager(this, true);
    this.opponentBoardManager = new GameBoardManager(this, false);

    this.visited = localStorage.getItem("tessera_board-visited");
    if (this.visited === null) {
      localStorage.setItem("tessera_board-visited", "1");
    } else {
      this.ui.tryRecoverData();
    }
    this.userDataManager.onRecoverCheck();
    this.userDataManager.applyData();
    this.userDataManager.updateReferences();

    watch(this.rotated, (newValue) => {
      this.ui.updateScreenRotation(newValue);
    });
    watch(this.playerPlaying, (newValue) => {
      this.ui.updatePrimaryHue(newValue, this.winner.value);
    });
    watch(this.winner, (newValue) => {
      this.ui.updatePrimaryHue(this.playerPlaying.value, newValue);
    });
    watch(this.playerColor, (newValue) => {
      updatePieceColors(newValue);
    });

    watch(this.settings.defaultBoardState, () => {
      this.defaultBoardAllPiecesContext.value = getAllPiecesContext(
        this.settings.defaultBoardState
      );
    });

    watch(this.paused, (newValue) => {
      this.updateTimerState();
      if (newValue !== "not") {
        this.ui.toastManager.showToast("Game paused", "pause");
      } else {
        this.ui.toastManager.showToast("Game resumed", "play-outline");
      }
    });

    this.playerMoveSecondsTimer = new Timer(
      this.playerMoveSeconds,
      this.settings.playerSecondsPerMove,
      this.onPlayerMoveSecsOut.bind(this),
      () => {
        if (
          this.winReason.value === "move_timeout" &&
          this.winner.value === "opponent"
        )
          this.cancelWin();
      }
    );
    this.opponentMoveSecondsTimer = new Timer(
      this.opponentMoveSeconds,
      this.settings.opponentSecondsPerMove,
      this.onOpponentMoveSecsOut.bind(this),
      () => {
        if (
          this.winReason.value === "move_timeout" &&
          this.winner.value === "player"
        )
          this.cancelWin();
      }
    );
    this.playerMatchSecondsTimer = new Timer(
      this.playerMatchSeconds,
      this.settings.playerSecondsPerMatch,
      this.onPlayerMatchSecsOut.bind(this),
      () => {
        if (
          this.winReason.value === "match_timeout" &&
          this.winner.value === "opponent"
        )
          this.cancelWin();
      }
    );

    this.opponentMatchSecondsTimer = new Timer(
      this.opponentMatchSeconds,
      this.settings.opponentSecondsPerMatch,
      this.onOpponentMatchSecsOut.bind(this),
      () => {
        if (
          this.winReason.value === "match_timeout" &&
          this.winner.value === "player"
        )
          this.cancelWin();
      }
    );
  }

  public mount = () => {
    // Sets CSS Saturation variables from 0 to their appropriate user configured values
    setSaturationMultiplier(1);
    this.ui.updatePrimaryHue(this.playerPlaying.value, this.winner.value);

    addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape") this.ui.escapeManager.escape();
      if (event.key === "R" && event.shiftKey) this.restart();
      if (event.key === "C" && event.shiftKey) {
        this.ui.toggleActionsPanel();
        if (this.ui.actionPanelOpen.value) {
          this.ui.toggleSettings();
        }
      }
    });

    addEventListener("visibilitychange", () => {
      this.ui.onDistractionChange();
    });

    // Let the app wait another 600ms to make sure its fully loaded.
    setTimeout(() => {
      if (this.visited === null) {
        this.restart();
      } else {
        this.restore();
      }
      hideSplashscreen(
        this.transitionsManager.getApplyedTransitions(
          this.settings.transitions.value
        )
      );
    }, 600);
  };

  public performMove(move: Move) {
    move.perform(this.movePerformContext);
    this.moveList.value.push(move);
    this.onMove("perform");
  }

  private playerWin(reason: WinReason) {
    const winner: Winner = "player";
    this.ui.toastManager.showToast(
      `${getPlayerTeamName(winner, this.playerColor.value)} won.`,

      "crown-outline"
    );
    this.winner.value = winner;
    this.winReason.value = reason;
    this.updateTimerState();
  }

  private clearCapturedPieces() {
    this.whiteCapturedPieces.value = [];
    this.blackCapturedPieces.value = [];
  }

  private opponentWin(reason: WinReason) {
    const winner: Winner = "opponent";
    this.ui.toastManager.showToast(
      `${getPlayerTeamName(winner, this.playerColor.value)} won.`,
      "crown-outline"
    );
    this.winner.value = winner;
    this.winReason.value = reason;
    this.updateTimerState();
  }

  private draw(reason: WinReason) {
    this.ui.toastManager.showToast("Draw.", "sword-cross");
    this.winner.value = "draw";
    this.winReason.value = reason;
    this.updateTimerState();
  }

  private performRandomMove(pieceColor?: PlayerColor) {
    let randomPiece: PieceContext;
    let moves: Move[];
    do {
      do {
        randomPiece = getRandomArrayValue(this.gameBoardAllPiecesContext.value);
      } while (
        typeof pieceColor === "undefined" ||
        randomPiece.piece.color !== pieceColor
      );
      moves = randomPiece.piece.getPossibleMoves(
        randomPiece,
        this.gameBoardState,
        this.gameBoardStateData,
        this.movePerformContext,
        this.settings.ignorePiecesGuardedProperty,
        this.lastMove
      );
    } while (moves.length === 0);
    const chosenMove = getRandomArrayValue(moves);
    this.performMove(chosenMove);
  }

  private onPlayerMoveSecsOut() {
    this.ui.toastManager.showToast(
      `${getColorTeamName(this.playerColor.value)} run out of move time!`,
      "timer-alert-outline"
    );
    if (this.settings.secondsMoveLimitRunOutPunishment.value === "game_loss") {
      this.opponentWin("move_timeout");
    } else if (
      this.settings.secondsMoveLimitRunOutPunishment.value === "random_move"
    ) {
      this.performRandomMove(this.playerColor.value);
    }
  }

  private onOpponentMoveSecsOut() {
    this.ui.toastManager.showToast(
      `${getColorTeamName(
        getOpossitePlayerColor(this.playerColor.value)
      )} run out of move time!`,
      "timer-alert-outline"
    );
    if (this.settings.secondsMoveLimitRunOutPunishment.value === "game_loss") {
      this.playerWin("move_timeout");
    } else if (
      this.settings.secondsMoveLimitRunOutPunishment.value === "random_move"
    ) {
      this.performRandomMove(getOpossitePlayerColor(this.playerColor.value));
    }
  }

  private onPlayerMatchSecsOut() {
    this.ui.toastManager.showToast(
      `${getColorTeamName(this.playerColor.value)} run out of match time!`,
      "timer-alert-outline"
    );
    this.opponentWin("match_timeout");
  }

  private onOpponentMatchSecsOut() {
    this.ui.toastManager.showToast(
      `${getColorTeamName(
        getOpossitePlayerColor(this.playerColor.value)
      )} run out of match time!`,
      "timer-alert-outline"
    );
    this.playerWin("match_timeout");
  }

  private cancelWin() {
    if (!isPlayer(this.winner.value)) {
      console.error("Winner value is not of Player type.");
      return;
    }
    this.ui.toastManager.showToast(
      `${getOpossiteTeamName(
        getPlayerTeamName(this.winner.value, this.playerColor.value)
      )} is back in the game.`,
      "keyboard-return"
    );
    this.winReason.value = "none";
    this.winner.value = "none";
    this.updateTimerState();
  }

  private setupDefaultBoardState() {
    this.gameBoardStateData.load(
      this.defaultBoardStateData.dump(),
      this.ui.toastManager,
      true
    );
    this.gameBoardStateData.updateReference();
  }

  private getPlayerColor(): PlayerColor {
    if (this.settings.preferredPlayerColor.value === "random") {
      return getRandomNumber(0, 1) ? "white" : "black";
    } else {
      return this.settings.preferredPlayerColor.value;
    }
  }

  private clearTimers() {
    this.playerMoveSecondsTimer.reset();
    this.opponentMoveSecondsTimer.reset();
    this.playerMatchSecondsTimer.reset();
    this.opponentMatchSecondsTimer.reset();
  }

  private updateTimerState() {
    if (
      this.winner.value !== "none" ||
      this.playerPlaying.value ||
      this.paused.value !== "not"
    ) {
      this.opponentMoveSecondsTimer.pause();
      this.opponentMatchSecondsTimer.pause();
    }
    if (
      this.winner.value !== "none" ||
      !this.playerPlaying.value ||
      this.paused.value !== "not"
    ) {
      this.playerMoveSecondsTimer.pause();
      this.playerMatchSecondsTimer.pause();
    }
    if (this.winner.value !== "none" || this.paused.value !== "not") {
      return;
    }
    if (this.playerPlaying.value) {
      this.playerMoveSecondsTimer.resume();
      this.playerMatchSecondsTimer.resume();
    } else {
      this.opponentMoveSecondsTimer.resume();
      this.opponentMatchSecondsTimer.resume();
    }
  }

  public async resign() {
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
    this.ui.toastManager.showToast(
      `${getPlayerTeamName(
        this.playerPlaying.value ? "player" : "opponent",
        this.playerColor.value
      )} resigned`,

      "flag"
    );
    this.playerPlaying.value
      ? this.opponentWin("resign")
      : this.playerWin("resign");
  }

  public restart() {
    this.winner.value = "none";
    this.setupDefaultBoardState();
    this.onBoardStateChange();
    this.playerColor.value = this.getPlayerColor();
    this.clearCapturedPieces();
    this.ui.toastManager.showToast("New match started.", "flag-checkered");
    this.lastMoveIndex.value = -1;
    this.onMoveForward();
    this.moveList.value = [];
    this.clearTimers();
  }

  public restore() {
    this.onBoardStateChange();
    this.updateTimerState();
    this.updateCapturingPaths();
  }

  private spliceFutureMoves(listIndexDiff: number) {
    this.moveList.value.splice(this.lastMoveIndex.value, listIndexDiff);
  }

  private reverseMove() {
    const reversedMove = this.moveList.value[this.lastMoveIndex.value + 1];
    reversedMove.reverse(this.gameBoardState);
  }

  private get movePerformContext(): MovePerformContext {
    return {
      boardStateValue: this.gameBoardState,
      blackCapturedPieces: this.blackCapturedPieces,
      whiteCapturedPieces: this.whiteCapturedPieces,
      selectPieceDialog: this.ui.selectPieceDialog,
      reviveFromCapturedPieces: this.settings.reviveFromCapturedPieces,
      audioEffectsEnabled: this.settings.audioEffectsEnabled,
      moveAudioEffect: this.pieceMoveAudioEffect,
      removeAudioEffect: this.pieceRemoveAudioEffect,
      vibrationsEnabled: this.settings.vibrationsEnabled,
      piecesImportance: this.piecesImportance,
    };
  }

  private forwardMove() {
    const forwardedMove = this.moveList.value[this.lastMoveIndex.value];
    forwardedMove.forward(this.movePerformContext);
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
    this.onMove("forward");
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
    this.onMove("reverse");
  }

  public onMove(moveExecution: MoveExecution = "perform") {
    if (moveExecution === "reverse") {
      this.lastMoveIndex.value--;
    } else {
      this.lastMoveIndex.value++;
    }

    if (moveExecution === "perform") {
      const listIndexDiff =
        this.moveList.value.length - this.lastMoveIndex.value - 1;
      if (listIndexDiff > 0) {
        this.spliceFutureMoves(listIndexDiff);
      }
      this.onMovePerform();
    } else {
      if (moveExecution === "reverse") {
        this.reverseMove();
      } else {
        this.forwardMove();
      }
      this.onBoardStateChange();
    }

    if (moveExecution !== "reverse") {
      this.lastMoveIndexData.save();
      this.moveListData.save();
    }
  }

  private onBoardStateChange() {
    this.gameBoardAllPiecesContext.value = getAllPiecesContext(
      this.gameBoardState
    );
    this.updateTimerState();
    if (this.playerPlaying.value) {
      this.opponentMoveSecondsTimer.reset();
    } else {
      this.playerMoveSecondsTimer.reset();
    }
    invalidatePiecesCache(this.gameBoardAllPiecesContext.value);
    this.updateCapturingPaths();
  }

  private onMoveForward() {
    this.onBoardStateChange();
    this.gameBoardStateData.save();
  }

  private onMovePerform() {
    this.onMoveForward();
    this.checkLoss();
  }

  private checkLoss() {
    const guardedPieces = getGuardedPieces(
      this.gameBoardAllPiecesContext.value,
      this.playingColor.value
    );
    const checked = isGuardedPieceChecked(
      this.gameBoardState,
      this.playingColor.value,
      this.gameBoardAllPiecesContext.value,
      guardedPieces,
      this.lastMove
    );
    if (checked) this.ui.toastManager.showToast("Check!", "cross");

    const canPlayerMove = this.canPlayerMove(
      this.playingColor.value,
      this.gameBoardAllPiecesContext.value
    );
    if (!canPlayerMove) {
      if (checked || guardedPieces.length === 0) {
        const winReason: WinReason =
          guardedPieces.length !== 0 ? "block" : "checkmate";
        this.playerPlaying.value
          ? this.opponentWin(winReason)
          : this.playerWin(winReason);
      } else {
        this.draw("stalemate");
      }
    }
  }

  private canPlayerMove(color: PlayerColor, pieceContext: PieceContext[]) {
    for (const props of pieceContext) {
      if (props.piece.color !== color) continue;
      const moves = props.piece.getPossibleMoves(
        props,
        this.gameBoardState,
        this.gameBoardStateData,
        this.movePerformContext,
        this.settings.ignorePiecesGuardedProperty,
        this.lastMove
      );
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
            piece.getCapturingPositions(
              origin,
              this.gameBoardState,
              this.lastMove
            ),
            origin
          ),
        ];
      } else {
        blackCapturingPaths = [
          ...blackCapturingPaths,
          ...positionsToPath(
            piece.getCapturingPositions(
              origin,
              this.gameBoardState,
              this.lastMove
            ),
            origin
          ),
        ];
      }
    }
    this.whiteCapturingPaths.value = whiteCapturingPaths;
    this.blackCapturingPaths.value = blackCapturingPaths;
  }
}

export default Game;
