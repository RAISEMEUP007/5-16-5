import React, { useEffect, useState} from 'react';
import { ScrollView, View, Text, TouchableHighlight, TextInput, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import {getProductLinesData, deleteProductLine } from '../../../../api/Product';
import { msgStr } from '../../../../common/constants/Message';
import { API_URL } from '../../../../common/constants/AppConstants';
import { TextMediumSize } from '../../../../common/constants/Fonts';
import { useAlertModal } from '../../../../common/hooks/UseAlertModal';
import { useConfirmModal } from '../../../../common/hooks/UseConfirmModal';

import { productLinesStyle } from './styles/ProductLinesStyle';
import AddProductLineModal from './AddProductLineModal';

const ProductLines = () => {
  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();

  const [tableData, setTableData] = useState([]);
  const [updateProductLineTrigger, setUpdateProductLineTrigger] = useState(true);

  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);

  const openAddProductLineModal = () => { setAddModalVisible(true); setSelectedLine(null)}
  const closeAddProductLineModal = () => { setAddModalVisible(false); setSelectedLine(null)}
  const editProductLine = (item) => { setSelectedLine(item); setAddModalVisible(true); }

  useEffect(()=>{
    if(updateProductLineTrigger == true) getTable();
  }, [updateProductLineTrigger]);

  const removeProductLine = (id) => {
    showConfirm(msgStr('deleteConfirmStr'), ()=>{
      deleteProductLine(id, (jsonRes, status, error)=>{
        switch(status){
          case 200:
            setUpdateProductLineTrigger(true);
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

  const getTable = () => {
    getProductLinesData((jsonRes, status, error) => {
      switch(status){
        case 200:
          setUpdateProductLineTrigger(false);
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
            <View style={styles.categoryCell}>
              <Text style={styles.categoryCell}>{item.line}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cell}>{item.category? item.category.category: ''}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cell}>{item.family? item.family.family: ''}</Text>
            </View>
            <View style={[styles.IconCell]}>
              <TouchableOpacity onPress={()=>{editProductLine(item)}}>
                <FontAwesome5 size={TextMediumSize} name="edit" color="black" />
              </TouchableOpacity>
            </View>
            <View style={[styles.IconCell]}>
              <TouchableOpacity onPress={()=>{removeProductLine(item.id)}}>
                <FontAwesome5 size={TextMediumSize} name="times" color="black" />
              </TouchableOpacity>
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
        <TouchableHighlight style={styles.button} onPress={openAddProductLineModal}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableHighlight>
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.columnHeader, styles.categoryCell]}>{"Line"}</Text>
          <Text style={[styles.columnHeader]}>{"Category"}</Text>
          <Text style={[styles.columnHeader]}>{"Family"}</Text>
          <Text style={[styles.columnHeader, styles.IconCell]}>{"Edit"}</Text>
          <Text style={[styles.columnHeader, styles.IconCell]}>{"DEL"}</Text>
        </View>
        <ScrollView>
            {renderTableData()}
        </ScrollView>
      </View>

      <AddProductLineModal
        isModalVisible={isAddModalVisible}
        Line={selectedLine}
        setUpdateProductLineTrigger = {setUpdateProductLineTrigger} 
        closeModal={closeAddProductLineModal}
      />
    </View>
  );
};

const styles = productLinesStyle;

export default ProductLines;