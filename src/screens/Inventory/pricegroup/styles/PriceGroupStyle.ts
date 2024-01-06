import { StyleSheet } from 'react-native';
import { TextMediumSize, TextSmallSize } from '../../../../common/constants/Fonts';
import { TextdefaultSize } from '../../../../common/constants/Fonts';

export const priceGroupStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 32,
  },

  tableContainer: {
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 10,
  },
 
  buttonText: {
    fontSize: TextSmallSize,
    color: 'white',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 4,
    paddingVertical: TextSmallSize/2,
    paddingHorizontal: TextSmallSize,
    margin: 5,
  },
  toolbarLabel: {
    fontSize: TextdefaultSize,
    margin: 5,
    paddingVertical: 5,
  }, 
  select: {
    margin: 5,
    fontSize: TextSmallSize,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    width: 150,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  table: {
    borderWidth: 0,
    borderColor: '#ddd',
    flexDirection: 'column',
  },
  tableHeader: {
    marginTop: 30,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderLeftWidth: 1,
    borderLeftColor: '#06685ea3',
    borderRightWidth: 1,
    borderRightColor: '#06685ea3',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderLeftWidth: 1,
    borderLeftColor: '#06685ea3',
    borderRightWidth: 1,
    borderRightColor: '#06685ea3',
  },
  columnHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
    padding: 8,
    width: 100,
  },
  cell: {
    padding: 8,
    width: 100,
    textAlign: 'center',
  },
  focusedCell: {
    borderWidth: 1,
    borderColor: "#ccc",
  }, 
  cellcheckbox: {
    width: 60,
    textAlign: 'center',
    alignItems: 'center',
  },
  groupCell: {
    width: 250, 
    paddingHorizontal: 12,
    justifyContent: "center",
    textAlign:'left',
  },
  headerIcon: {
    position:'absolute', 
    left:0, 
    width:'100%', 
    alignItems:'center', 
    top:-26
  },
  deleteRow: {
    position: 'absolute',
    right: 0,
    top: -20,
  },
  editRow: {
    position: 'absolute',
    right: TextMediumSize * 1.5,
    top: -20,
  },
  backButton: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    // Add any other styles you'd like for the back button
  },
  tableName: {
    fontSize: TextMediumSize,
    fontWeight: 'bold',
  }
});