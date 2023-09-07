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

import { Textarea } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { ObjectDetectionProps, BoundingBoxProps } from '../../../../hooks/util'
import { OBJECT_DETECTION } from '../../../../pages'
import styles from './objectdetection.module.scss'
import dynamic from 'next/dynamic'

export const ROWDATA_EXPLANATION = 'Inference Result'
export const LABEL_EXPLANATION = 'Label Setting'

// const BoundingBoxes = dynamic(() => import('../../../common/boundingboxes'), { ssr: false })

export type AdvertisementProps = {
  labels: string[] | undefined
  signageMode: boolean
}

const Advertisement = ({ labels, signageMode: signageMode }: AdvertisementProps) => {
  const advertisements: { [name: string]: string } = {
    toy: 'toy.png',
    makeup: 'makeup.png',
    bike: 'bike.png',
    init: 'init.png'
  }

  const classes: { [name: string]: string } = {
    0: 'makeup',
    1: 'bike',
    2: 'toy'
  }

  const advertisementType: string | undefined = labels !== undefined ? labels[0] : undefined
  const [advertisement, setAdvertisement] = useState<string>(advertisements.init)

  useEffect(() => {
    if (advertisementType === undefined) {
      setAdvertisement(advertisements.init)
    } else if (advertisementType === '0') {
      setAdvertisement(advertisements.makeup)
    } else if (advertisementType === '1') {
      setAdvertisement(advertisements.bike)
    } else if (advertisementType === '2') {
      setAdvertisement(advertisements.toy)
    }
  }, [labels])

  return (
    <>
      <p>Advertisement Type: {advertisementType && classes[advertisementType]}</p>
      <img
        src={advertisement}
        width={650}
        className={signageMode === false ? styles['advertisement-area'] : styles['advertisement-area-signage-mode']}
      />
    </>
  )
}

export default function ObjectiveDetection (props: ObjectDetectionProps) {
  const [labelTextOD, setLabelTextOD] = useState<string>(JSON.stringify(props.labelData).replace(/"|\[|\]/g, '').replace(/,/g, '\n'))
  const [timeStamp, setTimeStamp] = useState<string>('')
  const [rawData, setRawData] = useState<string | undefined>(undefined)
  const [labelList, setLabelList] = useState<string[] | undefined>(undefined)
  const [state, setState] = useState<HTMLImageElement>()
  const [boundingBoxesData, setBoundingBoxesData] = useState<BoundingBoxProps[] | undefined>()

  useEffect(() => {
    if (typeof window !== 'undefined' && props.aiTask === OBJECT_DETECTION) {
      const image = new window.Image()
      if (typeof props.image === 'string') {
        image.src = props.image
      }
      image.onload = () => {
        setState(image)
        setBoundingBoxesData(props.inferences)
        setRawData(props.inferenceRawData)
      }
    }
  }, [props.image])

  useEffect(() => {
    setLabelList(() => props.inferences?.map((item) => item.label))
  }, [props.timestamp])

  useEffect(() => {
    props.setLabelData(labelTextOD.split(/\n/))
  }, [labelTextOD])

  useEffect(() => {
    if (props.aiTask === OBJECT_DETECTION) {
      setTimeStamp(props.timestamp)
    }
  }, [props.image])

  return (
    <>
    {
      props.signageMode === false
        ? <div className={styles['object-detection-container']}>
            {props.isDisplayTs === true
              ? <div className={styles['timestamp-area']}>Timestamp:{timeStamp}</div>
              : null
            }
            <div className={styles['upper-items']}>
              <div className={styles['right-item']}>
                <Advertisement labels={labelList} signageMode={props.signageMode}/>
              </div>
            </div>
            <div className={styles['lower-items']}>
              <div className={styles['left-item']}>
                <div>{ROWDATA_EXPLANATION}</div>
                <Textarea className={styles['raw-data']} defaultValue={JSON.stringify((rawData), null, '\t')} readOnly resize="none" />
              </div>
              <div className={styles['right-item']}>
                <div>{LABEL_EXPLANATION}</div>
                <Textarea className={styles['label-area']} value={labelTextOD} onChange={((event) => setLabelTextOD(event.target.value))} resize="none" />
              </div>
            </div>
          </div>
        : <div className={styles['object-detection-container']}>
            {props.isDisplayTs === true
              ? <div className={styles['timestamp-area']}>Timestamp:{timeStamp}</div>
              : null
            }
            <div className={styles['upper-items']}>
              <div className={styles['right-item']}>
                <Advertisement labels={labelList} signageMode={props.signageMode}/>
              </div>
            </div>
          </div>
    }
    </>
  )
}
