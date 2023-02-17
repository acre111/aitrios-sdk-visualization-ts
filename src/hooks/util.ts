/*
 * Copyright 2022 Sony Semiconductor Solutions Corp. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CLASSIFICATION, HISTORY_MODE, OBJECT_DETECTION, REALTIME_MODE } from '../pages'

export type BoundingBoxProps = {
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  confidence: number,
  bbStrokeColor: string,
  tagStrokeColor: string,
  tagTextColor: string,
}

export type ClsInferenceProps = {
  label: string,
  confidence: number
}

type UploadHandlerProps = {
  isUploading: boolean,
  deviceId: string,
  setIsUploading: (isUploading: boolean) => void,
  setIsLoading: (isLoading: boolean) => void,
  setImagePath: (imagePath: string) => void,
  setIsPlaying: (isPlaying: boolean) => void,
  setLoadingDialogFlg: (loadingDialogFlg: boolean) => void
}

export type PollingHandlerProps = {
  deviceId: string,
  imagePath: string,
  aiTask: string,
  mode: string,
  imageCount: number,
  totalCount: number,
  isFirst: boolean,
  setImageCount: (imageCount: number) => void,
  setIsFirst: (isFirst: boolean) => void,
  setLoadingDialogFlg: (display: boolean) => void
}

export type PollingData = {
  image: any
  timeStamp: string
  inferenceRawData: string
  inference: string
  imageCount: number
}

export type setDataProps = {
  pollingData: PollingData | undefined,
  aiTask: string,
  imageCount: number,
  totalCount: number,
  setImage: (image: string) => void,
  setTimestamp: (timestamp: string) => void,
  setImageCount: (imageCount: number) => void,
  setIsFirst: (isFirst: boolean) => void,
  setInferencesOD: (inferences: BoundingBoxProps[] | undefined) => void,
  setInferencesCls: (inferences: ClsInferenceProps[] | undefined) => void,
  setInferencesRawData: (inferences: string | undefined) => void,
  setLoadingDialogFlg: (display: boolean) => void
}

export type ErrorData = {
  result?: string,
  code?: string,
  message: string,
  time?: string
}

const COLORS = [
  ['blue', 'white'],
  ['black', 'white'],
  ['yellow', 'black'],
  ['tomato', 'black'],
  ['green', 'white'],
  ['red', 'white'],
  ['pink', 'black'],
  ['cyan', 'black'],
  ['orange', 'black'],
  ['teal', 'white'],
  ['purple', 'white']
]

export const uploadHandler = async (props: UploadHandlerProps) => {
  if (!props.deviceId) {
    alert('Select Device ID')
    return
  }
  props.setIsLoading(true)
  !props.isUploading ? startUpload(props) : stopUpload(props)
  props.setIsLoading(false)
}

export const pollingHandler = async (props: PollingHandlerProps): Promise<PollingData> => {
  const pollingData: PollingData = {
    image: '',
    timeStamp: '',
    inferenceRawData: '',
    inference: '',
    imageCount: 0
  }

  try {
    let nextImageCount = 0
    if (props.mode === HISTORY_MODE) {
      if (props.isFirst) {
        props.setIsFirst(false)
        nextImageCount = props.imageCount
      } else if (props.imageCount === props.totalCount - 1) {
        nextImageCount = 0
      } else {
        nextImageCount = props.imageCount + 1
      }
    }
    pollingData.imageCount = nextImageCount

    const numberOfImages = 1
    const skip = nextImageCount
    const orderBy = props.mode === REALTIME_MODE ? 'DESC' : 'ASC'

    const url = `/api/image/${props.deviceId}?imagePath=${props.imagePath}&numberOfImages=${numberOfImages}&skip=${skip}&orderBy=${orderBy}`
    const image = await fetch(url, { method: 'GET' })

    if (image.status === 200) {
      const imageData = await image.json()
      const { timestamp } = imageData
      pollingData.image = `data:image/jpg;base64,${imageData.buff}`
      pollingData.timeStamp = timestamp

      const inference = await fetch(`/api/inference/${props.deviceId}?timestamp=${timestamp}&aiTask=${props.aiTask}`, { method: 'GET' })
      if (inference.status === 200) {
        const inferenceData = await inference.json()
        pollingData.inferenceRawData = inferenceData.inferencesList
        pollingData.inference = inferenceData.inferencesList.inferences[0].O[0]
      } else {
        const errorMessage: ErrorData = await inference.json()
        handleResponseErr(errorMessage)
      }
    } else {
      const errorMessage: ErrorData = await image.json()
      handleResponseErr(errorMessage)
    }
  } catch (e) {
    handleResponseErr({ message: 'An error has occurred.' })
    props.setLoadingDialogFlg(false)
  }
  return pollingData
}

export const setData = async (props: setDataProps) => {
  try {
    if (props.pollingData !== undefined) {
      props.setInferencesRawData(props.pollingData.inferenceRawData)
      if (props.aiTask === OBJECT_DETECTION) {
        props.setInferencesOD(convertInferencesOD(props.pollingData.inference))
      } else if (props.aiTask === CLASSIFICATION) {
        props.setInferencesCls(convertInferencesCls(props.pollingData.inference))
      }

      props.setImageCount(props.pollingData.imageCount)
      props.setTimestamp(props.pollingData.timeStamp)
      props.setImage(props.pollingData.image)
    }

    props.setLoadingDialogFlg(false)
  } catch (e) {
    handleResponseErr({ message: 'An error has occurred.' })
    props.setLoadingDialogFlg(false)
  }
}

export const convertInferencesOD = (inferenceResults: {}): BoundingBoxProps[] => {
  const results: BoundingBoxProps[] = []
  Object.values(inferenceResults).forEach((value: any) => {
    const bbsElement: BoundingBoxProps = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      label: '',
      confidence: 0,
      bbStrokeColor: '',
      tagStrokeColor: '',
      tagTextColor: ''
    }

    bbsElement.x = value.X
    bbsElement.y = value.Y
    bbsElement.width = Math.abs(value.X - value.x)
    bbsElement.height = Math.abs(value.y - value.Y)
    bbsElement.label = value.C.toString()
    bbsElement.confidence = value.P
    bbsElement.bbStrokeColor = COLORS[value.C % COLORS.length][0]
    bbsElement.tagStrokeColor = COLORS[value.C % COLORS.length][0]
    bbsElement.tagTextColor = COLORS[value.C % COLORS.length][1]

    results.push(bbsElement)
  })
  return results
}

export const convertInferencesCls = (inferenceResults: {}): ClsInferenceProps[] => {
  const results: ClsInferenceProps[] = []
  Object.values(inferenceResults).forEach((value: any) => {
    const ccaElement: ClsInferenceProps = {
      label: '',
      confidence: 0
    }

    ccaElement.label = value.C.toString()
    ccaElement.confidence = value.P

    results.push(ccaElement)
  })
  return results
}

export const handleResponseErr = (err: ErrorData) => {
  console.error(err)
  alert(err.message)
}

const startUpload = async (props: UploadHandlerProps) => {
  try {
    const startUploadResponse = await fetch(`/api/startUploadInferenceResult/${props.deviceId}`, { method: 'POST' })
    if (startUploadResponse.status === 200) {
      const startUploadData = await startUploadResponse.json()
      props.setIsUploading(true)
      const fullSubDir: string = startUploadData.outputSubDirectory
      const subDirList = fullSubDir.split('/')
      const subDir = subDirList[subDirList.length - 1]
      props.setImagePath(subDir)
      props.setLoadingDialogFlg(false)
    } else {
      const errorMessage: ErrorData = await startUploadResponse.json()
      handleResponseErr(errorMessage)
    }
  } catch (e) {
    handleResponseErr({ message: 'An error has occurred.' })
    props.setLoadingDialogFlg(false)
  }
}

const stopUpload = async (props: UploadHandlerProps) => {
  try {
    const stopUploadResponse = await fetch(`/api/stopUploadInferenceResult/${props.deviceId}`, { method: 'POST' })
    if (stopUploadResponse.status === 200) {
      props.setIsUploading(false)
      props.setIsPlaying(false)
      props.setImagePath('')
      props.setLoadingDialogFlg(false)
    } else {
      const errorMessage: ErrorData = await stopUploadResponse.json()
      handleResponseErr(errorMessage)
    }
  } catch (e) {
    handleResponseErr({ message: 'An error has occurred.' })
    props.setLoadingDialogFlg(false)
  }
}
