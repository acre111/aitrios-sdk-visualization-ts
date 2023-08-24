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
import { SemanticSegmentationTop } from './segmentation/semantic-segmentation-top'
import { SemanticSegmentationData } from './segmentation/semantic-segmentation-data'

export const deserializeSemanticSegmentation = (decodeData: Buffer) => {
  type Inference = {
    height: number,
    width: number,
    classIdMap: number[],
    numClassId: number,
    scoreMap: number[]
  }

  const deserializedInference = (readsegData: SemanticSegmentationData) => {
    const classIdMapLength = readsegData.classIdMapLength()
    const classIdMap: number[] = []
    for (let i = 0; i < classIdMapLength; i++) {
      const classIdMapData = readsegData.classIdMap(i)
      if (classIdMapData !== null) {
        classIdMap.push(classIdMapData)
      }
    }
    const scoreMapLength = readsegData.scoreMapLength()
    const scoreMap: number[] = []
    for (let i = 0; i < scoreMapLength; i++) {
      const scoreMapData = readsegData.scoreMap(i)
      if (scoreMapData !== null) {
        scoreMap.push(Math.round(scoreMapData * 1000000) / 1000000)
      }
    }
    const deserializedSegmentationData: Inference = {
      height: Number(readsegData.height()),
      width: Number(readsegData.width()),
      classIdMap,
      numClassId: Number(readsegData.numClassId()),
      scoreMap
    }
    return deserializedSegmentationData
  }

  const pplOut = SemanticSegmentationTop.getRootAsSemanticSegmentationTop(new flatbuffers.ByteBuffer(decodeData))
  const readsegData = pplOut.perception()

  if (readsegData !== null) {
    const deserializedInferenceData = deserializedInference(readsegData)
    return deserializedInferenceData
  } else {
    console.log('readsegData is null')
  }
}
