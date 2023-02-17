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

import * as yaml from 'js-yaml'
import * as fs from 'fs'

export type ConsoleSettings = {
  console_access_settings: {
    console_endpoint: string
    portal_authorization_endpoint: string
    client_secret: string
    client_id: string
  }
}

const ConsoleSettingsFile = './common/console_access_settings.yaml'

export function getConsoleSettings () {
  let consoleAccessSettings: ConsoleSettings = {
    console_access_settings: {
      console_endpoint: '',
      portal_authorization_endpoint: '',
      client_secret: '',
      client_id: ''
    }
  }
  if (!fs.existsSync(ConsoleSettingsFile)) {
    console.log('console_access_settings.yaml file is not exist.')
    return consoleAccessSettings
  }
  if (fs.lstatSync(ConsoleSettingsFile).isSymbolicLink()) {
    console.log('Can\'t open symbolic link console_access_settings.yaml file.')
    return consoleAccessSettings
  }
  const consoleAccessSettingFileData = yaml.load(fs.readFileSync(ConsoleSettingsFile, { encoding: 'utf8', flag: 'r' })) as ConsoleSettings
  consoleAccessSettings = {
    console_access_settings: {
      console_endpoint: consoleAccessSettingFileData.console_access_settings.console_endpoint,
      portal_authorization_endpoint: consoleAccessSettingFileData.console_access_settings.portal_authorization_endpoint,
      client_secret: consoleAccessSettingFileData.console_access_settings.client_secret,
      client_id: consoleAccessSettingFileData.console_access_settings.client_id
    }
  }
  return consoleAccessSettings
}
