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

import { Textarea } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { BoundingBoxProps } from '../../../../hooks/util'
import BoundingBoxes from '../../../common/boundingboxes'
import styles from './objectdetection.module.scss'

type ObjectDetectionProps = {
  timestamp: string,
  image: string,
  inferences: BoundingBoxProps[] | undefined,
  inferenceRawData: string | undefined,
  labelData: string[],
  setLabelData: (labelData: string[]) => void,
  probability: number,
  isDisplayTs: boolean,
  imageCount: number,
  setDisplayCount: (displayCount: number) => void
  setLoadingDialogFlg: (loadingDialogFlg: boolean) => void
}

export const ROWDATA_EXPLANATION = 'Inference Result'
export const LABEL_EXPLANATION = 'Label Setting'

export default function ObjectiveDetection (props: ObjectDetectionProps) {
  const [labelText, setLabelText] = useState<string>(JSON.stringify(props.labelData).replace(/"|\[|\]/g, '').replace(/,/g, '\n'))
  const [timeStamp, setTimeStamp] = useState<string>('')
  const [rawData, setRawData] = useState<string | undefined>(undefined)

  useEffect(() => {
    props.setLabelData(labelText.split(/\n/))
  }, [labelText])

  useEffect(() => {
    setTimeStamp(props.timestamp)
  }, [props.image])

  return (
    <div className={styles['object-detection-container']}>
      <div className={styles['upper-items']}>
        {props.isDisplayTs === true
          ? <div className={styles['timestamp-area']}>Timestamp:{timeStamp}</div>
          : null
        }
        <div className={styles['boundingboxes-area']}>
          <BoundingBoxes
            boundingBoxes={props.inferences}
            img={props.image}
            confidenceThreshold={props.probability}
            label={props.labelData}
            inferenceRawData={props.inferenceRawData}
            setRawData={setRawData}
            imageCount={props.imageCount}
            setDisplayCount={props.setDisplayCount}
            setLoadingDialogFlg={props.setLoadingDialogFlg}
          />
        </div>
      </div>
      <div className={styles['lower-items']}>
        <div className={styles['left-item']}>
          <div>{ROWDATA_EXPLANATION}</div>
          <Textarea className={styles['raw-data']} defaultValue={JSON.stringify((rawData), null, '\t')} readOnly resize="none" />
        </div>
        <div className={styles['right-item']}>
          <div>{LABEL_EXPLANATION}</div>
          <Textarea className={styles['label-area']} defaultValue={labelText} onChange={((event) => setLabelText(event.target.value))} resize="none" />
        </div>
      </div>
    </div>
  )
}
