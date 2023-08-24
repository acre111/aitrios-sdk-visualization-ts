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

import { Client, Config } from 'consoleaccesslibrary'
import type { NextApiRequest, NextApiResponse } from 'next'
import { CLASSIFICATION, OBJECT_DETECTION, SEGMENTATION } from '../..'
import { getConsoleSettings } from '../../../common/config'
import { getDateDecrement, getDateIncrement } from '../../../hooks/util'
import { deserialize } from '../../../hooks/deserialize/deserializeFunction'

/**
 * Uses Console to get uploading inference data, and deserialize
 *
 * @param deviceId The id of the device to get uploading inference data.
 * @param timestamp The time of the inference data is retrieved.
 * @param aiTask The model of the used AI model type.
 *
 * @returns an object. Ex: [{"1":{...}, "2"{...}, ...,}]
 */
const getInferenceResults = async (deviceId: string, timestamp: string, aiTask: string) => {
  const consoleSettings = getConsoleSettings()
  let calClient
  try {
    const config = new Config(consoleSettings.console_access_settings.console_endpoint, consoleSettings.console_access_settings.portal_authorization_endpoint, consoleSettings.console_access_settings.client_id, consoleSettings.console_access_settings.client_secret)
    calClient = await Client.createInstance(config)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Wrong setting. Check the settings.' }))
  }
  const filter = `EXISTS(SELECT VALUE i FROM i IN c.Inferences WHERE i.T >= "${getDateDecrement(timestamp)}" AND i.T <= "${getDateIncrement(timestamp)}")`
  const res = await calClient?.insight.getInferenceResults(deviceId, filter, 1, 1, undefined)
  if (res.status !== 200) {
    throw new Error(JSON.stringify(res.response.data))
  }

  const errorMsg = JSON.stringify({ message: 'Cannot get inferences.' })
  try {
    if (res.data.length === 0 || !res.data[0].inference_result.Inferences[0].O) {
      throw new Error(errorMsg)
    }
  } catch (e) {
    throw new Error(errorMsg)
  }

  try {
    const deserializedList = await deserialize(res.data[0].inference_result.Inferences[0].O, aiTask)
    const deserializedRawData = res.data[0]
    if (deserializedList !== undefined) {
      if (aiTask === OBJECT_DETECTION || aiTask === CLASSIFICATION) {
        deserializedRawData.inference_result.Inferences[0].O = deserializedList
      } else if (aiTask === SEGMENTATION) {
        const T = deserializedRawData.inference_result.Inferences[0].T
        deserializedRawData.inference_result.Inferences[0] = { T, ...deserializedList }
      }
      return deserializedRawData
    }
  } catch (e) {
    throw new Error(JSON.stringify({ message: 'The specified AITask and data AITask may not match.\rPlease check the specified AITask.' }))
  }
}

/**
 * Retrieves inference result items from Cosmos DB as defined by the query parameter.
 *
 * @param req Request
 * deviceId: edge AI device ID
 * timestamp: used filter on data related to the image
 * aiTask: Specify the AI model used  ex.'objectDetection'
 *
 * @param res Response
 * inferencesList:get inference contents data (after deserialize)
 *
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests.' })
    return
  }
  const deviceId: string | undefined = req.query.deviceId?.toString()
  const timestamp: string | undefined = req.query.timestamp?.toString()
  const aiTask: string | undefined = req.query.aiTask?.toString()

  if (deviceId === undefined || timestamp === undefined || aiTask === undefined) {
    throw new Error(JSON.stringify({ message: 'Some parameter is undefined.' }))
  } else {
    if (aiTask !== OBJECT_DETECTION && aiTask !== CLASSIFICATION && aiTask !== SEGMENTATION) {
      res.status(400).json({ message: 'Only objectDetection or classification or segmentation.' })
      return
    }
    await getInferenceResults(deviceId, timestamp, aiTask)
      .then((result) => {
        const inferenceData = { inferencesList: result }
        return res.status(200).json(inferenceData)
      }).catch(err => {
        return res.status(500).json(err.message)
      })
  }
}
