/**
 * 检测是否需要禁用此橡皮筋效果
 * **/
export function WhetherToDisableTheEffect(
  target = document.body,
  log = false,
  className = 'touch-none'
) {
  if (target === undefined) return
  const result = target.clientHeight === target.scrollHeight
  if (log) console.log(target.clientHeight, target.scrollHeight)
  if (result) target.classList.add(className)
  else target.classList.remove(className)
}
