export function vibrate(pattern = 10) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function vibrateSuccess() {
  vibrate([10, 30, 10]);
}

export function vibrateError() {
  vibrate([30, 50, 30]);
}
