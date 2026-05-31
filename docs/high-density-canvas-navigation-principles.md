# High-Density Canvas Navigation Principles

These principles are written for canvases that hold many live information surfaces: terminals, editors, browsers, agents, logs, notes, and documents.

## 1. Reading is more common than arranging

Users occasionally arrange panels, but they constantly read and compare them. The default interaction model should protect reading and scrolling. Selection, grouping, and manipulation can still be powerful, but they should not make basic panel use unpredictable.

## 2. Treat panel scroll as local ownership

When a gesture starts inside a panel, the panel should get the first chance to own it. Falling through to canvas pan because the panel cannot scroll in one axis may feel clever in code and confusing in use.

## 3. Ignore accidental side motion

Some wheels and trackpads emit small horizontal deltas during vertical scroll. Do not let that nudge the entire canvas. Use an axis dominance ratio and a small horizontal residue threshold.

## 4. Focus should help the camera

Focus is not just z-order. If a user navigates to a panel by keyboard or selects a mostly hidden panel, the camera should reveal it. If the panel is already visible, leave the camera alone.

## 5. One motion language

Mouse pan, wheel zoom, keyboard navigation, focus reveal, and zoom-to-fit should feel related. Avoid mixing snappy drags with slow, long-decay zooms unless there is a deliberate reason.

## 6. Sidebars are geometry, not decoration

A sidebar or dock changes the usable viewport. Centering math should account for it. Otherwise the canvas seems to center things underneath UI chrome.

## 7. Provide an overview loop

Dense canvases work well when the core loop is quick:

1. zoom out or jump to overview
2. choose a cluster or target
3. zoom/focus in
4. move to the next related surface

## 8. Keep power-user navigation visible

If a product caters to power users, keyboard navigation should be discoverable and mnemonic. A command palette, shortcut overlay, or small navigation help card can make a big difference.

## 9. Do not steal text input

Hotkeys must not fire while a user is typing in editors, terminals, inputs, contenteditable surfaces, or command palettes. Navigation is only satisfying when it is trustworthy.

## 10. Make policies measurable

Turn UX opinions into tests where possible: wheel deltas, visible-area ratios, safe-area centering, neighbor choice, and reduced-motion behavior can all be tested without a full app.
