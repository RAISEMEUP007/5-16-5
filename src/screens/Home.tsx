import React, { useState, useEffect } from 'react';
import { View, Image, Platform, Linking, ScrollView, Text } from 'react-native';
import { createDrawerNavigator, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useScreenSize } from '../common/hooks/UseScreenDimention';
import Dashboard from './dashboard/Dashboard';
import Inventory from './Inventory/Inventory';
import Settings from './settings/Settings';
import Customers from './customer/customers/Customers';
import Reservations from './reservations/Reservations';
import { logout, testTokenValid } from '../api/Auth';
import Orders from './orders/Orders';
import Scheduler from './scheduler/Scheduler';
import { useHambugerMenuHistory } from '../common/hooks/UseHambugerMenuHistory';
import Marketing from './marketing/Marketing';
import DemandsList from './reservations/DemansList';
import LocationManager from './marketing/locationmanager/Locations';
import Avaiable from './marketing/avaiable/Avaiable';
import Forecasting from './marketing/forecasting/Forecasting';
import OrderPotential from './marketing/orderpotential/OrderPotential';
import PotentialList from './reservations/PotentialList';
import Plantations from './marketing/plantaions/Plantaions';
import Streets from './marketing/streets/Streets';
import Properties from './marketing/properties/Properties';

const MainDrawer = ({ navigation }) => {

  const initialRouteName = 'Settings';

  const { isLargeScreen } = useScreenSize();
  const { addMenuHistory } = useHambugerMenuHistory();

  const Drawer = createDrawerNavigator();

  // useEffect(()=>{
  //   addMenuHistory(initialRouteName);
  // }, []);

  useEffect(() => {
    const handleDeepLinking = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          const route = url.replace(/.*?:\/\//g, '');
          if (route.toLowerCase().includes('dashboard')) {
            navigation.navigate('Dashboard');
          }else if (route.toLowerCase().includes('reservation')) {
            navigation.navigate('Reservation');
          }else if (route.toLowerCase().includes('demandslist')) {
            navigation.navigate('DemandsList');
          }else if (route.toLowerCase().includes('walkup')) {
            navigation.navigate('Walkup Order');
          }else if (route.toLowerCase().includes('inventory')) {
            navigation.navigate('Inventory');
          }else if (route.toLowerCase().includes('customer')) {
            navigation.navigate('Customer');
          }else if (route.toLowerCase().includes('marketing')) {
            navigation.navigate('Marketing');
          }else if (route.toLowerCase().includes('plantations')) {
            navigation.navigate('Plantations');
          }else if (route.toLowerCase().includes('streets')) {
            navigation.navigate('Streets');
          }else if (route.toLowerCase().includes('properties')) {
            navigation.navigate('Properties');
          }else if (route.toLowerCase().includes('locations')) {
            navigation.navigate('Locations');
          }else if (route.toLowerCase().includes('forecasting')) {
            navigation.navigate('Forecasting');
          }else if (route.toLowerCase().includes('demands')) {
            navigation.navigate('Demands Summary');
          }else if (route.toLowerCase().includes('scheduler')) {
            navigation.navigate('Scheduler');
          }else if (route.toLowerCase().includes('settings')) {
            navigation.navigate('Settings');
          }else if (route.toLowerCase().includes('potential%20list') || route.toLowerCase().includes('potentiallist')) {
            navigation.navigate('Potential List');
          }else if (route.toLowerCase().includes('potential')) {
            navigation.navigate('Order Potential');
          }
        }
      } catch (error) {
        console.error('Error fetching initial URL: ', error);
      }
    };
    handleDeepLinking();
  }, []);

  const screensConfig = [
    {
      name: "Dashboard",
      component: ({navigation})=>{return <Dashboard navigation={navigation} />},
      iconName: "dashboard.png",
      label: "Dashboard",
    },{
      name: "Reservation",
      component: ({navigation})=>{return <Reservations navigation={navigation} />},
      iconName: "reservations.png",
    },{
      name: "Walkup Order",
      component: ({navigation})=>{return <Orders navigation={navigation} />},
      iconName: "walk-up-order.png",
    },{
      name: "Inventory",
      component: ({navigation})=>{return <Inventory navigation={navigation} />},
      iconName: "inventory.png",
    },{
      name: "Customers",
      component: ({navigation})=>{return <Customers navigation={navigation} />},
      iconName: "customers.png",
    },{
      name: "Scheduler",
      component: ({navigation})=>{return <Scheduler navigation={navigation} />},
      hidden: true,
    },{
      name: "Marketing",
      component: ({navigation})=>{return <Marketing navigation={navigation} />},
      iconName: "marketing.png",
    },{
      name: "Locations",
      component: ({navigation})=>{return <LocationManager navigation={navigation} />},
      hidden: true,
    },{
      name: "Plantations",
      component: ({navigation})=>{return <Plantations navigation={navigation} />},
      hidden: true,
    },{
      name: "Streets",
      component: ({navigation})=>{return <Streets navigation={navigation} />},
      hidden: true,
    },{
      name: "Properties",
      component: ({navigation})=>{return <Properties navigation={navigation} />},
      hidden: true,
    },{
      name: "Forecasting",
      component: ({navigation})=>{return <Forecasting navigation={navigation} />},
      hidden: true,
    },{
      name: "Demands Summary",
      component: ({navigation})=>{return <Avaiable navigation={navigation} />},
      hidden: true,
    },{
      name: "Settings",
      component: ({navigation})=>{return <Settings navigation={navigation} />},
      iconName: "settings.png",
    },{
      name: "DemandsList",
      component: ({navigation})=>{return <DemandsList navigation={navigation} />},
      hidden: true,
    },{
      name: "Order Potential",
      component: ({navigation})=>{return <OrderPotential navigation={navigation} />},
      hidden: true,
    },{
      name: "Potential List",
      component: ({navigation})=>{return <PotentialList navigation={navigation} />},
      hidden: true,
    },
  ];
  
  const drawerScreens = screensConfig.map((screen) => (
    <Drawer.Screen
      key={screen.name}
      name={screen.name}
      component={screen.component}
      options={{
        drawerLabel: screen?.label??screen.name,
        unmountOnBlur: true,
        headerShown: false,
        drawerIcon: ({ focused, size }) => (
          screen.iconName ? (
            <Image
              style={{ width: 25, height: 25, resizeMode: 'contain' }}
              source={require(`../assets/nav-icons/${screen.iconName}`)}
            />
          ) : (
            <></>
          )
        ),
        drawerItemStyle: {
          display: screen.hidden ? 'none' : 'flex',
        },
      }}
    />
  ));

  const DrawerContent = (props) => {
    const { navigation } = props;
    return (
      <View style={{height:'100%', paddingBottom:50}}>
        <ScrollView>
          <DrawerItem
            label="#"
            onPress={() => navigation.navigate('Home')}
            icon={() => (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <Image source={require('../assets/icon.png')} style={{ width: 70, height: 70 }} />
              </View>
            )}
            style={{ marginTop: 20 }}
            labelStyle={{ color: 'black', fontWeight: 'bold' }}
          />
          <DrawerItemList {...props} />
          <DrawerItem
            label="Log out"
            onPress={async () => {
              await logout(() => {});
              await AsyncStorage.setItem('access-token', '');
              navigation.navigate('Auth');
            }}
          />
        </ScrollView>
        <View style={{position:"absolute", bottom:0, paddingBottom:10, width:'100%' }}><Text style={{textAlign:'center'}}>{`Version 1.0 - Commit ID {COMMIT}`}</Text></View>
      </View>
    );
  };

  return (
    <>
      <Drawer.Navigator
        initialRouteName={initialRouteName}
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          drawerType: Platform.OS == 'web' && isLargeScreen ? 'permanent' : 'front',
          drawerStyle: { backgroundColor: '#f1f3fc', },
        }}
      >
        {drawerScreens}
      </Drawer.Navigator>
    </>
  );
};

const Home = ({ navigation }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkTokenValidity = async () => {
      await testTokenValid((jsonRes, status)=>{
        if(status != 200) navigation.navigate('Auth');
      });
    };

    checkTokenValidity();
  }, []);

  useEffect(() => {

    const unsubscribe = navigation.addListener('state', () => {
      setRefreshKey((prevKey) => prevKey + 1);
    });

    return unsubscribe();
  }, [navigation]);

  return <MainDrawer key={refreshKey} navigation={navigation} />;
};

export default Home;
