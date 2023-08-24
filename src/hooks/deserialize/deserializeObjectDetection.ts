/*
 * Copyright 2022, 2023 Sony Semiconductor Solutions Corp. All rights reserved.
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

import * as flatbuffers from 'flatbuffers'
import { ObjectDetectionTop } from './objectdetection/object-detection-top'
import { BoundingBox } from './objectdetection/bounding-box'
import { BoundingBox2d } from './objectdetection/bounding-box2d'

export const deserializeObjectDetection = (decodeData: Buffer) => {
  type Inference = {
    'class_id': number,
    'score': number,
    'left': number,
    'top': number,
    'right': number,
    'bottom': number
  }

  const pplOut = ObjectDetectionTop.getRootAsObjectDetectionTop(new flatbuffers.ByteBuffer(decodeData))
  const readObjData = pplOut.perception()
  let resNum
  if (readObjData !== null) {
    resNum = readObjData.objectDetectionListLength()
  } else {
    console.log('readObjData is null')
    return
  }

  const deserializedInferenceData: { [prop: string]: any } = [{}]
  for (let i = 0; i < resNum; i++) {
    const objList = readObjData.objectDetectionList(i)
    let unionType
    if (objList !== null) {
      unionType = objList.boundingBoxType()
    } else {
      console.log('objList is null')
      return
    }

    if (unionType === BoundingBox.BoundingBox2d) {
      const bbox2d = objList.boundingBox(new BoundingBox2d())
      let res: Inference
      if (bbox2d !== null) {
        const objListScore = objList.score()
        const score = Math.round(objListScore * 1000000) / 1000000
        res = {
          class_id: Number(objList.classId()),
          score,
          left: Number(bbox2d.left()),
          top: Number(bbox2d.top()),
          right: Number(bbox2d.right()),
          bottom: Number(bbox2d.bottom())
        }
      } else {
        console.log('bbox2d is null')
        return
      }
      const inferenceKey = String(i + 1)
      deserializedInferenceData[0][inferenceKey] = res
    } else {
      throw new Error(JSON.stringify({ message: 'An error occurred in deserialize.' }))
    }
  }

  return deserializedInferenceData
}
