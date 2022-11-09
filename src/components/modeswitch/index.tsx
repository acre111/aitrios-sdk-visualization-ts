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
import { useToast } from '@chakra-ui/react'
import ToggleSVG from './toggle-svg'
import styles from './modeswitch.module.scss'

type ModeSwitchProps = {
  isHistoryMode: boolean,
  setIsHistoryMode: (isHistoryMode: boolean) => void,
  isPolling: boolean,
  setIsPolling: (isPolling: boolean) => void,
  isPlaying: boolean,
  setIsPlaying: (isPlaying: boolean) => void,
  isLoading: boolean
}

export default function ModeSwitch ({ isHistoryMode, setIsHistoryMode, isPolling, setIsPolling, isPlaying, setIsPlaying, isLoading }: ModeSwitchProps) {
  const toast = useToast()
  const handleChange = (value: boolean) => {
    setIsHistoryMode(value)
    setIsPolling(false)
    setIsPlaying(false)
    toast({
      title: `Selected ${value ? 'History Mode' : 'RealTime Mode'}`,
      status: 'info',
      position: 'bottom-left',
      duration: 2000,
      isClosable: true
    })
  }

  return (
    <div className={styles['device-mode-toggle']}>
      <button className={styles['device-mode-toggle-button']} onClick={() => handleChange(false)} disabled={!!(isLoading || isPolling || isPlaying)}>
        <ToggleSVG active={!isHistoryMode}></ToggleSVG> <span className={styles['device-mode-toggle-label']}>Realtime</span>
      </button>
      <button className={styles['device-mode-toggle-button']} onClick={() => handleChange(true)} disabled={!!(isLoading || isPolling || isPlaying)}>
        <ToggleSVG active={isHistoryMode}></ToggleSVG> <span className={styles['device-mode-toggle-label']}>History</span>
      </button>
    </div>
  )
}
