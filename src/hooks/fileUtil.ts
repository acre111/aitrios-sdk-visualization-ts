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

import * as fs from 'fs'
import { preDeserialize } from './deserialize/deserialize'

const PUBLIC_DIRECTORY: string = './public'
const CUSTOMLABELS_FILENAME: string = PUBLIC_DIRECTORY + '/labels/customLabels.json'
const LABELS_FILENAME: string = PUBLIC_DIRECTORY + '/labels/labels.json'

export function saveImage (imagePath: string, imageData: any, deviceId: string) {
  try {
    const { name, contents } = imageData
    const dirName = removeExtension(`/${deviceId}/${imagePath}/${name}`)
    const fileName = `${dirName}/${name}`
    if (!fs.existsSync(`${PUBLIC_DIRECTORY}${dirName}`)) {
      fs.mkdir(`${PUBLIC_DIRECTORY}/${dirName}`, { recursive: true }, (err: any) => {
        if (err) throw err
        console.log(`${dirName} created successfully`)

        createImageFile(`${PUBLIC_DIRECTORY}${fileName}`, contents)
      })
    } else {
      createImageFile(`${PUBLIC_DIRECTORY}${fileName}`, contents)
    }

    console.log('fileName: ' + fileName)
    return fileName
  } catch (e) {
    console.error(e)
  }
}

export function saveInference (deviceId: string, inferenceData: string, subDirectory: string, timestamp: string) {
  try {
    const imagePath = `/${deviceId}/${subDirectory}/${timestamp}`
    if (fs.existsSync(`${PUBLIC_DIRECTORY}${imagePath}`)) {
      const deserializedData = createInferencesFile(`${PUBLIC_DIRECTORY}${imagePath}/${timestamp}.json`, inferenceData)
      return deserializedData
    }
  } catch (e) {
    console.error(e.message)
  }
}

export function readLabelsFile () {
  try {
    const selectedLabels = fs.existsSync(CUSTOMLABELS_FILENAME) ? CUSTOMLABELS_FILENAME : LABELS_FILENAME
    return fs.readFileSync(selectedLabels, 'utf-8')
  } catch (e) {
    console.error(e.message)
  }
}

export function writeLabelsFile (data: string) {
  try {
    fs.writeFileSync(CUSTOMLABELS_FILENAME, data)
  } catch (e) {
    console.error(e.message)
  }
}

export function createSubDir (deviceId: string) {
  const subDirectory = PUBLIC_DIRECTORY + `/${deviceId}/`
  if (!fs.existsSync(subDirectory)) {
    fs.mkdir(subDirectory, (err: any) => {
      if (err) throw err
      console.log(`${subDirectory} created successfully`)
    })
  }
}

function removeExtension (str: string) {
  let convertedStr
  if (str.indexOf('.') !== -1) {
    convertedStr = str.substring(0, str.indexOf('.'))
  } else {
    convertedStr = str
  }
  return convertedStr
}

function createImageFile (filePath: string, imageData: string) {
  try {
    fs.writeFile(filePath, imageData, { encoding: 'base64' }, (err: any) => {
      if (err) throw err
      console.log(`save data ${filePath}`)
    })
  } catch (e) {
    console.error(e.message)
  }
}

function createInferencesFile (filePath: string, inferenceData: any) {
  const deserializedData = preDeserialize(inferenceData)
  try {
    fs.writeFileSync(filePath, JSON.stringify(deserializedData))
    console.log(`save data ${filePath}`)
  } catch (e) {
    console.error(e.message)
  }
  return deserializedData
}
