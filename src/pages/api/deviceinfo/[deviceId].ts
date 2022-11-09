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
 * Uses Console to retrieve information about a device with an id matching [deviceId].
 *
 * @param deviceId The id to retrieve information for
 * @returns an object containg information about the device.
 */
const getDeviceInfo = async (deviceId: string) => {
  const calClient = await Client.createInstance(ConsoleAccessLibrarySettings)
  const res = await calClient?.deviceManagement?.getDevices({ deviceId })
  if (res && res.data && res.data.devices) {
    return { deviceId: res.data.devices[0].device_id }
  }
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const deviceId = req.query.deviceId ? req.query.deviceId.toString() : DemoConfiguration.deviceId
  await getDeviceInfo(deviceId)
    .then(result => {
      res.status(200).json(result)
    }).catch(err => {
      res.status(500).json(err)
    })
}
