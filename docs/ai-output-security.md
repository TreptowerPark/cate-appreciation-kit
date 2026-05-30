# AI output security

Treat AI output like user-generated content. Models can emit hostile HTML, markdown, URLs, SVG, or malformed nested markup by accident or by prompt injection.

## Common vectors

- `<script>` tags
- image `onerror` handlers
- SVG `onload` handlers
- `javascript:` URLs
- `data:` URLs containing HTML/SVG/script
- malformed or nested HTML that confuses parsers
- markdown links that become unsafe HTML
- code blocks accidentally rendered as raw HTML

## Safer defaults

- Render model output as text unless HTML is truly needed.
- If markdown is needed, use a sanitizer after markdown-to-HTML conversion.
- Restrict allowed tags and attributes.
- Block dangerous URL schemes.
- Add tests for renderer behavior.
- Keep Content Security Policy strict in Electron renderer windows.
- Do not trust model-provided file names, paths, or commands.

## Markdown caveat

Markdown libraries differ. Some allow raw HTML by default; others escape it. Some plugins re-enable HTML. Test the exact configured renderer, not an imagined one.

See `tests/ai-output-security-vectors.test.ts` for generic vectors.
