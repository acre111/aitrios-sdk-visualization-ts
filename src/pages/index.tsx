/*
 * Copyright 2022, 2023 Sony Semiconductor Solutions Corp. All rights reserved.
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

import React, { useEffect, useState } from 'react'
import LoadingDialog from '../components/common/dialog/loading'
import { Input, Switch } from '@chakra-ui/react'
import Layout from '../components/common/layout'
import DropDownList from '../components/common/dropdownlist'
import DefaultButton from '../components/common/button/defaultbutton'
import ReloadSVG from '../components/common/button/defaultbutton/reload-svg'
import ObjectiveDetection from '../components/tabs/aiTask/objectdetection'
import Realtime from '../components/tabs/mode/realtime'
import useInterval from '../hooks/useInterval'
import { BoundingBoxProps, ClsInferenceProps, SegInferenceProps, PollingData, PollingHandlerProps, setDataProps, pollingHandler, setData, ErrorData, handleResponseErr, SegmentationLabelType, DeviceListData } from '../hooks/util'
import styles from '../styles/main-page.module.scss'
import { setPointerCapture } from 'konva/lib/PointerEvents'

export const REALTIME_MODE = 'realtimeMode'
export const HISTORY_MODE = 'historyMode'
export const OBJECT_DETECTION = 'objectDetection'
export const CLASSIFICATION = 'classification'
export const SEGMENTATION = 'segmentation'

function Home () {
  const [aiTask, setAiTask] = useState<string>(OBJECT_DETECTION)
  const [mode, setMode] = useState<string>(REALTIME_MODE)
  const [timestamp, setTimestamp] = useState<string>('')
  const [image, setImage] = useState<string>('')
  const [imageCls, setImageCls] = useState<string>('')
  const [imageSEG, setImageSEG] = useState<string>('')
  const [inferencesOD, setInferencesOD] = useState<BoundingBoxProps[] | undefined>(undefined)
  const [inferencesCls, setInferencesCls] = useState<ClsInferenceProps[] | undefined>(undefined)
  const [inferencesSEG, setInferencesSEG] = useState<SegInferenceProps | undefined>(undefined)

  const [inferenceRawData, setInferencesRawData] = useState<string | undefined>(undefined)
  const [labelDataOD, setLabelDataOD] = useState<string[]>(['woman', 'man', 'kid'])
  const [labelDataCLS, setLabelDataCLS] = useState<string[]>(['woman', 'man', 'kid'])
  const [labelDataSEG, setLabelDataSEG] = useState<SegmentationLabelType[]>([
    { isVisible: true, label: 'label1', color: '#000000' },
    { isVisible: false, label: 'label2', color: '#0000ff' },
    { isVisible: true, label: 'label3', color: '#ff0000' }
  ])
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [probability, setProbability] = useState<number>(0)
  const [isDisplayTs, setIsDisplayTs] = useState<boolean>(true)
  const [isOverlayIR, setIsOverlayIR] = useState<boolean>(true)
  const [overlayIRC, setOverlayIRC] = useState<string>('#FFFFFF')
  const [intervalTimeValue, setIntervalTimeValue] = useState<number>(10)
  const [deviceId, setDeviceId] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [imagePath, setImagePath] = useState<string>('')
  const [imageCount, setImageCount] = useState<number>(0)
  const [totalCount, setTotalCount] = useState<number>(1)
  const [loadingDialogFlg, setLoadingDialogFlg] = useState<boolean>(false)
  const [deviceIdList, setDeviceIdList] = useState<DeviceListData>({})
  const [isFirst, setIsFirst] = useState<boolean>(true)
  const [displayCount, setDisplayCount] = useState<number>(-1)
  const [pollingData, setPollingData] = useState<PollingData | undefined>(undefined)

  const [sinageMode, setSinageMode] = useState<'Management' | 'Sinage'>('Management')

  const pollingHandlerProps: PollingHandlerProps = {
    deviceId,
    imagePath,
    aiTask,
    mode,
    imageCount,
    totalCount,
    isFirst,
    setImageCount,
    setIsFirst,
    setLoadingDialogFlg
  }

  const setDataProps: setDataProps = {
    pollingData,
    aiTask,
    imageCount,
    totalCount,
    setImage,
    setImageCls,
    setImageSEG,
    setTimestamp,
    setImageCount,
    setIsFirst,
    setInferencesRawData,
    setInferencesOD,
    setInferencesCls,
    setInferencesSEG,
    setLoadingDialogFlg
  }

  useInterval(async () => {
    if (isPlaying) {
      setPollingData(await pollingHandler(pollingHandlerProps))
    }
  }, isPlaying ? intervalTimeValue * 1000 : null)

  useEffect(() => {
    if (isPlaying) {
      setData(setDataProps)
    }
  }, [pollingData])

  useEffect(() => {
    (async () => {
      if (isPlaying) {
        setPollingData(await pollingHandler(pollingHandlerProps))
      }
    })()
  }, [isPlaying])

  return (
    <>
      <LoadingDialog display={loadingDialogFlg} />
      <Layout title="edge AI Digital Signage">
        <div className={styles['main-page-container']}>
          <div className={styles['mode-input-area']}>
            Management/Sinage mode:
            <Input
              width="300px"
              onChange={(event) => { setSinageMode(event.target.value) }}
            />
            <a href={sinageMode}>Jump!</a>
          </div>
          {
            sinageMode === 'Management'
              ? <div className={styles['main-page-stage']}>
                  <ObjectiveDetection
                    aiTask={aiTask}
                    timestamp={timestamp}
                    image={image}
                    inferences={inferencesOD}
                    inferenceRawData={inferenceRawData}
                    labelData={labelDataOD}
                    setLabelData={setLabelDataOD}
                    probability={probability}
                    isDisplayTs={isDisplayTs}
                    imageCount={imageCount}
                    setDisplayCount={setDisplayCount}
                    setLoadingDialogFlg={setLoadingDialogFlg}
                    sinageMode={sinageMode}
                  />
                  <div className={styles['deviceid-area']}>
                    Device Name
                    <DropDownList
                      id={'device-id-list'}
                      name={deviceId} className={isPlaying || isUploading ? styles.disabled : styles.select}
                      list={Object.keys(deviceIdList)}
                      onChange={(event) => { setDeviceId(deviceIdList[event.target.value]) }}
                      disabled={mode === REALTIME_MODE
                        ? (isUploading)
                        : (isPlaying)
                      }
                      defaultSpace={true}
                    />
                    <DefaultButton isLoading={false}
                      icon={<ReloadSVG />}
                      text={'Reload'}
                      disabled={mode === REALTIME_MODE
                        ? (isUploading)
                        : (isPlaying)
                      }
                      action={async () => {
                        setDeviceId('')
                        setDeviceIdList({})
                        setLoadingDialogFlg(true)
                        const res = await fetch('/api/deviceInfo/deviceInfo', { method: 'GET' })
                        setLoadingDialogFlg(false)
                        if (res.status === 200) {
                          await res.json().then((data) => {
                            if (Object.keys(data).length === 0) {
                              return window.alert('Connected device not found.')
                            }
                            setDeviceIdList(data)
                          })
                        } else {
                          const errorMessage: ErrorData = await res.json()
                          handleResponseErr(errorMessage)
                        }
                      }
                    }
                    />
                      <Realtime
                        deviceId={deviceId}
                        setDeviceId={setDeviceId}
                        deviceIdList={deviceIdList}
                        setDeviceIdList={setDeviceIdList}
                        isPlaying={isPlaying}
                        mode={mode}
                        intervalTimeValue={intervalTimeValue}
                        isLoading={isLoading}
                        setIsPlaying={setIsPlaying}
                        setImagePath={setImagePath}
                        isUploading={isUploading}
                        setIsUploading={setIsUploading}
                        setIsLoading={setIsLoading}
                        setIntervalTimeValue={setIntervalTimeValue}
                        setLoadingDialogFlg={setLoadingDialogFlg}
                      />
                  </div>
                </div>
              : <ObjectiveDetection
                  aiTask={aiTask}
                  timestamp={timestamp}
                  image={image}
                  inferences={inferencesOD}
                  inferenceRawData={inferenceRawData}
                  labelData={labelDataOD}
                  setLabelData={setLabelDataOD}
                  probability={probability}
                  isDisplayTs={isDisplayTs}
                  imageCount={imageCount}
                  setDisplayCount={setDisplayCount}
                  setLoadingDialogFlg={setLoadingDialogFlg}
                  sinageMode={sinageMode}
                />
          }
        </div>
      </Layout >
    </>
  )
}

export default Home


