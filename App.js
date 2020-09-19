import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { createAppContainer ,createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import TransactionScreen from './screens/BookTransactionScreen';
import SearchScreen from './screens/SearchScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';

export default class App extends React.Component {
  render(){
    return (

        <AppContainer/>

    );
  }
}



const TabNavigator = createBottomTabNavigator({
  Transaction: {screen: TransactionScreen},
  Search: {screen: SearchScreen},
  Login: {screen: LoginScreen},
  Signup: {screen: SignupScreen},
},
{
  defaultNavigationOptions: ({navigation})=>({
    tabBarIcon: ()=>{
      const routeName = navigation.state.routeName;
      console.log(routeName)
      if(routeName === "Transaction"){
        return(
          <Image
          source={require("./assets/cycle.png")}
          style={{width:40, height:40}}
        />
        )

      }else if(routeName === "Login"){
        return(
          <Image
          source={require("./assets/cycle.png")}
          style={{width:40, height:40}}
        />
        )

      }
      else if(routeName === "Search"){
        return(
          <Image
          source={require("./assets/brokencycle.png")}
          style={{width:40, height:40}}
        />)

      }
    }
  })
}
);

const switchNavigator = createSwitchNavigator({
HomeScreen:{screen: HomeScreen},
TabNavigator:{screen: TabNavigator}
})

const AppContainer =  createAppContainer(switchNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
});