import type { KeyboardEvent } from 'react';

/** Makes a clickable <span>/<div> operable from the keyboard: Enter or Space triggers its onClick. */
export function clickOnKey(e: KeyboardEvent<HTMLElement>) {
  if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
    e.preventDefault();
    e.currentTarget.click();
  }
}
