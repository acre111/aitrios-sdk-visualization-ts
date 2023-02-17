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

type DropDownListProps = {
  id: string,
  name: string,
  className: string,
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
  disabled: boolean,
  list: string[] | number[]
  defaultValue?: string | number
}

export default function DropDownList (props: DropDownListProps) {
  return (
    <select
      defaultValue={props.defaultValue}
      id={props.id}
      name={props.name}
      className={props.className}
      onChange={(e) => props.onChange(e)}
      tabIndex={props.disabled ? -1 : 0}
      style={{ outline: 'none', paddingLeft: '2px', paddingRight: '5px' }} >
      <option value="" />
      {props.list.map((data, index) => {
        return (
          <option key={index} value={data}>{data}</option>
        )
      })}
    </select>
  )
}
