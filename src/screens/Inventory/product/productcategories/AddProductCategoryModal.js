import React, {useState, useEffect, useRef} from 'react';
import { Text, TextInput, TouchableOpacity, Modal, View, ActivityIndicator, Platform, Image } from 'react-native';

import { createProductCategory } from '../../../../api/Product';
import BasicModalContainer from '../../../../common/components/basicmodal/BasicModalContainer';
import ModalHeader from '../../../../common/components/basicmodal/ModalHeader';
import ModalBody from '../../../../common/components/basicmodal/ModalBody';
import ModalFooter from '../../../../common/components/basicmodal/ModalFooter';
import { msgStr } from '../../../../common/constants/Message';
import { useAlertModal } from '../../../../common/hooks/UseAlertModal';

import { productCategoryModalstyles } from './styles/ProductCategoryModalStyle';

const AddProductCategoryModal = ({ isModalVisible, setUpdateProductCategoryTrigger, closeModal }) => {

  const { showAlert } = useAlertModal();
  const [ValidMessage, setValidMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const [_productCategory, setProductCategory] = useState('');

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

  const handleImageSelection = (event) => {
    const file = Platform.OS == 'web' ? event.target.files[0] : event.nativeEvent.target.files[0];

    const imagePreviewUrl = URL.createObjectURL(file);
    setSelectedImage(file);
    setImagePreviewUrl(imagePreviewUrl); 
  };

  const handleAddButtonClick = () => {
    if (!_productCategory.trim()) {
      setValidMessage(msgStr('emptyField'));
      return;
    } 

    setIsLoading(true);

    const formData = new FormData();
    formData.append('category', _productCategory);
    formData.append('img', selectedImage);
    formData.append('description', 'dd');

    createProductCategory(formData, (jsonRes, status, error)=>{
      switch(status){
        case 201:
          showAlert('success', jsonRes.message);
          setUpdateProductCategoryTrigger(true);
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
    });
  };

  const checkInput = () => {
    if (!_productCategory.trim()) {
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
        setValidMessage(''); 
        setProductCategory(''); 
        inputRef.current = null;
        setImagePreviewUrl(null);
        setSelectedImage(null);
      }}
    >
      <BasicModalContainer>
        <ModalHeader label={"Product Category"} closeModal={closeModal} />
        <ModalBody>
          <TextInput
            style={styles.input}
            onChangeText={setProductCategory}
            value={_productCategory}
            placeholder="Product Category"
            placeholderTextColor="#ccc"
            onSubmitEditing={handleAddButtonClick}
            onBlur={checkInput}
          />
          {(ValidMessage.trim() != '') && <Text style={styles.message}>{ValidMessage}</Text>}
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
        </ModalBody>
        <ModalFooter>
          <TouchableOpacity onPress={handleAddButtonClick}>
            <Text style={styles.addButton}>Add</Text>
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

const styles = productCategoryModalstyles;

export default AddProductCategoryModal;
