import React, { createContext, useContext } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  AttachAdjustParam,
  SmartDialog,
  SmartDialogProvider,
  useBindWidget,
  useSmartDialog,
  useSmartDialogController,
} from '../../src/react';

const ThemeContext = createContext('default-theme');

afterEach(() => {
  cleanup();
});

function ReactDemoHarness() {
  const smartDialog = useSmartDialog();
  const controller = useSmartDialogController();
  const btnRef = useBindWidget<HTMLButtonElement>();
  let count = 1;

  function ContextConsumerDialog({ label }: { label: string }) {
    const theme = useContext(ThemeContext);
    return (
      <div data-testid="react-dialog-box">
        <span>{label}</span>
        <span data-testid="theme-val">{theme}</span>
      </div>
    );
  }

  return (
    <div>
      <button
        ref={btnRef}
        data-testid="open-react-dialog"
        onClick={() => {
          void smartDialog.show({
            tag: 'react-ctx',
            controller,
            useAnimation: false,
            builder: ({ dismiss }) => (
              <div>
                <ContextConsumerDialog label={`Step-${count}`} />
                <button
                  data-testid="close-react-dialog"
                  onClick={() => void dismiss('closed-by-jsx')}
                >
                  Close
                </button>
              </div>
            ),
          });
        }}
      >
        Open Dialog
      </button>
      <button
        data-testid="refresh-react-dialog"
        onClick={() => {
          count += 1;
          controller.refresh();
        }}
      >
        Refresh
      </button>
      <button
        data-testid="open-react-attach"
        onClick={() => {
          void smartDialog.showAttach({
            targetContext: btnRef,
            useAnimation: false,
            builder: () => <div data-testid="raw-attach">Raw</div>,
            adjustBuilder: () =>
              new AttachAdjustParam({
                builder: () => (
                  <div data-testid="adjusted-attach">Adjusted JSX</div>
                ),
              }),
          });
        }}
      >
        Open Attach
      </button>
    </div>
  );
}

describe('React Adapter Integration', () => {
  it('mounts portals inside SmartDialogProvider inheriting React Context and supports refresh + showAttach', async () => {
    render(
      <ThemeContext.Provider value="midnight-purple">
        <SmartDialogProvider>
          <ReactDemoHarness />
        </SmartDialogProvider>
      </ThemeContext.Provider>,
    );

    await act(async () => {
      screen.getByTestId('open-react-dialog').click();
    });

    expect(screen.getByTestId('theme-val').textContent).toBe('midnight-purple');
    expect(screen.getByTestId('react-dialog-box').textContent).toContain(
      'Step-1',
    );

    await act(async () => {
      screen.getByTestId('refresh-react-dialog').click();
    });
    expect(screen.getByTestId('react-dialog-box').textContent).toContain(
      'Step-2',
    );

    await act(async () => {
      screen.getByTestId('open-react-attach').click();
    });
    expect(screen.getByTestId('adjusted-attach').textContent).toBe(
      'Adjusted JSX',
    );

    await act(async () => {
      await SmartDialog.dismiss(); // dismiss attach
      screen.getByTestId('close-react-dialog').click();
    });

    expect(SmartDialog.checkExist()).toBe(false);
  });

  it('works standalone without SmartDialogProvider via createRoot fallback', async () => {
    let resolved: string | undefined;

    await act(async () => {
      void SmartDialog.show<string>({
        useAnimation: false,
        builder: ({ dismiss }) => (
          <button
            data-testid="standalone-close"
            onClick={() => void dismiss('standalone-ok')}
          >
            Standalone React
          </button>
        ),
      }).then((v) => {
        resolved = v;
      });
    });

    expect(screen.getByTestId('standalone-close').textContent).toBe(
      'Standalone React',
    );

    await act(async () => {
      screen.getByTestId('standalone-close').click();
    });

    expect(resolved).toBe('standalone-ok');
  });
});
