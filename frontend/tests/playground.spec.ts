import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility & Performance - Playground UI', () => {
  test('should pass basic accessibility checks', async ({ page }) => {
    // Navigate to the playground page
    await page.goto('/playground/ui');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Log violations if any
    if (accessibilityScanResults.violations.length > 0) {
      console.log('\n❌ Accessibility Violations Found:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Help: ${violation.help}`);
      });
    } else {
      console.log('\n✅ No accessibility violations found!');
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should measure Core Web Vitals (LCP & CLS)', async ({ page }) => {
    await page.goto('/playground/ui');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcp = 0;
        let cls = 0;

        // LCP
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1] as any;
            lcp = lastEntry.renderTime || lastEntry.loadTime;
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // CLS
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const layoutShift = entry as any;
            if (!layoutShift.hadRecentInput) {
              cls += layoutShift.value;
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          resolve({ lcp, cls });
        }, 2000);
      });
    });

    const { lcp, cls } = metrics as any;

    console.log('\n📊 Core Web Vitals:');
    console.log(`   LCP: ${lcp.toFixed(2)}ms (should be < 2500ms)`);
    console.log(`   CLS: ${cls.toFixed(4)} (should be < 0.1)`);

    // Assertions
    if (lcp < 2500) {
      console.log('   ✅ LCP is GOOD');
    } else if (lcp < 4000) {
      console.log('   ⚠️  LCP needs improvement');
    } else {
      console.log('   ❌ LCP is POOR');
    }

    if (cls < 0.1) {
      console.log('   ✅ CLS is GOOD');
    } else if (cls < 0.25) {
      console.log('   ⚠️  CLS needs improvement');
    } else {
      console.log('   ❌ CLS is POOR');
    }

    // Soft assertions (warnings instead of failures)
    expect(lcp).toBeLessThan(4000); // Allow up to 4s for development
    expect(cls).toBeLessThan(0.25); // Allow some layout shift in development
  });

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/playground/ui');
    
    // Check for heading
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    console.log('\n✅ Page has H1 heading');

    // Check for DataTable
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
    console.log('✅ DataTable is rendered');

    // Check table has data
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`✅ Table has ${rowCount} row(s)`);
    expect(rowCount).toBeGreaterThan(0);
  });
});
