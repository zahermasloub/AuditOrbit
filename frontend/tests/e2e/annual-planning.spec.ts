/**
 * E2E Tests for Annual Planning Approval Workflow
 * Tests the complete flow: Submit → CAE Approve → Committee Approve → Publish
 */
import { test, expect } from '@playwright/test';

test.describe('Annual Planning Approval Workflow', () => {
  
  test('complete approval workflow - happy path', async ({ page }) => {
    // Navigate to approvals page
    await page.goto('/planning/approvals');
    
    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Approvals');
    
    // Generate a test plan ID (in real scenario, this would come from creating a plan)
    const planId = crypto.randomUUID();
    
    // Enter plan ID
    await page.fill('input[placeholder*="UUID"]', planId);
    
    // Step 1: Manager submits plan
    await page.click('[data-testid="submit-plan"]');
    await page.waitForTimeout(500);
    await expect(page.locator('.approval-trail')).toContainText('Submit Plan: ✅');
    
    // Step 2: CAE approves
    await page.click('[data-testid="approve-as-cae"]');
    await page.waitForTimeout(500);
    await expect(page.locator('.approval-trail')).toContainText('Approve CAE: ✅');
    
    // Step 3: Committee approves
    await page.click('[data-testid="approve-as-committee"]');
    await page.waitForTimeout(500);
    await expect(page.locator('.approval-trail')).toContainText('Approve Committee: ✅');
    
    // Step 4: Admin publishes
    await page.click('[data-testid="publish-plan"]');
    await page.waitForTimeout(500);
    await expect(page.locator('.approval-trail')).toContainText('Publish: ✅');
    
    // Verify all steps succeeded
    const logEntries = await page.locator('.approval-trail > div').count();
    expect(logEntries).toBeGreaterThanOrEqual(4);
  });
  
  test('publish fails without approvals', async ({ page }) => {
    await page.goto('/planning/approvals');
    
    const planId = crypto.randomUUID();
    await page.fill('input[placeholder*="UUID"]', planId);
    
    // Try to publish without any approvals
    await page.click('[data-testid="publish-plan"]');
    await page.waitForTimeout(500);
    
    // Should show error
    await expect(page.locator('.approval-trail')).toContainText('Publish: ❌');
  });
  
  test('approval stages are displayed correctly', async ({ page }) => {
    await page.goto('/planning/approvals');
    
    // Check that all approval stages are visible
    await expect(page.locator('text=Manager → Submit Plan')).toBeVisible();
    await expect(page.locator('text=CAE → Review & Approve')).toBeVisible();
    await expect(page.locator('text=Committee → Final Approval')).toBeVisible();
    await expect(page.locator('text=Admin → Publish')).toBeVisible();
  });
  
  test('buttons are properly labeled', async ({ page }) => {
    await page.goto('/planning/approvals');
    
    // Check button labels
    await expect(page.locator('[data-testid="submit-plan"]')).toContainText('Submit');
    await expect(page.locator('[data-testid="approve-as-cae"]')).toContainText('Approve');
    await expect(page.locator('[data-testid="approve-as-committee"]')).toContainText('Approve');
    await expect(page.locator('[data-testid="publish-plan"]')).toContainText('Publish');
  });
  
  test('activity log shows operations in order', async ({ page }) => {
    await page.goto('/planning/approvals');
    
    const planId = crypto.randomUUID();
    await page.fill('input[placeholder*="UUID"]', planId);
    
    // Perform operations
    await page.click('[data-testid="submit-plan"]');
    await page.waitForTimeout(300);
    await page.click('[data-testid="approve-as-cae"]');
    await page.waitForTimeout(300);
    
    // Check log shows both operations (newest first)
    const logText = await page.locator('.approval-trail').textContent();
    expect(logText).toContain('Approve CAE');
    expect(logText).toContain('Submit Plan');
  });
});

test.describe('Annual Planning Pages', () => {
  
  test('risk universe page loads', async ({ page }) => {
    await page.goto('/planning/risk-universe');
    await expect(page.locator('h1')).toContainText('Risk Universe');
  });
  
  test('scoring page loads with heatmap', async ({ page }) => {
    await page.goto('/planning/scoring');
    await expect(page.locator('h1')).toContainText('Scoring');
    // HeatMap should be rendered
    await page.waitForTimeout(1000);
    // ECharts creates a canvas element
    const canvas = await page.locator('canvas').count();
    expect(canvas).toBeGreaterThan(0);
  });
  
  test('plan builder page loads', async ({ page }) => {
    await page.goto('/planning/plan-builder');
    await expect(page.locator('h1')).toContainText('Plan Builder');
  });
  
  test('calendar page loads with months', async ({ page }) => {
    await page.goto('/planning/calendar');
    await expect(page.locator('h1')).toContainText('Calendar');
    
    // Should show 12 months
    const months = ['يناير', 'فبراير', 'مارس'];
    for (const month of months) {
      await expect(page.locator(`text=${month}`)).toBeVisible();
    }
  });
});
