/**
 * Internal 9-point preset alignment names matching Flutter `Alignment` constants.
 */
export type AlignmentPresetKey =
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
 * Alignment model mirroring Flutter's `Alignment` class (`Alignment.center`,
 * `Alignment.centerLeft`, `new Alignment(x, y)`, `Alignment.custom(x, y)`).
 *
 * Normalized coordinates `(x, y)` map `(-1, -1)` to top-left, `(0, 0)` to
 * center, and `(1, 1)` to bottom-right.
 */
export class Alignment {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new TypeError(
        `Alignment coordinates (x, y) must be finite numbers; received (${x}, ${y}).`,
      );
    }
    this.x = x;
    this.y = y;
    Object.freeze(this);
  }

  static readonly topLeft = new Alignment(-1, -1);
  static readonly topCenter = new Alignment(0, -1);
  static readonly topRight = new Alignment(1, -1);
  static readonly centerLeft = new Alignment(-1, 0);
  static readonly center = new Alignment(0, 0);
  static readonly centerRight = new Alignment(1, 0);
  static readonly bottomLeft = new Alignment(-1, 1);
  static readonly bottomCenter = new Alignment(0, 1);
  static readonly bottomRight = new Alignment(1, 1);

  /** Creates a coordinate-based Alignment (`new Alignment(x, y)`). */
  static custom(x: number, y: number): Alignment {
    return new Alignment(x, y);
  }

  equals(other: unknown): boolean {
    return (
      other instanceof Alignment &&
      other.x === this.x &&
      other.y === this.y
    );
  }

  toString(): string {
    const preset = matchAlignmentPreset(this.x, this.y);
    return preset ? `Alignment.${preset}` : `Alignment(${this.x}, ${this.y})`;
  }
}

/**
 * Alignment accepted by all SmartDialog APIs.
 */
export type SmartAlignment = Alignment;

export interface ResolvedAlignment {
  x: number;
  y: number;
  preset: AlignmentPresetKey | null;
}

const PRESET_TO_COORDS: Record<AlignmentPresetKey, { x: number; y: number }> = {
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

function matchAlignmentPreset(x: number, y: number): AlignmentPresetKey | null {
  for (const [key, coords] of Object.entries(PRESET_TO_COORDS) as [
    AlignmentPresetKey,
    { x: number; y: number },
  ][]) {
    if (coords.x === x && coords.y === y) {
      return key;
    }
  }
  return null;
}

/**
 * Runtime guard enforcing an {@link Alignment} class instance.
 */
export function assertAlignment(
  value: unknown,
  name = 'alignment',
): Alignment {
  if (!(value instanceof Alignment)) {
    throw new TypeError(
      `Invalid ${name}: expected an Alignment instance (e.g. Alignment.center, new Alignment(x, y), or Alignment.custom(x, y)). Bare strings and plain objects are not allowed.`,
    );
  }
  return value;
}

export function resolveAlignment(alignment: Alignment): ResolvedAlignment {
  const validated = assertAlignment(alignment);
  return {
    x: validated.x,
    y: validated.y,
    preset: matchAlignmentPreset(validated.x, validated.y),
  };
}

export function isCenterAlignment(alignment: Alignment): boolean {
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
