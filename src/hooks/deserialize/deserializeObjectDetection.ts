/*
 * Copyright 2022 Sony Semiconductor Solutions Corp. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { flatbuffers } from 'flatbuffers'
import { SmartCamera } from './ObjectdetectionGenerated'

export const deserializeObjectDetection = (decodeData: Buffer) => {
    type Inference = {
        'C': number,
        'P': number,
        'X': number,
        'Y': number,
        'x': number,
        'y': number
    }

    const pplOut = SmartCamera.ObjectDetectionTop.getRootAsObjectDetectionTop(new flatbuffers.ByteBuffer(decodeData))
    const readObjData = pplOut.perception()
    let resNum
    if (readObjData !== null) {
      resNum = readObjData.objectDetectionListLength()
    } else {
      console.log('readObjData is null')
      return
    }

    const deserializedInferenceData:{[prop: string]: any} = [{}]
    for (let i = 0; i < resNum; i++) {
      const objList = readObjData.objectDetectionList(i)
      let unionType
      if (objList !== null) {
        unionType = objList.boundingBoxType()
      } else {
        console.log('objList is null')
        return
      }

      if (unionType === SmartCamera.BoundingBox.BoundingBox2d) {
        const bbox2d = objList.boundingBox(new SmartCamera.BoundingBox2d())
        let res: Inference
        if (bbox2d !== null) {
          res = {
            C: Number(objList.classId()),
            P: Number(objList.score()),
            X: Number(bbox2d.left()),
            Y: Number(bbox2d.top()),
            x: Number(bbox2d.right()),
            y: Number(bbox2d.bottom())
          }
        } else {
          console.log('bbox2d is null')
          return
        }
        const inferenceKey = String(i + 1)
        deserializedInferenceData[0][inferenceKey] = res
      } else {
        throw new Error()
      }
    }

    return deserializedInferenceData
}
