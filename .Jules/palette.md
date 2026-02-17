# Palette's Journal

## 2025-02-17 - Password Visibility Toggle Pattern
**Learning:** In this codebase, the base `Input` component does not use `forwardRef`, favoring uncontrolled inputs via `name` attribute for Server Actions. This simplifies form handling but requires wrapper components (like `PasswordInput`) to also avoid `forwardRef` to match the pattern and avoid React warnings.
**Action:** When creating wrapper components for inputs in this repo, mirror the base component's API (no `forwardRef`) unless explicit ref handling is needed, and ensure internal state props (like `type`) take precedence over spread props.
