// src/logic/DragAndDropManager.js
function toFiniteNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeRect(rectLike) {
  if (!rectLike || typeof rectLike !== "object") return null;
  const left = toFiniteNumber(rectLike.left, NaN);
  const top = toFiniteNumber(rectLike.top, NaN);
  const right =
    "right" in rectLike
      ? toFiniteNumber(rectLike.right, NaN)
      : left + toFiniteNumber(rectLike.width, NaN);
  const bottom =
    "bottom" in rectLike
      ? toFiniteNumber(rectLike.bottom, NaN)
      : top + toFiniteNumber(rectLike.height, NaN);
  if (
    !Number.isFinite(left) ||
    !Number.isFinite(top) ||
    !Number.isFinite(right) ||
    !Number.isFinite(bottom)
  ) {
    return null;
  }
  return {
    left: Math.min(left, right),
    top: Math.min(top, bottom),
    right: Math.max(left, right),
    bottom: Math.max(top, bottom),
  };
}

function expandRect(rect, padding = 0) {
  const pad = Math.max(0, toFiniteNumber(padding, 0));
  return {
    left: rect.left - pad,
    top: rect.top - pad,
    right: rect.right + pad,
    bottom: rect.bottom + pad,
  };
}

function pointInRect(x, y, rect) {
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom
  );
}

class DragAndDropManager {
  constructor(options = {}) {
    this.getDropZone =
      typeof options.getDropZone === "function" ? options.getDropZone : null;
    this.onAcceptedDrop =
      typeof options.onAcceptedDrop === "function"
        ? options.onAcceptedDrop
        : null;
    this.onRejectedDrop =
      typeof options.onRejectedDrop === "function"
        ? options.onRejectedDrop
        : null;
    this.dropPaddingPx = Math.max(0, toFiniteNumber(options.dropPaddingPx, 18));
    this.activeDrag = null;
  }

  startDrag(payload = {}) {
    const pointerId = toFiniteNumber(payload.pointerId, -1);
    const clientX = toFiniteNumber(payload.clientX, 0);
    const clientY = toFiniteNumber(payload.clientY, 0);
    this.activeDrag = {
      pointerId,
      itemType:
        String(payload.itemType || "")
          .trim()
          .toLowerCase() || "toy",
      itemId: String(payload.itemId || "").trim() || null,
      startedAt: Date.now(),
      clientX,
      clientY,
      data: payload.data || null,
    };
    return this.activeDrag;
  }

  updateDrag(payload = {}) {
    if (!this.activeDrag) return null;
    const pointerId = toFiniteNumber(
      payload.pointerId,
      this.activeDrag.pointerId
    );
    if (pointerId !== this.activeDrag.pointerId) return null;
    this.activeDrag.clientX = toFiniteNumber(
      payload.clientX,
      this.activeDrag.clientX
    );
    this.activeDrag.clientY = toFiniteNumber(
      payload.clientY,
      this.activeDrag.clientY
    );
    return this.activeDrag;
  }

  endDrag(payload = {}) {
    const active = this.activeDrag;
    if (!active) return { accepted: false, reason: "no_active_drag" };
    this.activeDrag = null;
    return this.evaluateDrop({
      itemType: payload.itemType || active.itemType,
      itemId: payload.itemId || active.itemId,
      clientX: toFiniteNumber(payload.clientX, active.clientX),
      clientY: toFiniteNumber(payload.clientY, active.clientY),
      data: payload.data ?? active.data,
      source: payload.source || "drag_end",
    });
  }

  cancelDrag() {
    this.activeDrag = null;
  }

  evaluateDrop(payload = {}) {
    const itemType = String(payload.itemType || "toy")
      .trim()
      .toLowerCase();
    const itemId = payload.itemId ? String(payload.itemId) : null;
    const clientX = toFiniteNumber(payload.clientX, NaN);
    const clientY = toFiniteNumber(payload.clientY, NaN);
    const source = String(payload.source || "drop");

    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
      const rejected = { accepted: false, reason: "invalid_point", source };
      if (this.onRejectedDrop) this.onRejectedDrop(rejected);
      return rejected;
    }

    const zone = normalizeRect(
      this.getDropZone
        ? this.getDropZone({
            itemType,
            itemId,
            clientX,
            clientY,
            data: payload.data || null,
            source,
          })
        : null
    );

    if (!zone) {
      const rejected = { accepted: false, reason: "missing_drop_zone", source };
      if (this.onRejectedDrop) this.onRejectedDrop(rejected);
      return rejected;
    }

    const hitZone = expandRect(zone, this.dropPaddingPx);
    const accepted = pointInRect(clientX, clientY, hitZone);
    const result = {
      accepted,
      itemType,
      itemId,
      clientX,
      clientY,
      source,
      zone: hitZone,
      reason: accepted ? "accepted" : "outside_drop_zone",
      data: payload.data || null,
    };

    if (accepted && this.onAcceptedDrop) this.onAcceptedDrop(result);
    if (!accepted && this.onRejectedDrop) this.onRejectedDrop(result);
    return result;
  }
}

export function createDragAndDropManager(options = {}) {
  return new DragAndDropManager(options);
}

export default DragAndDropManager;
