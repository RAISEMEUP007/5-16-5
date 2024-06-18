import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getReservationsCounts, getReservationsData } from '../../api/Reservation';
import { BasicLayout, CommonContainer } from '../../common/components/CustomLayout';
import { BOHTlbCheckbox, BOHTlbRadio, BOHTlbrSearchInput, BOHTlbrSearchPicker, BOHToolbar, renderBOHTlbDatePicker } from '../../common/components/bohtoolbar';
import { BOHTBody, BOHTD, BOHTDIconBox, BOHTH, BOHTHead, BOHTR, BOHTable } from '../../common/components/bohtable';
import { msgStr } from '../../common/constants/Message';
import { TextMediumSize, TextdefaultSize } from '../../common/constants/Fonts';
import { useAlertModal } from '../../common/hooks';
import { formatDate, formatDate2 } from '../../common/utils/DateUtils';

const Dashboard = ({ navigation }) => {

  const { showAlert } = useAlertModal();

  const [tableData, setTableData] = useState([]);
  const [isloading, setIsLoading] = useState(true);
  const [quantities, setQuantities] = useState({
    provisional:0,
    confirmed:0,
    checkedOut:0,
    checkedIn:0,
  });
  const [updateReservationListTrigger, setUpdateReservationListTrigger] = useState(false);

  const [periodRange, setPeriodRange] = useState<any>('');
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const initialWidths = [100, 100, 160, 160, 100, 100, 110, 110, 80];

  const [ searchOptions, setSearchOptions ] = useState({
    start_date : `${twoWeeksAgo.getFullYear()}-${String(twoWeeksAgo.getMonth() + 1).padStart(2, '0')}-${String(twoWeeksAgo.getDate()).padStart(2, '0')}`,
    end_date : `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`,
    customer : '',
    brand: '',
    order_number: '',
    stage: null,
    status_filter: null,
    hideBeachTennis: false,
    ShowOnlyManual: false,
  });

  useEffect(() => {
    switch (periodRange.toLowerCase()) {
      case 'today':
        setSearchOptions({
          ...searchOptions,
          start_date: new Date().toISOString().substr(0, 10),
          end_date: new Date().toISOString().substr(0, 10),
        });
        break;
      case 'tomorrow':
        setSearchOptions({
          ...searchOptions,
          start_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
          end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
        });
        break;
      case 'yesterday':
        setSearchOptions({
          ...searchOptions,
          start_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
          end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
        });
        break;
      case 'today+tomorrow':
        setSearchOptions({
          ...searchOptions,
          start_date: new Date().toISOString().substr(0, 10),
          end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
        });
        break;
      case '7days':
        setSearchOptions({
          ...searchOptions,
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
          end_date: new Date().toISOString().substr(0, 10),
        });
        break;
      default:
        break;
    }
  }, [periodRange]);

  useEffect(()=>{
    loadSearchOption();
  }, [])
  
  const loadSearchOption = async () => {
    const [cachedSearchOptions, cachedTimestamp] = await Promise.all([
      AsyncStorage.getItem('__search_options'),
      AsyncStorage.getItem('__search_options_timestamp')
    ]);
    if (cachedTimestamp && cachedSearchOptions &&(new Date().getTime() - parseInt(cachedTimestamp, 10)) < 600000 ) {
      setSearchOptions(JSON.parse(cachedSearchOptions));
    } else {
      AsyncStorage.removeItem('__search_options');
    }
  }

  useEffect(()=>{
    const timeout = setTimeout(() => {
      AsyncStorage.setItem('__search_options', JSON.stringify(searchOptions))
      AsyncStorage.setItem('__search_options_timestamp', new Date().getTime().toString())
      setUpdateReservationListTrigger(true)
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchOptions])

  useEffect(() => {
    const today = new Date();
    switch (periodRange.toLowerCase()) {
      case 'today':
        setSearchOptions({
          ...searchOptions,
          start_date: formatDate(new Date()),
          end_date: formatDate(new Date()),
        });
        break;
      case 'tomorrow':
        setSearchOptions({
          ...searchOptions,
          start_date: formatDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)),
          end_date: formatDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)),
        });
        break;
      case 'yesterday':
        setSearchOptions({
          ...searchOptions,
          start_date: formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
          end_date: formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        });
        break;
      case 'today+tomorrow':
        setSearchOptions({
          ...searchOptions,
          start_date: formatDate(new Date()),
          end_date: formatDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)),
        });
        break;
      case '7days':
        setSearchOptions({
          ...searchOptions,
          start_date: formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
          end_date: formatDate(new Date()),
        });
      break;
      case 'next fri':
        let nextFriday = new Date(today);
        nextFriday.setDate(nextFriday.getDate() + (5 + 7 - nextFriday.getDay()) % 7);
        if (nextFriday.getTime() === today.getTime()) {
          nextFriday.setDate(nextFriday.getDate() + 7);
        }
        setSearchOptions({
          ...searchOptions,
          start_date: formatDate(nextFriday),
          end_date: formatDate(nextFriday),
        });
        break;
      case 'next sat':
        let nextSaturday = new Date(today);
        nextSaturday.setDate(nextSaturday.getDate() + (6 + 7 - nextSaturday.getDay()) % 7);
        setSearchOptions({
          ...searchOptions,
          start_date: formatDate(nextSaturday),
          end_date: formatDate(nextSaturday),
        });
        break;
      case 'next sun':
        let nextSunday = new Date(today);
        nextSunday.setDate(nextSunday.getDate() + (7 + 7 - nextSunday.getDay()) % 7);
        setSearchOptions({
          ...searchOptions,
          start_date: formatDate(nextSunday),
          end_date: formatDate(nextSunday),
        });
        break;
      case 'next mon':
        let nextMonday = new Date(today);
        nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
        setSearchOptions({
          ...searchOptions,
          start_date: formatDate(nextMonday),
          end_date: formatDate(nextMonday),
        });
        break;
      default:
        break;
    }
  }, [periodRange]);

  useEffect(() => {
    if (searchOptions.start_date && searchOptions.end_date) {
      if (searchOptions.start_date === formatDate(new Date()) &&
          searchOptions.end_date === formatDate(new Date())) {
        if(periodRange != 'Today') setPeriodRange('Today');
      } else if (searchOptions.start_date === formatDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)) &&
                  searchOptions.end_date === formatDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000))) {
        if(periodRange != 'Tomorrow') setPeriodRange('Tomorrow');
      } else if (searchOptions.start_date === formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)) &&
                  searchOptions.end_date === formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000))) {
        if(periodRange != 'Yesterday') setPeriodRange('Yesterday');
      } else if (searchOptions.start_date === formatDate(new Date()) &&
                  searchOptions.end_date === formatDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000))) {
        if(periodRange != 'Today+Tomorrow') setPeriodRange('Today+Tomorrow');
      } else if (searchOptions.start_date === formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) &&
                  searchOptions.end_date === formatDate(new Date())) {
        if(periodRange != '7days') setPeriodRange('7days');
      } else if (searchOptions.start_date == searchOptions.end_date && new Date(searchOptions.start_date).getDay() === 4 
                && (new Date(searchOptions.start_date).getTime() - new Date().getTime())/86400000 < 7) {
        if(periodRange != 'Next Fri') setPeriodRange('Next Fri');
      } else if (searchOptions.start_date == searchOptions.end_date && new Date(searchOptions.start_date).getDay() === 5 
                && (new Date(searchOptions.start_date).getTime() - new Date().getTime())/86400000 < 7) {
        if(periodRange != 'Next Sat') setPeriodRange('Next Sat');
      } else if (searchOptions.start_date == searchOptions.end_date && new Date(searchOptions.start_date).getDay() === 6 
                && (new Date(searchOptions.start_date).getTime() - new Date().getTime())/86400000 < 7) {
        if(periodRange != 'Next Sun') setPeriodRange('Next Sun');
      } else if (searchOptions.start_date == searchOptions.end_date && new Date(searchOptions.start_date).getDay() === 0 
                && (new Date(searchOptions.start_date).getTime() - new Date().getTime())/86400000 < 7) {
        if(periodRange != 'Next Mon') setPeriodRange('Next Mon');
      } else {
        if(periodRange != 'custom') setPeriodRange('custom');
      }
    }
  }, [searchOptions.start_date, searchOptions.end_date]);

  const stage = [
    'draft',
    'provisional',
    'confirmed',
    'checked out',
    'checked in',
  ];

  const changeSearchOptions = (key, val) => {
    setSearchOptions(prevOptions => ({
      ...prevOptions,
      [key]: val
    }));
  }

  useEffect(() => {
    if (updateReservationListTrigger == true) getTable();
  }, [updateReservationListTrigger]);

  const getTable = () => {
    setIsLoading(true);
    getReservationsData({searchOptions:searchOptions}, (jsonRes, status, error) => {
      switch (status) {
        case 200:
          setUpdateReservationListTrigger(false);
          setTableData(jsonRes);
          break;
        case 500:
          showAlert('error', msgStr('serverError'));
          break;
        default:
          if (jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
          else showAlert('error', msgStr('unknownError'));
          break;
      }
    });
    getReservationsCounts({searchOptions:searchOptions}, (jsonRes, status, error) => {
      const quantities = {
        provisional:0,
        confirmed:0,
        checkedOut:0,
        checkedIn:0,
      }

      if(status == 200){
        jsonRes.map(item=>{
          if(item.stage == 1) quantities.provisional = item.amounts;
          else if(item.stage == 2) quantities.confirmed = item.amounts;
          else if(item.stage == 3) quantities.checkedOut = item.amounts;
          else if(item.stage == 4) quantities.checkedIn = item.amounts;
        })
      }

      setQuantities(quantities);
    })
  };

  const renderTableData = useMemo(() => {
    const convertStageToString = (stage) => {
      switch (stage) {
        case null: case 'null': return 'Draft';
        case 0: case '0': return 'Draft';
        case 1: case '1': return 'Provisional';
        case 2: case '2': return 'Confirmed';
        case 3: case '3': return 'Checked out';
        case 4: case '4': return 'Checked in';
        default:  return 'Invalid stage';
      }
    }

    const rows = [];
    if (tableData.length > 0) {
      tableData.map((item, index) => {
        let wIndex = 0;
        rows.push(
          <BOHTR key={index}>
            <BOHTD width={initialWidths[wIndex++]}>{item.order_number}</BOHTD>
            <BOHTD width={initialWidths[wIndex++]}>{formatDate2(new Date(item.createdAt))}</BOHTD>
            <BOHTD width={initialWidths[wIndex++]}>{item.brand}</BOHTD>
            <BOHTD width={initialWidths[wIndex++]}>{item.full_name}</BOHTD>
            <BOHTD width={initialWidths[wIndex++]}>{item.start_date ? formatDate2(new Date(`${item.start_date} 00:00:00`)) : ''}</BOHTD>
            <BOHTD width={initialWidths[wIndex++]}>{item.end_date ? formatDate2(new Date(`${item.end_date} 00:00:00`)) : ''}</BOHTD>
            <BOHTD width={initialWidths[wIndex++]} textAlign={'right'}>{item?.quantity??''}</BOHTD>
            <BOHTD width={initialWidths[wIndex++]}>{convertStageToString(item.stage)}</BOHTD>
            <BOHTD width={initialWidths[wIndex++]} textAlign={'center'}>{item?.color_id?'YES':'NO'}</BOHTD>
          </BOHTR>
        );
      });
    } else {
      <></>;
    }
    
    setIsLoading(false);
    return <>{rows}</>;
  }, [tableData]);

  const tableElement = useMemo(()=>{
    let wIndex = 0;
    return (<BOHTable isLoading={isloading}>
      <BOHTHead>
        <BOHTR>
          <BOHTH width={initialWidths[wIndex++]}>{'Order #'}</BOHTH>
          <BOHTH width={initialWidths[wIndex++]}>{'Created'}</BOHTH>
          <BOHTH width={initialWidths[wIndex++]}>{'Brand'}</BOHTH>
          <BOHTH width={initialWidths[wIndex++]}>{'Customer'}</BOHTH>
          <BOHTH width={initialWidths[wIndex++]}>{'Start'}</BOHTH>
          <BOHTH width={initialWidths[wIndex++]}>{'End'}</BOHTH>
          <BOHTH width={initialWidths[wIndex++]}>{'Qty of bikes'}</BOHTH>
          <BOHTH width={initialWidths[wIndex++]}>{'Stage'}</BOHTH>
          <BOHTH width={initialWidths[wIndex++]}>{'Locked'}</BOHTH>
        </BOHTR>
      </BOHTHead>
      <BOHTBody>
        {renderTableData}
      </BOHTBody>
    </BOHTable>)}, [isloading, tableData])

  return (
    <BasicLayout
      navigation={navigation}
      screenName={'Dashboard'}
    >
      <CommonContainer style={{flexDirection:'row'}}>
        <View style={{alignItems:'flex-start', height:'100%'}}>
          <BOHToolbar style={{zIndex:100}}>
            <Text style={{marginRight:8, fontSize:TextdefaultSize}}>Start</Text>
            {Platform.OS == 'web' && 
              renderBOHTlbDatePicker(searchOptions.start_date, (date) => {
                const year = date.getFullYear();
                const formattedDate = `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                changeSearchOptions('start_date', formattedDate);
            })}
            <Text style={{marginHorizontal:8, fontSize:TextdefaultSize}}>End</Text>
            {Platform.OS == 'web' && 
              renderBOHTlbDatePicker(searchOptions.end_date, (date) => {
                const year = date.getFullYear();
                const formattedDate = `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                changeSearchOptions('end_date', formattedDate);
            })}
            <BOHTlbRadio
              label='Today'
              onPress={()=>{setPeriodRange('Today')}}
              RadioButtonProps={{
                value: '1',
                status: periodRange == 'Today'? 'checked': 'unchecked',
              }}
            />
            <BOHTlbRadio
              label='Tomorrow'
              onPress={()=>{setPeriodRange('Tomorrow')}}
              RadioButtonProps={{
                value: '1',
                status: periodRange == 'Tomorrow'? 'checked': 'unchecked',
              }}
            />
            <BOHTlbRadio
              label='Yesterday'
              onPress={()=>{setPeriodRange('Yesterday')}}
              RadioButtonProps={{
                value: '1',
                status: periodRange == 'Yesterday'? 'checked': 'unchecked',
              }}
            />
            <BOHTlbRadio
              label='Today+Tomorrow'
              onPress={()=>{setPeriodRange('Today+Tomorrow')}}
              RadioButtonProps={{
                value: '1',
                status: periodRange == 'Today+Tomorrow'? 'checked': 'unchecked',
              }}
            />
            <BOHTlbRadio
              label='7 days'
              onPress={()=>{setPeriodRange('7days')}}
              RadioButtonProps={{
                value: '1',
                status: periodRange == '7days'? 'checked': 'unchecked',
              }}
            />
          </BOHToolbar>
          <BOHToolbar>
            <BOHTlbRadio
              label='Next Fri'
              style={{margin:0}}
              onPress={()=>{setPeriodRange('Next Fri')}}
              RadioButtonProps={{
                value: '1',
                status: periodRange == 'Next Fri'? 'checked': 'unchecked',
              }}
            />
            <BOHTlbRadio
              label='Next Sat'
              onPress={()=>{setPeriodRange('Next Sat')}}
              RadioButtonProps={{
                value: '1',
                status: periodRange == 'Next Sat'? 'checked': 'unchecked',
              }}
            />
            <BOHTlbRadio
              label='Next Sun'
              onPress={()=>{setPeriodRange('Next Sun')}}
              RadioButtonProps={{
                value: '1',
                status: periodRange == 'Next Sun'? 'checked': 'unchecked',
              }}
            />
            <BOHTlbRadio
              label='Next Mon'
              onPress={()=>{setPeriodRange('Next Mon')}}
              RadioButtonProps={{
                value: '1',
                status: periodRange == 'Next Mon'? 'checked': 'unchecked',
              }}
            />
          </BOHToolbar>
          <BOHToolbar>
            <BOHTlbRadio
              label={`Checked In (${quantities.checkedIn})`}
              style={{margin:0}}
              onPress={()=>{
                changeSearchOptions('stage', null);
                changeSearchOptions('status_filter', 1)
              }}
              RadioButtonProps={{
                value: '1',
                status: searchOptions.status_filter == 1? 'checked': 'unchecked',
                color: '#ff4d4d',
              }}
            />
            <BOHTlbRadio
              label={`Checked Out (${quantities.checkedOut})`}
              onPress={()=>{
                changeSearchOptions('stage', null);
                changeSearchOptions('status_filter', 2)
              }}
              RadioButtonProps={{
                value: '1',
                status: searchOptions.status_filter == 2? 'checked': 'unchecked',
                color: '#ff4d4d',
              }}
            />
            <BOHTlbRadio
              label={`Provisional (${quantities.provisional})`}
              onPress={()=>{
                changeSearchOptions('stage', null);
                changeSearchOptions('status_filter', 3)
              }}
              RadioButtonProps={{
                value: '1',
                status: searchOptions.status_filter == 3? 'checked': 'unchecked',
                color: '#ff4d4d',
              }}
            />
            <BOHTlbRadio
              label={`Confirmed (${quantities.confirmed})`}
              onPress={()=>{
                changeSearchOptions('stage', null);
                changeSearchOptions('status_filter', 4)
              }}
              RadioButtonProps={{
                value: '1',
                status: searchOptions.status_filter == 4? 'checked': 'unchecked',
                color: '#ff4d4d',
              }}
            />
            <BOHTlbRadio
              label={`All (${quantities.checkedIn + quantities.checkedOut + quantities.provisional + quantities.confirmed})`}
              style={{opacity: searchOptions.status_filter?1:0,}}
              onPress={()=>{
                changeSearchOptions('stage', null);
                changeSearchOptions('status_filter', null)
              }}
              RadioButtonProps={{
                value: '1',
                status: searchOptions.status_filter == null? 'checked': 'unchecked',
                color: '#ff4d4d',
              }}
            />
          </BOHToolbar>
          <BOHToolbar style={{width: '100%', justifyContent:'space-between'}}>
            <BOHTlbrSearchInput
              boxStyle={{margin:0}}
              width={125}
              label='Customer'
              defaultValue={searchOptions.customer}
              onChangeText={(val)=>changeSearchOptions('customer', val)}
            />
            <BOHTlbrSearchInput
              boxStyle={{margin:0}}
              width={125}
              label='Brand'
              defaultValue={searchOptions.brand}
              onChangeText={(val)=>changeSearchOptions('brand', val)}
            />
            <BOHTlbrSearchInput
              boxStyle={{margin:0}}
              width={125}
              label='Order number'
              defaultValue={searchOptions.order_number}
              onChangeText={(val)=>changeSearchOptions('order_number', val)}
            />
            <BOHTlbrSearchPicker
              width={125}
              boxStyle={{margin:0}}
              enabled={searchOptions.status_filter?false:true}
              label="Status"
              items={[
                {label: '', value: ''}, 
                ...stage
                  .map((item, index) => {
                    if (index === 2 || index === 3 || index === 4) {
                      return {label: item, value: index};
                    } else {
                      return null;
                    }
                  })
                  .filter(item => item !== null)
              ]}
              selectedValue={searchOptions.stage || ''}
              onValueChange={val=>changeSearchOptions('stage', val)}/>
          </BOHToolbar>
          <BOHToolbar>
            <BOHTlbCheckbox
              label={'Hide beach and tennis'}
              style={{marginRight:10}}
              CheckboxProps={{
                value:searchOptions.hideBeachTennis
              }}
              onPress={()=>{
                changeSearchOptions('hideBeachTennis', !searchOptions.hideBeachTennis);
              }}
            />
            <BOHTlbCheckbox
              label={'Show only manual addresses'}
              CheckboxProps={{
                value:searchOptions.ShowOnlyManual
              }}
              onPress={()=>{
                changeSearchOptions('ShowOnlyManual', !searchOptions.ShowOnlyManual);
              }}
            />
            <Text style={{marginLeft:50, fontSize:TextdefaultSize}}>{`Total #:  `}{tableData?.length??0}</Text>
          </BOHToolbar>
          {tableElement}
        </View>
        <View style={{height:'100%'}}>
          {Platform.OS == 'web' && <img style={{height:'100%', boxSizing:'border-box', padding:10}} src={require('./HiltonHeadIsland.png')}/>}
        </View>
      </CommonContainer>
    </BasicLayout>
  );
};

export default Dashboard;
