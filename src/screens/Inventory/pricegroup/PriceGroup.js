import React, { useEffect, useState} from 'react';
import { ScrollView, View, Text, TouchableHighlight, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import CheckBox from 'expo-checkbox';
import { FontAwesome5 } from '@expo/vector-icons';
import {Picker} from '@react-native-picker/picker';

import {getHeaderData, getTableData, setFree, setPriceData, setExtraDay, deleteGroup, deletePricePoint, getSeasonsData, getBrandsData } from '../../../api/Price';
import { msgStr } from '../../../common/constants/Message';
import { useAlertModal } from '../../../common/hooks/UseAlertModal';
import { useConfirmModal } from '../../../common/hooks/UseConfirmModal';

import { priceGroupStyles } from './styles/PriceGroupStyle';
import CreateGroupModal from './CreateGroupModal';
import PricePointModal from './PricePointModal';
import UpdateGroupModal from './UpdateGroupModal';
import { TextMediumSize } from '../../../common/constants/Fonts';

const PriceGroup = ({tableId, tableName, openPriceTable}) => {
  const screenHeight = Dimensions.get('window').height;

  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();

  const [groupName, setGroupName] = useState('');
  const [seasonId, setSeasonId] = useState(0);
  const [brandId, setBrandId] = useState(0);
  const [isGroupModalVisible, setGroupModalVisible] = useState(false);
  const [isUpdateGroupModalVisible, setUpdateGroupModalVisible] = useState(false);
  const [isAddPriceModalVisible, setAddPriceModalVisible] = useState(false);
  const [updateGroupTrigger, setUpdateGroupTrigger] = useState(false);
  const [updatePointTrigger, setUpdatePointTrigger] = useState(true);
  
  const [headerData, setHeaderData] = useState([]);
  const [tableData, setTableData] = useState({});
  const [seasonData, setSeasonData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  
  useEffect(()=>{
    if(updatePointTrigger == true){
      getHeader();
      getTable();
      //getSeasons();
      //getBrands();
      setUpdatePointTrigger(false);
    }
  }, [updatePointTrigger])

  useEffect(() => {
    if(updateGroupTrigger == true) {
      getSeasons();
      getBrands();
      getTable();
    }
  }, [updateGroupTrigger]);

  const openGroupModal = () => { setGroupModalVisible(true); };
  const closeGroupModal = () => { setGroupModalVisible(false); }
  const openUpdateGroupModal = (group) => { setGroupName(group); setUpdateGroupModalVisible(true); };
  const closeUpdateGroupModal = () => { setUpdateGroupModalVisible(false); }
  const openPriceModal = () => { setAddPriceModalVisible(true); };
  const closePriceModal = () => { setAddPriceModalVisible(false); };
  
  const changeCellData = (group, index, newVal) => {
    const updatedTableData = { ...tableData };
    updatedTableData[group] = {
      ...updatedTableData[group],
      data: [
        ...updatedTableData[group].data.slice(0, index),
        newVal,
        ...updatedTableData[group].data.slice(index + 1),
      ],
    };
    setTableData(updatedTableData);
  };  

  const changeExtraDay = (group, extraDay) => {
      const updatedTableData = {...tableData};
      updatedTableData[group] = {
        ...updatedTableData[group],
        extra_day: extraDay
      };
      setTableData(updatedTableData);
  };
  
  const getHeader = () => {
    getHeaderData(tableId, (jsonRes, status, error)=>{
      switch(status){
        case 200:
          setHeaderData(jsonRes);
          break;
        case 500:
          showAlert('error', msgStr('serverError'));
          break;
        default:
          if(jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
          else showAlert('error', msgStr('unknownError'));
          break;
      }
    })
  }
  
  const getTable = () => {
    getTableData(tableId, (jsonRes, status, error) => {
      switch(status){
        case 200:
          setTableData(jsonRes);
          setUpdateGroupTrigger(false);
          break;
        case 500:
          showAlert('error', msgStr('serverError'));
          break;
        default:
          if(jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
          else showAlert('error', msgStr('unknownError'));
          break;
      }
    })
  }

  const getSeasons = () => {
    getSeasonsData((jsonRes, status, error) => {
      switch(status){
        case 200:
          setSeasonData(jsonRes);
          break;
        case 500:
          showAlert('error', msgStr('serverError'));
          break;
        default:
          if(jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
          else showAlert('error', msgStr('unknownError'));
          break;
      }
    })
  }

  const getBrands = () => {
    getBrandsData((jsonRes, status, error) => {
      switch(status){
        case 200:
          setBrandData(jsonRes);
          break;
        case 500:
          showAlert('error', msgStr('serverError'));
          break;
        default:
          if(jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
          else showAlert('error', msgStr('unknownError'));
          break;
      }
    })
  }

  const saveFree = (group, isFree) => {
    setFree(group, isFree, (jsonRes, status, error)=>{
      switch(status){
        case 200:
          const updatedTableData = {...tableData};
          updatedTableData[group] = {
            ...updatedTableData[group],
            is_free: isFree
          };
          setTableData(updatedTableData);
          break;
        default:
          if(jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
          else showAlert('error', msgStr('unknownError'));
          break;
      }
    });
  };

  const saveCellData = (group, index, cellData) => {
    const groupId = tableData[group].group_id;
    const pointId = headerData[index].id;
    const value = cellData ? cellData : "";

    setPriceData(groupId, tableId, pointId, value, (jsonRes, status, error)=>{
      switch(status){
        case 200:
          break;
        case 500:
          showAlert('error', msgStr('serverError'));
          break;
        default:
          setUpdateGroupTrigger(true);
          if(jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
          else showAlert('error', msgStr('unknownError'));
          break;
      }
    });
  }

  const saveExtraDay = (group, extraDay) => {
    setExtraDay(group, extraDay, (jsonRes, status, error)=>{
      switch(status){
        case 200:
          break;
        default:
          setUpdateGroupTrigger(true);
          if(jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
          else showAlert('error', msgStr('unknownError'));
          break;
      }
    })
  }

  const removePoint = (priceId) => {
    showConfirm(msgStr('deleteConfirmStr'), ()=>{
      deletePricePoint(priceId, (jsonRes, status, error)=>{
        switch(status){
          case 200:
            setUpdatePointTrigger(true);
            showAlert('success', jsonRes.message);
            break;
          default:
            if(jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
            else showAlert('error', msgStr('unknownError'));
            break;
        }
      })
    });
  }

  const removeGroup = (group) => {
    showConfirm(msgStr('deleteConfirmStr'), ()=>{
      deleteGroup(group, (jsonRes, status, error)=>{
        switch(status){
          case 200:
            setUpdateGroupTrigger(true);
            showAlert('success', jsonRes.message);
            break;
          default:
            if(jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
            else showAlert('error', msgStr('unknownError'));
            break;
        }
      })
    });
  }

  const renderTableHeader = () => {
    return (
      <>
        <View style={styles.tableHeader}>
          <Text style={[styles.columnHeader, styles.groupCell]}>PriceGroup</Text>
          <Text style={[styles.columnHeader, styles.cellcheckbox]}>Free</Text>
          {headerData.map((item, index) => (
            <View key={index} style={styles.columnHeader} >
              <View style={styles.headerIcon}>
                <TouchableOpacity onPress={()=>{removePoint(item.id)}} >
                  <FontAwesome5 size={TextMediumSize} name="times" color="black" />
                </TouchableOpacity>
              </View>
              <Text pointId={item.id}>{item.header}</Text>
            </View>
          ))}
          <Text style={styles.columnHeader}>Extra day</Text>
        </View>
      </>
    );
  };

  const renderTableData = () => {
    const rows = [];
    for (let i in tableData) {
      rows.push( 
        <View key={i} style={styles.tableRow}>
          <View style={[styles.groupCell]}>
            <Text >{i}</Text>
            <View>
              <TouchableOpacity onPress={()=>{openUpdateGroupModal(i)}}>
                <FontAwesome5 style={styles.editRow} size={TextMediumSize} name="pencil-alt" color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>{removeGroup(i)}}>
                <FontAwesome5 style={styles.deleteRow} size={TextMediumSize} name="times" color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.cell, styles.cellcheckbox]}>
            <CheckBox value={(tableData[i].is_free ? true : false)} onValueChange={(newValue) => saveFree(i, newValue)} />
          </View>
          {tableData[i].data.map((cellData, index) => (
            <TextInput
              key={index}
              style={[styles.cell]}
              value={cellData?cellData.toString():""}
              onChangeText={(value) => {
                changeCellData(i, index, value);
              }}
              onBlur={() => {
                saveCellData(i, index, cellData);
              }}
            />
          ))}
          <TextInput
            style={[styles.cell]}
            value={tableData[i].extra_day ? tableData[i].extra_day.toString() : ""}
            onChangeText={(value) => {
              changeExtraDay(i, value);
            }}
            onBlur={(e) => {
              saveExtraDay(i, tableData[i].extra_day );
            }}
          />
        </View>
      );
    }
    return <>{rows}</>;
  };

  const renderSeasonPicker = () => {
    return (
      <Picker
        selectedValue={seasonId}
        style={styles.select}
        onValueChange={(itemValue, itemIndex) =>
        {
          setSeasonId(itemValue); setUpdateGroupTrigger(true);
        }
      }>
        <Picker.Item label="Default" value={0} />
        {seasonData.map((item, index) => (
          <Picker.Item key={index} label={item.season} value={item.id} />
        ))}
      </Picker>
    );
  }

  const renderBrandPicker = () => {
    return (
      <Picker
        selectedValue={brandId}
        style={styles.select}
        onValueChange={(itemValue, itemIndex) =>
        {
          setBrandId(itemValue); setUpdateGroupTrigger(true);
        }
      }>
        <Picker.Item label="Default" value={0} />
        {brandData.map((item, index) => (
          <Picker.Item key={index} label={item.brand} value={item.id} />
        ))}
      </Picker>
    );
  }

  return (
    <ScrollView horizontal={true}>
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.backButton} onPress={()=>{openPriceTable(null)}}>
            <FontAwesome5 name="arrow-left" size={15} color="#000" />
          </TouchableOpacity>
          <Text style={styles.tableName}>{tableName}</Text>
        </View>
        <View style={styles.toolbar}>
          <TouchableHighlight style={styles.button} onPress={openGroupModal}>
            <Text style={styles.buttonText}>Create price group</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.button} onPress={openPriceModal}>
            <Text style={styles.buttonText}>Add Duration</Text>
          </TouchableHighlight>
        </View>
        <View style={styles.tableContainer}>
            <View style={styles.table}>
              {renderTableHeader()}
              <ScrollView style={{ flex: 1, maxHeight: screenHeight-280 }}>
                {renderTableData()}
              </ScrollView>
            </View>
        </View>

        <CreateGroupModal
          isModalVisible={isGroupModalVisible}
          tableId={tableId}
          groupName={""}
          setUpdateGroupTrigger = {setUpdateGroupTrigger} 
          closeModal={closeGroupModal}
        />

        <UpdateGroupModal
          isModalVisible={isUpdateGroupModalVisible}
          tableId={tableId}
          groupName={groupName}
          setUpdateGroupTrigger = {setUpdateGroupTrigger} 
          closeModal={closeUpdateGroupModal}
        />

        <PricePointModal
          isModalVisible={isAddPriceModalVisible}
          tableId={tableId}
          setUpdatePointTrigger = {setUpdatePointTrigger} 
          closeModal={closePriceModal}
        />

      </View>
    </ScrollView>
  );
};

const styles = priceGroupStyles;

export default PriceGroup;