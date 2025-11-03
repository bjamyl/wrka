import { View} from 'react-native'
import React from 'react'
import Header from './Header'
import Status from './Status'

export default function Hero() {
  return (
    <View>
      <Header/>
      <Status/>
    </View>
  )
}