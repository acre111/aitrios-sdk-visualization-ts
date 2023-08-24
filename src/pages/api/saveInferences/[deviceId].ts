/*
 * Copyright 2023 Sony Semiconductor Solutions Corp. All rights reserved.
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
import { deserialize } from '../../../hooks/deserialize/deserializeFunction'
import { saveInference, WORK_DIR, getTimestampFromImageFIleName } from '../../../hooks/fileUtil'
import { getDateDecrement, getDateIncrement } from '../../../hooks/util'

import * as path from 'path'

/**
 * Get timestamp from Directory name.
 *
 * @param dir directory path.
 *
 * @returns Timestamp list.
 */

/**
 * Uses Console to get inference data and save it.
 *
 * @param deviceId The id of the device to get uploading image data.
 * @param subDirectory the image data's subdirectory name.
 * @param aiTask The model of the used AI model type.

 * @returns an object containing information on whether or not the operation succeeded. Ex: { "result": "SUCCESS" }
 */
async function getInference (deviceId: string, subDirectory: string, aiTask: string) {
  const consoleSettings = getConsoleSettings()
  const errorMsg = 'Fail to save Inferences.'
  let calClient
  try {
    const config = new Config(consoleSettings.console_access_settings.console_endpoint,
      consoleSettings.console_access_settings.portal_authorization_endpoint,
      consoleSettings.console_access_settings.client_id,
      consoleSettings.console_access_settings.client_secret)
    calClient = await Client.createInstance(config)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Wrong setting. Check the settings.' }))
  }

  let saveDirPath
  let timestampList
  try {
    saveDirPath = path.join(WORK_DIR, deviceId, subDirectory)
    timestampList = getTimestampFromImageFIleName(saveDirPath)
    timestampList.sort()
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to get timestamp list.' }))
  }

  const maxNumberOfGetInference = 10000
  const procCount = Math.ceil(timestampList.length / (maxNumberOfGetInference / 2))
  for (let i = 0; i < procCount; i++) {
    const execList = timestampList.slice(i * (maxNumberOfGetInference / 2), (i + 1) * (maxNumberOfGetInference / 2))
    const filter = `EXISTS(SELECT VALUE i FROM i IN c.Inferences WHERE i.T >= "${getDateDecrement(execList[0])}" AND i.T <= "${getDateIncrement(timestampList[execList.length - 1])}")`
    const response = await calClient?.insight.getInferenceResults(deviceId, filter, maxNumberOfGetInference, 1, undefined)
    if (response.status !== 200) {
      throw new Error(JSON.stringify({ message: errorMsg }))
    }

    try {
      if (response.data.length === 0) {
        continue
      }
    } catch (e) {
      throw new Error(JSON.stringify({ message: errorMsg }))
    }

    for (const timeStamp of execList) {
      for (const data of response.data) {
        if (timeStamp === data.inference_result.Inferences[0].T) {
          try {
            let deserializedList
            if (data.inference_result.Inferences[0].O) {
              deserializedList = await deserialize(data.inference_result.Inferences[0].O, aiTask)
            }
            if (deserializedList !== undefined) {
              if (aiTask === OBJECT_DETECTION || aiTask === CLASSIFICATION) {
                data.inference_result.Inferences[0].O = deserializedList
              } else if (aiTask === SEGMENTATION) {
                const T = data.inference_result.Inferences[0].T
                data.inference_result.Inferences[0] = { T, ...deserializedList }
              }
            }
          } catch (err) {
            throw new Error(JSON.stringify({ message: 'The specified AITask and data AITask may not match.\rPlease check the specified AITask.' }))
          }
          try {
            saveInference(data, saveDirPath, timeStamp)
          } catch (err) {
            throw new Error(JSON.stringify({ message: errorMsg }))
          }
        }
      }
    }
  }
}

/**
 * Get inference data as defined by the query parameter.
 *
 * @param req Request
 * deviceId: edge AI device ID
 * subDirectory: image data's subdirectory name.
 * aiTask: The model of the used AI model type.
 *
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests.' })
    return
  }
  const deviceId: string | undefined = req.query.deviceId?.toString()
  const subDirectory: string | undefined = req.query.subDirectory?.toString()
  const aiTask: string | undefined = req.query.aiTask?.toString()

  if (deviceId === undefined || subDirectory === undefined || aiTask === undefined) {
    throw new Error(JSON.stringify({ message: 'Some parameter is undefined.' }))
  } else {
    if (aiTask !== OBJECT_DETECTION && aiTask !== CLASSIFICATION && aiTask !== SEGMENTATION) {
      res.status(400).json({ message: 'Only objectDetection or classification or segmentation.' })
      return
    }
    await getInference(deviceId, subDirectory, aiTask)
      .then(result => {
        res.status(200).json(result)
      }).catch(err => {
        res.status(500).json(err.message)
      })
  }
}
