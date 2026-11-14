import {
  NotifyType,
  SmartAllDialogType,
  SmartAnimationType,
  SmartAttachAlignmentType,
  SmartAwaitOverType,
  SmartBackType,
  SmartHighlightShape,
  SmartInitType,
  SmartMaskTriggerType,
  SmartNonAnimationType,
  SmartStatus,
  SmartTheme,
  SmartToastType,
  assertEnumArray,
  assertEnumIterable,
  assertEnumValue,
} from './enums';
import { Alignment, assertAlignment, type SmartAlignment } from '../types/common';

export interface ValidatedCommonConfigFields {
  alignment?: unknown;
  animationType?: unknown;
  awaitOverType?: unknown;
  maskTriggerType?: unknown;
  nonAnimationTypes?: unknown;
  backType?: unknown;
  attachAlignmentType?: unknown;
  displayType?: unknown;
  notifyType?: unknown;
}

/**
 * Defines an enumerable property backed by a validated local slot so both
 * constructor initialization and direct property assignments reject invalid
 * non-enum / non-Alignment values immediately at runtime.
 */
export function bindValidatedProperty<T>(
  target: object,
  key: string,
  initialValue: T,
  validator: (value: unknown, name: string) => T,
  label = key,
): void {
  let current = validator(initialValue, label);
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: () => current,
    set: (next: unknown) => {
      current = validator(next, label);
    },
  });
}

export function bindCommonValidatedConfigFields(
  target: object,
  prefix: string,
  values: {
    alignment: SmartAlignment;
    animationType: SmartAnimationType;
    awaitOverType: SmartAwaitOverType;
    maskTriggerType: SmartMaskTriggerType;
    nonAnimationTypes: SmartNonAnimationType[];
  },
): void {
  bindValidatedProperty(
    target,
    'alignment',
    values.alignment,
    assertAlignment,
    `${prefix}.alignment`,
  );
  bindValidatedProperty(
    target,
    'animationType',
    values.animationType,
    (v, n) => assertEnumValue(SmartAnimationType, v, n),
    `${prefix}.animationType`,
  );
  bindValidatedProperty(
    target,
    'awaitOverType',
    values.awaitOverType,
    (v, n) => assertEnumValue(SmartAwaitOverType, v, n),
    `${prefix}.awaitOverType`,
  );
  bindValidatedProperty(
    target,
    'maskTriggerType',
    values.maskTriggerType,
    (v, n) => assertEnumValue(SmartMaskTriggerType, v, n),
    `${prefix}.maskTriggerType`,
  );
  bindValidatedProperty(
    target,
    'nonAnimationTypes',
    values.nonAnimationTypes,
    (v, n) => assertEnumArray(SmartNonAnimationType, v, n),
    `${prefix}.nonAnimationTypes`,
  );
}

/**
 * Validates optional runtime enum / Alignment properties passed to show* methods.
 */
export function validateRuntimeDialogOptions(
  apiName: string,
  options: ValidatedCommonConfigFields,
): void {
  if (options.alignment !== undefined) {
    assertAlignment(options.alignment, `${apiName}.alignment`);
  }
  if (options.animationType !== undefined) {
    assertEnumValue(
      SmartAnimationType,
      options.animationType,
      `${apiName}.animationType`,
    );
  }
  if (options.awaitOverType !== undefined) {
    assertEnumValue(
      SmartAwaitOverType,
      options.awaitOverType,
      `${apiName}.awaitOverType`,
    );
  }
  if (options.maskTriggerType !== undefined) {
    assertEnumValue(
      SmartMaskTriggerType,
      options.maskTriggerType,
      `${apiName}.maskTriggerType`,
    );
  }
  if (options.nonAnimationTypes !== undefined) {
    assertEnumArray(
      SmartNonAnimationType,
      options.nonAnimationTypes,
      `${apiName}.nonAnimationTypes`,
    );
  }
  if (options.backType !== undefined) {
    assertEnumValue(SmartBackType, options.backType, `${apiName}.backType`);
  }
  if (options.attachAlignmentType !== undefined) {
    assertEnumValue(
      SmartAttachAlignmentType,
      options.attachAlignmentType,
      `${apiName}.attachAlignmentType`,
    );
  }
  if (options.displayType !== undefined) {
    assertEnumValue(
      SmartToastType,
      options.displayType,
      `${apiName}.displayType`,
    );
  }
  if (options.notifyType !== undefined) {
    assertEnumValue(
      NotifyType,
      options.notifyType,
      `${apiName}.notifyType`,
    );
  }
}

export {
  Alignment,
  NotifyType,
  SmartAllDialogType,
  SmartAttachAlignmentType,
  SmartBackType,
  SmartHighlightShape,
  SmartInitType,
  SmartStatus,
  SmartTheme,
  SmartToastType,
  assertAlignment,
  assertEnumArray,
  assertEnumIterable,
  assertEnumValue,
};
