import { View, Text,TouchableOpacity,Button,StyleSheet,Platform,Dimensions, ScrollView} from 'react-native';
import React from 'react';
import colors from '../helpers/colors';
import Loading from '../components/Loading';
import CreateNotification from '../components/CreateNotification';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'ReminderDatabase.db' });

export default function Home() {
  const [isOpen,setisOpen]=React.useState(false)
  const [reminders, setReminders] = React.useState([]);
  const [isload,setisload]=React.useState(false)
  const deleterecord = (id) => {
    setisload(true);
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM reminders WHERE id=?',
        [id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            setisload(false);
            alert('Reminder deleted successfully');
          } else {
            setisload(false);
            alert('Failed to delete');
          }
        },
        (tx, error) => {
          setisload(false)
          console.log('Error while deleting record', error);
        }
      );
    });
  }
  
  const closeOpen=()=>{
    setisOpen(false)
  }
  React.useEffect(()=>{
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS reminders (id INTEGER PRIMARY KEY AUTOINCREMENT, remindertext TEXT, reminderdate TEXT);',
        [],
        (tx, results) => {
          console.log('Table created successfully');
        },
        (tx, error) => {
          console.log('Error while creating the table', error);
        },
      );
    });
  },[])

  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM reminders ORDER BY reminderdate DESC',
        [],
        (tx, results) => {
          const len = results.rows.length;
          const temp = [];
          for (let i = 0; i < len; i++) {
            const item = results.rows.item(i);
            temp.push(item);
          }
          setReminders(temp);
        },
        (error) => {
          console.log('error while fetching reminders:', error);
        },
      );
    });
  }, [isOpen,isload]);
 

  return (
    <View style={styles.mncont}>
      <Loading load={isload}/>
      <CreateNotification close={closeOpen} open={isOpen}/>
      <Text style={{fontWeight:'bold',marginBottom:20,color:colors.black,fontSize:32}}>Reminders</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {
          reminders.map((item,i)=>(
            <View key={i} style={{paddingHorizontal:16,paddingVertical:12,marginBottom:7,backgroundColor:colors.green,borderRadius:8}}>
               <View style={{display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
               <Text style={{color:colors.white,fontSize:18,fontWeight:500,width:"70%"}}>
                  {
                    item?.remindertext
                  }
                </Text>
                <TouchableOpacity style={{backgroundColor:colors.red,paddingHorizontal:10,paddingVertical:5,borderRadius:5}} onPress={()=>deleterecord(item?.id)}>
                  <Text style={{color:colors.white}}>Delete</Text>
                </TouchableOpacity>
               </View>
                <View style={{display:"flex",flexDirection:"row",justifyContent:"flex-end",marginVertical:10}}>
                <Text style={{color:colors.white,fontWeight:300}}>{item?.reminderdate}</Text>
                </View>
                
            </View>
          ))
        }
      </ScrollView>
      <TouchableOpacity onPress={()=>setisOpen(true)} style={{position:"absolute",backgroundColor:colors.green,height:60,width:60,borderRadius:30,display:"flex",alignItems:"center",justifyContent:"center",bottom:50,right:20}}>
        <Text style={{color:colors.white,fontWeight:"bold"}}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  mncont:{
    height:Dimensions.get('window').height,
    paddingHorizontal:15,
    paddingVertical:20,
  },
});
