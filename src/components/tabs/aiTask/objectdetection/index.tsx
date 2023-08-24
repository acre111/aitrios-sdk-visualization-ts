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

import { Textarea, Button } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { ObjectDetectionProps, handleFileInputChangeODorCLS, exportLabelDataODorCLS } from '../../../../hooks/util'
import { OBJECT_DETECTION } from '../../../../pages'
import styles from './objectdetection.module.scss'
import dynamic from 'next/dynamic'

export const ROWDATA_EXPLANATION = 'Inference Result'
export const LABEL_EXPLANATION = 'Label Setting'

const BoundingBoxes = dynamic(() => import('../../../common/boundingboxes'), { ssr: false })

export default function ObjectiveDetection (props: ObjectDetectionProps) {
  const [labelTextOD, setLabelTextOD] = useState<string>(JSON.stringify(props.labelData).replace(/"|\[|\]/g, '').replace(/,/g, '\n'))
  const [timeStamp, setTimeStamp] = useState<string>('')
  const [rawData, setRawData] = useState<string | undefined>(undefined)

  useEffect(() => {
    props.setLabelData(labelTextOD.split(/\n/))
  }, [labelTextOD])

  useEffect(() => {
    if (props.aiTask === OBJECT_DETECTION) {
      setTimeStamp(props.timestamp)
    }
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
            aiTask={props.aiTask}
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
          <Textarea className={styles['label-area']} value={labelTextOD} onChange={((event) => setLabelTextOD(event.target.value))} resize="none" />
          <div className={styles['button-area']}>
            <Button
              onClick={() => document.getElementById('fileInputOD')?.click()}
              style={{ color: '#ffffff', backgroundColor: '#2d78be' }}
              variant='solid'
              size='md'
              m={'2'}
            >
              Import Labels
              <input
                id='fileInputOD'
                type='file'
                accept='.json'
                style={{ display: 'none' }}
                onChange={(event) => handleFileInputChangeODorCLS(event, setLabelTextOD)}
              />
            </Button>
            <Button
              onClick={() => exportLabelDataODorCLS(props)}
              style={{ color: '#ffffff', backgroundColor: '#2d78be' }}
              variant='solid'
              size='md'
              m={'2'}
            >
              Export Labels
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
