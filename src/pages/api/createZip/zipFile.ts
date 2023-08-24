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

import type { NextApiRequest, NextApiResponse } from 'next'
import * as fs from 'fs'
import * as path from 'path'
import { createZipFile, WORK_DIR } from '../../../hooks/fileUtil'

/**
 * Create zip.
 *
 * @param req Request
 * @param res Response
 *
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests.' })
    return
  }

  const deviceId = fs.readdirSync(WORK_DIR)[0]
  const subDirectory = fs.readdirSync(`${WORK_DIR}/${deviceId}`)[0]
  const zipDirPath = path.join(WORK_DIR, deviceId, subDirectory)
  const zipFileName = path.join(WORK_DIR, `${subDirectory}.zip`)

  await createZipFile(zipDirPath, zipFileName, subDirectory).then(() => {
    return res.status(200).json({})
  }).catch(err => {
    console.error(err)
    return res.status(500).json(err.message)
  })
}
