import { View, Text,SafeAreaView } from 'react-native';
import React from 'react';
import Home from "./src/screens/Home"
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';


export default function App() {
  React.useEffect(()=>{
    // Set up the background event handler
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log('Background event received', { type, detail });
      // Handle the background event here, e.g. update app state, display a notification, etc.
      if (type === 'ACTION_PRESS') {
        console.log('User pressed notification action');
      }
    });

    // Set up the foreground event handler
    notifee.onForegroundEvent(async ({ type, detail }) => {
      console.log('Foreground event received', { type, detail });
      // Handle the foreground event here, e.g. update app state, display a notification, etc.
      if (type === 'ACTION_PRESS') {
        console.log('User pressed notification action');
      }
    });
},[])
  return (
    <SafeAreaView>
      <Home/>
    </SafeAreaView>
  );
}
