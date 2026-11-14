import { Layout as BaseLayout } from '@rspress/core/theme-original';
import { Content, ThemeContext, useLang } from '@rspress/core/runtime';
import type { ComponentProps } from 'react';
import { useContext, useEffect, useState } from 'react';
import { SmartDialog, SmartTheme } from 'fe-smart-dialog';
import { SmartDialogProvider } from 'fe-smart-dialog/react';
import { getWorkbenchHref } from '../components/workbenchUrl';

export * from '@rspress/core/theme-original';

function ThemeAndDialogSync() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    SmartDialog.init({
      theme: theme === 'dark' ? SmartTheme.dark : SmartTheme.light,
    });
  }, [theme]);

  return null;
}

function WorkbenchNavAction() {
  const lang = useLang();
  const isEn = lang === 'en';
  return (
    <a
      href={getWorkbenchHref()}
      data-testid="docs-nav-workbench"
      className="fsd-nav-workbench-pill"
    >
      <span className="fsd-nav-workbench-dot" aria-hidden="true" />
      <span>{isEn ? '37-Demo Workbench' : '37 个交互工作台'}</span>
      <span aria-hidden="true">-&gt;</span>
    </a>
  );
}

export function Layout(props: ComponentProps<typeof BaseLayout>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <BaseLayout
        {...props}
        afterFeatures={
          <>
            {props.afterFeatures}
            <div style={{ padding: '0 24px' }}>
              <Content />
            </div>
          </>
        }
        afterRightNavItems={
          <>
            {props.afterRightNavItems}
            <WorkbenchNavAction />
          </>
        }
      />
      {mounted && (
        <SmartDialogProvider>
          <ThemeAndDialogSync />
        </SmartDialogProvider>
      )}
    </>
  );
}
