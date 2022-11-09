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

import React from 'react'
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box
} from '@chakra-ui/react'

import SliderThumbSVG from '../sliderthumb-svg'
import ImageSelectionSVG from './imageselection-svg'

import styles from './imageselection.module.scss'

type ImageSelectionSliderProps = {
    isPlaying: boolean,
    currImgIndex: number,
    setCurrImgIndex: (index: number) => void,
    totalImgCount: number,
}

export default function ImageSelectionSlider ({ ...props }: ImageSelectionSliderProps) {
  return (
        <div className={styles['device-imageselection-slider']}>
            <div className={styles['slider-svg']}>
                <ImageSelectionSVG />
            </div>
            <div className={styles['slider-control']}>
                <Slider
                    value={props.currImgIndex}
                    onChange={(val) => props.setCurrImgIndex(val)}
                    min={1}
                    max={props.totalImgCount}
                    step={1}
                    focusThumbOnChange={false}
                    disabled={props.isPlaying}
                >
                    <SliderTrack backgroundColor="#8A8C99" height="2px" borderRadius="0px">
                        <SliderFilledTrack backgroundColor="#8A8C99" height="2px" />
                    </SliderTrack>
                    <SliderThumb boxShadow="none">
                        <Box as={SliderThumbSVG} boxShadow="none"></Box>
                    </SliderThumb>
                </Slider>
            </div>
            <div className={styles['slider-imageselection-display']}>
                {`${props.currImgIndex}`}
            </div>
        </div>
  )
}
