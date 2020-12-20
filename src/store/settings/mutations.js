export function updateLang (state, data) {
  state.lang = data
}

export function updateMode (state, data) {
  state.mode = data
}

export function updateDevice (state, data) {
  state.cam.device = data
}

export function updateColor (state, data) {
  state.color = data
}

export function updateModel (state, data) {
  state.model.file = data
}

export function updateImage (state, data) {
  state.image.file = data.url
  state.image.width = data.width
  state.image.height = data.height
}

export function updateMouth (state, data) {
  state.model.mouth = data
}

export function updateEmote (state, data) {
  state.model.emote = data
}

export function updatePose (state, data) {
  state.model.pose = data
}

export function updateLight (state, data) {
  state.light.intensity = data
}
