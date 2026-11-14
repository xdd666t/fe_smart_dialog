import { createContext, useContext, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Alignment,
  SmartDialogProvider,
  useBindWidget,
  useSmartDialog,
  useSmartDialogController,
} from 'fe-smart-dialog/react';

const ReactThemeContext = createContext('react-default-theme');

function ContextAwareModal({
  initialLabel,
  onRefresh,
  onClose,
}: {
  initialLabel: string;
  onRefresh: () => void;
  onClose: () => void;
}) {
  const theme = useContext(ReactThemeContext);
  const [clicks, setClicks] = useState(0);

  return (
    <div className="pg-dialog-box" data-testid="react-pg-modal">
      <h4 style={{ margin: '0 0 8px' }}>React 19 Portal Modal</h4>
      <p style={{ margin: '0 0 8px' }}>
        Context Value: <strong data-testid="react-pg-theme">{theme}</strong>
      </p>
      <p style={{ margin: '0 0 12px' }}>
        Controller Prop:{' '}
        <strong data-testid="react-pg-label">{initialLabel}</strong>
      </p>
      <div className="pg-actions">
        <button
          className="pg-btn pg-btn--primary"
          data-testid="react-pg-state-btn"
          onClick={() => setClicks((c) => c + 1)}
        >
          Internal State: {clicks}
        </button>
        <button
          className="pg-btn"
          data-testid="react-pg-modal-refresh"
          onClick={onRefresh}
        >
          Refresh Label
        </button>
        <button className="pg-btn" data-testid="react-pg-close" onClick={onClose}>
          Close (react-done)
        </button>
      </div>
    </div>
  );
}

function ReactPlaygroundInner() {
  const dialog = useSmartDialog();
  const controller = useSmartDialogController();
  const anchorRef = useBindWidget<HTMLButtonElement>();
  const stepRef = useRef(1);
  const [resultText, setResultText] = useState('none');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div className="pg-card">
        <h4>React Context Inheritance + Controller</h4>
        <p>Dialogs inherit ReactThemeContext and retain internal React state across controller.refresh().</p>
        <div className="pg-actions" style={{ marginBottom: '10px', justifyContent: 'flex-start' }}>
          <button
            className="pg-btn pg-btn--primary"
            data-testid="btn-react-open"
            onClick={() => {
              stepRef.current = 1;
              void dialog
                .show<string>({
                  tag: 'react-pg-dialog',
                  controller,
                  useAnimation: false,
                  builder: ({ dismiss }) => (
                    <ContextAwareModal
                      initialLabel={`Step-${stepRef.current}`}
                      onRefresh={() => {
                        stepRef.current += 1;
                        controller.refresh();
                      }}
                      onClose={() => void dismiss('react-done')}
                    />
                  ),
                })
                .then((res) => setResultText(res ?? 'closed'));
            }}
          >
            Open React Dialog
          </button>
          <button
            className="pg-btn"
            data-testid="btn-react-refresh"
            onClick={() => {
              stepRef.current += 1;
              controller.refresh();
            }}
          >
            Controller Refresh
          </button>
        </div>
        <div className="pg-badge" data-testid="react-pg-result">
          Result: {resultText}
        </div>
      </div>

      <div className="pg-card">
        <h4>React useBindWidget + showAttach</h4>
        <p>Attach JSX popovers directly to React refs.</p>
        <div className="pg-actions" style={{ justifyContent: 'flex-start' }}>
          <button
            ref={anchorRef}
            className="pg-btn pg-btn--primary"
            data-testid="btn-react-attach"
            onClick={() => {
              void dialog.showAttach({
                targetContext: anchorRef,
                alignment: Alignment.bottomCenter,
                useAnimation: false,
                builder: () => (
                  <div className="pg-popover" data-testid="react-pg-popover">
                    React Ref Attached Popover
                  </div>
                ),
              });
            }}
          >
            React Attach Anchor
          </button>
        </div>
      </div>
    </div>
  );
}

export function mountReactDemo(container: HTMLElement): () => void {
  // Isolate React's sub-root in its own host node and defer unmount to a microtask
  // so cleaning up inside the outer React playground's effect never collides with commit/DOM clears.
  const host = document.createElement('div');
  host.style.width = '100%';
  container.appendChild(host);

  const root = createRoot(host);
  root.render(
    <ReactThemeContext.Provider value="react-ocean">
      <SmartDialogProvider>
        <ReactPlaygroundInner />
      </SmartDialogProvider>
    </ReactThemeContext.Provider>,
  );

  return () => {
    host.remove();
    queueMicrotask(() => {
      root.unmount();
    });
  };
}
