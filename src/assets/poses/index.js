import { VRMSchema } from '@pixiv/three-vrm'
import standard from './standerd.js'
import ya from './ya.js'
import think from './think.js'

const reset = () => {
  const filled = {}
  Object.values(VRMSchema.HumanoidBoneName).forEach(boneName => {
    filled[boneName] = {
      rotation: [0, 0, 0, 1]
    }
  })
  return filled
}

export default {
  standard: {
    ...reset(),
    ...standard
  },
  ya: {
    ...reset(),
    ...ya
  },
  think: {
    ...reset(),
    ...think
  }
}
