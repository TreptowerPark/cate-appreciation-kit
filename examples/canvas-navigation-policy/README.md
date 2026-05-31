# Canvas navigation policy example

This tiny example wires together the package primitives without assuming any framework or app architecture.

It demonstrates:

- wheel intent classification
- horizontal residue filtering
- focus reveal decisions
- safe-area centering with a sidebar inset
- WASD-style traversal mapping

Read `navigationExample.ts` as pseudocode you can adapt to a canvas store.

The example intentionally avoids importing Cate or any private application code.
