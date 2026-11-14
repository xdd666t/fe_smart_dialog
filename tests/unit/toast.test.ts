import { describe, expect, it, vi } from 'vitest';
import {
  SmartDialog,
  SmartStatus,
  SmartToastType,
} from '../../src';

describe('Toast System (4 Modes & Lifecycle)', () => {
  it('supports both positional and object showToast signatures and auto-dismisses', async () => {
    vi.useFakeTimers();

    void SmartDialog.showToast('Saved!', {
      displayTime: 500,
      useAnimation: false,
    });
    expect(SmartDialog.config.toast.isExist).toBe(true);
    expect(document.querySelector('.fsd-toast')?.textContent).toBe('Saved!');

    await vi.advanceTimersByTimeAsync(520);
    expect(SmartDialog.config.toast.isExist).toBe(false);

    void SmartDialog.showToast({
      msg: 'Object form',
      displayTime: 400,
      useAnimation: false,
    });
    expect(document.querySelector('.fsd-toast')?.textContent).toBe('Object form');
    await vi.advanceTimersByTimeAsync(420);
    expect(SmartDialog.config.toast.isExist).toBe(false);
  });

  it('normal mode queues serially and last mode preserves isExist across rapid replacement', async () => {
    vi.useFakeTimers();

    // 1. Normal mode: sequential FIFO queue
    void SmartDialog.showToast('First', {
      displayType: SmartToastType.normal,
      displayTime: 400,
      animationTime: 100,
      useAnimation: true,
    });
    void SmartDialog.showToast('Second', {
      displayType: SmartToastType.normal,
      displayTime: 400,
      animationTime: 100,
      useAnimation: true,
    });

    expect(SmartDialog.config.toast.isExist).toBe(true);
    expect(document.body.textContent).toContain('First');
    expect(document.body.textContent).not.toContain('Second');

    // Wait for First (400ms display + 100ms exit + 100ms default interval)
    await vi.advanceTimersByTimeAsync(620);
    expect(SmartDialog.config.toast.isExist).toBe(true);
    expect(document.body.textContent).toContain('Second');

    await vi.advanceTimersByTimeAsync(600);
    expect(SmartDialog.config.toast.isExist).toBe(false);
  });

  it('last mode replaces active toast and keeps only newest across rapid bursts', async () => {
    vi.useFakeTimers();

    void SmartDialog.showToast('Last-A', {
      displayType: SmartToastType.last,
      displayTime: 500,
      animationTime: 100,
      useAnimation: true,
    });
    expect(document.body.textContent).toContain('Last-A');

    // Rapid replacements while Last-A is closing -> intermediate Last-B dropped
    void SmartDialog.showToast('Last-B', {
      displayType: SmartToastType.last,
      displayTime: 500,
      animationTime: 100,
      useAnimation: true,
    });
    void SmartDialog.showToast('Last-C', {
      displayType: SmartToastType.last,
      displayTime: 500,
      animationTime: 100,
      useAnimation: true,
    });

    expect(SmartDialog.config.toast.isExist).toBe(true);
    await vi.advanceTimersByTimeAsync(220);
    expect(SmartDialog.config.toast.isExist).toBe(true);
    expect(document.body.textContent).not.toContain('Last-A');
    expect(document.body.textContent).not.toContain('Last-B');
    expect(document.body.textContent).toContain('Last-C');

    await vi.advanceTimersByTimeAsync(650);
    expect(SmartDialog.config.toast.isExist).toBe(false);
  });

  it('onlyRefresh mode reuses a single toast and resets its timer', async () => {
    vi.useFakeTimers();

    void SmartDialog.showToast('Step 1', {
      displayType: SmartToastType.onlyRefresh,
      displayTime: 400,
      useAnimation: false,
    });
    await vi.advanceTimersByTimeAsync(300);

    void SmartDialog.showToast('Step 2', {
      displayType: SmartToastType.onlyRefresh,
      displayTime: 400,
      useAnimation: false,
    });
    expect(document.querySelectorAll('.fsd-toast')).toHaveLength(1);
    expect(document.querySelector('.fsd-toast')?.textContent).toBe('Step 2');

    // Original timer at 400ms was reset, so at +200ms it must still be visible
    await vi.advanceTimersByTimeAsync(200);
    expect(SmartDialog.config.toast.isExist).toBe(true);

    await vi.advanceTimersByTimeAsync(250);
    expect(SmartDialog.config.toast.isExist).toBe(false);
  });

  it('multi mode renders concurrent toasts and dismiss prioritizes serial before multi', async () => {
    vi.useFakeTimers();

    void SmartDialog.showToast('Multi 1', {
      displayType: SmartToastType.multi,
      displayTime: 2000,
      useAnimation: false,
    });
    void SmartDialog.showToast('Multi 2', {
      displayType: SmartToastType.multi,
      displayTime: 2000,
      useAnimation: false,
    });
    void SmartDialog.showToast('Serial', {
      displayType: SmartToastType.normal,
      displayTime: 2000,
      useAnimation: false,
    });

    expect(document.querySelectorAll('.fsd-toast').length).toBeGreaterThanOrEqual(3);

    // Single toast dismiss clears serial first, leaving multi toasts alive
    await SmartDialog.dismiss({ status: SmartStatus.toast });
    expect(document.body.textContent).not.toContain('Serial');
    expect(document.body.textContent).toContain('Multi 1');
    expect(document.body.textContent).toContain('Multi 2');

    // Next single toast dismiss clears multi FIFO/LIFO one at a time, then allToast clears remaining
    await SmartDialog.dismiss({ status: SmartStatus.toast });
    await SmartDialog.dismiss({ status: SmartStatus.allToast });
    expect(SmartDialog.config.toast.isExist).toBe(false);
  });

  it('last mode drops middle queued toast when back-to-back calls happen synchronously', async () => {
    vi.useFakeTimers();

    void SmartDialog.showToast('First Toast', {
      displayType: SmartToastType.last,
      displayTime: 300,
      useAnimation: false,
    });
    void SmartDialog.showToast('Dropped Middle', {
      displayType: SmartToastType.last,
      displayTime: 300,
      useAnimation: false,
    });
    void SmartDialog.showToast('Last Toast', {
      displayType: SmartToastType.last,
      displayTime: 300,
      useAnimation: false,
    });

    // Wait for microtask settlement of detached replacement
    await vi.advanceTimersByTimeAsync(20);
    expect(document.body.textContent).toContain('Last Toast');
    expect(document.body.textContent).not.toContain('Dropped Middle');

    await vi.advanceTimersByTimeAsync(320);
    expect(SmartDialog.config.toast.isExist).toBe(false);
  });
});
