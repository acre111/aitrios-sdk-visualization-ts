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

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import LoadingDialog from '../components/common/dialog/loading'
import Layout from '../components/common/layout'
import SettingMenu from '../components/common/menu/settingmenu'
import Classification from '../components/tabs/aiTask/classification'
import ObjectiveDetection from '../components/tabs/aiTask/objectdetection'
import History from '../components/tabs/mode/history'
import Realtime from '../components/tabs/mode/realtime'
import useInterval from '../hooks/useInterval'
import { BoundingBoxProps, ClsInferenceProps, PollingData, PollingHandlerProps, setDataProps, pollingHandler, setData } from '../hooks/util'
import styles from '../styles/main-page.module.scss'

export const REALTIME_MODE = 'realtimeMode'
export const HISTORY_MODE = 'historyMode'
export const OBJECT_DETECTION = 'objectDetection'
export const CLASSIFICATION = 'classification'

function Home () {
  const [aiTask, setAiTask] = useState<string>(OBJECT_DETECTION)
  const [mode, setMode] = useState<string>(REALTIME_MODE)
  const [timestamp, setTimestamp] = useState<string>('')
  const [image, setImage] = useState<string>('')
  const [inferencesOD, setInferencesOD] = useState<BoundingBoxProps[] | undefined>(undefined)
  const [inferencesCls, setInferencesCls] = useState<ClsInferenceProps[] | undefined>(undefined)
  const [inferenceRawData, setInferencesRawData] = useState<string | undefined>(undefined)
  const [labelData, setLabelData] = useState<string[]>(['1', '2', '3', '4', '5'])
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [probability, setProbability] = useState<number>(0)
  const [isDisplayTs, setIsDisplayTs] = useState<boolean>(true)
  const [displayScore, setDisplayScore] = useState<number>(5)
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
  const [deviceIdList, setDeviceIdList] = useState<string[]>([])
  const [isFirst, setIsFirst] = useState<boolean>(true)
  const [displayCount, setDisplayCount] = useState<number>(-1)
  const [pollingData, setPollingData] = useState<PollingData | undefined>(undefined)

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
    setTimestamp,
    setImageCount,
    setIsFirst,
    setInferencesRawData,
    setInferencesOD,
    setInferencesCls,
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
      <Layout title="edge AI device Visualization">
        <div className={styles['main-page-container']}>
          <div className={styles['main-page-stage']}>
            <Tabs className={styles['aitask-tabs']} onChange={(taskNum: number) => {
              setAiTask(taskNum === 0 ? OBJECT_DETECTION : CLASSIFICATION)
            }}>
              <TabList className={styles['aitask-tablist']}>
                <Tab isDisabled={isPlaying || isUploading}>Object Detection</Tab>
                <Tab isDisabled={isPlaying || isUploading}>Classification</Tab>
              </TabList>
              <div className={styles['display-setting-button']}>
                {aiTask === OBJECT_DETECTION
                  ? <SettingMenu
                    aiTask={aiTask}
                    mode={mode}
                    probability={probability}
                    setProbability={setProbability}
                    isDisplayTs={isDisplayTs}
                    setIsDisplayTs={setIsDisplayTs}
                  />
                  : <SettingMenu
                    aiTask={aiTask}
                    mode={mode}
                    probability={probability}
                    setProbability={setProbability}
                    isDisplayTs={isDisplayTs}
                    setIsDisplayTs={setIsDisplayTs}
                    displayScore={displayScore}
                    setDisplayScore={setDisplayScore}
                    isOverlayIR={isOverlayIR}
                    setIsOverlayIR={setIsOverlayIR}
                    overlayIRC={overlayIRC}
                    setOverlayIRC={setOverlayIRC}
                  />
                }
              </div>
              <TabPanels>
                <TabPanel className={styles['aitask-tab-panel']}>
                  <ObjectiveDetection
                    timestamp={timestamp}
                    image={image}
                    inferences={inferencesOD}
                    inferenceRawData={inferenceRawData}
                    labelData={labelData}
                    setLabelData={setLabelData}
                    probability={probability}
                    isDisplayTs={isDisplayTs}
                    imageCount={imageCount}
                    setDisplayCount={setDisplayCount}
                    setLoadingDialogFlg={setLoadingDialogFlg}
                  />
                </TabPanel>
                <TabPanel className={styles['aitask-tab-panel']}>
                  <Classification
                    timestamp={timestamp}
                    image={image}
                    inferences={inferencesCls}
                    inferenceRawData={inferenceRawData}
                    labelData={labelData}
                    setLabelData={setLabelData}
                    probability={probability}
                    isDisplayTs={isDisplayTs}
                    displayScore={displayScore}
                    isOverlayIR={isOverlayIR}
                    overlayIRC={overlayIRC}
                    imageCount={imageCount}
                    setDisplayCount={setDisplayCount}
                    setLoadingDialogFlg={setLoadingDialogFlg}
                    isFirst={isFirst}
                    setIsFirst={setIsFirst}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
            <Tabs className={styles['mode-tabs']} onChange={(tabNum: number) => {
              switch (tabNum) {
                case 0:
                  setMode(REALTIME_MODE)
                  break
                case 1:
                  setMode(HISTORY_MODE)
                  break
              }
            }}>
              <TabList className={styles['mode-tablist']}>
                <Tab isDisabled={isPlaying || isUploading}>Realtime Mode</Tab>
                <Tab isDisabled={isPlaying || isUploading}>History Mode</Tab>
              </TabList>
              <TabPanels>
                <TabPanel className={styles['realtime-mode-block']}>
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
                </TabPanel>
                <TabPanel className={styles['history-mode-block']}>
                  <History
                    deviceId={deviceId}
                    setDeviceId={setDeviceId}
                    deviceIdList={deviceIdList}
                    setDeviceIdList={setDeviceIdList}
                    isPlaying={isPlaying}
                    mode={mode}
                    intervalTimeValue={intervalTimeValue}
                    subDirectory={imagePath}
                    imageCount={imageCount}
                    totalCount={totalCount}
                    isFirst={isFirst}
                    setIsPlaying={setIsPlaying}
                    setSubDirectory={setImagePath}
                    setImageCount={setImageCount}
                    setTotalCount={setTotalCount}
                    setIntervalTimeValue={setIntervalTimeValue}
                    setLoadingDialogFlg={setLoadingDialogFlg}
                    setIsFirst={setIsFirst}
                    displayCount={displayCount}
                    setDisplayCount={setDisplayCount}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
      </Layout >
    </>
  )
}

export default Home
