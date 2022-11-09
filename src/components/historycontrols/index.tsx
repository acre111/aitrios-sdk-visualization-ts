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

import React, { useEffect, useState } from 'react'
import { Button } from '@chakra-ui/react'
import ConfidenceSlider from '../confidenceslider'
import IntervalTimeSlider from '../intervaltimeslider'
import ImageSelectionSlider from '../imageselectionslider'
import DropDownList from '../dropDownList'

import historyModuleStyles from './historycontrols.module.scss'
import styles from '../../styles/Home.module.css'

type HistoryControlsProps = {
  currConfidenceThreshold: { confidence: number },
  setCurrConfidenceThreshold: (currConfidenceThreshold: { confidence: number }) => void,
  isPlaying: boolean,
  setIsPlaying: (isPlaying: boolean) => void,
  playInterval: { seconds: number },
  setPlayInterval: (interval: { seconds: number }) => void,
  deviceId: string,
  setInferences: (inferences: object | {}) => void,
  totalImgCount: number,
  setTotalImgCount: (totalImgCount: number) => void,
  currImgIndex: number,
  setCurrImgIndex: (index: number) => void,
  setImagePath: (path: string[]) => void,
}

type Bbs = {
  x: number
  y: number
  width: number
  height: number
  label: string
  confidence: number
  bbStrokeColor: string
  tagStrokeColor: string
  tagTextColor: string
}

type InferenceItem = {
  C: number
  P: number
  X: number
  Y: number
  x: number
  y: number
}

type InferenceResults = {
  ts: string,
  total: number,
  bbs: Bbs[]
}

export const COLORS = [
  ['blue', 'white'],
  ['black', 'white'],
  ['yellow', 'black'],
  ['tomato', 'black'],
  ['green', 'white'],
  ['red', 'white'],
  ['pink', 'black'],
  ['cyan', 'white'],
  ['orange', 'black'],
  ['teal', 'white'],
  ['purple', 'black']
]

export const convertInferences = (deviceId: string, inferenceResults: any[]) => {
  if (inferenceResults.length === 0 || deviceId === 'mock') return {}
  const results: InferenceResults[] = []

  inferenceResults.forEach((inference: any) => {
    const inferenceData = inference[0].inferences[0]
    const ts = inferenceData.T
    const o = inferenceData.O.Inferences[0]

    const total = Object.keys(o).length
    const bbs: Bbs[] = []

    const bbsElement: Bbs = {
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

    Object.values(o).forEach((value: InferenceItem) => {
      bbsElement.x = value.X
      bbsElement.y = value.Y
      bbsElement.width = Math.abs(value.X - value.x)
      bbsElement.height = Math.abs(value.y - value.Y)
      bbsElement.label = value.C.toString()
      bbsElement.confidence = value.P
      bbsElement.bbStrokeColor = COLORS[value.C % COLORS.length][0]
      bbsElement.tagStrokeColor = COLORS[value.C % COLORS.length][0]
      bbsElement.tagTextColor = COLORS[value.C % COLORS.length][1]

      bbs.push(JSON.parse(JSON.stringify(bbsElement)))
    })
    results.push({ ts, total, bbs })
  })
  return results
}

const fetchSubDir = async (props) => {
  const imageList = await fetch(`/api/imagelist/${props.deviceId}`)
  const imagePathList = await imageList.json()
  return imagePathList
}

const getImages = async (props, selectedSubDirectory) => {
  const res = await fetch(`/api/image/${selectedSubDirectory}?deviceId=${props.deviceId}`)
  const images = await res.json()
  return { images: images.files, totalCount: images.buff.total_image_count }
}

const getInferences = async (props, imagePathList) => {
  const inferences = await Promise.all(imagePathList.map(async (imagePath: string) => {
    const subDirectory = imagePath.replace(`/${props.deviceId}/`, '').toString().split('/')[0]
    const tmp = imagePath.substring(0, imagePath.indexOf('.'))
    const timestamp = tmp.toString().split('/')[4]
    const res = await fetch(`/api/inference/${props.deviceId}/?imagePath=${subDirectory}&timestamp=${timestamp}`)
    return await res.json()
  }))
  return inferences
}

export default function HistoryControls ({ ...props }: HistoryControlsProps) {
  const [selectedSubDirectory, setSelectedSubDirectory] = useState<string[]>([])
  const [subDirectoryList, setSubDirectoryList] = useState([])
  const [inferenceList, setInferenceList] = useState({})
  const [finishSaved, setfinishSaved] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      const subDirectoryList = await fetchSubDir(props)
      setSubDirectoryList(subDirectoryList)
    })()
  }, [])

  useEffect(() => {
    (async () => {
      if (!selectedSubDirectory.length) {
        return
      }
      setfinishSaved(false)

      const { images, totalCount } = await getImages(props, selectedSubDirectory)
      const inferences = await getInferences(props, images)
      setInferenceList(convertInferences(props.deviceId, inferences))

      props.setTotalImgCount(totalCount)
      props.setImagePath(images)
      props.setCurrImgIndex(1)
      setfinishSaved(true)
    })()
  }, [selectedSubDirectory])

  useEffect(() => {
    props.setInferences(inferenceList)
  }, [inferenceList])

  return (
    <div className={historyModuleStyles['history-controls-container']}>
      <div className={historyModuleStyles['history-control-confidence']}>
        <div className={historyModuleStyles['confidence-header']}>PROBABILITY</div>
        <ConfidenceSlider currConfidence={props.currConfidenceThreshold} setCurrConfidence={props.setCurrConfidenceThreshold} />
      </div>
      <div className={historyModuleStyles['history-control-intervaltime']}>
        <div className={historyModuleStyles['intervaltime-header']}>INTERVAL TIME (seconds)</div>
        <IntervalTimeSlider isPlaying={props.isPlaying} playInterval={props.playInterval} setPlayInterval={props.setPlayInterval} />
      </div>
      <div className={historyModuleStyles['history-control-imageselection']}>
        <div className={historyModuleStyles['imageselection-header']}>IMAGE SELECTION (index)</div>
        <div className={historyModuleStyles['drop-down']}>
          <div>Sub Directory</div>
          <DropDownList id={'device-id-list'}
            name={'deviceId'}
            className={props.isPlaying ? styles.disabled : styles.select}
            datas={subDirectoryList}
            onChange={(event) => { setSelectedSubDirectory(event.target.value) }}
            disabled={props.isPlaying}
          />
        </div>
        <ImageSelectionSlider currImgIndex={props.currImgIndex} setCurrImgIndex={props.setCurrImgIndex} totalImgCount={props.totalImgCount} isPlaying={!!props.isPlaying} />
      </div>
      <div className={historyModuleStyles['history-control-actions']}>
        <Button className={!finishSaved ? historyModuleStyles['action-toggle-disable'] : historyModuleStyles['action-toggle-play']} onClick={() => props.setIsPlaying(!props.isPlaying)} disabled={!finishSaved}>
          <div className={historyModuleStyles['play-svg']}>
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 7L-6.11959e-07 14L0 -5.24537e-07L12 7Z" fill="white" />
            </svg>
          </div>
          <div className={!finishSaved ? historyModuleStyles['disable-text'] : historyModuleStyles['play-text']}>
            {props.isPlaying ? 'Stop playing' : 'Start playing'}
          </div>
        </Button>
      </div >
    </div >
  )
}
