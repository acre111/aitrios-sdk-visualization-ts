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

import { Client, Config } from 'consoleaccesslibrary'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getConsoleSettings } from '../../../common/config'

/**
 * Uses Console to request that a device stop uploading inference data
 *
 * @param deviceId The id of the device to request that it stops uploading inference data.
 * @returns an object containing information on whether or not the operation succeeded. Ex: { "result": "SUCCESS" } or { "result": "ERROR", "code": ..., "message": ..., "time": ... }
 */
const stopUploadInferenceResult = async (deviceId: string) => {
  const consoleSettings = getConsoleSettings()
  let calClient
  try {
    const config = new Config(consoleSettings.console_access_settings.console_endpoint, consoleSettings.console_access_settings.portal_authorization_endpoint, consoleSettings.console_access_settings.client_id, consoleSettings.console_access_settings.client_secret)
    calClient = await Client.createInstance(config)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Wrong setting. Check the settings.' }))
  }
  const res = await calClient?.deviceManagement?.stopUploadInferenceResult(deviceId)
  if (res.status !== 200) {
    throw new Error(JSON.stringify(res.response.data))
  }

  return res.data
}

/**
 * Request that a device stop uploading inference data.
 *
 * @param req Request
 * deviceId: edge AI device ID
 *
 * @param res Response
 * result: execution result
 *
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests.' })
    return
  }
  const deviceId = req.query.deviceId.toString()
  await stopUploadInferenceResult(deviceId)
    .then(result => {
      res.status(200).json(result)
    }).catch(err => {
      res.status(500).json(err.message)
    })
}
