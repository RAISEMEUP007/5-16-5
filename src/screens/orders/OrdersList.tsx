import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Text, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getReservationsCounts, checkedInBarcode, getReservationsData } from '../../api/Reservation';
import { msgStr } from '../../common/constants/Message';
import { useAlertModal } from '../../common/hooks';
import { TextMediumSize, TextdefaultSize } from '../../common/constants/Fonts';
import { BasicLayout, CommonContainer } from '../../common/components/CustomLayout';
import { BOHTBody, BOHTD, BOHTDIconBox, BOHTH, BOHTHead, BOHTR, BOHTable } from '../../common/components/bohtable';
import { BOHTlbrSearchInput, BOHTlbrSearchPicker, BOHToolbar, BOHTlbRadio, renderBOHTlbDatePicker, BOHButton, BOHTlbCheckbox } from '../../common/components/bohtoolbar';
import { formatDate, formatDate2 } from '../../common/utils/DateUtils';

const OrdersList = ({ navigation, openOrderScreen }) => {

  const { showAlert } = useAlertModal();
  const InitialWidths = [100, 100, 160, 160, 100, 100, 110, 70, 110, 80, 80, 80];

  const barcodeInputRef = useRef(null);

  const [tableData, setTableData] = useState([]);
  const [isloading, setIsLoading] = useState(true);
  const [quantities, setQuantities] = useState({
    provisional:0,
    confirmed:0,
    checkedOut:0,
    checkedIn:0,
  });
  const [updateOrderListTrigger, setUpdateOrderListTrigger] = useState(false);
  const [barcode, SetBarcode] = useState('');
  const [periodRange, setPeriodRange] = useState<any>('');

  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

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

  const stage = [
    'draft',
    'provisional',
    'confirmed',
    'checked out',
    'checked in',
  ];

  useEffect(()=>{
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
    
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
    const today = new Date();
    const timeout = setTimeout(() => {
      AsyncStorage.setItem('__search_options', JSON.stringify(searchOptions))
      AsyncStorage.setItem('__search_options_timestamp', new Date().getTime().toString())
      setUpdateOrderListTrigger(true)
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

  useEffect(() => {
    if (updateOrderListTrigger == true) getTable();
  }, [updateOrderListTrigger]);

  const getTable = () => {
    setIsLoading(true);
    const payload = {
      searchOptions: {...searchOptions}
    };
    if(payload.searchOptions.stage === null && payload.searchOptions.status_filter === null) {
      payload.searchOptions.stage = [2,3,4]
    }
    getReservationsData(payload, (jsonRes, status, error) => {
      switch (status) {
        case 200:
          setUpdateOrderListTrigger(false);
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

  const changeSearchOptions = (key, val) => {
    setSearchOptions(prevOptions => ({
      ...prevOptions,
      [key]: val
    }));
  }

  const scanBarcodeHandle = async () => {
    if(!barcode.trim() || tableData.length === 0) return;
    
    let flag = false;
    for(const order of tableData){
      const payload = {
        barcode: barcode,
        reservation_id: order.id,
      }

      if(order.stage == 3){
        const result = await checkedInBarcode(payload, (jsonRes, status)=>{
          switch (status) {
            case 200:
              break;
            default:
              if (jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
              else showAlert('error', msgStr('unknownError'));
              break;
          }
        });
        if(result.status == 200){
          openOrderScreen('Action Order', {orderId:order.id})
          flag = true;
          break;
        }
      }
    }
  }

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

  const returnBgColor = (stage) => {
    switch (stage) {
      case 2: case '2': return '#BEE5EB';
      case 3: case '3': return '#F5C6CB';
      case 4: case '4': return '#C3E6CB';
      default:  return '#fff';
    }
  }

  const renderTableData = useMemo(() => {
    const rows = [];
    if (tableData.length > 0) {
      tableData.map((item, index) => {
        let wIndex = 0;
        rows.push(
          <BOHTR key={index} style={{backgroundColor:returnBgColor(item.stage)}}>
            <BOHTD width={InitialWidths[wIndex++]}>{item.order_number}</BOHTD>
            <BOHTD width={InitialWidths[wIndex++]}>{formatDate2(new Date(item.createdAt))}</BOHTD>
            <BOHTD width={InitialWidths[wIndex++]}>{item.brand}</BOHTD>
            <BOHTD width={InitialWidths[wIndex++]}>{item.full_name}</BOHTD>
            <BOHTD width={InitialWidths[wIndex++]}>{item.start_date ? formatDate2(new Date(`${item.start_date} 00:00:00`)) : ''}</BOHTD>
            <BOHTD width={InitialWidths[wIndex++]}>{item.end_date ? formatDate2(new Date(`${item.end_date} 00:00:00`)) : ''}</BOHTD>
            <BOHTD width={InitialWidths[wIndex++]} textAlign={'right'}>{item?.quantity??''}</BOHTD>
            <BOHTD width={InitialWidths[wIndex++]} textAlign={'right'}>{(item && item.driver_tip>0)?item.driver_tip.toLocaleString('en-US', { style: 'currency', currency: 'USD' }):''}</BOHTD>
            <BOHTD width={InitialWidths[wIndex++]}>{convertStageToString(item.stage)}</BOHTD>
            <BOHTD width={InitialWidths[wIndex++]} textAlign={'center'}>{item?.color_id?'YES':'NO'}</BOHTD>
            <BOHTD width={InitialWidths[wIndex++]} textAlign={'center'}>{item?.printed?'YES':'NO'}</BOHTD>
            <BOHTDIconBox  width={InitialWidths[wIndex++]}>
              <TouchableOpacity
                onPress={() => {
                  openOrderScreen('Action Order', {orderId:item.id})
                }}
              >
                <FontAwesome5 size={TextMediumSize} name="arrow-right" color="black" />
              </TouchableOpacity>
            </BOHTDIconBox>
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
          <BOHTH width={InitialWidths[wIndex++]}>{'Order #'}</BOHTH>
          <BOHTH width={InitialWidths[wIndex++]}>{'Created'}</BOHTH>
          <BOHTH width={InitialWidths[wIndex++]}>{'Brand'}</BOHTH>
          <BOHTH width={InitialWidths[wIndex++]}>{'Customer'}</BOHTH>
          <BOHTH width={InitialWidths[wIndex++]}>{'Start'}</BOHTH>
          <BOHTH width={InitialWidths[wIndex++]}>{'End'}</BOHTH>
          <BOHTH width={InitialWidths[wIndex++]}>{'Qty of bikes'}</BOHTH>
          <BOHTH width={InitialWidths[wIndex++]}>{'Tips'}</BOHTH>
          <BOHTH width={InitialWidths[wIndex++]}>{'Stage'}</BOHTH>
          <BOHTH width={InitialWidths[wIndex++]}>{'Locked'}</BOHTH>
          <BOHTH width={InitialWidths[wIndex++]}>{'Printed'}</BOHTH>
          <BOHTH width={InitialWidths[wIndex++]}>{'Action'}</BOHTH>
        </BOHTR>
      </BOHTHead>
      <BOHTBody>
        {renderTableData}
      </BOHTBody>
    </BOHTable>)}, [isloading, tableData])

  return (
    <BasicLayout
      navigation={navigation}
      screenName={'Order List'}
    >
      <CommonContainer>
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
          {/* <BOHTlbRadio
            label='Provisional'
            onPress={()=>{
              changeSearchOptions('stage', null);
              changeSearchOptions('status_filter', 3)
            }}
            RadioButtonProps={{
              value: '1',
              status: searchOptions.status_filter == 3? 'checked': 'unchecked',
              color: '#ff4d4d',
            }}
          /> */}
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
            width={150}
            label='Customer'
            defaultValue={searchOptions.customer}
            onChangeText={(val)=>changeSearchOptions('customer', val)}
          />
          <BOHTlbrSearchInput
            boxStyle={{margin:0}}
            width={150}
            label='Brand'
            defaultValue={searchOptions.brand}
            onChangeText={(val)=>changeSearchOptions('brand', val)}
          />
          <BOHTlbrSearchInput
            boxStyle={{margin:0}}
            width={150}
            label='Order number'
            defaultValue={searchOptions.order_number}
            onChangeText={(val)=>changeSearchOptions('order_number', val)}
          />
          <BOHTlbrSearchPicker
            width={150}
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
          <BOHTlbrSearchInput 
            ref={barcodeInputRef}
            boxStyle={{margin:0, marginRight:12}}
            style={{paddingVertical:5}}
            defaultValue={barcode}
            onChangeText={SetBarcode}
            onSubmitEditing={scanBarcodeHandle}/>
          <BOHButton
            label='Scan'
            onPress={scanBarcodeHandle}/>
          <BOHTlbCheckbox
            label={'Hide beach and tennis'}
            style={{marginLeft: 30, marginRight:10}}
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
      </CommonContainer>
    </BasicLayout>
  );
};

export default OrdersList;
