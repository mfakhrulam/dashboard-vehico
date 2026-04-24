import { useEffect, useMemo, useState } from 'react';
import { useBlocker } from 'react-router';

const DEFAULT_MESSAGE = 'Perubahan belum disimpan. Anda yakin ingin meninggalkan halaman ini?';

interface UseUnsavedChangesOptions {
  isDirty: boolean;
  message?: string;
}

export const useUnsavedChanges = ({ isDirty, message = DEFAULT_MESSAGE }: UseUnsavedChangesOptions) => {
  const [allowLeave, setAllowLeave] = useState(false);
  const shouldBlock = useMemo(() => isDirty && !allowLeave, [isDirty, allowLeave]);
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (!shouldBlock) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };

    globalThis.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      globalThis.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message, shouldBlock]);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;

    const confirmed = globalThis.confirm(message);
    if (confirmed) {
      blocker.proceed();
      return;
    }

    blocker.reset();
  }, [blocker, message]);

  const allowNavigation = () => {
    setAllowLeave(true);
  };

  const confirmDiscard = (onConfirm: () => void) => {
    if (!shouldBlock) {
      onConfirm();
      return;
    }

    const confirmed = globalThis.confirm(message);
    if (!confirmed) return;

    setAllowLeave(true);
    onConfirm();
  };

  return {
    allowNavigation,
    confirmDiscard,
  };
};
