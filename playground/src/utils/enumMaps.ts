import {
  Alignment,
  SmartAnimationType,
  SmartAttachAlignmentType,
  SmartTheme,
} from 'fe-smart-dialog';

export const PRESET_ALIGNMENT_ENTRIES: ReadonlyArray<{
  name: string;
  value: Alignment;
}> = [
  { name: 'topLeft', value: Alignment.topLeft },
  { name: 'topCenter', value: Alignment.topCenter },
  { name: 'topRight', value: Alignment.topRight },
  { name: 'centerLeft', value: Alignment.centerLeft },
  { name: 'center', value: Alignment.center },
  { name: 'centerRight', value: Alignment.centerRight },
  { name: 'bottomLeft', value: Alignment.bottomLeft },
  { name: 'bottomCenter', value: Alignment.bottomCenter },
  { name: 'bottomRight', value: Alignment.bottomRight },
];

export const ALIGNMENT_BY_KEY: Record<string, Alignment> = Object.fromEntries(
  PRESET_ALIGNMENT_ENTRIES.map((item) => [item.name, item.value]),
);

export const ATTACH_ALIGNMENT_BY_KEY: Record<string, SmartAttachAlignmentType> = {
  inside: SmartAttachAlignmentType.inside,
  center: SmartAttachAlignmentType.center,
  outside: SmartAttachAlignmentType.outside,
};

export const ANIMATION_TYPE_BY_KEY: Record<string, SmartAnimationType> = {
  fade: SmartAnimationType.fade,
  scale: SmartAnimationType.scale,
  centerFade_otherSlide: SmartAnimationType.centerFade_otherSlide,
  centerScale_otherSlide: SmartAnimationType.centerScale_otherSlide,
};

export const THEME_BY_KEY: Record<string, SmartTheme> = {
  auto: SmartTheme.auto,
  light: SmartTheme.light,
  dark: SmartTheme.dark,
};
