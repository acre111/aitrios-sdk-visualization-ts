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

import { Client } from 'consoleaccesslibrary'
import { ConsoleAccessLibrarySettings, DemoConfiguration } from '../../../common/config'
import type { NextApiRequest, NextApiResponse } from 'next'
import { saveInference } from '../../../hooks/fileUtil'

const getInferenceResults = async (deviceId: string, imagePath: string) => {
  try {
    const calClient = await Client.createInstance(ConsoleAccessLibrarySettings)
    const res = await calClient?.insight.getInferenceresults(deviceId, 1, '', 1, imagePath)
    return { statusCode: 200, res }
  } catch (err) {
    console.error(err)
    return { statusCode: err.statusCode, msg: err.code }
  }
}

/**
 * Retrieves inference result items from Cosmos DB as defined by the query parameter.
 *
 * Get all: /api/inference/<deviceId>/all
 * Get latest: /api/inference/deviceId>/latest
 * Get newer than timestamp: /api/inferencere/<deviceId>/<timestamp string>
 *
 * The query parameters are in req.query.{deviceId | selector}, where selector = "all" | "latest" | timestamp
 *
 * @param req Request
 * @param res Response
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const deviceId: string = req.query.deviceId ? req.query.deviceId.toString() : DemoConfiguration.deviceId
  const imagePath: string = req.query.imagePath ? req.query.imagePath.toString() : ''
  const timestamp: string = req.query.timestamp ? req.query.timestamp.toString() : ''

  await getInferenceResults(deviceId, timestamp)
    .then((result) => {
      const { data } = result.res
      const deserializedData = saveInference(deviceId, data, imagePath, timestamp)
      return res.status(200).json(deserializedData)
    }).catch(err => {
      return res.status(500).json(err)
    })
}
