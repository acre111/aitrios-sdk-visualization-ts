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
import IntervalTimeSVG from './intervaltimeSVG'

import styles from './intervaltime.module.scss'

type IntervalTimeSliderProps = {
    isPlaying: boolean,
    playInterval: { seconds: number },
    setPlayInterval: (playInterval: { seconds: number }) => void,
}

export default function IntervalTimeSlider ({ ...props }: IntervalTimeSliderProps) {
  return (
        <div className={styles['device-intervaltime-slider']}>
            <div className={styles['slider-svg']}>
                <IntervalTimeSVG />
            </div>
            <div className={styles['slider-control']}>
                <Slider
                    disabled={props.isPlaying}
                    defaultValue={props.playInterval.seconds}
                    onChange={val => props.setPlayInterval({ ...props.playInterval, seconds: val })}
                    min={1}
                    max={20}
                    step={1}
                    focusThumbOnChange={false}
                >
                    <SliderTrack backgroundColor="#8A8C99" height="2px" borderRadius="0px">
                        <SliderFilledTrack backgroundColor="#8A8C99" height="2px" />
                    </SliderTrack>
                    <SliderThumb boxShadow="none">
                        <Box as={SliderThumbSVG} boxShadow="none"></Box>
                    </SliderThumb>
                </Slider>
            </div>
            <div className={styles['slider-intervaltime-display']}>
                {`${props.playInterval.seconds} sec `}
            </div>
        </div>
  )
}
