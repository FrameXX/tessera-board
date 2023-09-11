<script lang="ts" setup>
import { PropType } from "vue";
import type Piece from "../modules/pieces";
import SimpleInfo from "./SimpleInfo.vue";
import PieceIcon from "./PieceIcon.vue";
import type { PieceSetValue } from "../modules/user_data/piece_set";

const props = defineProps({
  playerCapturedPieces: { type: Array as PropType<Piece[]> },
  opponentCapturedPieces: { type: Array as PropType<Piece[]> },
  pieceSet: { type: String as PropType<PieceSetValue>, required: true },
});
</script>

<template>
  <div class="player-info">
    <div id="player-info-player">
      <div class="player">Player</div>
      <div class="content">
        <SimpleInfo name="captured pieces" class="captured-pieces">
          <TransitionGroup name="list">
            <PieceIcon
              v-for="piece in props.playerCapturedPieces"
              :color="piece.color"
              :piece-set="props.pieceSet"
              :piece-id="piece.pieceId"
            ></PieceIcon>
          </TransitionGroup>
        </SimpleInfo>
        <SimpleInfo name="remaining time">00:00</SimpleInfo>
      </div>
    </div>
    <div id="player-info-opponent">
      <div class="player">Opponent</div>
      <div class="content">
        <SimpleInfo name="captured pieces" class="captured-pieces">
          <TransitionGroup name="list">
            <PieceIcon
              v-for="piece in props.opponentCapturedPieces"
              :color="piece.color"
              :piece-set="props.pieceSet"
              :piece-id="piece.pieceId"
            ></PieceIcon>
          </TransitionGroup>
        </SimpleInfo>
        <SimpleInfo name="remaining time">00:00</SimpleInfo>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.player-info {
  @include shadow;
  @include no-overrender;
  margin: 0 var(--spacing-small);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  display: flex;
  align-items: baseline;

  .info {
    display: inline-flex;
  }
}

#player-info-player,
#player-info-opponent {
  height: 100%;
  display: inline-block;

  .player {
    text-align: center;
    padding: var(--spacing-medium);
    padding-bottom: 0;
    font-size: var(--font-size-big);

    &.playing {
      text-decoration: underline;
    }
  }
}

#player-info-player {
  background-color: var(--color-player-surface-accent);
}

#player-info-opponent {
  background-color: var(--color-opponent-surface-accent);
}

.captured-pieces {
  .icon {
    width: var(--font-size-big);
    height: var(--font-size-big);
    margin: 0;
  }
}
</style>
