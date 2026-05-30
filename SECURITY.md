# Security

Please report security issues privately to the repository maintainers through GitHub security advisories when available.

This kit contains examples and test vectors, not production hardening. Before using any pattern in an app:

- threat-model renderer boundaries
- sanitize or escape AI/user output
- isolate dangerous tools behind explicit approval
- log approval decisions without storing sensitive content unnecessarily
- keep secrets out of source control and examples

If you find private data or credentials in this repository, stop using the affected revision and report it immediately.
