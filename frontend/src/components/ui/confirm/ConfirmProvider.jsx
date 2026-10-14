import { useCallback, useRef, useState } from 'react';
import { ConfirmContext } from './ConfirmContext';
import Modal from '../Modal';
import Button from '../Button';
import { useLanguage } from '../../../i18n/useLanguage';

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);
  const { t } = useLanguage();

  const confirm = useCallback(
    (options) => {
      return new Promise((resolve) => {
        resolver.current = resolve;
        setState({
          title: t('confirm.title'),
          confirmLabel: t('confirm.confirm'),
          cancelLabel: t('confirm.cancel'),
          tone: 'primary',
          ...options,
        });
      });
    },
    [t],
  );

  const close = useCallback((result) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(state)}
        onClose={() => close(false)}
        title={state?.title}
        footer={
          <>
            <Button variant="secondary" onClick={() => close(false)}>
              {state?.cancelLabel}
            </Button>
            <Button
              variant={state?.tone === 'danger' ? 'danger' : 'primary'}
              onClick={() => close(true)}
            >
              {state?.confirmLabel}
            </Button>
          </>
        }
      >
        <p>{state?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}
