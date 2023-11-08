export const StorageIdentifier = 'Flyfree'
export const ContentPageTitle = 'FlyFree - Multiple posts'

export const SelectorTextarea =
  '[data-testid="twc-cc-mask"] ~ div [data-testid="tweetTextarea_0"]'
export const SelectorAttachments =
  '[data-testid="twc-cc-mask"] ~ div [data-testid="attachments"]'
export const SelectorCardWrapper =
  '[data-testid="twc-cc-mask"] ~ div [data-testid="card.wrapper"]'
export const SelectorCardDomain = [
  '[data-testid="card.layoutSmall.detail"]>div:first-child',
  '[data-testid="card.layoutLarge.detail"]>div:first-child',
  '[data-testid="card.layoutSmall.media"]>div:first-child',
  '[data-testid="card.layoutLarge.media"]>div:first-child',
].join(', ')
export const SelectorDroppedImage = [
  'img[src^="blob:https://twitter.com/"]',
  'img[src^="blob:https://x.com/"]',
].join(', ')
export const SelectorTweetButton = '[data-testid="tweetButton"]'
