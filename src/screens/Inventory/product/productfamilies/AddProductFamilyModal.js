import React, {useState, useEffect, useRef} from 'react';
import { Text, TextInput, TouchableOpacity, Modal, View, ActivityIndicator, Platform, Image, Picker } from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

import { createProductFamily, updateProductFamily, getProductCategoriesData } from '../../../../api/Product';
import BasicModalContainer from '../../../../common/components/basicmodal/BasicModalContainer';
import ModalHeader from '../../../../common/components/basicmodal/ModalHeader';
import ModalBody from '../../../../common/components/basicmodal/ModalBody';
import ModalFooter from '../../../../common/components/basicmodal/ModalFooter';
import { msgStr } from '../../../../common/constants/Message';
import { useAlertModal } from '../../../../common/hooks/UseAlertModal';

import { productFamilyModalstyles } from './styles/ProductFamilyModalStyle';
import { API_URL } from '../../../../common/constants/AppConstants';

const AddProductFamilyModal = ({ isModalVisible, family, setUpdateProductFamilyTrigger, closeModal }) => {

  const isUpdate = family ? true : false;

  const { showAlert } = useAlertModal();
  const [ValidMessage, setValidMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const [categories, setCategories] = useState([]);
  const [familyTxt, setFamilyTxt] = useState('');
  const [summaryTxt, setSummaryTxt] = useState('');
  const [selectedCategory, selectCategory] = useState({});

  const inputRef = useRef(null);

  useEffect(() => {
    if(Platform.web){
      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          closeModal();
        }
      };
  
      window.addEventListener('keydown', handleKeyDown);
  
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [closeModal]);

  useEffect(()=>{
    getProductCategoriesData((jsonRes, status, error) => {
      switch(status){
        case 200:
          setCategories(jsonRes);
          if(jsonRes.length> 0){
            selectCategory(jsonRes[0])
          }
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
  }, [])
  
  const handleImageSelection = (event) => {
    const file = Platform.OS == 'web' ? event.target.files[0] : event.nativeEvent.target.files[0];

    const imagePreviewUrl = URL.createObjectURL(file);
    setSelectedImage(file);
    setImagePreviewUrl(imagePreviewUrl); 
  };

  const  handleImageUpload = () => {
    const options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        setImagePreviewUrl(imageUri);
      }
    });
  }

  const AddFamilyButtonHandler = () => {
    if (!familyTxt.trim()) {
      setValidMessage(msgStr('emptyField'));
      return;
    } 
    console.log('wef');
    
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('family', familyTxt);
    formData.append('category_id', selectedCategory.id);
    if(selectedImage) formData.append('img', selectedImage);
    formData.append('summary', summaryTxt);

    const handleResponse = (jsonRes, status) => {
      switch(status){
        case 201:
          showAlert('success', jsonRes.message);
          setUpdateProductFamilyTrigger(true);
          closeModal();
          break;
        case 409:
          setValidMessage(jsonRes.error);
          break;
        default:
          if(jsonRes && jsonRes.error) showAlert('error', jsonRes.error);
          else showAlert('error', msgStr('unknownError'));
          closeModal();
          break;
      }
      setIsLoading(false);
    };
    
    if (isUpdate) {
      formData.append('id', family.id);
      updateProductFamily(formData, (jsonRes, status) => {
        handleResponse(jsonRes, status);
      });
    } else {
      createProductFamily(formData, (jsonRes, status) => {
        handleResponse(jsonRes, status);
      });
    }
  };

  const checkInput = () => {
    if (!familyTxt.trim()) {
      setValidMessage(msgStr('emptyField'));
    } else {
      setValidMessage('');
    }
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isModalVisible}
      onShow={()=>{
        console.log(family);
        setValidMessage('');
        if(family && categories){
          const initalCategory = categories.find(category => {return category.id == family.category_id});
          if(initalCategory) selectCategory(initalCategory);
        }else selectCategory('');
        setFamilyTxt(family?family.family:'');
        setSummaryTxt(family?family.summary:'');
        setImagePreviewUrl(family?API_URL + family.img_url:'');
        setSelectedImage(null);
        inputRef.current = null;
      }}
    >
      <BasicModalContainer>
        <ModalHeader label={"Product Family"} closeModal={closeModal} />
        <ModalBody>
          <Picker
            style={styles.select}
            selectedValue={selectedCategory.id}
            onValueChange={(itemValue, itemIndex) =>
              {
                selectCategory(categories[itemIndex]);
              }}>
            {categories.length>0 && (
              categories.map((item, index) => {
                return <Picker.Item key={index} label={item.category} value={item.id} />
              })
            )}
          </Picker>

          <TextInput style={styles.input} placeholder="Family" value={familyTxt} onChangeText={setFamilyTxt} placeholderTextColor="#ccc" onBlur={checkInput}/>
          {(ValidMessage.trim() != '') && <Text style={styles.message}>{ValidMessage}</Text>}

          {Platform.OS == 'web' && (
            <View style={styles.imagePicker}>
              <TouchableOpacity style={styles.imageUpload} onPress={() => inputRef.current.click()}>
                {imagePreviewUrl ? (
                  <Image source={{ uri: imagePreviewUrl }} style={styles.previewImage} />
                ) : (
                  <View style={styles.imageBox}>
                    <Text style={styles.boxText}>Click to choose an image</Text>
                  </View>
                )}
              </TouchableOpacity>
              <input
                type="file" 
                ref={inputRef} 
                style={styles.fileInput} 
                onChange={handleImageSelection} 
              />
            </View>
          )}
          {Platform.OS != 'web' && (
            <>
              <TouchableOpacity onPress={handleImageUpload}>
                <Text>Upload Image</Text>
              </TouchableOpacity>
              {imagePreviewUrl && <Image source={{ uri: imagePreviewUrl }} style={{ width: 200, height: 200 }} />}
            </>
          )}
    
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Summary"
            placeholderTextColor="#ccc"
            multiline={true}
            numberOfLines={4}
            value={summaryTxt}
            onChangeText={setSummaryTxt}
          />

          <Picker
            style={styles.select}
            selectedValue={0}
            onValueChange={()=>{}}>
            <Picker.Item label="group1" value="group1" />
            <Picker.Item label="group2" value="group2" />
            <Picker.Item label="group3" value="group3" />
          </Picker>
        </ModalBody>
        <ModalFooter>
          <TouchableOpacity onPress={AddFamilyButtonHandler}>
            <Text style={styles.addButton}>{isUpdate?"Update":"Add"}</Text>
          </TouchableOpacity>
        </ModalFooter>
      </BasicModalContainer>
      {isLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </Modal>
  );
};

const styles = productFamilyModalstyles;

export default AddProductFamilyModal;
