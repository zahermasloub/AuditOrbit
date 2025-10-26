# Visual & Performance Testing Guide

## Visual Regression Tests (Playwright)

### Update Baselines
When you intentionally change UI design:
```bash
$env:PW_UPDATE_SNAPSHOTS = "1"
pnpm -C web test:visual
$env:PW_UPDATE_SNAPSHOTS = ""
```

### Run Visual Tests
```bash
# Development mode (auto-starts dev server)
$env:PW_DEV = "1"
pnpm -C web test:visual

# Production mode (requires build first)
pnpm -C web build
pnpm -C web test:visual
```

### Baseline Snapshots
- Located in: `web/tests/visual/__snapshots__/`
- **Committed to git** for tracking visual changes
- LTR/Light mode: baseline for English users
- RTL/Dark mode: baseline for Arabic users with dark theme

## Performance Budgets (Lighthouse CI)

### Run Lighthouse Tests
```bash
# Full build + Lighthouse audit
pnpm -C web perf:lhci
```

### Budget Thresholds
| Metric | Target | Severity |
|--------|--------|----------|
| LCP (Largest Contentful Paint) | < 3.0s | ❌ Error |
| TBT (Total Blocking Time) | < 200ms | ❌ Error |
| CLS (Cumulative Layout Shift) | < 0.1 | ❌ Error |
| FCP (First Contentful Paint) | < 2.0s | ⚠️ Warn |
| TTI (Time to Interactive) | < 4.5s | ⚠️ Warn |
| Performance Score | > 85% | ⚠️ Warn |

### Resource Budgets
- JavaScript bundles: < 300 KB
- Total page weight: < 1.5 MB

## CI/CD Integration

### GitHub Actions Workflows
- **`ci.yml`**: Backend/frontend smoke tests
- **`ui-perf-visual.yml`**: Lighthouse + visual snapshots

### Artifacts
- Lighthouse reports: `.lighthouse/` directory
- Visual snapshots: uploaded as GitHub artifacts
- Test results: available in Actions summary

## Troubleshooting

### Visual Tests Failing
1. Check if UI changes were intentional
2. Review diff images in test results
3. Update baselines if changes are correct:
   ```bash
   $env:PW_UPDATE_SNAPSHOTS = "1"
   pnpm -C web test:visual
   ```

### Lighthouse Failing
1. Check `.lighthouse/` reports for details
2. Review bundle sizes: `pnpm -C web build --analyze`
3. Optimize images/fonts if needed
4. Consider code splitting for large pages

### Server Won't Start
1. Ensure Next.js build is complete: `pnpm -C web build`
2. Check port 3000 is available
3. Review `playwright.config.ts` webServer settings
