import type { Preference } from '~/models/Preference'

export type PreferenceBluesky = Preference & {
  username: string
  password: string
}

export const DefaultPreference: PreferenceBluesky = Object.seal({
  service: 'Bluesky',
  enabled: true,
  paused: false,
  username: '',
  password: '',
})
