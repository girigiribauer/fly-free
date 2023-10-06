import style from '~/components/ServiceToggle.module.css'

export type ServiceToggleProps = {
  id: string
  state: boolean
  handleSwitch?: (state: boolean) => void
}

export const ServiceToggle = ({
  id,
  state,
  handleSwitch = () => {},
}: ServiceToggleProps) => {
  return (
    <label className={style.toggle}>
      <input
        type="checkbox"
        className={style.checkbox}
        id={id}
        name={id}
        checked={state}
        onChange={(e) => handleSwitch?.(e.target.checked)}
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
