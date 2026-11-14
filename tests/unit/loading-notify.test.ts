import { describe, expect, it, vi } from 'vitest';
import {
  NotifyType,
  SmartAllDialogType,
  SmartDialog,
  SmartStatus,
} from '../../src';

describe('Loading & Notify Systems', () => {
  it('showLoading respects leastLoadingTime: 0 synchronous dismissal readiness', async () => {
    SmartDialog.config.loading.leastLoadingTime = 0;
    const onDismiss = vi.fn();

    void SmartDialog.showLoading({
      msg: 'Quick Loading',
      useAnimation: false,
      onDismiss,
    });

    expect(SmartDialog.config.loading.isExist).toBe(true);
    expect(document.querySelector('.fsd-loading')?.textContent).toContain(
      'Quick Loading',
    );

    await SmartDialog.dismiss({ status: SmartStatus.loading });
    expect(SmartDialog.config.loading.isExist).toBe(false);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('showLoading defers dismissal until positive leastLoadingTime elapses', async () => {
    vi.useFakeTimers();
    SmartDialog.config.loading.leastLoadingTime = 500;
    const onDismiss = vi.fn();

    void SmartDialog.showLoading({
      msg: 'Min Time Loading',
      useAnimation: false,
      onDismiss,
    });

    expect(SmartDialog.config.loading.isExist).toBe(true);

    // Trigger dismiss immediately -> must stay visible until 500ms elapses
    const dismissPromise = SmartDialog.dismiss({ status: SmartStatus.loading });
    await vi.advanceTimersByTimeAsync(200);
    expect(SmartDialog.config.loading.isExist).toBe(true);
    expect(onDismiss).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(350);
    await dismissPromise;
    expect(SmartDialog.config.loading.isExist).toBe(false);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('showLoading reuses singleton when called consecutively', async () => {
    SmartDialog.config.loading.leastLoadingTime = 0;

    void SmartDialog.showLoading({ msg: 'Phase 1', useAnimation: false });
    void SmartDialog.showLoading({ msg: 'Phase 2', useAnimation: false });

    expect(document.querySelectorAll('.fsd-loading')).toHaveLength(1);
    expect(document.querySelector('.fsd-loading')?.textContent).toContain(
      'Phase 2',
    );

    await SmartDialog.dismiss({ status: SmartStatus.loading });
    expect(SmartDialog.config.loading.isExist).toBe(false);
  });

  it('showNotify supports all 5 NotifyTypes, keepSingle, and allNotify dismissal', async () => {
    for (const type of Object.values(NotifyType)) {
      void SmartDialog.showNotify({
        notifyType: type,
        msg: `Notify ${type}`,
        useAnimation: false,
      });
      expect(
        document.querySelector(`[data-fsd-notify-type="${type}"]`),
      ).not.toBeNull();
      await SmartDialog.dismiss({ status: SmartStatus.notify });
    }

    // keepSingle notify reuses same element
    void SmartDialog.showNotify({
      notifyType: NotifyType.success,
      tag: 'sync',
      keepSingle: true,
      msg: 'Sync 1',
      useAnimation: false,
    });
    void SmartDialog.showNotify({
      notifyType: NotifyType.warning,
      tag: 'sync',
      keepSingle: true,
      msg: 'Sync 2',
      useAnimation: false,
    });

    expect(document.querySelectorAll('.fsd-notify')).toHaveLength(1);
    expect(document.querySelector('.fsd-notify')?.textContent).toContain(
      'Sync 2',
    );
    expect(SmartDialog.checkExist({ dialogTypes: [SmartAllDialogType.notify] })).toBe(
      true,
    );

    await SmartDialog.dismiss({ status: SmartStatus.allNotify });
    expect(SmartDialog.checkExist({ dialogTypes: [SmartAllDialogType.notify] })).toBe(
      false,
    );
  });

  it('SmartStatus.smart closes in priority order: loading -> notify -> dialog (leaving toast)', async () => {
    SmartDialog.config.loading.leastLoadingTime = 0;

    void SmartDialog.showToast('Toast Layer', {
      displayTime: 5000,
      useAnimation: false,
    });
    void SmartDialog.show({
      useAnimation: false,
      builder: () => 'Dialog Layer',
    });
    void SmartDialog.showNotify({
      notifyType: NotifyType.alert,
      msg: 'Notify Layer',
      useAnimation: false,
    });
    void SmartDialog.showLoading({ msg: 'Loading Layer', useAnimation: false });

    // 1. Loading
    await SmartDialog.dismiss();
    expect(SmartDialog.config.loading.isExist).toBe(false);
    expect(
      SmartDialog.checkExist({ dialogTypes: [SmartAllDialogType.notify] }),
    ).toBe(true);

    // 2. Notify
    await SmartDialog.dismiss();
    expect(
      SmartDialog.checkExist({ dialogTypes: [SmartAllDialogType.notify] }),
    ).toBe(false);
    expect(
      SmartDialog.checkExist({ dialogTypes: [SmartAllDialogType.custom] }),
    ).toBe(true);

    // 3. Dialog
    await SmartDialog.dismiss();
    expect(
      SmartDialog.checkExist({ dialogTypes: [SmartAllDialogType.custom] }),
    ).toBe(false);
    expect(SmartDialog.config.toast.isExist).toBe(true);

    // 4. SmartStatus.smart does not dismiss toast; explicit toast dismiss closes it
    await SmartDialog.dismiss();
    expect(SmartDialog.config.toast.isExist).toBe(true);
    await SmartDialog.dismiss({ status: SmartStatus.toast });
    expect(SmartDialog.config.toast.isExist).toBe(false);
  });
});
