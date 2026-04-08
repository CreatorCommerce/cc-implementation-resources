# CreatorCommerce Implementation Resources

This repository contains the implementation assets that support CreatorCommerce builds: documentation, Liquid templates, workflow templates, prompts, and AI-support resources.

## Canonical Documentation

The canonical product documentation lives in `cc-dev-docs/`.

If something in this repository conflicts with something else, use this order of trust:

1. `cc-dev-docs/references/` for facts, schemas, fields, payloads, and API details
2. `cc-dev-docs/guides/glossary.mdx` for terminology
3. `cc-dev-docs/guides/documentation-contract.mdx` for how documentation is organized and how updates should be made

`cc-dev-documentation/` is a legacy archive. It is kept for historical reference only and should not be used as the source of truth for new implementations or AI retrieval workflows.

## Repository Layout

- `cc-dev-docs/`
  - Active documentation site and the canonical documentation corpus
- `cc-liquid-templates/`
  - Shopify Liquid sections, snippets, templates, and implementation examples
- `cc-flow-templates/`
  - Shopify Flow templates for activation, conversion, enrichment, operations, and integrations
- `cc-ai-prompts/`
  - Prompt assets and helper instructions for AI-assisted implementation workflows
- `cc-chat-agent/`
  - Agent-specific guidance and supporting configuration
- `cc-dev-documentation/`
  - Legacy documentation archive, not canonical

## Guidance for Humans and AI

- Start with an overview or use-case page in `cc-dev-docs/guides/`.
- Pull canonical facts from the related reference pages instead of relying on repeated prose.
- Treat draft, archived, or legacy material as non-canonical unless a current page explicitly links to it.
- When working with AI, prefer the active docs tree over broad repo dumps. The docs are structured so overviews route to the right references.

Recommended starting points:

- `cc-dev-docs/guides/getting-started.mdx`
- `cc-dev-docs/guides/how-to-use-these-docs.mdx`
- `cc-dev-docs/guides/documentation-contract.mdx`

## Contributing

If you update product behavior, data structures, or implementation guidance:

1. Update the canonical reference page first.
2. Update any overview or how-to pages that summarize that behavior.
3. Update the glossary if terminology changed.
4. Update AI playbooks only if the prompting or recommended workflow changed.

For contribution mechanics, see [CONTRIBUTING.md](CONTRIBUTING.md).
