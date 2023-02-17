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
 * Uses Console to get Subdirectory of deviceId
 *
 * @param deviceId The id of the device to get uploading image data.
 *
 * @returns subDirectory list . Ex:['20220120','20220121','20220122']
 */
const getsubDirectoryList = async (deviceId: string) => {
  const consoleSettings = getConsoleSettings()
  let calClient
  try {
    const config = new Config(consoleSettings.console_access_settings.console_endpoint, consoleSettings.console_access_settings.portal_authorization_endpoint, consoleSettings.console_access_settings.client_id, consoleSettings.console_access_settings.client_secret)
    calClient = await Client.createInstance(config)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Wrong setting. Check the settings.' }))
  }
  const response = await calClient?.insight.getImageDirectories(deviceId)
  if (response.status !== 200) {
    throw new Error(JSON.stringify(response.response.data))
  }
  return response.data[0].devices[0].Image
}

/**
 * Get image data as defined by the query parameter.
 *
 * @param req Request
 * deviceId: edge AI device ID
 *
 * @param res Response
 * subDirectory list: List of subdirectories where inference source images are stored
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests.' })
    return
  }
  const deviceId: string = req.query.deviceId.toString()
  await getsubDirectoryList(deviceId)
    .then(result => {
      res.status(200).json(result)
    }).catch(err => {
      res.status(500).json(err.message)
    })
}
