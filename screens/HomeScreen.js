import React from 'react';
import {View,Text,StyleSheet,Image,TextInput,TouchableOpacity,Alert,KeyboardAvoidingView} from 'react-native';
import * as firebase from 'firebase'
export default class SignupScreen extends React.Component {

    constructor(){
        super();
        this.state={
          emailId : '',
          password: '',
          passwordConf: ''
        }
      }
    
      login=async(email,password)=>{
              this.props.navigation.navigate('Login')
           
      }
      signup=async(email,password)=>{
        this.props.navigation.navigate('Signup')
            
        }

  render(){
      return(
        <KeyboardAvoidingView style = {{alignItems:'center',marginTop:20}}>
        <View>
          <Image
            source={require("../assets/cycle.png")}
            style={{width:200, height: 200}}/>
          <Text style={{textAlign: 'center', fontSize: 30}}>Bike Repair</Text>
        </View>
        <View>
        <Text style={{textAlign: 'center', fontSize: 24}}>Do You Have an account?</Text>
        </View>
        <View>
          <TouchableOpacity style={{height:30,width:90,borderWidth:1,marginTop:20,paddingTop:5,borderRadius:7}}
          onPress={()=>{this.login()}}>
            <Text style={{textAlign:'center'}}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{height:30,width:90,borderWidth:1,marginTop:20,paddingTop:5,borderRadius:7}}
          onPress={()=>{this.signup()}}>
            <Text style={{textAlign:'center'}}>No</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>

      )
  }
}


const styles = StyleSheet.create({
  loginBox:
  {
    width: 300,
  height: 40,
  borderWidth: 1.5,
  fontSize: 20,
  margin:10,
  paddingLeft:10
  }
})
