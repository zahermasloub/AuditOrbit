import { test, expect } from '@playwright/test';

test.describe('Performance Tests - Playground UI', () => {
  test('should have acceptable Core Web Vitals', async ({ page }) => {
    await page.goto('/playground/ui');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // LCP (Largest Contentful Paint)
        let lcp = 0;
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // CLS (Cumulative Layout Shift)
        let cls = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });

        // Wait a bit for metrics to be collected
        setTimeout(() => {
          resolve({ lcp, cls });
        }, 3000);
      });
    });

    console.log('Performance Metrics:', metrics);

    // Assert LCP is under 2.5s (good threshold)
    expect((metrics as any).lcp).toBeLessThan(2500);
    console.log(`✓ LCP: ${(metrics as any).lcp}ms (should be < 2500ms)`);

    // Assert CLS is under 0.1 (good threshold)
    expect((metrics as any).cls).toBeLessThan(0.1);
    console.log(`✓ CLS: ${(metrics as any).cls} (should be < 0.1)`);
  });

  test('should load the page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/playground/ui');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('should render DataTable without layout shifts', async ({ page }) => {
    await page.goto('/playground/ui');
    
    // Get initial position of an element
    const table = page.locator('table').first();
    const initialBox = await table.boundingBox();
    
    // Wait for potential layout shifts
    await page.waitForTimeout(2000);
    
    // Check position hasn't changed significantly
    const finalBox = await table.boundingBox();
    
    expect(initialBox).toBeTruthy();
    expect(finalBox).toBeTruthy();
    
    if (initialBox && finalBox) {
      const shift = Math.abs(initialBox.y - finalBox.y);
      expect(shift).toBeLessThan(5); // Less than 5px shift
      console.log(`✓ Layout shift: ${shift}px`);
    }
  });
});
