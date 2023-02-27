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
import { Group, Image, Label, Layer, Rect, Stage, Tag, Text } from 'react-konva'
import { BoundingBoxProps } from '../../../hooks/util'

export type BoundingBoxesProps = {
  img?: string | null,
  boundingBoxes: BoundingBoxProps[] | undefined,
  confidenceThreshold: number,
  label: string[],
  inferenceRawData: string | undefined,
  setRawData: (inferenceRawData: string | undefined) => void
  imageCount: number,
  setDisplayCount: (displayCount: number) => void,
  setLoadingDialogFlg: (loadingDialogFlg: boolean) => void
}

const BoundingBoxes = ({
  boundingBoxes,
  img,
  confidenceThreshold,
  label,
  inferenceRawData,
  setRawData,
  imageCount,
  setDisplayCount,
  setLoadingDialogFlg
}: BoundingBoxesProps) => {
  const LABEL_OFFSET = 14
  const MARGIN = 20
  const [state, setState] = useState<HTMLImageElement>()
  const [canvasWidth, setCanvasWidth] = useState<number>(360)
  const [canvasHeight, setCanvasHeight] = useState<number>(360)
  const [boundingBoxesData, setBoundingBoxesData] = useState<BoundingBoxProps[] | undefined>()
  const labelText = (label: string[], confidence: number, idx: number) => `${label[idx]} ${Math.round(confidence * 100)}%`

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const image = new window.Image()
      if (typeof img === 'string') {
        image.src = img
      }
      image.onload = () => {
        setState(image)
        setCanvasWidth(image.width + MARGIN * 2)
        setCanvasHeight(image.height + MARGIN * 2)
        setBoundingBoxesData(boundingBoxes)
        setRawData(inferenceRawData)
        setDisplayCount(imageCount)
        setLoadingDialogFlg(false)
      }
    }
  }, [img])

  return (
    <div style={ { border: '1px solid black', width: canvasWidth, height: canvasHeight }}>
    { state !== null && boundingBoxesData !== undefined
      ? <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        <Image
          image={state}
          x={MARGIN}
          y={MARGIN}
        />
      </Layer>
      <Layer>
        {boundingBoxesData.length === 0 &&
          <Text
            fontSize={10}
            text="No detections"
            fill="red"
            wrap="char"
            align="center"
            width={320}
          />}
        {boundingBoxesData.length > 0 && boundingBoxesData
          .filter((bb: BoundingBoxProps) => Math.round(bb.confidence * 100) > confidenceThreshold)
          .map((bb: BoundingBoxProps, idx: number) => {
            return <Group key={idx}>
              <Rect
                x={bb.x + MARGIN}
                y={bb.y + MARGIN}
                width={bb.width}
                height={bb.height}
                opacity={1}
                stroke={bb.bbStrokeColor}
                strokeWidth={2}
              />
              <Label
                x={bb.x + MARGIN}
                y={bb.y + MARGIN - LABEL_OFFSET}
              >
                <Tag stroke={bb.tagStrokeColor} fill={bb.tagStrokeColor} />
                <Text fill={bb.tagTextColor} fontSize={14} text={` ${labelText(label, bb.confidence, Number(bb.label))} `} />
              </Label>
            </Group>
          })}
      </Layer>
    </Stage>
      : <div style={{ fontSize: '14px' }}>Not found image data</div>
    }
    </div>
  )
}

export default BoundingBoxes