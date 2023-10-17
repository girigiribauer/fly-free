import type { Preference } from '~/models/Preference'

export type PreferenceTaittsuu = Preference

export const DefaultPreference: PreferenceTaittsuu = Object.seal({
  service: 'Taittsuu',
  enabled: false,
  paused: false,
})
