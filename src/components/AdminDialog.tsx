import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDialogFocus } from '../hooks/useDialogFocus';

export default function AdminDialog({ label, onClose, children }: {
  label: string; onClose: () => void; children: React.ReactElement<any>;
}) {
  const ref = useDialogFocus(true, onClose);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);
  if (typeof document === 'undefined') return null;
  return createPortal(<div className="admin-overlay" onMouseDown={event => {
    if (event.target === event.currentTarget) onClose();
  }}>{React.cloneElement(children, {
    ref, role: 'dialog', 'aria-modal': true, 'aria-label': label,
    className: `${children.props.className || ''} admin-dialog`,
  })}</div>, document.body);
}
