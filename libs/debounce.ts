export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  callback: F,
  delay = 200,
) => {
  let timer: ReturnType<typeof setTimeout>

  return (...args: Parameters<F>) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      callback.apply(this, args)
    }, delay)
  }
}
