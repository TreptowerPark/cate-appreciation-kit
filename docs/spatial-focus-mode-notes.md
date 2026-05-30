# Spatial ↔ focused mode notes

Spatial canvas mode is good for overview: arranging tools, seeing relationships, and navigating work areas.

Focused mode is good for reading, writing, reviewing diffs, and thinking without visual noise.

Strong canvas IDEs let users move between both without losing orientation.

## Mode sketch

Possible phases:

- `idle`
- `inviting-input`
- `exchanging`
- `chat`
- `spatial`
- `focused`

These phases do not need to own the whole app. They can be a small UI state machine that coordinates viewport and active panel behavior.

## Viewport lessons

- Save viewport before focusing a panel.
- Restore viewport when returning to overview.
- Keep focus transitions short.
- Avoid surprise zoom jumps.
- Show breadcrumbs or minimap hints when zoomed in.
- Make Escape or an obvious control return to spatial mode.

## Snapping and glide

Optional polish:

- snap focused panels to readable bounds
- glide camera rather than teleporting
- keep animation under user control
- respect reduced-motion preferences

## Avoid users getting lost

- Preserve stable panel identities.
- Keep active panel visibly connected to its canvas location.
- Avoid hidden modal stacks over spatial state.
- Let users recover overview quickly.
