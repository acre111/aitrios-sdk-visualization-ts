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

import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { CLASSIFICATION } from '../../../../pages'
import DefaultButton from '../../button/defaultbutton'
import SettingSVG from '../../button/defaultbutton/setting-svg'
import RadioButton from '../../button/radiobutton'
import DropDownList from '../../dropdownlist'
import CustomSlider from '../../slider'
import ProbabilitySVG from '../../slider/probability-svg'
import styles from './settingmenu.module.scss'

type SettingMenuProps = {
  aiTask: string
  mode: string,
  probability: number,
  setProbability: (probability: number) => void,
  isDisplayTs: boolean,
  setIsDisplayTs: (isDisplayTs: boolean) => void,
  displayScore?: number,
  setDisplayScore?: (displayScore: number) => void,
  isOverlayIR?: boolean,
  setIsOverlayIR?: (isOverlayIR: boolean) => void,
  overlayIRC?: string,
  setOverlayIRC?: (isOverlayIRC: string) => void
}

export default function SettingMenu (props: SettingMenuProps) {
  const RADIO_TEXT: string[] = ['ON', 'OFF']
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [tsRadioValue, setTsRadioValue] = useState<string>(RADIO_TEXT[0])
  const scoreList = [...Array(21)].map((_, num) => num)
  const [overlayIrValue, setOverlayIrValue] = useState<string>(RADIO_TEXT[0])

  useEffect(() => {
    if (tsRadioValue === RADIO_TEXT[0]) {
      props.setIsDisplayTs(true)
    } else {
      props.setIsDisplayTs(false)
    }
  }, [tsRadioValue])

  useEffect(() => {
    if (props.isOverlayIR !== undefined && props.setIsOverlayIR !== undefined) {
      if (overlayIrValue === RADIO_TEXT[0]) {
        props.setIsOverlayIR(true)
      } else {
        props.setIsOverlayIR(false)
      }
    }
  }, [overlayIrValue])

  return (
    <>
      <DefaultButton isLoading={false} icon={<SettingSVG />} text='Display Setting' disabled={false} action={onOpen}></DefaultButton>
      <Modal isOpen={isOpen} onClose={onClose} size={'xl'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader />
          <ModalCloseButton />
          <ModalBody>
            <div className={styles['probability-area']}>
              <div>Probability</div>
              <div className={styles['slider-area']}>
                <CustomSlider icon={<ProbabilitySVG />} currValue={props.probability} setCurrValue={props.setProbability} max={100} />
                <div className={styles['unit-area']}>
                  {` > ${props.probability}  %`}
                </div>
              </div>
            </div>
            <div className={styles['radio-button']}>
              Display Timestamp
              <RadioButton name={'tsRadio'} radioValue={tsRadioValue} setRadioValue={setTsRadioValue} text={RADIO_TEXT} />
            </div>
            {props.aiTask === CLASSIFICATION
              ? <div className={styles['display-top-score']}>Display Top
                <div className={styles['number-list']}>
                  <DropDownList
                    id={'device-id-list'}
                    name={'score'}
                    className={styles['']}
                    list={scoreList}
                    onChange={(event) => {
                      if (props.displayScore !== undefined && props.setDisplayScore !== undefined) {
                        props.setDisplayScore(Number(event.target.value))
                      }
                    }
                    }
                    defaultValue={props.displayScore}
                    disabled={false}
                  />
                </div>
                Score</div>
              : null
            }
            {props.aiTask === CLASSIFICATION
              ? <div className={styles['radio-button']}>Overlay Inference Result
                <RadioButton name={'overlayRadio'} radioValue={overlayIrValue} setRadioValue={setOverlayIrValue} text={RADIO_TEXT} />
              </div>
              : null
            }
            {props.aiTask === CLASSIFICATION
              ? <div className={styles['overlay-inference-result-color']}>Overlay Inference Result Color
                <input id="select-inferencecolor"
                  role='color'
                  type='color'
                  onChange={(event) => {
                    if (props.overlayIRC !== undefined && props.setOverlayIRC !== undefined) {
                      props.setOverlayIRC(event.target.value)
                    }
                  }
                  }
                  value={props.overlayIRC}
                />
              </div>
              : null
            }
          </ModalBody>
          <ModalFooter>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
