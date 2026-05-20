'use client';

import { useEffect } from 'react';

const isBareRuntimeEvent = (value: unknown) => (
  typeof Event !== 'undefined'
  && value instanceof Event
  && !(value instanceof ErrorEvent)
);

const isResourceErrorEvent = (event: Event) => {
  const target = event.target;
  return (
    typeof HTMLImageElement !== 'undefined' && target instanceof HTMLImageElement
  ) || (
    typeof HTMLMediaElement !== 'undefined' && target instanceof HTMLMediaElement
  ) || (
    typeof HTMLLinkElement !== 'undefined' && target instanceof HTMLLinkElement
  );
};

export function RuntimeEventGuard() {
  useEffect(() => {
    const handleError = (event: ErrorEvent | Event) => {
      if (event instanceof ErrorEvent && (event.message || event.error)) return;
      if (!isBareRuntimeEvent(event) && !isResourceErrorEvent(event)) return;

      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (!isBareRuntimeEvent(event.reason)) return;

      event.preventDefault();
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
