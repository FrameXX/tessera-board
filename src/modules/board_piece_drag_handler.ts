class BoardPieceDragHandler {
  private inchPxOffset: ComputedRef<number> = computed(() => {
    let offset = inchCmOffset.value * pixelsPerCm;
    if (props.contentRotated !== props.rotated) {
      offset *= -1;
    }
    return offset;
  });

  constructor() {

  };

  const inchPxOffset = computed(() => {
    let offset = inchCmOffset.value * pixelsPerCm;
    if (props.contentRotated !== props.rotated) {
      offset *= -1;
    }
    return offset;
  });
  
  let pressTimeout: number | null = null;
  let lastDragX = 0;
  let lastDragY = 0;
  const dragXDelta = ref(0);
  const dragYDelta = ref(0);
  
  watch(dragXDelta, dragDeltaChange);
  watch(dragYDelta, dragDeltaChange);
  
  const shiftedDragYDelta = computed(() => {
    return dragYDelta.value - inchPxOffset.value;
  });
  
  const dragRowDelta = computed(() => {
    let delta = Math.round(-shiftedDragYDelta.value / cellSize.value);
    if (delta === -0) {
      delta = 0;
    }
    return delta;
  });
  
  const dragColDelta = computed(() => {
    let delta = Math.round(dragXDelta.value / cellSize.value);
    if (delta === -0) {
      delta = 0;
    }
    return delta;
  });
  
  const targetingDragPosition = computed(() => {
    if (!draggingPiece.value) {
      return { row: 0, col: 0 };
    }
    const position = getDeltaPosition(
      { row: draggingPiece.value?.row, col: draggingPiece.value?.col },
      dragColDelta.value,
      dragRowDelta.value
    );
    return position;
  });
  
  watch(targetingDragPosition, () => {
    if (!draggingPiece.value || !showDragging.value) {
      return;
    }
    props.manager.onPieceDragOverCell(
      targetingDragPosition.value,
      draggingPiece.value
    );
  });
  
  watch(showDragging, (newValue) => {
    if (!draggingPiece.value || !newValue) return;
    props.manager.onPieceDragStart(
      targetingDragPosition.value,
      draggingPiece.value
    );
    if (useVibrations.value) navigator.vibrate(30);
  });

  function resetDragDelta() {
    dragXDelta.value = 0;
    dragYDelta.value = 0;
  }
  
  dragDeltaChange() {
    if (showDragging.value || !draggingPiece.value) return;
    if (
      Math.abs(dragXDelta.value) / cellSize.value > 0.5 ||
      Math.abs(dragYDelta.value) / cellSize.value > 0.5
    ) {
      showDragging.value = true;
    }
  }
  
  updatePointerPosition(x: number, y: number) {
    let xDelta = x - lastDragX;
    let yDelta = y - lastDragY;
    if (props.rotated) {
      xDelta = -xDelta;
      yDelta = -yDelta;
    }
  
    dragXDelta.value = dragXDelta.value + xDelta;
    dragYDelta.value = dragYDelta.value + yDelta;
  
    lastDragX = x;
    lastDragY = y;
  }
  
  initDrag(event: PointerEvent, pieceProps: BoardPieceProps) {
    pressTimeout = null;
    draggingPiece.value = pieceProps;
  
    const x = event.clientX;
    const y = event.clientY;
  
    lastDragX = x;
    lastDragY = y;
    updatePointerPosition(x, y);
  }
  
  onPiecePointerStart(event: PointerEvent, pieceProps: BoardPieceProps) {
    if (event.pointerType === "touch") {
      if (pressTimeout !== null || draggingPiece.value !== null) return;
      inchCmOffset.value = 1.8;
    } else {
      if (
        event.button !== 0 ||
        pressTimeout !== null ||
        draggingPiece.value !== null
      )
        return;
      inchCmOffset.value = 0;
    }
  
    pressTimeout = window.setTimeout(() => {
      initDrag(event, pieceProps);
    }, longPressTimeout.value);
  }
  
  function onPointerMove(event: PointerEvent) {
    if (!draggingPiece.value) {
      return;
    }
    updatePointerPosition(event.clientX, event.clientY);
  }
  
  onPointerUp() {
    if (!draggingPiece.value) {
      if (pressTimeout === null) return;
      clearTimeout(pressTimeout);
      pressTimeout = null;
      return;
    }
    if (showDragging.value) {
      props.manager.onPieceDragEnd(
        targetingDragPosition.value,
        draggingPiece.value
      );
      showDragging.value = false;
    }
    draggingPiece.value = null;
    resetDragDelta();
  }
}

export default BoardPieceDragHandler;
