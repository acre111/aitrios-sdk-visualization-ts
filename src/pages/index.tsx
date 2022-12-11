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

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text
} from '@chakra-ui/react'

import Layout from '../components/layout'
import { DemoConfiguration } from '../common/config'

function Home () {
  const [deviceId, setDeviceId] = useState(DemoConfiguration.deviceId)
  const [disable, setDisable] = useState(false)
  const router = useRouter()
  const handleDeviceIdChange = (event: any) => {
    setDeviceId(event.target.value)
  }
  const handleClickButton = async () => {
    setDisable(true)
    try {
      if (deviceId !== 'mock') {
        const res = await fetch(`/api/deviceinfo/${deviceId}`)
        const data = await res.json()
        if (res.status === 500) {
          window.alert('Get deviceInfo has failed. Plese check environment file.')
          setDisable(false)
          return
        } else if (!Object.keys(data).length) {
          window.alert('DeviceID is not registered. Plese re-enter.')
          setDisable(false)
          return
        }
      }
    } catch (e) {
      console.error(e)
      window.alert('Get deviceInfo has failed.')
      setDisable(false)
      return
    }
    router.push(`/${deviceId}`)
  }
  const initialRef = useRef<any>(undefined)

  return (
    <Layout title="edge AI device Visualization">
      <Modal
        isCentered
        initialFocusRef={initialRef}
        isOpen={true}
        onClose={() => null}
      >
        <ModalOverlay />
        <ModalContent style={{ borderWidth: '0.3em', borderColor: 'teal', borderRadius: '20px' }}>
          <ModalHeader>Please Choose DeviceId</ModalHeader>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>DeviceId</FormLabel>
              <Input onChange={handleDeviceIdChange} ref={initialRef} placeholder={''} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button disabled={disable} colorScheme="teal" mr={3} onClick={handleClickButton}>
              {!disable ? 'GO' : 'verify DeviceID...'}
            </Button>
          </ModalFooter>
          <Text style={{ paddingLeft: '10px' }} as="i" fontSize="xs">DeviceId "mock" does not require Console</Text>
        </ModalContent>
      </Modal>
    </Layout>
  )
}

export default Home
