export const StorageIdentifier = 'Flyfree'
export const ContentPageTitle = 'FlyFree - Social Media Crossposting Tool'

export const SelectorTextarea =
  '[data-testid="twc-cc-mask"] ~ div [data-testid="tweetTextarea_0"]'
export const SelectorAttachments =
  '[data-testid="twc-cc-mask"] ~ div [data-testid="attachments"]'
export const SelectorLinkcard =
  '[data-testid="twc-cc-mask"] ~ div [data-testid="card.wrapper"]'
export const SelectorDroppedImage = [
  'img[src^="blob:https://twitter.com/"]',
  'img[src^="blob:https://x.com/"]',
].join(', ')
export const SelectorTweetButton = '[data-testid="tweetButton"]'
