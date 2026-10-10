import { test, expect } from '@playwright/test';

const imageUrl = 'https://images.example.test/photo.jpg';
const imageSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="skyblue"/></svg>';

function image(tags = 'blue sky') {
  return {
    webformatURL: imageUrl,
    largeImageURL: imageUrl,
    tags,
    likes: 12,
    views: 345,
    comments: 6,
    downloads: 78,
  };
}

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (['error', 'warning', 'log'].includes(message.type())) {
      errors.push(message.text());
    }
  });
  await page.route(imageUrl, (route) =>
    route.fulfill({ contentType: 'image/svg+xml', body: imageSvg })
  );
  await page.goto('./');
  page.consoleErrors = errors;
});

test.afterEach(async ({ page }) => {
  expect(page.consoleErrors).toEqual([]);
});

async function search(page, query) {
  await page.getByRole('textbox', { name: 'Search images' }).fill(query);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
}

test('validates queries and does not request empty or whitespace searches', async ({
  page,
}) => {
  let requests = 0;
  await page.route('https://pixabay.com/api/**', (route) => {
    requests += 1;
    return route.fulfill({ json: { hits: [] } });
  });
  await search(page, '');
  expect(
    await page.locator('input').evaluate((input) => input.validity.valid)
  ).toBe(false);
  await search(page, '   ');
  await expect(page.getByText('Please enter a search query.')).toBeVisible();
  expect(requests).toBe(0);
  await expect(page.locator('.loading')).toBeHidden();
});

test('sends required parameters, shows loader, renders cards and opens lightbox', async ({
  page,
}) => {
  let releaseResponse;
  const pending = new Promise((resolve) => {
    releaseResponse = resolve;
  });
  let requestUrl;
  await page.route('https://pixabay.com/api/**', async (route) => {
    requestUrl = new URL(route.request().url());
    await pending;
    await route.fulfill({ json: { hits: [image(), image('clouds')] } });
  });
  await search(page, '  blue sky & clouds  ');
  await expect(page.locator('.loading')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Search', exact: true })
  ).toBeDisabled();
  await expect(page.locator('.gallery')).toHaveAttribute('aria-busy', 'true');
  releaseResponse();
  await expect(page.locator('.gallery-item')).toHaveCount(2);
  expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
    key: 'test-key-not-a-real-credential',
    q: 'blue sky & clouds',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
  });
  await expect(page.locator('.loading')).toBeHidden();
  await expect(page.locator('.image-info').first()).toHaveText(
    /Likes12\s*Views345\s*Comments6\s*Downloads78/
  );
  await page.locator('.gallery-link').first().click();
  await expect(page.locator('.sl-wrapper')).toBeVisible();
  await expect(page.locator('.sl-image img')).toHaveAttribute('src', imageUrl);
  await expect(page.locator('.sl-caption')).toHaveText('blue sky');
  await expect(page.locator('.sl-caption')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.sl-wrapper')).toBeHidden();
});

test('clears old results and refreshes lightbox for a new gallery', async ({
  page,
}) => {
  let count = 0;
  await page.route('https://pixabay.com/api/**', (route) =>
    route.fulfill({
      json: {
        hits: count++ === 0 ? [image(), image()] : [image('new photo')],
      },
    })
  );
  await search(page, 'sky');
  await expect(page.locator('.gallery-item')).toHaveCount(2);
  await search(page, 'new');
  await expect(page.locator('.gallery-item')).toHaveCount(1);
  await expect(page.locator('.gallery-image')).toHaveAttribute(
    'alt',
    'new photo'
  );
  await page.locator('.gallery-link').click();
  await expect(page.locator('.sl-wrapper')).toBeVisible();
});

test('shows exact empty-results message and removes prior results', async ({
  page,
}) => {
  let count = 0;
  await page.route('https://pixabay.com/api/**', (route) =>
    route.fulfill({ json: { hits: count++ === 0 ? [image()] : [] } })
  );
  await search(page, 'sky');
  await expect(page.locator('.gallery-item')).toHaveCount(1);
  await search(page, 'no matches');
  await expect(
    page.getByText(
      'Sorry, there are no images matching your search query. Please try again!'
    )
  ).toBeVisible();
  await expect(page.locator('.gallery-item')).toHaveCount(0);
  await expect(page.locator('.loading')).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Search', exact: true })
  ).toBeEnabled();
});

test('handles invalid responses and permits another search', async ({
  page,
}) => {
  let count = 0;
  await page.route('https://pixabay.com/api/**', (route) =>
    route.fulfill({ json: count++ === 0 ? {} : { hits: [image()] } })
  );
  await search(page, 'invalid');
  await expect(page.getByText('Search failed')).toBeVisible();
  await expect(page.locator('.loading')).toBeHidden();
  await search(page, 'retry');
  await expect(page.locator('.gallery-item')).toHaveCount(1);
});

test('handles a rejected HTTP request and restores the form', async ({
  page,
}) => {
  await page.route('https://pixabay.com/api/**', (route) =>
    route.abort('failed')
  );
  await search(page, 'network failure');
  await expect(page.getByText('Search failed')).toBeVisible();
  await expect(page.locator('.loading')).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Search', exact: true })
  ).toBeEnabled();
  // Chromium reports failed transport requests independently of app handling.
  page.consoleErrors = page.consoleErrors.filter(
    (message) => !message.includes('net::ERR_FAILED')
  );
});

test('escapes image descriptions without injecting HTML', async ({ page }) => {
  const tags = 'sky "><script>alert(1)</script> & clouds';
  await page.route('https://pixabay.com/api/**', (route) =>
    route.fulfill({ json: { hits: [image(tags)] } })
  );
  await search(page, 'sky');
  await expect(page.locator('.gallery-image')).toHaveAttribute('alt', tags);
  await expect(page.locator('.gallery script')).toHaveCount(0);
});

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.route('https://pixabay.com/api/**', (route) =>
    route.fulfill({ json: { hits: [image()] } })
  );
  await search(page, 'sky');
  await expect(page.locator('.gallery-item')).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});
