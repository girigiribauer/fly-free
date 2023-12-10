import style from '~/components/ToggleButton.module.css'

export type ToggleButtonProps = {
  id: string
  state: boolean
  handleToggle: (state: boolean) => void
}

export const ToggleButton = ({
  id,
  state,
  handleToggle,
}: ToggleButtonProps) => {
  return (
    <label className={style.toggle}>
      <input
        type="checkbox"
        className={style.checkbox}
        id={id}
        name={id}
        checked={state}
        onChange={(e) => handleToggle(e.target.checked)}
      />
      <img
        src="/assets/toggle-on.svg"
        className={style.toggleOn}
        alt="ON"
        width="64"
        height="20"
      />
      <img
        src="/assets/toggle-off.svg"
        className={style.toggleOff}
        alt="OFF"
        width="64"
        height="20"
      />
    </label>
  )
}
