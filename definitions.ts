export const StorageIdentifier = 'Flyfree'
export const ContentPageTitle = 'FlyFree - Social Media Crossposting Tool'

export const ContainerSelector =
  ':is([role="dialog"], [role="main"]):has([data-testid="tweetButton"])'

export const SelectorTextarea = `${ContainerSelector} [data-testid="tweetTextarea_0"]`
export const SelectorAttachments = `${ContainerSelector} [data-testid="attachments"]`
export const SelectorLinkcard = `${ContainerSelector} [data-testid="card.wrapper"]`
export const SelectorDroppedImage = [
  'img[src^="blob:https://twitter.com/"]',
  'img[src^="blob:https://x.com/"]',
].join(', ')
export const SelectorTweetButton = '[data-testid="tweetButton"]'
