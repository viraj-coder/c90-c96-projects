import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase'
import db from '../config.js'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        bikeModelId: '',
        customerId:'',
        buttonState: 'normal',
        transactionMessage: ''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="bikeModelId"){
        this.setState({
          scanned: true,
          bikeModelId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="customerId"){
        this.setState({
          scanned: true,
          customerId: data,
          buttonState: 'normal'
        });
      }
      
    }

    initiateBookIssue = async()=>{
      //add a transaction
      db.collection("transactions").add({
        'customerId': this.state.customerId,
        'bikeModelId' : this.state.bikeModelId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Issue"
      })
      //change book status
      db.collection("books").doc(this.state.bikeModelId).update({
        'bookAvailability': false
      })
      //change number  of issued books for customer
      db.collection("customer").doc(this.state.customerId).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)
      })

      Alert.alert("Book issued!")

      this.setState({
        customerId: '',
        bikeModelId: ''
      })
    }

    initiateBookReturn = async()=>{
      //add a transaction
      db.collection("transactions").add({
        'customerId': this.state.customerId,
        'bikeModelId' : this.state.bikeModelId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Return"
      })
      //change book status
      db.collection("books").doc(this.state.bikeModelId).update({
        'bookAvailability': true
      })
      //change number  of issued books for customer
      db.collection("customer").doc(this.state.customerId).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
      })

      this.setState({
        customerId: '',
        bikeModelId: ''
      })
    }

    checkBookEligibility = async()=>{
      const bookRef = await db.collection("books").where("bikeModelId","==",this.state.bikeModelId).get()
      var transactionType = ""
      if(bookRef.docs.length == 0){
        transactionType = "false";
        console.log(bookRef.docs.length)
      }
      else{
        bookRef.docs.map((doc)=>{
          var book = doc.data()
          if (book.bookAvailability)
            transactionType = "Issue"
          else
            transactionType = "Return"
          
        })
      }

      return transactionType
      
    }

    checkcustomerEligibilityForBookIssue = async()=>{
      const customerRef = await db.collection("customer").where("customerId","==",this.state.customerId).get()
      var iscustomerEligible = ""
      if(customerRef.docs.length == 0){
        this.setState({
          customerId: '',
          bikeModelId: ''
        })
        iscustomerEligible = false
        Alert.alert("The customer id doesn't exist in the database!")
      }
      else{
         customerRef.docs.map((doc)=>{
            var customer = doc.data();
            if(customer.numberOfBooksIssued < 2){
              iscustomerEligible = true
            }
            else{
              iscustomerEligible = false
              Alert.alert("The customer has already issued 2 books!")
              this.setState({
                customerId: '',
                bikeModelId: ''
              })
            }

          })

      }

      return iscustomerEligible

    }

    checkcustomerEligibilityForReturn = async()=>{
      const transactionRef = await db.collection("transactions").where("bikeModelId","==",this.state.bikeModelId).limit(1).get()
      var iscustomerEligible = ""
      transactionRef.docs.map((doc)=>{
        var lastBookTransaction = doc.data();
        if(lastBookTransaction.customerId === this.state.customerId)
          iscustomerEligible = true
        else {
          iscustomerEligible = false
          Alert.alert("The book wasn't issued by this customer!")
          this.setState({
            customerId: '',
            bikeModelId: ''
          })
        }
          
      })
      return iscustomerEligible
    }


    handleTransaction = async()=>{
     //verify if the customer is eligible for book issue or return or none
            //customer id exists in the database
            //issue : number of book issued < 2
            //issue: verify book availability
            //return: last transaction -> book issued by the customer id
      var transactionType = await this.checkBookEligibility();
      console.log("Transaction Type", transactionType)
      if (!transactionType) {
        Alert.alert("The book doesn't exist in the library database!")
        this.setState({
          customerId: '',
          bikeModelId: ''
        })
      }

      else if(transactionType === "Issue"){
        var iscustomerEligible = await this.checkcustomerEligibilityForBookIssue()
        if(iscustomerEligible)
          this.initiateBookIssue()
          Alert.alert("Book issued to the customer!")     
      }

      else{
        var iscustomerEligible = await this.checkcustomerEligibilityForReturn()
        if(iscustomerEligible)
          this.initiateBookReturn()
          Alert.alert("Book returned to the library!")
      }
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <View>
              <Image
                source={require("../assets/cycle.png")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Bike Repair</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Cycle Model Number"
              onChangeText={(text)=>{
                this.setState({
                  bikeModelId: text
                })
              }}
              value={this.state.bikeModelId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("Customer Id")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>

            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="customer Id"
              onChangeText={(text)=>{
                this.setState({
                  customerId: text
                })
              }}
              value={this.state.customerId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("customerId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <Text style={styles.transactionAlert}>{this.state.transactionMessage}</Text>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={async()=>{
                var transactionMessage = this.handleTransaction();
                console.log("Transaction Message: ",transactionMessage)
              }}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: '#FBC02D',
      width: 100,
      height:50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight:"bold",
      color: 'white'
    },
    transactionAlert:{
      margin:10,
      color: 'red'
    }
  });