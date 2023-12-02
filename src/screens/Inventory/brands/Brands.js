import React, { useEffect, useState} from 'react';
import { ScrollView, View, Text, TouchableHighlight, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import {getBrandsData, saveBrandCell, deleteBrand } from '../../../api/Price';
import { msgStr } from '../../../common/constants/Message';
import { TextMediumSize } from '../../../common/constants/Fonts';
import { useAlertModal } from '../../../common/hooks/UseAlertModal';
import { useConfirmModal } from '../../../common/hooks/UseConfirmModal';

import { brandsStyle } from './styles/BrandsStyle';
import AddBrandModal from './AddBrandModal';

const Brands = () => {
  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();

  const [tableData, setTableData] = useState([]);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const openAddBrandModal = () => { setAddModalVisible(true); };
  const closeAddBrandModal = () => { setAddModalVisible(false); }
  const [updateBrandTrigger, setUpdateBrandTrigger] = useState(true);

  
  const changeCellData = (index, key, newVal) => {
    const updatedTableData = [ ...tableData ];
    updatedTableData[index] = {
      ...updatedTableData[index],
      [key]: newVal 
    };
    setTableData(updatedTableData);
  };  

  const saveCellData = (id, column, value) => {
    value = value ? value : "";

    saveBrandCell(id, column, value, (jsonRes, status, error)=>{
      switch(status){
        case 200:
          break;
        case 500:
          showAlert('error', msgStr('serverError'));
          break;
        default:
          setUpdateBrandTrigger(true);
          if(jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
          else showAlert('error', msgStr('unknownError'));
          break;
      }
    });
  }

  const removeBrand = (id) => {
    showConfirm(msgStr('deleteConfirmStr'), ()=>{
      deleteBrand(id, (jsonRes, status, error)=>{
        switch(status){
          case 200:
            setUpdateBrandTrigger(true);
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

  useEffect(()=>{
    if(updateBrandTrigger == true) getTable();
  }, [updateBrandTrigger]);

  const getTable = () => {
    getBrandsData((jsonRes, status, error) => {
      switch(status){
        case 200:
          setUpdateBrandTrigger(false);
          setTableData(jsonRes);
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

  const renderTableData = () => {
    const rows = [];
    if(tableData.length > 0){
      tableData.map((item, index) => {
        rows.push( 
          <View key={index} style={styles.tableRow}>
            <View style={styles.cell}>
              <TextInput style={styles.cellInput}
                value={item.brand}
                onChangeText={(value) => {
                  changeCellData(index, 'brand', value);
                }}
                onBlur={(e) => {
                  console.log('ddd');
                  saveCellData(item.id, 'brand', item.brand);
                }}
              />
              <View style={styles.deleteRow}>
                <TouchableOpacity onPress={()=>{removeBrand(item.id)}}>
                  <FontAwesome5 style={styles.deleteRow} size={TextMediumSize} name="times" color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      });
    }else{
      <></>
    }
    return <>{rows}</>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableHighlight style={styles.button} onPress={openAddBrandModal}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableHighlight>
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.columnHeader}>{"Brand"}</Text>
        </View>
        <ScrollView>
            {renderTableData()}
        </ScrollView>
      </View>

      <AddBrandModal
        isModalVisible={isAddModalVisible}
        setUpdateBrandTrigger = {setUpdateBrandTrigger} 
        closeModal={closeAddBrandModal}
      />
    </View>
  );
};

const styles = brandsStyle;

export default Brands;