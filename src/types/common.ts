/**
 * Standard 9-point preset alignment names matching Flutter Alignment constants.
 */
export type SmartPresetAlignment =
  | 'center'
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'centerLeft'
  | 'centerRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

/**
 * Numeric coordinate alignment in [-1, 1] space (where (0, 0) is center).
 */
export interface SmartCoordinateAlignment {
  readonly x: number;
  readonly y: number;
}

/**
 * Alignment accepted by all SmartDialog APIs.
 */
export type SmartAlignment = SmartPresetAlignment | SmartCoordinateAlignment;

/**
 * Flutter-compatible Alignment helper constants and custom factory.
 */
export const Alignment = {
  topLeft: 'topLeft' as const,
  topCenter: 'topCenter' as const,
  topRight: 'topRight' as const,
  centerLeft: 'centerLeft' as const,
  center: 'center' as const,
  centerRight: 'centerRight' as const,
  bottomLeft: 'bottomLeft' as const,
  bottomCenter: 'bottomCenter' as const,
  bottomRight: 'bottomRight' as const,
  custom(x: number, y: number): SmartCoordinateAlignment {
    return { x, y };
  },
} as const;

export interface ResolvedAlignment {
  x: number;
  y: number;
  preset: SmartPresetAlignment | null;
}

const PRESET_TO_COORDS: Record<SmartPresetAlignment, { x: number; y: number }> = {
  topLeft: { x: -1, y: -1 },
  topCenter: { x: 0, y: -1 },
  topRight: { x: 1, y: -1 },
  centerLeft: { x: -1, y: 0 },
  center: { x: 0, y: 0 },
  centerRight: { x: 1, y: 0 },
  bottomLeft: { x: -1, y: 1 },
  bottomCenter: { x: 0, y: 1 },
  bottomRight: { x: 1, y: 1 },
};

export function resolveAlignment(alignment: SmartAlignment): ResolvedAlignment {
  if (typeof alignment === 'string') {
    const coords = PRESET_TO_COORDS[alignment];
    return { x: coords.x, y: coords.y, preset: alignment };
  }

  let matched: SmartPresetAlignment | null = null;
  for (const [key, coords] of Object.entries(PRESET_TO_COORDS) as [
    SmartPresetAlignment,
    { x: number; y: number },
  ][]) {
    if (coords.x === alignment.x && coords.y === alignment.y) {
      matched = key;
      break;
    }
  }

  return { x: alignment.x, y: alignment.y, preset: matched };
}

export function isCenterAlignment(alignment: SmartAlignment): boolean {
  const resolved = resolveAlignment(alignment);
  return resolved.x === 0 && resolved.y === 0;
}

/**
 * Duration accepted by SmartDialog APIs: milliseconds (`number`) or `{ milliseconds, seconds }`.
 */
export type SmartDuration =
  | number
  | {
      milliseconds?: number;
      seconds?: number;
    };

/**
 * Flutter-compatible Duration helper.
 */
export const Duration = {
  zero: 0,
  milliseconds(value: number): number {
    return Math.max(0, value);
  },
  seconds(value: number): number {
    return Math.max(0, value * 1000);
  },
  from(input: { milliseconds?: number; seconds?: number }): number {
    const ms = (input.seconds ?? 0) * 1000 + (input.milliseconds ?? 0);
    return Math.max(0, ms);
  },
} as const;

export function resolveDurationMs(duration: SmartDuration | undefined): number {
  if (duration === undefined) return 0;
  if (typeof duration === 'number') {
    return Number.isFinite(duration) ? Math.max(0, duration) : 0;
  }
  const ms = (duration.seconds ?? 0) * 1000 + (duration.milliseconds ?? 0);
  return Number.isFinite(ms) ? Math.max(0, ms) : 0;
}

/**
 * Inset rectangle (`ignoreArea` / `maskIgnoreArea`) specifying top/right/bottom/left gaps in px.
 */
export interface SmartRect {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}

/**
 * Flutter-compatible Rect helper for `ignoreArea` and `maskIgnoreArea`.
 */
export const Rect = {
  zero: { left: 0, top: 0, right: 0, bottom: 0 } as Readonly<Required<SmartRect>>,
  fromLTRB(
    left: number,
    top: number,
    right: number,
    bottom: number,
  ): Required<SmartRect> {
    return { left, top, right, bottom };
  },
  fromLTWH(
    left: number,
    top: number,
    width: number,
    height: number,
  ): Required<SmartRect> {
    return { left, top, right: left + width, bottom: top + height };
  },
} as const;

export interface SmartOffset {
  x: number;
  y: number;
  readonly dx?: number;
  readonly dy?: number;
}

export interface SmartResolvedOffset extends SmartOffset {
  readonly dx: number;
  readonly dy: number;
}

export interface OffsetConstructor {
  (x: number, y: number): SmartResolvedOffset;
  new (x: number, y: number): SmartResolvedOffset;
  readonly zero: Readonly<SmartResolvedOffset>;
}

function createOffset(x: number, y: number): SmartResolvedOffset {
  return { x, y, dx: x, dy: y };
}

export const Offset: OffsetConstructor = Object.assign(
  function Offset(this: unknown, x: number, y: number): SmartResolvedOffset {
    return createOffset(x, y);
  } as unknown as OffsetConstructor,
  {
    zero: Object.freeze(createOffset(0, 0)),
  },
);

export interface SmartSize {
  width: number;
  height: number;
}

export interface SizeConstructor {
  (width: number, height: number): SmartSize;
  new (width: number, height: number): SmartSize;
  readonly zero: Readonly<SmartSize>;
}

export const Size: SizeConstructor = Object.assign(
  function Size(this: unknown, width: number, height: number): SmartSize {
    return { width, height };
  } as unknown as SizeConstructor,
  {
    zero: Object.freeze({ width: 0, height: 0 }),
  },
);
