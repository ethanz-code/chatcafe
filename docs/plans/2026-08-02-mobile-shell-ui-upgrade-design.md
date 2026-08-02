# Mobile Shell UI Upgrade Design

## Goal

Refine the functional ChatCafe mobile experience while preserving the existing 430px desktop phone-column presentation. Simplify the primary navigation to the three high-frequency destinations and improve the visual hierarchy of high-use account pages.

## Scope

- Replace the five-item bottom navigation with AI Chat, AI Assistant, and User Center.
- Move App Center and Image Community into User Center's More Services section. Both remain navigable and retain their current pages.
- Replace the Vant tab bar with a custom router-backed navigation component.
- Add a fluid active indicator, active icon/label enlargement, and directional page transitions when users click a navigation item.
- Do not enable swipe-based tab switching.
- Upgrade Pay Store, Task Reward, Starred Messages, and User Profile as the first high-frequency account-page set.
- Preserve the existing behavior and visual treatment of low-frequency service pages and unimplemented pages.

## Navigation Experience

- The bottom navigation has three equal-width actions: AI Chat, AI Assistant, and User Center.
- The active action receives a rounded, colored indicator that glides between positions using a transform transition.
- The active icon subtly lifts and scales; its label becomes more prominent. Inactive actions return to a stable, compact state.
- Navigation remains Vue Router based. Existing direct links, browser history behavior, and authentication guards remain intact.
- Clicking a tab animates the routed content horizontally according to the source and destination tab order. No gesture handler is added, so chat and scroll interactions retain their current behavior.
- The navigation and routed content remain contained by `--app-content-width` on desktop.

## User Center Information Architecture

- App Center and Image Community are added to More Services as active routes.
- Existing quick actions remain unchanged: Task Reward, Pay Store, Starred Messages, Contact Support, and Feedback.
- More Services presents active and unavailable destinations consistently. App Center and Image Community do not receive a construction-state badge because their existing pages remain reachable.

## High-Frequency Page Design

### Pay Store

- Make package comparison faster with clearer price, credit quantity, benefit, and selection states.
- Use restrained brand-color accents rather than dense gradients or decorative cards.
- Keep all existing payment routing, QR-code payment, polling, and browser-specific behavior unchanged.

### Task Reward

- Separate the current balance, daily check-in, and claimable rewards into a scan-friendly visual sequence.
- Preserve all task eligibility, claim, and refresh behavior.

### Starred Messages

- Improve message hierarchy and action discoverability while retaining expand, copy, and unstar operations.
- Provide an intentional empty state when no messages are saved.

### User Profile

- Group editable identity and account information so frequently used changes are easy to scan.
- Preserve the current forms, validation, and password-management routes.

## States and Accessibility

- Use explicit loading, empty, and error feedback where the existing data flow exposes those states.
- Keep controls keyboard accessible and maintain tap targets suitable for mobile.
- Respect reduced-motion preferences by limiting or disabling navigation animations when requested by the operating system.

## Verification

- Run the client build and available lint/type checks.
- Confirm the three-tab layout and route transitions at mobile width and in the 430px desktop column.
- Check direct navigation to App Center and Image Community through User Center.
- Verify payment, task reward, favorites, and profile behavior remains intact after visual changes.
