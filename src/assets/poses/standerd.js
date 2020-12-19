import { VRMSchema } from '@pixiv/three-vrm'

export default {
  [VRMSchema.HumanoidBoneName.LeftUpperArm]: {
    rotation: [0, 0, Math.PI / 2 - 1, 0.8]
  },
  [VRMSchema.HumanoidBoneName.LeftHand]: {
    rotation: [0, 0, 0.1, 0]
  },
  [VRMSchema.HumanoidBoneName.RightUpperArm]: {
    rotation: [0, 0, -(Math.PI / 2 - 1), 0.8]
  },
  [VRMSchema.HumanoidBoneName.RightHand]: {
    rotation: [0, 0, -0.1, 0]
  }
}
