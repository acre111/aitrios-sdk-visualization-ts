import { Spinner } from '@chakra-ui/react'
import React from 'react'
import styles from './loading.module.scss'

type Props = {
  display: boolean
}

export default function LoadingDialog (props: Props) {
  return (
    <div className={props.display ? styles['loading-area'] : styles['loading-area-hide']} >
      <div className={styles['spinner-area']}>
        <Spinner thickness='4px'speed='0.8s' emptyColor='gray.200' color='blue.500' size='xl' />
      </div>
    </div>
  )
}
