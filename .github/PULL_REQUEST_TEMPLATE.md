## Summary

<!-- What changed, why, and which issue does it resolve? -->

## Related issues

Closes #

## Type of change

- [ ] Security fix
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / maintenance
- [ ] Documentation
- [ ] CI / release / packaging

## Testing

| Command                                           | Result                    |
| ------------------------------------------------- | ------------------------- |
| `npm run check`                                   | Passed / Failed / Not run |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Passed / Failed / Not run |

## Checklist

- [ ] I kept the change focused and did not include unrelated refactors.
- [ ] I added or updated tests for the behavior I changed.
- [ ] `npm run check` and `cargo test --manifest-path src-tauri/Cargo.toml` pass locally.
- [ ] If UI text changed, `npm run check:i18n` passes and TR/EN dictionaries are updated.
- [ ] I did not commit secrets, certificates, or personal student data.
