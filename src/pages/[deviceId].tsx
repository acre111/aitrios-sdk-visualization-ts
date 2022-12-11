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

import React, { useEffect, useState, useRef } from 'react'
import { Container, useToast, Heading } from '@chakra-ui/react'
import Error from 'next/error'
import BoundingBoxes, { BoundingBoxesProps } from '../components/boundingboxes'
import Layout from '../components/layout'
import ModeSwitch from '../components/modeswitch'
import RealTimeControls from '../components/realtimecontrols'
import HistoryControls, { COLORS, convertInferences } from '../components/historycontrols'
import useInterval from '../hooks/useInterval'
import { createSubDir } from '../hooks/fileUtil'
import styles from '../styles/device-page.module.scss'

export async function getServerSideProps (context: any) {
  const deviceId = context.params.deviceId
  console.info('Using deviceId: ', deviceId)
  try {
    const data: BoundingBoxesProps = { canvasWidth: 0, canvasHeight: 0, boundingBoxes: [], confidenceThreshold: 0.0, img: '' }

    createSubDir(deviceId)
    return {
      props: { data, deviceId }
    }
  } catch (err) {
    return {
      props:
      {
        errorCode: 500,
        errorMsg: err.message,
        deviceId: context.params.deviceId
      }
    }
  }
}

const START_UPLOAD_INFERENCE_RESULT_ENDPOINT = '/api/startuploadinferenceresult'
const STOP_UPLOAD_INFERENCE_RESULT_ENDPOINT = '/api/stopuploadinferenceresult'

const MOCKDATA = (isUpdate: boolean, setIsUpdate: (isUpdate: boolean) => void) => {
  interface BBOX {
    x: number
    y: number
    w: number
    h: number
  }
  interface MOCK_BBOX {
    1: BBOX
    2: BBOX
    3: BBOX
    4: BBOX
    5: BBOX
  }
  const DATA: MOCK_BBOX[] = [
    {
      1: { x: 25, y: 77, w: 144, h: 111 },
      2: { x: 13, y: 113, w: 121, h: 85 },
      3: { x: 199, y: 221, w: 38, h: 41 },
      4: { x: 224, y: 134, w: 143, h: 136 },
      5: { x: 87, y: 86, w: 269, h: 248 }
    },
    {
      1: { x: 15, y: 62, w: 110, h: 104 },
      2: { x: 26, y: 102, w: 124, h: 92 },
      3: { x: 218, y: 242, w: 35, h: 41 },
      4: { x: 248, y: 116, w: 144, h: 137 },
      5: { x: 91, y: 88, w: 258, h: 248 }
    },
    {
      1: { x: 6, y: 67, w: 110, h: 124 },
      2: { x: 23, y: 106, w: 81, h: 104 },
      3: { x: 190, y: 241, w: 50, h: 42 },
      4: { x: 224, y: 121, w: 131, h: 158 },
      5: { x: 92, y: 86, w: 278, h: 250 }
    },
    {
      1: { x: 24, y: 55, w: 115, h: 126 },
      2: { x: 29, y: 119, w: 122, h: 96 },
      3: { x: 190, y: 228, w: 41, h: 48 },
      4: { x: 228, y: 116, w: 146, h: 157 },
      5: { x: 93, y: 81, w: 253, h: 295 }
    },
    {
      1: { x: 18, y: 60, w: 122, h: 130 },
      2: { x: 24, y: 102, w: 124, h: 81 },
      3: { x: 208, y: 239, w: 35, h: 43 },
      4: { x: 232, y: 125, w: 150, h: 162 },
      5: { x: 84, y: 79, w: 254, h: 277 }
    }
  ]
  const i = (): number => Date.now() % 5
  const c = (label: number = 1): string[] => COLORS[label % COLORS.length]

  const bbs: BoundingBoxesProps = { canvasWidth: 320, canvasHeight: 320, boundingBoxes: [], img: '/img.jpeg', confidenceThreshold: 0.0, isUpdate, setIsUpdate }
  bbs.boundingBoxes.push({ x: DATA[i()][1].x, y: DATA[i()][1].y, width: DATA[i()][1].w, height: DATA[i()][1].h, label: '3', confidence: 0.36, bbStrokeColor: c(3)[0], tagStrokeColor: c(3)[0], tagTextColor: c(3)[1] })
  bbs.boundingBoxes.push({ x: DATA[i()][2].x, y: DATA[i()][2].y, width: DATA[i()][2].w, height: DATA[i()][2].h, label: '9', confidence: 0.81, bbStrokeColor: c(9)[0], tagStrokeColor: c(9)[0], tagTextColor: c(9)[1] })
  bbs.boundingBoxes.push({ x: DATA[i()][3].x, y: DATA[i()][3].y, width: DATA[i()][3].w, height: DATA[i()][3].h, label: '1', confidence: 0.58, bbStrokeColor: c(12)[0], tagStrokeColor: c(12)[0], tagTextColor: c(12)[1] })
  bbs.boundingBoxes.push({ x: DATA[i()][4].x, y: DATA[i()][4].y, width: DATA[i()][4].w, height: DATA[i()][4].h, label: '4', confidence: 0.92, bbStrokeColor: c(4)[0], tagStrokeColor: c(4)[0], tagTextColor: c(4)[1] })
  bbs.boundingBoxes.push({ x: DATA[i()][5].x, y: DATA[i()][5].y, width: DATA[i()][5].w, height: DATA[i()][5].h, label: '5', confidence: 0.62, bbStrokeColor: c(33)[0], tagStrokeColor: c(33)[0], tagTextColor: c(33)[1] })
  return bbs
}

type ServerSideProps = {
  data: BoundingBoxesProps,
  deviceId: string,
  errorCode?: number,
  errorMsg?: string,
}

export default function Device ({ data, deviceId, errorCode, errorMsg }: ServerSideProps) {
  if (errorCode && deviceId !== 'mock') {
    return <Error statusCode={500} title={errorMsg} />
  }
  const [isUpdate, setIsUpdate] = useState<boolean>(true)
  const [bbs, setBbs] = useState<BoundingBoxesProps>(deviceId === 'mock' ? MOCKDATA(isUpdate, setIsUpdate) : data)
  const [currImgIndex, setCurrImgIndex] = useState<number>(0)
  const [inferences, setInferences] = useState({})
  const [isPolling, setIsPolling] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadSubDirectory, setUploadSubDirectory] = useState<string>('')
  const [pollInterval, setPollInterval] = useState({ seconds: 5 })
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [playInterval, setPlayInterval] = useState({ seconds: 2 })
  const [currConfidenceThreshold, setCurrConfidenceThreshold] = useState({ confidence: 0.5 })
  const [isHistoryMode, setIsHistoryMode] = useState(false)
  const [totalImgCount, setTotalImgCount] = useState(0)
  const [imagePath, setImagePath] = useState<string[]>([])
  const [jsonFileName, setJsonFileName] = useState<string>()
  const [imgDate, setimgDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFirst, setIsFirst] = useState<boolean>(true)

  useInterval(() => {
    fetchInferenceResults()
  }, isPolling ? pollInterval.seconds * 1000 : null)

  useInterval(() => {
    if (deviceId === 'mock') {
      setBbs(MOCKDATA(isUpdate, setIsUpdate))
      return
    }

    const bbsIfExist = (img: string, inference) => {
      const imgTs = img.split('/')[3]
      const tsCheck = Number(imgTs) === Number(inference.ts)
      if (!inference || inference.length === 0 || !tsCheck || !inference.bbs) return []
      return inference.bbs
    }

    const setIndex = (index: number) => {
      setBbs({
        canvasWidth: 320,
        canvasHeight: 320,
        boundingBoxes: bbsIfExist(imagePath[index], inferences[index]),
        img: imagePath[index],
        confidenceThreshold: 0.0,
        isUpdate,
        setIsUpdate
      })
      setimgDate(dateFromImagePath(imagePath[index]))
    }

    if (isFirst) {
      setIndex(currImgIndex - 1)
      setIsFirst(false)
    } else if (currImgIndex === imagePath.length) {
      setIndex(0)
      setCurrImgIndex(1)
    } else {
      setIndex(currImgIndex)
      setCurrImgIndex(currImgIndex + 1)
    }
  }, isPlaying ? playInterval.seconds * 1000 : null)

  useEffect(() => {
    if (!isPlaying) {
      setIsFirst(true)
    }
  }, [isPlaying])

  const handleChangeUploadingStatus = async (newStatus: boolean) => {
    setIsLoading(true)
    if (newStatus) {
      try {
        const startUploadResponse = await fetch(`${START_UPLOAD_INFERENCE_RESULT_ENDPOINT}/${deviceId}`)
        const startUploadData = await startUploadResponse.json()
        if (startUploadData.result === 'SUCCESS') {
          setIsUploading(true)
          setUploadSubDirectory(startUploadData.outputSubDirectory.split('/').slice(-1)[0])
        } else {
          alert(`Request to device ${deviceId} to begin uploading inference data has failed or invalid command parameter files setting.`)
        }
      } catch (err: any) {
        // this will probably only catch network-level errors, not HTTP
        console.error(err)
      }
    } else {
      try {
        const stopUploadResponse = await fetch(`${STOP_UPLOAD_INFERENCE_RESULT_ENDPOINT}/${deviceId}`)
        const stopUploadData = await stopUploadResponse.json()
        if (stopUploadData.result === 'SUCCESS') {
          setIsUploading(false)
          setUploadSubDirectory('')
        } else {
          alert(`Request to device ${deviceId} to stop uploading inference data has failed.`)
        }
      } catch (err: any) {
        // this will probably only catch network-level errors, not HTTP
        console.error(err)
      }
    }
    setIsLoading(false)
  }

  const fetchInferenceResults = async () => {
    if (pollInterval.seconds > 5) {
      toast({
        title: 'Refreshing...',
        status: 'info',
        position: 'bottom-right',
        duration: 1000,
        isClosable: true
      })
    }

    if (deviceId === 'mock') {
      setBbs(MOCKDATA(isUpdate, setIsUpdate))
      return
    }

    if (uploadSubDirectory === '') {
      alert('Please run start upload first.')
      setIsPolling(false)
      return
    }

    const image = await fetch(`/api/image/${uploadSubDirectory}?deviceId=${deviceId}`)
    const imageJson = await image.json()

    const totalImageCount = imageJson.buff.total_image_count
    const latestImage = imageJson.buff.images[totalImageCount - 1]
    const timestamp = latestImage.name.substring(0, latestImage.name.indexOf('.'))
    const inference = await fetch(`/api/inference/${deviceId}/?imagePath=${uploadSubDirectory}&timestamp=${timestamp}`)
    const inferenceJson = await inference.json()

    const inferenceArray = [inferenceJson]
    const inferences = convertInferences(deviceId, inferenceArray)

    const img = `/${deviceId}/${uploadSubDirectory}/${timestamp}/${timestamp}.jpg`
    setBbs({
      canvasWidth: 320,
      canvasHeight: 320,
      boundingBoxes: inferences[0].bbs,
      img,
      confidenceThreshold: 0.0,
      isUpdate,
      setIsUpdate
    })
  }

  const GridStyle = () => {
    return ({ borderWidth: '0.1em', borderColor: 'teal', borderRadius: '20px' })
  }

  // 20210304214709501 => 2021-03-04 21:47:09
  const dateFromImagePath = (path: string) => {
    if (!path || path.length === 0) return new Date().toLocaleString()
    let dateArr
    try {
      dateArr = path.split('/')[3].split('')
    } catch (e) {
      console.error(e)
    }

    dateArr.splice(4, 0, '-')
    dateArr.splice(7, 0, '-')
    dateArr.splice(10, 0, ' ')
    dateArr.splice(13, 0, ':')
    dateArr.splice(16, 0, ':')
    dateArr.length = 19
    return dateArr.join('')
  }

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    if (event && event.target && event.target.files) {
      const file = event.target.files[0]
      fileReader.readAsText(file)

      fileReader.addEventListener('load', () => {
        if (fileReader && fileReader.result) {
          const contents: string = fileReader.result.toString()
          setJsonFileName(file.name)
          fetch(`/api/labels/labels?contents=${contents}`)
          setIsUpdate(true)
        }
      })
    }
  }

  return (
    <Layout title={'edge AI device Visualization'}>
      <div className={styles['device-page-container']}>
        <div className={styles['device-page-status']}>
          <div className={styles['status-header-id']}>
            DEVICE ID: <span className={styles['status-value']}>{deviceId}</span>
          </div>
          <div className={styles['status-header-polling']}>
            STATUS: <span className={styles['status-value']}>{isHistoryMode ? `${isPlaying ? 'Playing' : 'Not Playing'}` : ` ${isUploading ? 'Uploading' : 'Not Uploading'}` + `${isPolling ? ' / Polling' : ' / Not Polling'}`}</span>
          </div>
        </div>
        <div className={styles['device-page-stage']}>
          <Container style={GridStyle()} maxW="container.md" centerContent bg="white" border="none">
            {isHistoryMode && imagePath && <Heading as="h6" size="xs">
              {imgDate}
            </Heading>}
            <BoundingBoxes {...bbs} confidenceThreshold={currConfidenceThreshold.confidence} isUpdate={isUpdate} setIsUpdate={setIsUpdate} />
            <Heading as="h6" size="xs">
              {isHistoryMode ? `History Mode ${isPlaying ? ' - Playing...' : ' - Not Playing'}` : `RealTime Mode ${isPolling ? ' - Polling...' : ' - Not Polling'}`}
            </Heading>
          </Container>
        </div>
        <div className={styles['device-page-control-header']}>
          Detection controls
        </div>
        <div className={styles['device-page-control-mode']}>MODE
          <ModeSwitch isHistoryMode={isHistoryMode}
            setIsHistoryMode={setIsHistoryMode}
            isPolling={isPolling}
            setIsPolling={setIsPolling}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            isLoading={isLoading} />
        </div>
        <div className={styles['device-page-file-upload']}>Label Setting File
          <input hidden ref={inputRef} className={styles['uploaded-file']} type={'file'} accept="application/json" onChange={onFileInputChange} />
          <div className={styles['upload-button']} onClick={() => inputRef?.current?.click()}> Select File</div>
          <div className={styles['uploaded-file']}>File: {jsonFileName}</div>
        </div>
        {isHistoryMode &&
          <HistoryControls
            currConfidenceThreshold={currConfidenceThreshold}
            setCurrConfidenceThreshold={setCurrConfidenceThreshold}
            currImgIndex={currImgIndex}
            setCurrImgIndex={setCurrImgIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            playInterval={playInterval}
            setPlayInterval={setPlayInterval}
            deviceId={deviceId}
            totalImgCount={totalImgCount}
            setTotalImgCount={setTotalImgCount}
            setInferences={setInferences}
            setImagePath={setImagePath} />
        }
        {!isHistoryMode &&
          <RealTimeControls
            currConfidenceThreshold={currConfidenceThreshold}
            setCurrConfidenceThreshold={setCurrConfidenceThreshold}
            isPolling={isPolling}
            setIsPolling={setIsPolling}
            setIsUploading={handleChangeUploadingStatus}
            isUploading={isUploading}
            pollInterval={pollInterval}
            setPollInterval={setPollInterval}
            isLoading={isLoading}
            setIsLoading={setIsLoading} />
        }
      </div>
    </Layout >
  )
}
