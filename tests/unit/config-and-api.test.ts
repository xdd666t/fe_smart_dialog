import { describe, expect, it } from 'vitest';
import {
  Alignment,
  Duration,
  FlutterSmartNotifyStyle,
  NotifyType,
  Offset,
  Rect,
  Size,
  SmartAllDialogType,
  SmartAnimationType,
  SmartAttachAlignmentType,
  SmartAwaitOverType,
  SmartBackType,
  SmartConfig,
  SmartConfigCustom,
  SmartDialog,
  SmartDialogController,
  SmartHighlightShape,
  SmartInitType,
  SmartMaskTriggerType,
  SmartNonAnimationType,
  SmartNotifyStyle,
  SmartStatus,
  SmartTheme,
  SmartToastType,
  html,
  isCenterAlignment,
  resolveAlignment,
  resolveDurationMs,
} from '../../src';

describe('Public API Compatibility & Config', () => {
  it('exposes all 13 strict enums with expected members', () => {
    expect(Object.values(SmartStatus)).toEqual([
      'smart',
      'toast',
      'allToast',
      'loading',
      'custom',
      'attach',
      'dialog',
      'notify',
      'allCustom',
      'allAttach',
      'allDialog',
      'allNotify',
    ]);
    expect(Object.values(SmartAllDialogType)).toEqual([
      'custom',
      'attach',
      'notify',
      'loading',
      'toast',
    ]);
    expect(Object.values(SmartToastType)).toEqual([
      'normal',
      'last',
      'onlyRefresh',
      'multi',
    ]);
    expect(Object.values(SmartAnimationType)).toEqual([
      'fade',
      'scale',
      'centerFade_otherSlide',
      'centerScale_otherSlide',
    ]);
    expect(Object.values(SmartAwaitOverType)).toEqual([
      'dialogDismiss',
      'dialogAppear',
      'none',
    ]);
    expect(Object.values(SmartMaskTriggerType)).toEqual([
      'down',
      'move',
      'up',
    ]);
    expect(Object.values(SmartNonAnimationType)).toEqual([
      'openDialog_nonAnimation',
      'closeDialog_nonAnimation',
      'routeClose_nonAnimation',
      'maskClose_nonAnimation',
      'backClose_nonAnimation',
      'highlightMask_nonAnimation',
      'continueLoading_nonAnimation',
      'continueKeepSingle',
    ]);
    expect(Object.values(SmartAttachAlignmentType)).toEqual([
      'inside',
      'center',
      'outside',
    ]);
    expect(Object.values(SmartInitType)).toEqual([
      'custom',
      'attach',
      'notify',
      'loading',
      'toast',
    ]);
    expect(Object.values(SmartBackType)).toEqual([
      'normal',
      'block',
      'ignore',
    ]);
    expect(Object.values(NotifyType)).toEqual([
      'success',
      'failure',
      'warning',
      'error',
      'alert',
    ]);
    expect(Object.values(SmartHighlightShape)).toEqual(['rect', 'circle']);
    expect(Object.values(SmartTheme)).toEqual(['auto', 'light', 'dark']);
  });

  it('provides Alignment class, Duration, Offset, Rect, Size Flutter-style helpers', () => {
    expect(Alignment.topLeft).toBeInstanceOf(Alignment);
    expect(resolveAlignment(Alignment.topLeft)).toEqual({
      x: -1,
      y: -1,
      preset: 'topLeft',
    });
    expect(resolveAlignment(Alignment.bottomRight)).toEqual({
      x: 1,
      y: 1,
      preset: 'bottomRight',
    });
    expect(resolveAlignment(new Alignment(0.5, -0.5))).toEqual({
      x: 0.5,
      y: -0.5,
      preset: null,
    });
    expect(resolveAlignment(Alignment.custom(0, -1))).toEqual({
      x: 0,
      y: -1,
      preset: 'topCenter',
    });
    expect(isCenterAlignment(Alignment.center)).toBe(true);
    expect(isCenterAlignment(new Alignment(0, 0))).toBe(true);
    expect(isCenterAlignment(Alignment.topCenter)).toBe(false);
    expect(Alignment.centerLeft.equals(new Alignment(-1, 0))).toBe(true);
    expect(Alignment.centerLeft.toString()).toBe('Alignment.centerLeft');
    expect(Alignment.custom(0.25, 0.5).toString()).toBe('Alignment(0.25, 0.5)');

    expect(resolveDurationMs(Duration.milliseconds(350))).toBe(350);
    expect(resolveDurationMs(Duration.seconds(2))).toBe(2000);
    expect(resolveDurationMs(125)).toBe(125);

    const rect = Rect.fromLTWH(10, 20, 100, 50);
    expect(rect).toEqual({ left: 10, top: 20, right: 110, bottom: 70 });
    expect(new Offset(60, 45).dx).toBe(60);
    expect(new Size(100, 50).width).toBe(100);
  });

  it('rejects bare strings and invalid enum values strictly at runtime', async () => {
    expect(() => resolveAlignment('bottomRight' as unknown as Alignment)).toThrow(
      TypeError,
    );
    expect(() =>
      resolveAlignment({ x: 0, y: 0 } as unknown as Alignment),
    ).toThrow(TypeError);
    expect(() => isCenterAlignment('center' as unknown as Alignment)).toThrow(
      TypeError,
    );
    expect(() => new Alignment(Number.NaN, 0)).toThrow(TypeError);

    expect(() =>
      new SmartConfigCustom({ alignment: 'centerLeft' as unknown as Alignment }),
    ).toThrow(TypeError);
    expect(() => {
      const cfg = new SmartConfigCustom();
      cfg.alignment = 'bottomCenter' as unknown as Alignment;
    }).toThrow(TypeError);
    expect(() => {
      const cfg = new SmartConfigCustom();
      cfg.animationType = 'bounce' as unknown as SmartAnimationType;
    }).toThrow(TypeError);

    expect(() =>
      SmartDialog.init({ theme: 'midnight' as unknown as SmartTheme }),
    ).toThrow(TypeError);
    expect(() =>
      SmartDialog.init({ initType: new Set(['modal' as unknown as SmartInitType]) }),
    ).toThrow(TypeError);
    expect(() =>
      SmartDialog.checkExist({
        dialogTypes: ['modal' as unknown as SmartAllDialogType],
      }),
    ).toThrow(TypeError);

    await expect(
      SmartDialog.show({
        alignment: 'centerLeft' as unknown as Alignment,
        builder: () => 'x',
      }),
    ).rejects.toThrow(TypeError);
    await expect(
      SmartDialog.show({
        animationType: 'slide' as unknown as SmartAnimationType,
        builder: () => 'x',
      }),
    ).rejects.toThrow(TypeError);
    await expect(
      SmartDialog.showNotify({
        notifyType: 'info' as unknown as NotifyType,
        msg: 'x',
      }),
    ).rejects.toThrow(TypeError);
    await expect(
      SmartDialog.showLoading({
        backType: 'allow' as unknown as SmartBackType,
      }),
    ).rejects.toThrow(TypeError);
    await expect(
      SmartDialog.showToast('x', {
        displayType: 'stack' as unknown as SmartToastType,
      }),
    ).rejects.toThrow(TypeError);
    await expect(
      SmartDialog.dismiss({
        status: 'invalid' as unknown as SmartStatus,
      }),
    ).rejects.toThrow(TypeError);
  });

  it('maintains default SmartConfig and allows replacing SmartDialog.config', () => {
    const customConfig = new SmartConfig();
    customConfig.custom.alignment = Alignment.bottomCenter;
    customConfig.toast.displayTime = Duration.seconds(3);
    SmartDialog.config = customConfig;

    expect(SmartDialog.config).toBe(customConfig);
    expect(SmartDialog.config.custom.alignment).toBe(Alignment.bottomCenter);
    expect(SmartDialog.config.toast.displayTime).toBe(3000);
    expect(SmartDialog.config.custom.isExist).toBe(false);
    expect(SmartDialog.config.loading.isExist).toBe(false);
    expect(SmartDialog.config.toast.isExist).toBe(false);
  });

  it('supports init options including styleBuilder, custom builders, and injectStyles: false', async () => {
    expect(FlutterSmartNotifyStyle).toBe(SmartNotifyStyle);

    SmartDialog.init({
      injectStyles: false,
      theme: SmartTheme.dark,
      zIndexBase: 12000,
      toastBuilder: (msg) => html`<span class="custom-toast">${msg}</span>`,
      loadingBuilder: (msg) => html`<span class="custom-loading">${msg}</span>`,
      notifyStyle: new SmartNotifyStyle({
        successBuilder: (msg) => html`<span class="custom-ok">${msg}</span>`,
      }),
      styleBuilder: (child) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-theme-shell';
        wrapper.appendChild(child);
        return wrapper;
      },
    });

    expect(document.head.querySelector('#fe-smart-dialog-styles')).toBeNull();
    const root = document.querySelector('.fsd-root') as HTMLElement;
    expect(root.getAttribute('data-fsd-theme')).toBe('dark');
    expect(root.querySelector('.custom-theme-shell')).not.toBeNull();

    void SmartDialog.showToast('<script>xss</script>', { useAnimation: false });
    const toast = document.querySelector('.custom-toast');
    expect(toast?.textContent).toBe('<script>xss</script>');
    expect(document.querySelector('script')).toBeNull();

    void SmartDialog.showLoading({ msg: 'Wait', useAnimation: false });
    expect(document.querySelector('.custom-loading')?.textContent).toBe('Wait');

    void SmartDialog.showNotify({
      notifyType: NotifyType.success,
      msg: 'Saved',
      useAnimation: false,
    });
    expect(document.querySelector('.custom-ok')?.textContent).toBe('Saved');

    await SmartDialog.dismiss({ status: SmartStatus.allToast, force: true });
    await SmartDialog.dismiss({ status: SmartStatus.loading, force: true });
    await SmartDialog.dismiss({ status: SmartStatus.allNotify, force: true });
  });

  it('supports SmartDialogController instance construction', () => {
    const controller = new SmartDialogController();
    expect(typeof controller.refresh).toBe('function');
  });
});
