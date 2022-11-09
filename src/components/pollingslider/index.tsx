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

import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box
} from '@chakra-ui/react'
import React from 'react'

import SliderThumbSVG from '../sliderthumb-svg'
import PollingSVG from './polling-svg'

import styles from './polling.module.scss'

type PollingSliderProps = {
    isPolling: boolean,
    pollInterval: { seconds: number },
    setPollInterval: (playInterval: { seconds: number }) => void,
}

export default function PollingSlider ({ isPolling, pollInterval: currDelay, setPollInterval: setCurrDelay }: PollingSliderProps) {
  return (
        <div className={styles['device-polling-slider']}>
            <div className={styles['slider-svg']}>
                <PollingSVG/>
            </div>
            <div className={styles['slider-control']}>
                <Slider
                    disabled={isPolling}
                    defaultValue={currDelay.seconds}
                    onChange={(val) => setCurrDelay({ ...currDelay, seconds: val })}
                    min={1}
                    max={120}
                    step={1}
                    focusThumbOnChange={false}
                >
                    <SliderTrack backgroundColor="#8A8C99" height="2px" borderRadius="0px">
                        <SliderFilledTrack backgroundColor="#8A8C99" height="2px"/>
                    </SliderTrack>
                    <SliderThumb boxShadow="none">
                        <Box as={SliderThumbSVG} boxShadow="none"></Box>
                    </SliderThumb>
                </Slider>
            </div>
            <div className={styles['slider-interval-display']}>
                {`${currDelay.seconds} sec`}
            </div>
        </div>
  )
}
