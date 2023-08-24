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
import { ClassificationTop } from './classification/classification-top'

export const deserializeClassification = (decodeData: Buffer) => {
  type Inference = {
    'class_id': number
    'score': number
  }

  const pplOut = ClassificationTop.getRootAsClassificationTop(new flatbuffers.ByteBuffer(decodeData))
  const readclassData = pplOut.perception()
  let resNum
  if (readclassData !== null) {
    resNum = readclassData.classificationListLength()
  } else {
    console.log('readclassData is null')
    return
  }

  const deserializedInferenceData: { [prop: string]: any } = [{}]
  for (let i = 0; i < resNum; i++) {
    const clsList = readclassData.classificationList(i)
    let res: Inference
    if (clsList != null) {
      const clsListScore = clsList.score()
      const score = Math.round(clsListScore * 1000000) / 1000000
      res = {
        class_id: Number(clsList.classId()),
        score
      }
    } else {
      console.log('clsList is null')
      return
    }

    const inferenceKey = String(i + 1)
    deserializedInferenceData[0][inferenceKey] = res
  }

  return deserializedInferenceData
}
