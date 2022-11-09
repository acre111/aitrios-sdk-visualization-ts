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

import type { NextApiRequest, NextApiResponse } from 'next'

import { Client } from 'consoleaccesslibrary'
import { ConsoleAccessLibrarySettings, DemoConfiguration } from '../../../common/config'

/**
 * Uses Console to request that a device stop uploading inference data
 *
 * @param deviceId The id of the device to request that it stops uploading inference data.
 * @returns an object containing information on whether or not the operation succeeded. Ex: { "result": "SUCCESS" } or { "result": "ERROR", "code": ..., "message": ..., "time": ... }
 */
const stopUploadInferenceResult = async (deviceId: string) => {
  const calClient = await Client.createInstance(ConsoleAccessLibrarySettings)
  const res = await calClient?.deviceManagement?.stopUploadInferenceResult(deviceId)
  return res.data
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const deviceId = req.query.deviceId ? req.query.deviceId.toString() : DemoConfiguration.deviceId
  await stopUploadInferenceResult(deviceId)
    .then(result => {
      res.status(200).json(result)
    }).catch(err => {
      res.status(500).json(err)
    })
}
