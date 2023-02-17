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

import { Box, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react'
import React from 'react'
import styles from './slider.module.scss'
import SliderThumbSVG from './sliderthumb-svg'

type SliderProps = {
  icon: JSX.Element,
  isPlaying? : boolean,
  currValue: number,
  setCurrValue: (currValue: number) => void,
  min?: number
  max: number
}

export default function CustomSlider (props: SliderProps) {
  return (
    <>
      {props.icon}
      <div className={styles['custom-slider']}>
        <Slider
          value={props.currValue}
          onChange={(val: number) => props.setCurrValue(val)}
          min={(props.min) ? props.min : 0}
          max={props.max}
          step={1}
          focusThumbOnChange={false}
          isDisabled={props.isPlaying}
        >
          <SliderTrack backgroundColor="#8A8C99" height="2px" borderRadius="0px" >
            <SliderFilledTrack backgroundColor="#8A8C99" height="2px"/>
          </SliderTrack>
          <SliderThumb boxShadow="none">
            <Box as={SliderThumbSVG} boxShadow="none" />
          </SliderThumb>
        </Slider>
      </div>
    </>)
}
