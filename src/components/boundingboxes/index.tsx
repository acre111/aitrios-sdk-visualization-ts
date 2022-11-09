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
import { Stage, Layer, Rect, Text, Label, Tag, Image, Group } from 'react-konva'

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

export type BoundingBoxesProps = {
  img?: string | null,
  canvasWidth: number,
  canvasHeight: number,
  boundingBoxes: BoundingBoxProps[],
  confidenceThreshold: number,
  isUpdate?: boolean,
  setIsUpdate?: (isUpdate: boolean) => void
}

const getLabels = async () => {
  const LABEL_ENDPOINT = '/api/labels/labels'
  const DEFAULT_LABELS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  let labels: string[]
  try {
    const data = await fetch(LABEL_ENDPOINT)
    labels = await data.json()
  } catch (_) {
    labels = DEFAULT_LABELS
  }
  return labels
}

const BoundingBoxes = ({ canvasWidth, canvasHeight, boundingBoxes, img, confidenceThreshold, isUpdate, setIsUpdate }: BoundingBoxesProps) => {
  const [state, setState] = useState<HTMLImageElement>()
  if (typeof window !== 'undefined') {
    const image = new window.Image()
    if (typeof img === 'string') {
      image.src = img
    }
    image.onload = () => {
      setState(image)
    }
  }

  const [labels, setLabels] = useState<string[]>([])
  const LABEL_OFFSET = 14
  const labelText = (label: string, confidence: number) => `${labels[parseInt(label)]} ${Math.round(confidence * 100)}%`

  useEffect(() => {
    if (isUpdate) {
      getLabels().then(labels => setLabels(labels))
      if (setIsUpdate !== undefined) setIsUpdate(false)
    }
  }, [isUpdate])

  return (
    <Stage style={{ margin: '1em' }} width={canvasWidth} height={canvasHeight}>
      <Layer>
        <Image image={state} />
      </Layer>
      <Layer>
        {boundingBoxes.length === 0 &&
          <Text
            fontSize={10}
            text="No detections"
            fill="red"
            wrap="char"
            align="center"
            width={320}
          />}
        {boundingBoxes.length > 0 && boundingBoxes
          .filter((bb: BoundingBoxProps) => Math.round(bb.confidence * 100) > confidenceThreshold)
          .map((bb: BoundingBoxProps, idx: number) => {
            return <Group key={idx}>
              <Rect
                x={bb.x}
                y={bb.y < LABEL_OFFSET ? LABEL_OFFSET : bb.y}
                width={bb.width}
                height={bb.height}
                opacity={1}
                stroke={bb.bbStrokeColor}
                strokeWidth={2}
              />
              <Label
                x={bb.x}
                y={bb.y < LABEL_OFFSET ? 0 : bb.y - LABEL_OFFSET}
              >
                <Tag stroke={bb.tagStrokeColor} fill={bb.tagStrokeColor} />
                <Text fill={bb.tagTextColor} fontSize={14} text={` ${labelText(bb.label, bb.confidence)} `} />
              </Label>
            </Group>
          })}
      </Layer>
    </Stage>
  )
}

export default BoundingBoxes
