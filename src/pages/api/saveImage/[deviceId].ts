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
import { getConsoleSettings } from '../../../common/config'
import { saveImage, WORK_DIR } from '../../../hooks/fileUtil'
import * as path from 'path'

/**
 * Uses Console to get image data and save it.
 *
 * @param deviceId The id of the device to get uploading image data.
 * @param subDirectory image data's subdirectory name.
 * @param numberOfImages The number of image data at one time request.
 * @param skip Start point of image data.
 */
async function getImage (deviceId: string, subDirectory: string, numberOfImages: number, skip: number) {
  let calClient
  const consoleSettings = getConsoleSettings()
  try {
    const config = new Config(consoleSettings.console_access_settings.console_endpoint,
      consoleSettings.console_access_settings.portal_authorization_endpoint,
      consoleSettings.console_access_settings.client_id,
      consoleSettings.console_access_settings.client_secret)
    calClient = await Client.createInstance(config)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Wrong setting. Check the settings.' }))
  }
  const response = await calClient?.insight.getImageData(deviceId, subDirectory, numberOfImages, skip, 'ASC')
  try {
    const saveDirPath = path.join(WORK_DIR, deviceId, subDirectory)
    response.images.forEach((element: any) => {
      saveImage(element, saveDirPath)
    })
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to save images.' }))
  }
}

/**
 * Save image data as defined by the query parameter.
 *
 * @param req Request
 * deviceId: edge AI device ID
 * subDirectory: image data's subdirectory name.
 * numberOfImages: The number of image data at one time request.
 * skip: Start point of image data.
 *
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests.' })
    return
  }
  const deviceId: string | undefined = req.query.deviceId?.toString()
  const subDirectory: string | undefined = req.query.subDirectory?.toString()
  const numberOfImages: number = Number(req.query.endIndex) - Number(req.query.startIndex) + 1
  const skip: number = Number(req.query.startIndex)

  if (deviceId === undefined || subDirectory === undefined) {
    throw new Error(JSON.stringify({ message: 'Some parameter is undefined.' }))
  } else {
    await getImage(deviceId, subDirectory, numberOfImages, skip)
      .then(result => {
        res.status(200).json(result)
      }).catch(err => {
        res.status(500).json(err.message)
      })
  }
}
