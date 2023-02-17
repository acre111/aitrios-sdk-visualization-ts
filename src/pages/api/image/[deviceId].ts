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
 * Uses Console to get uploading image data
 *
 * @param deviceId The id of the device to get uploading image data.
 * @param imagePath The path of the storage for acquired images.
 * @param numberOfImages The number of the image data.
 * @param skip The number of the index to start getting.
 * @param orderBy The order of datas, ascending or descending .
 *
 * @returns an object . Ex: { "data": {"images": ["contents": ..., "name":...,]} } or { "result": "ERROR", "code": ..., "message": ..., "time": ... }
 */
const getBlob = async (deviceId: string, imagePath: string, numberOfImages: number, skip: number, orderBy: string) => {
  const consoleSettings = getConsoleSettings()
  let calClient
  try {
    const config = new Config(consoleSettings.console_access_settings.console_endpoint, consoleSettings.console_access_settings.portal_authorization_endpoint, consoleSettings.console_access_settings.client_id, consoleSettings.console_access_settings.client_secret)
    calClient = await Client.createInstance(config)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Wrong setting. Check the settings.' }))
  }
  const response = await calClient?.insight.getImages(deviceId, imagePath, numberOfImages, skip, orderBy)
  if (response.status !== 200) {
    throw new Error(JSON.stringify(response.response.data))
  }
  return response
}

/**
 * Get image data as defined by the query parameter.
 *
 * @param req Request
 * deviceId: edge AI device ID
 * imagePath: image data's subdirectory name.
 * numberOfImages: get Image numbers. only use '1'
 * skip: Number of images to skip get.
 * orderBy: use 'ASC' or 'DESC'
 *
 * @param res Response
 * buff:get image contents data (base64 encode)
 * timestamp: image timestamp
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests.' })
    return
  }
  const deviceId: string = req.query.deviceId.toString()
  const imagePath: string = req.query.imagePath.toString()
  const numberOfImages: number = Number(req.query.numberOfImages)
  const skip: number = Number(req.query.skip)
  const orderBy: string = req.query.orderBy.toString()

  await getBlob(deviceId, imagePath, numberOfImages, skip, orderBy)
    .then(result => {
      const imageData = { buff: result.data.images[0].contents, timestamp: (result.data.images[0].name).replace('.jpg', '') }
      res.status(200).json(imageData)
    }).catch(err => {
      res.status(500).json(err.message)
    })
}
