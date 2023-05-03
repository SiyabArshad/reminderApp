import { View, Text,Modal,ActivityIndicator } from 'react-native'
import React from 'react'
import colors from '../helpers/colors'

export default function Loading({load}) {
  return (
<Modal transparent visible={load}>
<View style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <View style={{height:70,width:40,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <ActivityIndicator size={24} color={colors.green}/>
      </View>
    </View>
</Modal>
  )
}