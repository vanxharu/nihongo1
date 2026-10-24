'use client';

import React, { Children, isValidElement, useState } from 'react';
import { Effect } from '@animate-ui/react/primitives/effects/effect';
import { scale, shift, useMotionTokens } from '@animate-ui/react/utils/motion';

/** Brief, per-row entrances. A focused child becomes visible immediately. */
export function ExpressiveReveal({ children, index = 0, inView = true }: {
  children: React.ReactElement;
  index?: number;
  inView?: boolean;
}) {
  const { spring, transition } = useMotionTokens();
  const [focused, setFocused] = useState(false);
  return <Effect
    asChild
    inView={inView}
    fade
    slide={{ offset: shift.navigation }}
    zoom={{ initialScale: scale.toast }}
    blur={{ initialBlur: 4 }}
    delay={focused ? 0 : (index % 4) * 90}
    transition={focused ? transition.instant : spring.bounce}
    onFocusCapture={() => setFocused(true)}
    {...(focused ? { animate: 'visible' } : {})}
  >{children}</Effect>;
}

export function ExpressiveGroup({ children }: { children: React.ReactNode }) {
  return <>{Children.toArray(children).filter(isValidElement).map((child, index) =>
    <ExpressiveReveal key={child.key ?? index} index={index}>{child}</ExpressiveReveal>
  )}</>;
}
