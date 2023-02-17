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

import { CLASSIFICATION, OBJECT_DETECTION } from '../../pages'
import { deserializeClassification } from './deserializeClassification'
import { deserializeObjectDetection } from './deserializeObjectDetection'

/**
 * Deserialize inference data by AI model.
 *
 * @param inferenceData  Get uploading inference data.
 * @param aiTask The model of the used AI model type.
 *
 * @returns an object. Ex: [{"1":{...}, "2"{...}, ...,}]
 */
export const deserialize = async (inferenceData: string, aiTask: string) => {
  try {
    let deserializeResult
    const decoded = Buffer.from(inferenceData, 'base64')
    if (aiTask === OBJECT_DETECTION) {
      deserializeResult = deserializeObjectDetection(decoded)
    } else if (aiTask === CLASSIFICATION) {
      deserializeResult = deserializeClassification(decoded)
    }
    return deserializeResult
  } catch (e) {
    throw new Error()
  }
}
