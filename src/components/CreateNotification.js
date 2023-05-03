import { View, Alert,Text,Modal,TouchableOpacity,Button,TextInput, Dimensions,ActivityIndicator,Platform } from 'react-native'
import React from 'react'
import colors from '../helpers/colors'
import DateTimePicker from '@react-native-community/datetimepicker';
import notifee,{ TimestampTrigger, TriggerType } from '@notifee/react-native';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'ReminderDatabase.db' });
export default function CreateNotification({close,open}) {
  const [remindertext,setremindertext]=React.useState("")
  const [isloading,setisloading]=React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedTime, setSelectedTime] = React.useState(new Date(Date.now()));
  const [show,setshow]=React.useState(false)
  const [show2,setshow2]=React.useState(false)
  
  const onChangeFormate=(event,selecteddate)=>{ 
    setSelectedDate(selecteddate)
    setshow(false)
    }
  const onChangeFormatetime=(event,selecteddate)=>{ 
    setSelectedTime(selecteddate)
    setshow2(false)
    }
  const saveReminder = async () => {
    const timeReminder = selectedDate.toDateString() + " " + selectedTime.toLocaleTimeString('en-US');
    let alerttime = combineDateTime(selectedTime, selectedDate);
    const secondhere = getSecondsFromDate(alerttime);
    if (secondhere > 0) {
        if (!remindertext) {
            Alert.alert(
              'Title',
              'Please enter a reminder text.',
              [
                {
                  text: 'Close',
                  onPress: () => close()
                }
              ],
              { cancelable: false }
            );
            return;
        }
        setisloading(true);
        await scheduleLocalNotification(secondhere, remindertext);
        db.transaction((tx) => {
            tx.executeSql(
                'INSERT INTO reminders (remindertext, reminderdate) VALUES (?, ?)',
                [remindertext, timeReminder],
                async (tx, results) => {
                    setisloading(false);
                    Alert.alert(
                      'Title',
                      'Reminder Added',
                      [
                        {
                          text: 'Close',
                          onPress: () => close()
                        }
                      ],
                      { cancelable: false }
                    );
          
                },
                (error) => {
                    console.log('Error', error);
                    setisloading(false);
                    close();
                }
            );
        });
    } else {
        alert("Cannot Schedule in past");
       }
};

  const scheduleLocalNotification = async (rtime, remindertext = 'My Notification Message') => {
    console.log("notification time",rtime)
     await notifee.requestPermission();
     const notificationTime = new Date().getTime() + rtime*1000;//time in milliseconds
     let randomNumber = Math.floor(Math.random() * 90000) + 10000;
     const channelId = await notifee.createChannel({
           id: `reminder_${randomNumber}`,
           name: 'Default Channel',
         });
     const notification = {
       title: 'Reminder',
       body: remindertext,
       android: {
         channelId, // the channel to use for this notification on Android
         pressAction: {
           id: `id_${randomNumber}`,
           title: 'Open App',
         },
       },
       ios: {
         sound: 'default',
       },
     };
   
     const trigger = {
       type: TriggerType.TIMESTAMP,
       timestamp: notificationTime,//rtime,
       repeats: false, // don't repeat the notification
       alarmManager: true,
     };
   
     const notificationId = await notifee.createTriggerNotification(notification, trigger);
  };
  function combineDateTime(timeinp, dateinp) {
    // Parse the input strings
    var time = new Date(timeinp);
    var date = new Date(dateinp);
    
    // Extract the year, month, and day components from the date
    var year = date.getUTCFullYear();
    var month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    var day = ('0' + date.getUTCDate()).slice(-2);
    
    // Extract the hour, minute, second, and millisecond components from the time
    var hour = ('0' + time.getUTCHours()).slice(-2);
    var minute = ('0' + time.getUTCMinutes()).slice(-2);
    var second = ('0' + time.getUTCSeconds()).slice(-2);
    var millisecond = ('00' + time.getUTCMilliseconds()).slice(-3);
    
    // Combine the components into a new ISO 8601 string
    var combined = year + '-' + month + '-' + day + 'T' +
                   hour + ':' + minute + ':' + second + '.' + millisecond + 'Z';
  
    // Convert combined date and time string to local time
    return combined;
  }
  
  function getSecondsFromDate(dateString) {
    const date = new Date(dateString);
  const now = new Date();
  const diff = (date.getTime() - now.getTime()) / 1000;
  const diffRounded = Math.ceil(diff / 60) * 60;
  return diffRounded;
  }
  return (
    <Modal transparent visible={open}>
      {
        show&&(
          <DateTimePicker
          value={selectedDate}
          mode={"date"}
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeFormate}
        />
        )
      }
      {
        show2&&(
          <DateTimePicker
          value={selectedTime}
          mode={"time"}
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeFormatetime}
        />
        )
      }
      <View style={{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:colors.tranbg}}>
      <View style={{width:Dimensions.get("screen").width/1.2,paddingHorizontal:15,paddingVertical:12,backgroundColor:colors.white,borderRadius:8}}>
      <Text style={{color:colors.black,fontSize:17,fontWeight:"bold",marginBottom:10}}>Create New Reminder</Text>
      <TextInput onChangeText={(e)=>setremindertext(e)} value={remindertext} placeholder='Enter Reminder' style={{borderWidth:1,borderColor:colors.black,paddingHorizontal:8,paddingVertical:4,borderRadius:5}}/>
       <View style={{marginVertical:5}}>
       <Text >Date = {selectedDate.toDateString()}</Text>
      <Text >Time = {selectedTime.toLocaleTimeString('en-US')}</Text>
       </View>
        <View style={{display:"flex",flexDirection:"row",alignItems:"center",marginTop:10}}>
        <TouchableOpacity onPress={()=>setshow(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:colors.black,width:"49%",paddingVertical:5,borderRadius:6,marginRight:5}}>
          <Text style={{color:colors.white,fontWeight:"bold"}}>Date</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setshow2(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:colors.black,width:"49%",paddingVertical:5,borderRadius:6}}>
          <Text style={{color:colors.white,fontWeight:"bold"}}>Time</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={saveReminder} style={{marginVertical:10,backgroundColor:colors.green,display:"flex",alignItems:"center",justifyContent:"center",paddingHorizontal:10,paddingVertical:8,borderRadius:7}}>
        {isloading?<ActivityIndicator size={24} color={colors.white}/>:<Text style={{color:colors.white,fontWeight:"bold"}}>Save Reminder</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={close} style={{backgroundColor:colors.red,display:"flex",alignItems:"center",justifyContent:"center",paddingHorizontal:10,paddingVertical:8,borderRadius:7}}>
        <Text style={{color:colors.white,fontWeight:"bold"}}>Cancel</Text>
      </TouchableOpacity>
      </View>
    </View>
    </Modal>
  )
}