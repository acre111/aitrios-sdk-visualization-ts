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

import { List, ListItem, Progress, Textarea } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { ClsInferenceProps } from '../../../../hooks/util'
import styles from './classfication.module.scss'
import { Stage, Layer, Image, Text } from 'react-konva'

type ClassficationProps = {
  timestamp: string,
  image: string,
  inferences: ClsInferenceProps[] | undefined,
  inferenceRawData: string | undefined,
  labelData: string[],
  setLabelData: React.Dispatch<React.SetStateAction<string[]>>,
  probability: number,
  isDisplayTs: boolean,
  displayScore: number,
  isOverlayIR: boolean,
  overlayIRC: string,
  imageCount: number,
  setDisplayCount: (displayCount: number) => void,
  setLoadingDialogFlg: (loadingDialogFlg: boolean) => void,
  isFirst: boolean,
  setIsFirst: (isFirst: boolean) => void
}

export const ROWDATA_EXPLANATION = 'Inference Result'
export const LABEL_EXPLANATION = 'Label Setting'

export default function Classification (props: ClassficationProps) {
  const [labelText, setLabelText] = useState<string>(JSON.stringify(props.labelData).replace(/"|\[|\]/g, '').replace(/,/g, '\n'))
  const [inferences, setInferences] = useState<ClsInferenceProps[] | undefined>()
  const [rawData, setRawData] = useState<string>()
  const [timeStamp, setTimeStamp] = useState<string>('')
  const [canvasWidth, setCanvasWidth] = useState<number>(360)
  const [canvasHeight, setCanvasHeight] = useState<number>(360)
  const [state, setState] = useState<HTMLImageElement>()
  const settedLabelText = (label: string[], idx: number) => `${label[idx]}`

  const sortDesc = (inferences: ClsInferenceProps[]) => {
    const highScore = inferences
      .filter((cls: ClsInferenceProps) => cls.confidence * 100 > props.probability)
      .sort((a, b) => b.confidence - a.confidence)[0]
    if (highScore !== undefined) {
      return Number(highScore.label)
    } else {
      return 0
    }
  }

  useEffect(() => {
    props.setLabelData(labelText.split(/\n/))
  }, [labelText])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const image = new window.Image()

      if (typeof props.image === 'string') {
        image.src = props.image
      }

      image.onload = () => {
        setState(image)
        setTimeStamp(props.timestamp)
        setCanvasWidth(image.width)
        setCanvasHeight(image.height)
        setInferences(props.inferences)
        setRawData(props.inferenceRawData)
        props.setDisplayCount(props.imageCount)
      }
    }
  }, [props.image])

  return (
    <div className={styles['classfication-container']}>
      <div className={styles['upper-items']}>
        <div className={styles['timestamp-area']}>
          {props.isDisplayTs === true
            ? <div className={styles['timestamp-area']}>Timestamp:{timeStamp}</div>
            : null
          }
        </div>
      </div>
      <div className={styles['middle-items']}>
        <div style={{ border: '1px solid black', width: canvasWidth, height: canvasHeight }}>
          {props.image.length !== 0
            ? <Stage width={canvasWidth} height={canvasHeight}>
              <Layer>
                <Image
                  image={state}
                />
              </Layer>
              <Layer>
                {props.isOverlayIR && inferences !== undefined
                  ? <Text
                    fill={props.overlayIRC}
                    fontSize={30}
                    y={100}
                    width={canvasWidth}
                    wrap={'none'}
                    ellipsis={true}
                    text={` ${settedLabelText(props.labelData, sortDesc(inferences))} `}
                  />
                  : null
                }
              </Layer>
            </Stage>

            : <div style={{ fontSize: '14px' }}>Not found image data</div>
          }
        </div>
        <div className={styles['inference-data-list']}>
          {inferences !== undefined
            ? inferences
              .filter((cls: ClsInferenceProps) => cls.confidence * 100 > props.probability)
              .sort(function (a, b) { return b.confidence - a.confidence })
              .slice(0, props.displayScore)
              .map((jsonItem, index) => {
                return <List key={index}>
                  <ListItem>
                    <div className={styles['inference-parameter']}>
                      <div className={styles['inference-parameter-name']}>{` ${settedLabelText(props.labelData, Number(jsonItem.label))} `}</div>
                      <div className={styles['inference-parameter-percentage']}>{jsonItem.confidence * 100}%</div>
                    </div>
                    {<Progress colorScheme='green' value={jsonItem.confidence * 100} />}
                  </ListItem>
                </List>
              })
            : <div style={{ fontSize: '14px' }}>Not found inferences list data</div>
          }
        </ div>
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
