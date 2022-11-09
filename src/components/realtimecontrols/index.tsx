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
import { Button } from '@chakra-ui/react'
import ConfidenceSlider from '../confidenceslider'
import PollingSlider from '../pollingslider'
import styles from './realtimecontrols.module.scss'

type RealTimeControlsProps = {
    currConfidenceThreshold: { confidence: number },
    setCurrConfidenceThreshold: (currConfidenceThreshold: { confidence: number }) => void,
    isPolling: boolean,
    setIsPolling: (isPolling: boolean) => void,
    setIsUploading: (isUploading: boolean) => void,
    isUploading: boolean,
    pollInterval: { seconds: number },
    setPollInterval: (pollInterval: { seconds: number }) => void
    isLoading: boolean,
    setIsLoading: (isLoading: boolean) => void
}

export default function RealTimeControls ({ ...props }: RealTimeControlsProps) {
  return (
        <div className={styles['realtime-controls-container']}>
            <div className={styles['realtime-control-confidence']}>
                <div className={styles['confidence-header']}>PROBABILITY</div>
                <ConfidenceSlider currConfidence={props.currConfidenceThreshold} setCurrConfidence={props.setCurrConfidenceThreshold} />
            </div>
            <div className={styles['realtime-control-polling-interval']}>
                <div className={styles['polling-header']}>POLLING INTERVAL (seconds)</div>
                <PollingSlider isPolling={props.isPolling} pollInterval={props.pollInterval} setPollInterval={props.setPollInterval} />
            </div>
            <div className={styles['realtime-control-actions']}>
                <Button className={props.isLoading ? `${styles['action-disable']}` : `${styles['action-toggle']}`} disabled={props.isLoading} onClick={() => props.setIsUploading(!props.isUploading)}>
                    <div className={props.isLoading ? `${styles['disable-svg']}` : `${styles['toggle-svg']}`}>
                        <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0.5 7.5C0.5 9.98528 2.51472 12 5 12H14C15.933 12 17.5 10.433 17.5 8.5C17.5 6.72999 16.1861 5.26685 14.4804 5.0327C14.2433 2.21385 11.8802 0 9 0C6.82267 0 4.94084 1.26521 4.0496 3.10055C2.02075 3.53675 0.5 5.34078 0.5 7.5ZM9 3L5.5 7H7.5V10H10.5V7H12.5L9 3Z" fill="white" />
                        </svg>
                    </div>
                    <div className={props.isLoading ? `${styles['disable-text']}` : `${styles['toggle-text']}`}>{props.isLoading ? 'Please wait...' : props.isUploading ? 'Stop upload' : 'Start upload'}</div>
                </Button>
                <Button className={styles['action-toggle']} onClick={() => props.setIsPolling(!props.isPolling)}>
                    <div className={styles['toggle-svg']}>
                        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M6 0H4V16H6V0ZM2 8H0V16H2V8ZM8 6H10V16H8V6ZM14 4H12V16H14V4Z" fill="white" />
                        </svg>
                    </div>
                    <div className={styles['toggle-text']}>{props.isPolling ? 'Stop polling' : 'Start polling'}</div>
                </Button>
            </div>
        </div>
  )
}
