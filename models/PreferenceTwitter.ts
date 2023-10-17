import type { Preference } from '~/models/Preference'

export type PreferenceTwitter = Preference

export const DefaultPreference: PreferenceTwitter = Object.seal({
  service: 'Twitter',
  enabled: true,
  paused: false,
})
