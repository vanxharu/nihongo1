# Animate UI integration

- Skill: animate-ui, path C (custom React components).
- Level: expressive, explicitly selected by the user.
- Dependencies: @animate-ui/react 2.2.1 and Motion 14.6.0.
- AnimateUIProvider sets tempo 1; reduced motion follows the device through ReducedMotionConfig and the primitives' own settings.
- Buttons use the library press primitive (scale.press / spring.press); whole reading and listening cards use scale.choice. Hover does not scale the button.
- Grammar exercise tabs use the complete Tabs, TabsHighlight, TabsContents and TabsContent composition. Inactive panels are inert; entered answers remain in state when switching tabs.
- Reading/listening cards, grammar summary cards and decorative accents use Effect with spring.bounce, a 24px rise, scale.toast, 4px blur and a stagger capped at 270ms per row. Focus cancels any reveal delay. Main headings stay visible. XP uses SlidingNumber with an initially stable value.
- Existing route animation in App.tsx is retained: Animate UI's current PageTransition requires React's ViewTransition API, which the project's locked React 19.2.7 does not expose. React was not upgraded to enable it.
- Existing flashcard flip/slide, mascot/audio feedback and other authored animations remain unchanged and do not follow AnimateUIProvider tempo. Their existing reduced-motion support remains in place.

Source: https://github.com/imskyleen/animate-ui and https://animate-ui.com/.
