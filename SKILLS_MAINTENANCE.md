# Skills Maintenance Guide

## Version Mapping

| Package | Package Version | Skill Version | Last Updated |
|---|---|---|---|
| `@bluvo/sdk-ts` | 3.0.0 | 3.0.0 (initial) | 2026-03-29 |
| `@bluvo/react` | 3.0.0 | 3.0.0 (initial) | 2026-03-29 |

## PR Checklist for Public API Changes

When modifying the public API of either package, update the corresponding skill files:

- [ ] Update `SKILL.md` frontmatter `metadata.version` if package version changed
- [ ] Update state reference if new `FlowStateType` values were added
- [ ] Update action/method documentation if signatures changed
- [ ] Update `references/types.md` if TypeScript interfaces changed
- [ ] Update `references/api-client.md` if REST endpoints or error codes changed
- [ ] Update `references/state-transitions.md` if transition logic changed
- [ ] Update `references/hooks-complete.md` if hook return values changed

## Skill File Locations

```
packages/ts/skill/
├── SKILL.md                          # Main skill file for @bluvo/sdk-ts
└── references/
    ├── api-client.md                 # REST client, auth, error codes
    ├── types.md                      # Complete TypeScript type definitions
    └── state-transitions.md          # Transition map and sequence diagrams

packages/react/skill/
├── SKILL.md                          # Main skill file for @bluvo/react
└── references/
    ├── hooks-complete.md             # Full hook signatures and return values
    ├── nextjs-patterns.md            # Next.js App Router integration
    └── components.md                 # Note: no components exported
```

## Installation

For AI agents to consume these skills:

```bash
# Using skills-ref CLI (if available)
npx skills-ref install

# Or copy skill directories directly into your project
cp -r packages/ts/skill/ your-project/.skills/bluvo-sdk-ts/
cp -r packages/react/skill/ your-project/.skills/bluvo-react/
```

## Validation

```bash
# Validate skill file structure (if skills-ref is available)
npx skills-ref validate ./packages/ts/skill
npx skills-ref validate ./packages/react/skill
```

### Manual Validation Checklist

- [ ] YAML frontmatter parses correctly in both SKILL.md files
- [ ] `name` field matches directory convention
- [ ] `description` is under 1024 characters
- [ ] Each SKILL.md is under 500 lines
- [ ] Every referenced file in "References" section exists
- [ ] All 32 `FlowStateType` values are documented
- [ ] All `ERROR_CODES` entries are documented
- [ ] Build passes: `pnpm -F @bluvo/sdk-ts build && pnpm -F @bluvo/react build`

## CI Integration

Add to your GitHub Actions workflow:

```yaml
- name: Validate skill files
  run: |
    npx skills-ref validate ./packages/ts/skill || echo "skills-ref not available, skipping"
    npx skills-ref validate ./packages/react/skill || echo "skills-ref not available, skipping"
```
