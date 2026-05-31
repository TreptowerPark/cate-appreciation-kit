# Canvas Navigation UX Kit

Hello Cate builders. This is a second, smaller bundle focused on navigation feel for high-density information canvases. It is not a demand, not a fork, and not a patch against Cate. It is a clean-room set of policies, snippets, and tests that may help if the canvas ever starts to feel slightly too "slippery" while users are reading, scrolling, and cross-referencing panels.

## What this is

A practical navigation-policy kit for dense spatial AI/dev canvases:

- wheel and trackpad ownership rules
- small horizontal wheel-noise filtering
- shared camera ballistics
- focus camera rules
- sidebar-safe viewport math
- WASD-style power-user traversal
- tests that encode the edge cases

The package lives in `packages/canvas-navigation-ux` and stays framework-free.

## Why dense information canvases feel different

An illustration canvas, node shader editor, or 3D tool often treats the canvas itself as the primary object. In a dense information canvas, the panels are usually the primary objects. Users zoom out to understand context, choose a region, then zoom or focus back into a panel to read, write, compare, or run commands.

That makes navigation policy more important than raw navigation capability. If a user scrolls inside a panel and the whole world drifts, trust drops. If focus changes but the camera does not help, keyboard traversal feels half-finished. If sidebars cover content, the canvas feels like it is underneath the UI rather than part of one platform.

## Wheel intent: panel first, canvas second

A good default for information work is:

1. Explicit zoom always wins: Cmd/Ctrl plus wheel or trackpad pinch.
2. Panel-local scrolling wins when the event starts inside a panel.
3. Small horizontal residue from wheel hardware is ignored.
4. Canvas pan only wins on the canvas surface or when an explicit pan affordance is active.

This differs from many drawing apps, but it matches the mental model of a workspace full of scrollable documents, terminals, editors, browsers, logs, and agents.

See `classifyWheelIntent` in `packages/canvas-navigation-ux/src/wheelIntentPolicy.ts`.

## Camera follows focus, not every click

Clicking a panel can mean many things: select, drag, resize, edit, or read. The camera should not fight all clicks, but when focus semantically changes to a panel that is not mostly visible, the camera should reveal it.

Suggested policy:

- Do not move during drag, resize, text editing, or active manipulation.
- Do not move if the panel is already mostly visible.
- Do move when keyboard navigation or an explicit focus command lands on a hidden panel.
- For click focus, move only when the target is below a visibility threshold.
- Use the same animation ballistics as zoom and overview.

See `computeFocusViewport` and `computeRevealViewport`.

## Unified ballistics

Navigation feels coherent when mouse, wheel, hotkeys, zoom-to-fit, zoom-to-selection, and focus-reveal share the same motion language.

A useful baseline is short and crisp:

- focus: 120 ms
- zoom: 100 ms
- overview: 160 ms
- pan: 100 ms
- easing: cubic-out

Long lerp tails can make the camera feel washy, especially when paired with otherwise snappy mouse panning. The package provides `snappyBallistics`, `smoothBallistics`, and `reducedMotionBallistics` as starting points.

## Safe-area canvas

Sidebars and docks should participate in viewport math. If a sidebar opens over the canvas, the focused panel can become visually hidden even though the canvas state says it is centered.

Treat sidebars as insets:

- compute the safe viewport rectangle
- center focused nodes inside that safe area
- fit selections inside that safe area
- when a sidebar opens, optionally shift the viewport rather than covering the current focus target

See `computeSafeViewportRect`, `centerNodeInSafeArea`, and `fitBoundsInSafeArea`.

## Power-user traversal

For high-density work, the mouse is not enough. Keyboard traversal should support both time and space:

- W/S: previous/next by time, recency, or narrative order
- A/D: previous/next in spatial or reading order
- Arrow keys: directional neighbors
- Enter: focus and reveal
- Escape: zoom to overview or clear focus

This pattern is intentionally DAW-like: fast movement between clips/sources/panels matters more often than multi-selection. Multi-select can live behind a modifier.

See `createWasdSpatialKeymap`, `chooseNextByTime`, and `chooseNextByDirection`.

## How this maps to Cate

Cate already has strong primitives: canvas state, focus, node navigation, zoom-to-fit, zoom-to-selection, panel content, and shortcut infrastructure. This kit is mostly about interaction policy:

- panel-first wheel ownership
- thresholding tiny horizontal deltas
- using focus-and-reveal when focus meaningfully changes
- treating dock/sidebar chrome as viewport insets
- making all camera actions share ballistics
- making hotkeys more discoverable for power users

## What not to overfit

The feedback that led to this package came from a power user with very specific preferences. Do not blindly optimize for one setup. Instead, treat the utilities as testable policy switches. Keep defaults conservative, expose preferences where possible, and profile the feel with real mouse, trackpad, and tilt-wheel hardware.
