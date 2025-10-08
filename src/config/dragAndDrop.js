// Lightweight DnD tuning — pointer slop, drop zones, keyboard affordances.
export const DND = Object.freeze({
  dragThresholdPx: 4,     // movement before a drag is recognized
  holdDelayMs: 120,       // press-and-hold to pick up (touch)
  dropTolerancePx: 24,    // snap distance to target slot
  keyboardMode: true,     // allow arrow-keys + space to move items between slots
});

export function isDragStart(start, current) {
  const dx = current.x - start.x;
  const dy = current.y - start.y;
  return dx * dx + dy * dy >= DND.dragThresholdPx * DND.dragThresholdPx;
}
export function isDropTarget(itemRect, targetRect) {
	const cx = itemRect.left + itemRect.width / 2;
	const cy = itemRect.top + itemRect.height / 2;
	return (
		cx >= targetRect.left - DND.dropTolerancePx &&
		cx <= targetRect.right + DND.dropTolerancePx &&
		cy >= targetRect.top - DND.dropTolerancePx &&
		cy <= targetRect.bottom + DND.dropTolerancePx
	);
}
export function canUseKeyboardDND() {
	return DND.keyboardMode && typeof window !== 'undefined' && 'onkeydown' in window;
}
