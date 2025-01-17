import React, { useEffect } from 'react';
import { View, Modal, StyleSheet, Platform } from 'react-native';

const BasicModalContainer = ({ children }) => {
  return (
    <View style={styles.bootstrapModal}>
      <View style={styles.modalContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bootstrapModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flexDirection: 'column',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
  },
});

export default BasicModalContainer;