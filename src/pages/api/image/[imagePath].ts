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
import { ConsoleAccessLibrarySettings } from '../../../common/config'
import type { NextApiRequest, NextApiResponse } from 'next'
import { saveImage } from '../../../hooks/fileUtil'

type Result = {
  buff: Buffer,
  files: string[],
}

const getBlob = async (deviceId: string, imagePath: string) => {
  const calClient = await Client.createInstance(ConsoleAccessLibrarySettings)
  try {
    const buff = await calClient?.insight.getImages(deviceId, imagePath)
    return { statusCode: 200, buff }
  } catch (err) {
    console.error(err)
    return { statusCode: err.statusCode, msg: err.code }
  }
}

/**
 * Query parameter is for example: cf5c43cf368-JPG-20210306222225679-20210306222921197.jpg
 *
 * @param req
 * @param res
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse<Result>) {
  const imagePath: string = req.query.imagePath.toString()
  const deviceId: string = req.query.deviceId.toString()
  const result = await getBlob(deviceId, imagePath)

  if (result.statusCode === 200) {
    const { data } = result.buff
    const files: string[] = data.images.map((imageData) => {
      return saveImage(imagePath, imageData, deviceId)
    })

    const response: Result = {
      buff: data,
      files
    }
    res.json(response)
  } else { res.status(result.statusCode).json(result.msg) }
}
