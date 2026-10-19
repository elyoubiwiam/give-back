import asyncio,os
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  context=await browser.new_context(viewport={'width':885,'height':780})
  page=await context.new_page()
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto('http://localhost:8080')
  await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[os.environ['LOVABLE_BROWSER_SUPABASE_STORAGE_KEY'],os.environ['LOVABLE_BROWSER_SUPABASE_SESSION_JSON']])
  await page.goto('http://localhost:8080/profile',wait_until='networkidle')
  section=page.get_by_role('region',name='Your booked tasks')
  before=await section.locator('dd').all_text_contents()
  print('before:',before)
  article=section.locator('article').filter(has=page.get_by_role('heading',name='Walk two senior dogs',exact=True))
  assert await article.count()==1
  await article.get_by_role('button',name='Cancel task',exact=True).click()
  dialog=page.get_by_role('dialog')
  await dialog.get_by_role('button',name='Keep booking').click()
  await dialog.wait_for(state='hidden')
  assert await article.count()==1
  await article.get_by_role('button',name='Cancel task',exact=True).click()
  await dialog.get_by_role('button',name='Cancel booking',exact=True).click()
  await page.get_by_text('Task cancelled',exact=True).wait_for(state='visible')
  await page.reload(wait_until='networkidle')
  after=await section.locator('dd').all_text_contents()
  print('after cancellation and reload:',after)
  assert int(after[0])==int(before[0])-1
  assert int(after[2])==int(before[2])-30
  await page.screenshot(path='/tmp/browser/cancellation/profile.png')
  await page.goto('http://localhost:8080/tasks',wait_until='networkidle')
  task=page.locator('article').filter(has=page.get_by_role('heading',name='Walk two senior dogs',exact=True))
  await task.get_by_role('button',name='Lend a hand',exact=True).click()
  await page.get_by_role('dialog').get_by_role('button',name='Done',exact=True).click()
  await page.goto('http://localhost:8080/profile',wait_until='networkidle')
  restored=await section.locator('dd').all_text_contents()
  assert restored==before
  print('restored booking:',restored,'page errors:',errors)
  await page.screenshot(path='/tmp/browser/cancellation/restored.png')
  await browser.close()
asyncio.run(main())
