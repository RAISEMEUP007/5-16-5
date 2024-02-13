import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { reservationMainInfoStyle } from './styles/ReservationMainInfoStyle';
import LabeledTextInput from '../../common/components/input/LabeledTextInput';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonSelectDropdown } from '../../common/components/CommonSelectDropdown/CommonSelectDropdown';
import { DropdownData } from '../../common/components/CommonDropdown/CommonDropdown';
import { LocationType } from '../../types/LocationType';
import { useRequestLocationsQuery } from '../../redux/slices/baseApiSlice';
import { getDiscountCodesData } from '../../api/Settings';
import { updateReservation } from '../../api/Reservation';
import { msgStr } from '../../common/constants/Message';
import { useAlertModal } from '../../common/hooks/UseAlertModal';

if (Platform.OS === 'web') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = 'react-datepicker/dist/react-datepicker.css';
  document.head.appendChild(link);
}

const ReservationMainInfo = ({ details }) => {
  const { showAlert } = useAlertModal();

  const [inputValues, setInputValues] = useState({
    startDate: new Date(),
    endDate: new Date(),
    billableDays: '',
    reservationDuration: '',
    discountCode: '',
    customPrice: '',
    referrer: '',
    group: '',
    startLocationId: '',
    endLocationId: ''
  });

  const[discountCodes, setDiscountCodes] = useState([]);

  useEffect(() => {
    if(details)
      setInputValues({
        startDate: new Date(details.start_date) || new Date(),
        endDate: new Date(details.end_date) || new Date(),
        billableDays: details.billableDays || '',
        reservationDuration: details.reservationDuration || '',
        discountCode: details.promo_code || '',
        customPrice: details.customPrice || '',
        referrer: details.referrer || '',
        group: details.group || '',
        startLocationId: details.start_location_id || '',
        endLocationId: details.end_location_id || ''
      });
  }, [details]);

  useEffect(()=>{
    getDiscountCodesData((jsonRes, status, error) => {
      switch (status) {
        case 200:
          setDiscountCodes(jsonRes);
          break;
      }
    });
  }, [])

  const { data: locationsData } = useRequestLocationsQuery({}, {refetchOnFocus: true,});
  
  const locationsDropdownData = useMemo(() => {
    if (!locationsData?.length) {
      return [];
    }

    const result: DropdownData<LocationType> = locationsData.map((item, index) => {
      return {
        value: item,
        displayLabel: item.location,
        index,
      };
    });
    return result;
  }, [locationsData]);

  const defaultStartLocation = useMemo(()=>{
    if(details && details.start_location_id)
      return locationsDropdownData.find(item=>item.value.id == details.start_location_id);
    else return null;
  }, [details, locationsData]);

  const defaultEndLocation = useMemo(()=>{
    if(details && details.end_location_id)
      return locationsDropdownData.find(item=>item.value.id == details.end_location_id);
    else return null;
  }, [details, locationsData]);

  const discountCodesDropdownData = useMemo(() => {
    if (!discountCodes?.length) {
      return [];
    }

    const result: Array<any> = discountCodes.map((item, index) => {
      return {
        value: item,
        displayLabel: item.code,
        index,
      };
    });
    return result;
  }, [discountCodes]);

  const defaultDiscountCode = useMemo(()=>{
    if(details && details.promo_code)
      return discountCodesDropdownData.find(item=>item.value.id == details.promo_code);
    else return null;
  }, [details, discountCodes]);
  
  const handleInputChange = (fieldName, value) => {
    const newValues = {
      ...inputValues,
      [fieldName]: value
    };

    const payload = {
      id: details.id,
      start_date : newValues.startDate,
      end_date : newValues.endDate,
      promo_code: newValues.discountCode,
      start_location_id : newValues.startLocationId,
      end_location_id : newValues.endLocationId,
    }

    updateReservation(payload, (jsonRes, status) => {
      switch (status) {
        case 201:
          setInputValues(newValues);
          break;
        default:
          if (jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
          else showAlert('error', msgStr('unknownError'));
          break;
      }
    })

  };

  const CustomInput = forwardRef(({ value, onChange, onClick }, ref) => (
    <input
      onClick={onClick}
      onChange={onChange}
      ref={ref}
      style={styles.input}
      value={value}
    ></input>
  ))

  const renderDatePicker = (selectedDate, onChangeHandler, minDate = null) => {
    return (
      <View>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => onChangeHandler(date)}
          customInput={<CustomInput />}
          minDate={minDate}
          peekNextMonth
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          timeInputLabel="Time:"
          dateFormat="MM/dd/yyyy hh:mm aa"
          showTimeSelect
        />
      </View>
    );
  };

  return (
    <View>
      <View style={[styles.reservationRow, {zIndex:10}]}>
        <View>
          <Text style={{marginBottom:6, color:"#555555"}}>{'Start date'}</Text>
          {Platform.OS == 'web' && renderDatePicker(inputValues.startDate, (date)=>{handleInputChange('startDate', date)})}
        </View>
        <View>
          <Text style={{marginBottom:6, color:"#555555"}}>{'End date'}</Text>
          {Platform.OS == 'web' && renderDatePicker(inputValues.endDate, (date)=>{handleInputChange('endDate', date)}, inputValues.startDate)}
        </View>
      </View>
      <View style={styles.reservationRow}>
        <LabeledTextInput
          label='Billable days'
          width={300}
          containerStyle={{marginRight:30}}
          placeholder='Billable days'
          placeholderTextColor="#ccc"
          inputStyle={{marginVertical:6}}
          value={inputValues.billableDays}
          onChangeText={value => handleInputChange('billableDays', value)}
          editable={false}
        />
        <LabeledTextInput
          label='Reservation duration'
          width={300}
          placeholder='Reservation duration'
          placeholderTextColor="#ccc"
          inputStyle={{marginVertical:6}}
          value={inputValues.reservationDuration}
          onChangeText={value => handleInputChange('reservationDuration', value)}
          editable={false}
        />
      </View>
      <View style={styles.reservationRow}>
        <CommonSelectDropdown
          containerStyle={{
            marginRight: 30,
          }}
          width={300}
          onItemSelected={(item) => {
            handleInputChange('discountCode', item.value.id);
          }}
          data={discountCodesDropdownData}
          placeholder="Select A Code"
          title={'Discount code'}
          titleStyle={{marginBottom:6, color:"#555555", fontSize:14}}
          defaultValue={defaultDiscountCode}
        />
        <LabeledTextInput
          label='Custom Price'
          width={300}
          placeholder='Custom Price'
          placeholderTextColor="#ccc"
          inputStyle={{marginVertical:6}}
          value={inputValues.customPrice}
          onChangeText={value => handleInputChange('customPrice', value)}
        />
      </View>
      <View style={styles.reservationRow}>
        <LabeledTextInput
          label='Referrer'
          width={300}
          containerStyle={{marginRight:30}}
          placeholder='Referrer'
          placeholderTextColor="#ccc"
          inputStyle={{marginVertical:6}}
          value={inputValues.referrer}
          onChangeText={value => handleInputChange('referrer', value)}
        />
        <LabeledTextInput
          label='Group'
          width={300}
          placeholder='Group'
          placeholderTextColor="#ccc"
          inputStyle={{marginVertical:6}}
          value={inputValues.group}
          onChangeText={value => handleInputChange('group', value)}
        />
      </View>
      <View style={styles.reservationRow}>
        <CommonSelectDropdown
          containerStyle={{
            marginRight: 30,
          }}
          width={300}
          onItemSelected={(item) => {
            handleInputChange('startLocationId', item.value.id);
          }}
          data={locationsDropdownData}
          placeholder="Select A Location"
          title={'Start Location'}
          titleStyle={{marginBottom:6, color:"#555555", fontSize:14}}
          defaultValue={defaultStartLocation}
        />
        <CommonSelectDropdown
          containerStyle={{
            // marginRight: 40,
          }}
          width={300}
          onItemSelected={(item) => {
            handleInputChange('endLocationId', item.value.id);
          }}
          data={locationsDropdownData}
          placeholder="Select A Location"
          title={'End Location'}
          titleStyle={{marginBottom:6, color:"#555555", fontSize:14}}
          defaultValue={defaultEndLocation}
        />
      </View>
    </View>
  );
};

const styles = reservationMainInfoStyle;

export default ReservationMainInfo;