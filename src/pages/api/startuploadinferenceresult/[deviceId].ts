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
 * Uses Console to request that a get Mode and UploadMethodIR in command parameter files
 *
 * @param deviceId The id of the device to request that it get command parameter files.
 * @returns an object containing information on whether or not the operation succeeded. Ex: { "Mode": "1", "UploadMethodIR": "Mqtt"}
 */
const getCommandParameterFile = async (deviceId: string) => {
  const calClient = await Client.createInstance(ConsoleAccessLibrarySettings)
  const response = await calClient?.deviceManagement?.getCommandParameterFile()
  let mode
  let uploadMethodIR
  const matchData = response.data.parameter_list.filter(function (value: any) {
    return value.device_ids.indexOf(deviceId) !== -1
  })
  if ('Mode' in matchData[0].parameter.commands[0].parameters) {
    mode = matchData[0].parameter.commands[0].parameters.Mode
  } else {
    mode = 0
  }
  if ('UploadMethodIR' in matchData[0].parameter.commands[0].parameters) {
    uploadMethodIR = matchData[0].parameter.commands[0].parameters.UploadMethodIR
  } else {
    uploadMethodIR = 'MQTT'
  }
  const result = `{"Mode": ${mode}, "UploadMethodIR": "${uploadMethodIR}"}`
  return result
}

/**
 * Uses Console to request that a device start uploading inference data
 *
 * @param deviceId The id of the device to request that it starts uploading inference data.
 * @returns an object containing information on whether or not the operation succeeded. Ex: { "result": "SUCCESS" }
 */
const startUploadInferenceResult = async (deviceId: string) => {
  const parameter = await getCommandParameterFile(deviceId)
  const json = JSON.parse(parameter)
  if (json.Mode !== 1 || json.UploadMethodIR.toUpperCase() !== 'MQTT') {
    return { result: 'ERROR' }
  }
  const calClient = await Client.createInstance(ConsoleAccessLibrarySettings)
  const res = await calClient?.deviceManagement?.startUploadInferenceResult(deviceId)
  return res.data
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const deviceId = req.query.deviceId ? req.query.deviceId.toString() : DemoConfiguration.deviceId
  await startUploadInferenceResult(deviceId)
    .then(result => {
      res.status(200).json(result)
    }).catch(err => {
      res.status(500).json(err)
    })
}
