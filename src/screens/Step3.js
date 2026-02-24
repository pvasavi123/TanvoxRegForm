import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  
export default function Step3({ form }) {
 const stayType = form?.stayType || '';
  const [floorInput, setFloorInput] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [floors, setFloors] = useState([]);
  const [buildingOpen, setBuildingOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomsOpen, setRoomsOpen] = useState(false);

  /* MULTI-SELECT STATES */
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFloors, setSelectedFloors] = useState([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const [roomSelectionMode, setRoomSelectionMode] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomBatchModalOpen, setRoomBatchModalOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const roomSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  useEffect(() => {
    if (buildingOpen) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [buildingOpen, slideAnim]);

  useEffect(() => {
    if (roomsOpen) {
      Animated.timing(roomSlideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      roomSlideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [roomsOpen, roomSlideAnim]);

  /* ================= LOGIC FUNCTIONS ================= */

  const generateFloors = () => {
    Keyboard.dismiss();
    const num = parseInt(floorInput);
    if (isNaN(num) || num <= 0) return;

    setFloors(prevFloors => {
      const currentCount = prevFloors.length;
      if (num === currentCount) return prevFloors;

      if (num > currentCount) {
        const newFloors = Array.from(
          { length: num - currentCount },
          (_, i) => ({
            floorNo: currentCount + i + 1,
            rooms: [],
          })
        );
        return [...prevFloors, ...newFloors];
      }
      return prevFloors.slice(0, num);
    });
  };

  const handleLongPress = (index) => {
    setSelectionMode(true);
    setSelectedFloors([index]);
  };

  const handlePress = (index) => {
    if (selectionMode) {
      if (selectedFloors.includes(index)) {
        const next = selectedFloors.filter(i => i !== index);
        setSelectedFloors(next);
        if (next.length === 0) setSelectionMode(false);
      } else {
        setSelectedFloors([...selectedFloors, index]);
      }
    } else {
      setSelectedFloor(index);
      setSelectedRoom(null);
      setRoomsOpen(true);
    }
  };

  const deleteSelectedFloors = () => {
    Alert.alert("Delete Floors", `Delete ${selectedFloors.length} floor(s)?`, [
      { text: "Cancel", style: "cancel" }, 
      { text: "Delete", style: "destructive", onPress: ()=> {
          const remaining = floors.filter((_, idx) => !selectedFloors.includes(idx));
          setFloors(remaining.map((f, i) => ({ ...f, floorNo: i + 1 })));
          setSelectionMode(false);
          setSelectedFloors([]);
      }}
    ]);
  };

  const applyBatchRooms = () => {
    const num = parseInt(roomInput);
    if (isNaN(num) || num <= 0) return;
    const updated = [...floors];
    selectedFloors.forEach(idx => {
      updated[idx].rooms = Array.from({ length: num }, (_, i) => ({ roomNo: i + 1, beds: 1 }));
    });
    setFloors(updated);
    setRoomInput('');
    setBatchModalOpen(false);
    setSelectionMode(false);
    setSelectedFloors([]);
  };

  const addRoomManually = () => {
    if (selectedFloor === null) return;
    const updated = [...floors];
    const currentRooms = updated[selectedFloor].rooms;
    const newRoom = { roomNo: currentRooms.length + 1, beds: 1 };
    updated[selectedFloor].rooms = [...currentRooms, newRoom];
    setFloors(updated);
  };

  const handleRoomLongPress = (index) => {
    setRoomSelectionMode(true);
    setSelectedRooms([index]);
  };

  const handleRoomPress = (index) => {
    if (roomSelectionMode) {
      if (selectedRooms.includes(index)) {
        const next = selectedRooms.filter(i => i !== index);
        setSelectedRooms(next);
        if (next.length === 0) setRoomSelectionMode(false);
      } else {
        setSelectedRooms([...selectedRooms, index]);
      }
    } else {
      setSelectedRoom(selectedRoom === index ? null : index);
    }
  };

  const deleteSelectedRooms = () => {
    Alert.alert("Delete Rooms", `Delete ${selectedRooms.length} room(s)?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
          const updated = [...floors];
          const remainingRooms = updated[selectedFloor].rooms.filter((_, idx) => !selectedRooms.includes(idx));
          updated[selectedFloor].rooms = remainingRooms.map((r, i) => ({ ...r, roomNo: i + 1 }));
          setFloors(updated);
          setRoomSelectionMode(false);
          setSelectedRooms([]);
      }}
    ]);
  };

  const applyBatchSharing = () => {
    const num = parseInt(roomInput);
    if (isNaN(num) || num <= 0) return;
    const updated = [...floors];
    selectedRooms.forEach(idx => {
      updated[selectedFloor].rooms[idx].beds = Math.min(8, num);
    });
    setFloors(updated);
    setRoomInput('');
    setRoomBatchModalOpen(false);
    setRoomSelectionMode(false);
    setSelectedRooms([]);
  };

  const updateBeds = (change) => {
    const updated = [...floors];
    const room = updated[selectedFloor].rooms[selectedRoom];
    room.beds = Math.max(1, Math.min(8, room.beds + change));
    setFloors(updated);
  };

  const generateRoomsForFloor = () => {
    const num = parseInt(roomInput);
    if (isNaN(num) || num <= 0 || selectedFloor === null) return;
    const updated = [...floors];
    updated[selectedFloor].rooms = Array.from({ length: num }, (_, i) => ({ roomNo: i + 1, beds: 1 }));
    setFloors(updated);
    setRoomInput('');
  };



  const totalRoomsCount = floors.reduce((acc, f) => acc + f.rooms.length, 0);
  const currentFloorRooms = selectedFloor !== null ? floors[selectedFloor]?.rooms.length : 0;
  const currentFloorBeds = selectedFloor !== null ? floors[selectedFloor]?.rooms.reduce((sum, r) => sum + r.beds, 0) : 0;

  return stayType === 'apartment' ? (
    <ApartmentLayout />
  ) : stayType === 'commercial' ? (
    <CommercialLayout />
  ) : (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.stepText}>Step 3 of 3</Text>
          <View style={{ width: 24 }} />
        </View> */}

        {/* <Text style={styles.title}>Structure Setup</Text>
        <Text style={styles.subtitle}>Define the layout of your building</Text> */}

        {/* FLOOR INPUT */}
        <View style={styles.row}>
          <TextInput 
            placeholder="No. of Floors" 
            placeholderTextColor="#9CA3AF" 
            keyboardType="number-pad" 
            value={floorInput} 
            onChangeText={setFloorInput} 
            style={styles.input} 
          />
          <TouchableOpacity style={styles.setBtn} onPress={generateFloors}>
            <Text style={styles.btnText}>{floors.length > 0 ? "Update" : "Set"}</Text>
          </TouchableOpacity>
        </View>

        {/* CENTER CONFIGURATION BOX */}
        {floors.length > 0 ? (
          <View style={styles.centerContainer}>
            <TouchableOpacity 
              style={styles.buildingBox} 
              onPress={() => setBuildingOpen(true)}
              activeOpacity={0.9}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="business" size={50} color="#2F80ED" />
              </View>
              <Text style={styles.buildingText}>Configure Building</Text>
              <Text style={styles.buildingSubText}>
                {floors.length} Floors • {totalRoomsCount} Rooms total
              </Text>
              
              <View style={styles.manageBadge}>
                <Text style={styles.manageText}>Open Layout Editor</Text>
                <Ionicons name="chevron-forward" size={16} color="#2F80ED" />
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
             <Ionicons name="business-outline" size={60} color="#D1D5DB" />
             <Text style={styles.emptyText}>Enter floor count to start building</Text>
          </View>
        )}


        
      </ScrollView>

      <Modal visible={buildingOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <Animated.View style={[styles.modalBox, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.sectionTitle}>{selectionMode ? `${selectedFloors.length} Selected` : "Select a Floor"}</Text>
              {selectionMode && (
                <TouchableOpacity onPress={() => {setSelectionMode(false); setSelectedFloors([]);}}>
                    <Text style={{color: '#EF4444', fontWeight: 'bold'}}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView contentContainerStyle={styles.gridContainer}>
              {floors.map((floor, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.card, selectedFloors.includes(index) && styles.selectedCard]} 
                  onLongPress={() => handleLongPress(index)} 
                  onPress={() => handlePress(index)}
                >
                  {selectionMode && (
                    <View style={[styles.checkCircle, selectedFloors.includes(index) && styles.checkCircleActive]}>
                      {selectedFloors.includes(index) && <Ionicons name="checkmark" size={12} color="white" />}
                    </View>
                  )}
                  <Text style={[styles.cardTitle, selectedFloors.includes(index) && {color: '#2F80ED'}]}>Floor {floor.floorNo}</Text>
                  <Text style={styles.cardSub}>{floor.rooms.length} Rooms</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectionMode ? (
              <View style={styles.selectionFooter}>
                <TouchableOpacity style={styles.smallActionBtn} onPress={() => setSelectedFloors(floors.map((_, i) => i))}><Text style={styles.smallBtnText}>All</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.smallActionBtn, {backgroundColor: '#FEE2E2'}]} onPress={deleteSelectedFloors}><Text style={[styles.smallBtnText, {color: '#EF4444'}]}>Delete</Text></TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setBatchModalOpen(true)}><Text style={styles.btnText}>Apply Rooms</Text></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.closeBtn} onPress={() => setBuildingOpen(false)}><Text style={styles.btnText}>Done</Text></TouchableOpacity>
            )}

            {roomsOpen && selectedFloor !== null && (
              <Animated.View style={[styles.roomsScreen, { transform: [{ translateY: roomSlideAnim }] }]}>
                <View style={styles.roomsHeader}>
                  <TouchableOpacity onPress={() => { setRoomsOpen(false); setRoomSelectionMode(false); setSelectedRooms([]); }}>
                    <Ionicons name="arrow-back" size={28} color="#1F2937" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>{roomSelectionMode ? `${selectedRooms.length} Selected` : `Floor ${floors[selectedFloor].floorNo}`}</Text>
                  {roomSelectionMode && (
                    <TouchableOpacity onPress={() => {setRoomSelectionMode(false); setSelectedRooms([]);}}>
                       <Text style={{color: '#EF4444', fontWeight: 'bold'}}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                  {!roomSelectionMode && <View style={{ width: 28 }} />}
                </View>

                <View style={styles.row}>
                  <TextInput 
                    placeholder="Rooms count" 
                    placeholderTextColor="#9CA3AF" 
                    keyboardType="number-pad" 
                    value={roomInput} 
                    onChangeText={setRoomInput} 
                    style={styles.input} 
                  />
                  <TouchableOpacity style={styles.setBtn} onPress={generateRoomsForFloor}>
                    <Text style={styles.btnText}>Set</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.setBtn, {backgroundColor: '#22C55E'}]} onPress={addRoomManually}>
                    <Ionicons name="add" size={18} color="#FFF" />
                    <Text style={styles.btnText}> Add</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.counterBox}>
                  <Text style={styles.counterText}>Rooms: {currentFloorRooms} | Total Beds: {currentFloorBeds}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.gridContainer}>
                  {floors[selectedFloor].rooms.map((room, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={[styles.card, (selectedRoom === index || selectedRooms.includes(index)) && styles.selectedCard]} 
                        onLongPress={() => handleRoomLongPress(index)} 
                        onPress={() => handleRoomPress(index)}
                    >
                      {roomSelectionMode && (
                        <View style={[styles.checkCircle, selectedRooms.includes(index) && styles.checkCircleActive]}>
                          {selectedRooms.includes(index) && <Ionicons name="checkmark" size={12} color="white" />}
                        </View>
                      )}
                      <Text style={[styles.cardTitle, (selectedRoom === index || selectedRooms.includes(index)) && {color: '#2F80ED'}]}>
                         {floors[selectedFloor].floorNo * 100 + room.roomNo}
                      </Text>
                      <Text style={styles.cardSub}>{room.beds} Sharing</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {roomSelectionMode ? (
                  <View style={styles.selectionFooter}>
                    <TouchableOpacity style={styles.smallActionBtn} onPress={() => setSelectedRooms(floors[selectedFloor].rooms.map((_, i) => i))}><Text style={styles.smallBtnText}>All</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.smallActionBtn, {backgroundColor: '#FEE2E2'}]} onPress={deleteSelectedRooms}><Text style={[styles.smallBtnText, {color: '#EF4444'}]}>Delete</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => setRoomBatchModalOpen(true)}><Text style={styles.btnText}>Apply Sharing</Text></TouchableOpacity>
                  </View>
                ) : (
                  selectedRoom !== null ? (
                    <View style={styles.sharingBox}>
                      <Text style={styles.sharingTitle}>
                        Beds in Room {floors[selectedFloor].floorNo * 100 + floors[selectedFloor].rooms[selectedRoom].roomNo}
                      </Text>
                      <View style={styles.sharingRow}>
                        <TouchableOpacity onPress={() => updateBeds(-1)}><Ionicons name="remove-circle" size={48} color="#EF4444" /></TouchableOpacity>
                        <Text style={styles.bedCount}>{floors[selectedFloor].rooms[selectedRoom].beds}</Text>
                        <TouchableOpacity onPress={() => updateBeds(1)}><Ionicons name="add-circle" size={48} color="#22C55E" /></TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setRoomsOpen(false)}><Text style={styles.btnText}>Done</Text></TouchableOpacity>
                  )
                )}

                {roomBatchModalOpen && (
                  <View style={styles.batchPopup}>
                    <Text style={styles.popupTitle}>Apply Sharing to {selectedRooms.length} Rooms</Text>
                    <TextInput placeholder="No." placeholderTextColor="#9CA3AF" keyboardType="number-pad" value={roomInput} onChangeText={setRoomInput} autoFocus style={styles.batchInput} />
                    <View style={styles.row}>
                      <TouchableOpacity style={styles.secondaryBtn} onPress={() => setRoomBatchModalOpen(false)}><Text style={styles.secondaryBtnText}>Cancel</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.primaryBtn, {marginLeft: 10}]} onPress={applyBatchSharing}><Text style={styles.btnText}>Apply</Text></TouchableOpacity>
                    </View>
                  </View>
                )}
              </Animated.View>
            )}

            {batchModalOpen && (
              <View style={styles.batchPopup}>
                <Text style={styles.popupTitle}>Set Rooms for {selectedFloors.length} Floors</Text>
                <TextInput placeholder="Rooms per floor" placeholderTextColor="#9CA3AF" keyboardType="number-pad" value={roomInput} onChangeText={setRoomInput} autoFocus style={styles.batchInput} />
                <View style={styles.row}>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => setBatchModalOpen(false)}><Text style={styles.secondaryBtnText}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.primaryBtn, {marginLeft: 10}]} onPress={applyBatchRooms}><Text style={styles.btnText}>Apply</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F4F7FB', 
    paddingHorizontal: 24, 
    paddingTop: 40 
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 30,
    marginTop: 4,
  },
  row: { 
    flexDirection: 'row', 
    marginBottom: 20 
  },
  input: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#D6E4F0', 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 16, 
    color: '#1F2937' 
  },
  setBtn: { 
    backgroundColor: '#2F80ED', 
    paddingHorizontal: 18, 
    justifyContent: 'center', 
    borderRadius: 12, 
    marginLeft: 10, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  btnText: { color: '#FFF', fontWeight: '600' },
  centerContainer: {
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buildingBox: { 
    backgroundColor: '#FFFFFF', 
    width: '100%',
    paddingVertical: 40,  
    borderRadius: 24,      
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D6E4F0',
    shadowColor: "#2F80ED",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buildingText: { 
    color: '#1F2937', 
    fontWeight: '800', 
    fontSize: 22 
  },
  buildingSubText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  manageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 25,
  },
  manageText: {
    color: '#2F80ED',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginBottom: 20,
  },
  emptyText: {
    color: '#9CA3AF',
    marginTop: 15,
    fontSize: 14,
    fontWeight: '500',
  },

  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalBox: { 
    backgroundColor: '#F4F7FB', 
    padding: 24, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    height: '92%' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20, 
    alignItems: 'center' 
  },
  sectionTitle: { color: '#1F2937', fontSize: 20, fontWeight: 'bold' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 20 },
  card: { 
    backgroundColor: '#FFFFFF', 
    width: '30%', 
    margin: '1.5%', 
    borderRadius: 16, 
    paddingVertical: 22, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6E4F0'
  },
  selectedCard: { borderColor: '#2F80ED', borderWidth: 2, backgroundColor: '#F0F7FF' },
  cardTitle: { color: '#1F2937', fontWeight: '600', fontSize: 14 },
  cardSub: { color: '#6B7280', fontSize: 11, marginTop: 4 },
  roomsScreen: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: '#F4F7FB', 
    padding: 24, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30 
  },
  roomsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  headerTitle: { color: '#1F2937', fontSize: 18, fontWeight: 'bold' },
  counterBox: { 
    backgroundColor: '#FFFFFF', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 15, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6E4F0' 
  },
  counterText: { color: '#2F80ED', fontWeight: '700' },
  closeBtn: { backgroundColor: '#2F80ED', padding: 16, borderRadius: 14, marginTop: 10, alignItems: 'center' },
  sharingBox: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#D6E4F0' },
  sharingTitle: { color: '#6B7280', marginBottom: 10, textAlign: 'center', fontWeight: '500' },
  sharingRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  bedCount: { color: '#1F2937', fontSize: 36, fontWeight: 'bold', marginHorizontal: 30 },
  checkCircle: { 
    position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: 10, 
    borderWidth: 1, borderColor: '#D6E4F0', justifyContent: 'center', alignItems: 'center' 
  },
  checkCircleActive: { backgroundColor: '#2F80ED', borderColor: '#2F80ED' },
  selectionFooter: { flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'center' },
  smallActionBtn: { 
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, width: 75, alignItems: 'center',
    borderWidth: 1, borderColor: '#D6E4F0' 
  },
  smallBtnText: { color: '#1F2937', fontWeight: '700', fontSize: 12 },
  primaryBtn: { backgroundColor: '#2F80ED', padding: 16, borderRadius: 14, alignItems: 'center', flex: 1 },
  secondaryBtn: { 
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, alignItems: 'center', flex: 1,
    borderWidth: 1, borderColor: '#D6E4F0' 
  },
  secondaryBtnText: { color: '#6B7280', fontWeight: '600' },
  batchPopup: { 
    backgroundColor: '#FFFFFF', padding: 25, borderRadius: 25, position: 'absolute', 
    bottom: 20, left: 10, right: 10, elevation: 20, borderWidth: 1, borderColor: '#D6E4F0'
  },
  popupTitle: { color: '#1F2937', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  batchInput: { 
    backgroundColor: '#F4F7FB', padding: 15, borderRadius: 12, color: '#1F2937', 
    marginBottom: 15, textAlign: 'center', fontSize: 24, fontWeight: 'bold', borderWidth: 1, borderColor: '#D6E4F0' 
  },
  inputCompact: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    height: 40,
    borderRadius: 8,
    width: '60%',
    alignSelf: 'center',
    marginBottom: 8
  }
});
function ApartmentLayout() {
  const [floorInput, setFloorInput] = useState('');
  const [flatInput, setFlatInput] = useState('');
  const [bhkInput, setBhkInput] = useState('');
  const [floors, setFloors] = useState([]);
  const [buildingOpen, setBuildingOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [flatsOpen, setFlatsOpen] = useState(false);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFloors, setSelectedFloors] = useState([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const [flatSelectionMode, setFlatSelectionMode] = useState(false);
  const [selectedFlats, setSelectedFlats] = useState([]);
  const [bhkBatchModalOpen, setBhkBatchModalOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const flatSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (buildingOpen) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [buildingOpen, slideAnim]);

  useEffect(() => {
    if (flatsOpen) {
      Animated.timing(flatSlideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      flatSlideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [flatsOpen, flatSlideAnim]);

  const generateFloors = () => {
    const num = parseInt(floorInput);
    if (isNaN(num) || num <= 0) return;
    setFloors(prevFloors => {
      const currentCount = prevFloors.length;
      if (num === currentCount) return prevFloors;
      if (num > currentCount) {
        const newFloors = Array.from({ length: num - currentCount }, (_, i) => ({
          floorNo: currentCount + i + 1,
          flats: [],
        }));
        return [...prevFloors, ...newFloors];
      }
      return prevFloors.slice(0, num);
    });
  };

  const handleLongPress = (index) => {
    setSelectionMode(true);
    setSelectedFloors([index]);
  };
  const handlePress = (index) => {
    if (selectionMode) {
      if (selectedFloors.includes(index)) {
        const next = selectedFloors.filter(i => i !== index);
        setSelectedFloors(next);
        if (next.length === 0) setSelectionMode(false);
      } else {
        setSelectedFloors([...selectedFloors, index]);
      }
    } else {
      setSelectedFloor(index);
      setSelectedFlat(null);
      setFlatsOpen(true);
    }
  };

  const deleteSelectedFloors = () => {
    Alert.alert("Delete Floors", `Delete ${selectedFloors.length} floor(s)?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
          const remaining = floors.filter((_, idx) => !selectedFloors.includes(idx));
          setFloors(remaining.map((f, i) => ({ ...f, floorNo: i + 1 })));
          setSelectionMode(false);
          setSelectedFloors([]);
        } 
      }
    ]);
  };

  const applyBatchFlats = () => {
    const num = parseInt(flatInput);
    if (isNaN(num) || num <= 0) return;
    const updated = [...floors];
    selectedFloors.forEach(idx => {
      updated[idx].flats = Array.from({ length: num }, (_, i) => ({ flatNo: i + 1, bhk: 1 }));
    });
    setFloors(updated);
    setFlatInput('');
    setBatchModalOpen(false);
    setSelectionMode(false);
    setSelectedFloors([]);
  };

  const addFlatManually = () => {
    if (selectedFloor === null) return;
    const updated = [...floors];
    const currentFlats = updated[selectedFloor].flats;
    const newFlat = { flatNo: currentFlats.length + 1, bhk: 1 };
    updated[selectedFloor].flats = [...currentFlats, newFlat];
    setFloors(updated);
  };

  const handleFlatLongPress = (index) => {
    setFlatSelectionMode(true);
    setSelectedFlats([index]);
  };
  const handleFlatPress = (index) => {
    if (flatSelectionMode) {
      if (selectedFlats.includes(index)) {
        const next = selectedFlats.filter(i => i !== index);
        setSelectedFlats(next);
        if (next.length === 0) setFlatSelectionMode(false);
      } else {
        setSelectedFlats([...selectedFlats, index]);
      }
    } else {
      setSelectedFlat(selectedFlat === index ? null : index);
    }
  };

  const deleteSelectedFlats = () => {
    Alert.alert("Delete Flats", `Delete ${selectedFlats.length} flat(s)?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
          const updated = [...floors];
          const remainingFlats = updated[selectedFloor].flats.filter((_, idx) => !selectedFlats.includes(idx));
          updated[selectedFloor].flats = remainingFlats.map((r, i) => ({ ...r, flatNo: i + 1 }));
          setFloors(updated);
          setFlatSelectionMode(false);
          setSelectedFlats([]);
        } 
      }
    ]);
  };

  const applyBatchBhk = () => {
    const num = parseInt(bhkInput);
    if (isNaN(num) || num <= 0) return;
    const updated = [...floors];
    selectedFlats.forEach(idx => {
      updated[selectedFloor].flats[idx].bhk = Math.min(7, Math.max(1, num));
    });
    setFloors(updated);
    setBhkInput('');
    setBhkBatchModalOpen(false);
    setFlatSelectionMode(false);
    setSelectedFlats([]);
  };

  const updateBhk = (change) => {
    const updated = [...floors];
    const flat = updated[selectedFloor].flats[selectedFlat];
    flat.bhk = Math.max(1, Math.min(7, flat.bhk + change));
    setFloors(updated);
  };

  const generateFlatsForFloor = () => {
    const num = parseInt(flatInput);
    if (isNaN(num) || num <= 0 || selectedFloor === null) return;
    const updated = [...floors];
    updated[selectedFloor].flats = Array.from({ length: num }, (_, i) => ({ flatNo: i + 1, bhk: 1 }));
    setFloors(updated);
    setFlatInput('');
  };

  const totalFlatsCount = floors.reduce((acc, f) => acc + f.flats.length, 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <TextInput 
            placeholder="No. of Floors" 
            placeholderTextColor="#9CA3AF" 
            keyboardType="number-pad" 
            value={floorInput} 
            onChangeText={setFloorInput} 
            style={styles.input} 
          />
          <TouchableOpacity style={styles.setBtn} onPress={generateFloors}>
            <Text style={styles.btnText}>{floors.length > 0 ? "Update" : "Set"}</Text>
          </TouchableOpacity>
        </View>

        {floors.length > 0 ? (
          <View style={styles.centerContainer}>
            <TouchableOpacity 
              style={styles.buildingBox} 
              onPress={() => setBuildingOpen(true)}
              activeOpacity={0.9}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="business" size={50} color="#2F80ED" />
              </View>
              <Text style={styles.buildingText}>Configure Building</Text>
              <Text style={styles.buildingSubText}>
                {floors.length} Floors • {totalFlatsCount} Flats total
              </Text>
              
              <View style={styles.manageBadge}>
                <Text style={styles.manageText}>Open Layout Editor</Text>
                <Ionicons name="chevron-forward" size={16} color="#2F80ED" />
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
             <Ionicons name="business-outline" size={60} color="#D1D5DB" />
             <Text style={styles.emptyText}>Enter floor count to start building</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={buildingOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <Animated.View style={[styles.modalBox, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.sectionTitle}>{selectionMode ? `${selectedFloors.length} Selected` : "Select a Floor"}</Text>
              {selectionMode && (
                <TouchableOpacity onPress={() => {setSelectionMode(false); setSelectedFloors([]);}}>
                    <Text style={{color: '#EF4444', fontWeight: 'bold'}}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView contentContainerStyle={styles.gridContainer}>
              {floors.map((floor, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.card, selectedFloors.includes(index) && styles.selectedCard]} 
                  onLongPress={() => handleLongPress(index)} 
                  onPress={() => handlePress(index)}
                >
                  {selectionMode && (
                    <View style={[styles.checkCircle, selectedFloors.includes(index) && styles.checkCircleActive]}>
                      {selectedFloors.includes(index) && <Ionicons name="checkmark" size={12} color="white" />}
                    </View>
                  )}
                  <Text style={[styles.cardTitle, selectedFloors.includes(index) && {color: '#2F80ED'}]}>Floor {floor.floorNo}</Text>
                  <Text style={styles.cardSub}>{floor.flats.length} Flats</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectionMode ? (
              <View style={styles.selectionFooter}>
                <TouchableOpacity style={styles.smallActionBtn} onPress={() => setSelectedFloors(floors.map((_, i) => i))}><Text style={styles.smallBtnText}>All</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.smallActionBtn, {backgroundColor: '#FEE2E2'}]} onPress={deleteSelectedFloors}><Text style={[styles.smallBtnText, {color: '#EF4444'}]}>Delete</Text></TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setBatchModalOpen(true)}><Text style={styles.btnText}>Apply Flats</Text></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.closeBtn} onPress={() => setBuildingOpen(false)}><Text style={styles.btnText}>Done</Text></TouchableOpacity>
            )}

            {flatsOpen && selectedFloor !== null && (
              <Animated.View style={[styles.roomsScreen, { transform: [{ translateY: flatSlideAnim }] }]}>
                <View style={styles.roomsHeader}>
                  <TouchableOpacity onPress={() => { setFlatsOpen(false); setFlatSelectionMode(false); setSelectedFlats([]); }}>
                    <Ionicons name="arrow-back" size={28} color="#1F2937" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>{flatSelectionMode ? `${selectedFlats.length} Selected` : `Floor ${floors[selectedFloor].floorNo}`}</Text>
                  {flatSelectionMode && (
                    <TouchableOpacity onPress={() => {setFlatSelectionMode(false); setSelectedFlats([]);}}>
                       <Text style={{color: '#EF4444', fontWeight: 'bold'}}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                  {!flatSelectionMode && <View style={{ width: 28 }} />}
                </View>

                <View style={styles.row}>
                  <TextInput 
                    placeholder="Flats count" 
                    placeholderTextColor="#9CA3AF" 
                    keyboardType="number-pad" 
                    value={flatInput} 
                    onChangeText={setFlatInput} 
                    style={styles.input} 
                  />
                  <TouchableOpacity style={styles.setBtn} onPress={generateFlatsForFloor}>
                    <Text style={styles.btnText}>Set</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.setBtn, {backgroundColor: '#22C55E'}]} onPress={addFlatManually}>
                    <Ionicons name="add" size={18} color="#FFF" />
                    <Text style={styles.btnText}> Add</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.gridContainer}>
                  {floors[selectedFloor].flats.map((flat, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={[styles.card, (selectedFlat === index || selectedFlats.includes(index)) && styles.selectedCard]} 
                        onLongPress={() => handleFlatLongPress(index)} 
                        onPress={() => handleFlatPress(index)}
                    >
                      {flatSelectionMode && (
                        <View style={[styles.checkCircle, selectedFlats.includes(index) && styles.checkCircleActive]}>
                          {selectedFlats.includes(index) && <Ionicons name="checkmark" size={12} color="white" />}
                        </View>
                      )}
                      <Text style={[styles.cardTitle, (selectedFlat === index || selectedFlats.includes(index)) && {color: '#2F80ED'}]}>
                         {floors[selectedFloor].floorNo * 100 + flat.flatNo}
                      </Text>
                      <Text style={styles.cardSub}>{flat.bhk} BHK</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {flatSelectionMode ? (
                  <View style={styles.selectionFooter}>
                    <TouchableOpacity style={styles.smallActionBtn} onPress={() => setSelectedFlats(floors[selectedFloor].flats.map((_, i) => i))}><Text style={styles.smallBtnText}>All</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.smallActionBtn, {backgroundColor: '#FEE2E2'}]} onPress={deleteSelectedFlats}><Text style={[styles.smallBtnText, {color: '#EF4444'}]}>Delete</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => setBhkBatchModalOpen(true)}><Text style={styles.btnText}>Apply BHK</Text></TouchableOpacity>
                  </View>
                ) : (
                  selectedFlat !== null ? (
                    <View style={styles.sharingBox}>
                      <Text style={styles.sharingTitle}>
                        BHK for Flat {floors[selectedFloor].floorNo * 100 + floors[selectedFloor].flats[selectedFlat].flatNo}
                      </Text>
                      <View style={styles.sharingRow}>
                        <TouchableOpacity onPress={() => updateBhk(-1)}><Ionicons name="remove-circle" size={48} color="#EF4444" /></TouchableOpacity>
                        <Text style={styles.bedCount}>{floors[selectedFloor].flats[selectedFlat].bhk}</Text>
                        <TouchableOpacity onPress={() => updateBhk(1)}><Ionicons name="add-circle" size={48} color="#22C55E" /></TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setFlatsOpen(false)}><Text style={styles.btnText}>Done</Text></TouchableOpacity>
                  )
                )}

                {bhkBatchModalOpen && (
                  <View style={styles.batchPopup}>
                    <Text style={styles.popupTitle}>Apply BHK to {selectedFlats.length} Flats</Text>
                    <TextInput placeholder="No." placeholderTextColor="#9CA3AF" keyboardType="number-pad" value={bhkInput} onChangeText={setBhkInput} autoFocus style={styles.batchInput} />
                    <View style={styles.row}>
                      <TouchableOpacity style={styles.secondaryBtn} onPress={() => setBhkBatchModalOpen(false)}><Text style={styles.secondaryBtnText}>Cancel</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.primaryBtn, {marginLeft: 10}]} onPress={applyBatchBhk}><Text style={styles.btnText}>Apply</Text></TouchableOpacity>
                    </View>
                  </View>
                )}
              </Animated.View>
            )}

            {batchModalOpen && (
              <View style={styles.batchPopup}>
                <Text style={styles.popupTitle}>Set Flats for {selectedFloors.length} Floors</Text>
                <TextInput placeholder="Flats per floor" placeholderTextColor="#9CA3AF" keyboardType="number-pad" value={flatInput} onChangeText={setFlatInput} autoFocus style={styles.batchInput} />
                <View style={styles.row}>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => setBatchModalOpen(false)}><Text style={styles.secondaryBtnText}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.primaryBtn, {marginLeft: 10}]} onPress={applyBatchFlats}><Text style={styles.btnText}>Apply</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function CommercialLayout() {
  const [floorInput, setFloorInput] = useState('');
  const [floors, setFloors] = useState([]);
  const [buildingOpen, setBuildingOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const areaSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [areaOpen, setAreaOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFloors, setSelectedFloors] = useState([]);
  const [areaBatchModalOpen, setAreaBatchModalOpen] = useState(false);
  const [areaInput, setAreaInput] = useState('');

  useEffect(() => {
    if (buildingOpen) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [buildingOpen, slideAnim]);

  useEffect(() => {
    if (areaOpen) {
      Animated.timing(areaSlideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      areaSlideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [areaOpen, areaSlideAnim]);

  const generateFloors = () => {
    const num = parseInt(floorInput);
    if (isNaN(num) || num <= 0) return;
    setFloors(prevFloors => {
      const currentCount = prevFloors.length;
      if (num === currentCount) return prevFloors;
      if (num > currentCount) {
        const newFloors = Array.from({ length: num - currentCount }, (_, i) => ({
          floorNo: currentCount + i + 1,
          area: null,
        }));
        return [...prevFloors, ...newFloors];
      }
      return prevFloors.slice(0, num);
    });
  };

  const configuredCount = floors.filter(f => typeof f.area === 'number').length;

  const handleLongPress = (index) => {
    setSelectionMode(true);
    setSelectedFloors([index]);
  };

  const handlePress = (index) => {
    if (selectionMode) {
      if (selectedFloors.includes(index)) {
        const next = selectedFloors.filter(i => i !== index);
        setSelectedFloors(next);
        if (next.length === 0) setSelectionMode(false);
      } else {
        setSelectedFloors([...selectedFloors, index]);
      }
    } else {
      setSelectedFloor(index);
      setAreaOpen(true);
    }
  };

  const deleteSelectedFloors = () => {
    Alert.alert("Delete Floors", `Delete ${selectedFloors.length} floor(s)?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
          const remaining = floors.filter((_, idx) => !selectedFloors.includes(idx));
          setFloors(remaining.map((f, i) => ({ ...f, floorNo: i + 1 })));
          setSelectionMode(false);
          setSelectedFloors([]);
        } 
      }
    ]);
  };

  const applyBatchArea = () => {
    const num = parseInt(areaInput);
    if (isNaN(num) || num <= 0) return;
    const updated = [...floors];
    selectedFloors.forEach(idx => {
      updated[idx].area = num;
    });
    setFloors(updated);
    setAreaInput('');
    setAreaBatchModalOpen(false);
    setSelectionMode(false);
    setSelectedFloors([]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <TextInput 
            placeholder="No. of Floors" 
            placeholderTextColor="#9CA3AF" 
            keyboardType="number-pad" 
            value={floorInput} 
            onChangeText={setFloorInput} 
            style={styles.input} 
          />
          <TouchableOpacity style={styles.setBtn} onPress={generateFloors}>
            <Text style={styles.btnText}>{floors.length > 0 ? "Update" : "Set"}</Text>
          </TouchableOpacity>
        </View>

        {floors.length > 0 ? (
          <View style={styles.centerContainer}>
            <TouchableOpacity 
              style={styles.buildingBox} 
              onPress={() => setBuildingOpen(true)}
              activeOpacity={0.9}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="business" size={50} color="#2F80ED" />
              </View>
              <Text style={styles.buildingText}>Configure Building</Text>
              <Text style={styles.buildingSubText}>
                {floors.length} Floors • {configuredCount} Configured
              </Text>
              
              <View style={styles.manageBadge}>
                <Text style={styles.manageText}>Open Layout Editor</Text>
                <Ionicons name="chevron-forward" size={16} color="#2F80ED" />
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
             <Ionicons name="business-outline" size={60} color="#D1D5DB" />
             <Text style={styles.emptyText}>Enter floor count to start building</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={buildingOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <Animated.View style={[styles.modalBox, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.sectionTitle}>{selectionMode ? `${selectedFloors.length} Selected` : "Select a Floor"}</Text>
              {selectionMode && (
                <TouchableOpacity onPress={() => {setSelectionMode(false); setSelectedFloors([]);}}>
                    <Text style={{color: '#EF4444', fontWeight: 'bold'}}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView contentContainerStyle={styles.gridContainer}>
              {floors.map((floor, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.card, selectedFloors.includes(index) && styles.selectedCard]} 
                  onLongPress={() => handleLongPress(index)} 
                  onPress={() => handlePress(index)}
                >
                  {selectionMode && (
                    <View style={[styles.checkCircle, selectedFloors.includes(index) && styles.checkCircleActive]}>
                      {selectedFloors.includes(index) && <Ionicons name="checkmark" size={12} color="white" />}
                    </View>
                  )}
                  <Text style={[styles.cardTitle, selectedFloors.includes(index) && {color: '#2F80ED'}]}>Floor {floor.floorNo}</Text>
                  <Text style={styles.cardSub}>{typeof floor.area === 'number' ? `${floor.area} sq.ft` : "No area"}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectionMode ? (
              <View style={styles.selectionFooter}>
                <TouchableOpacity style={styles.smallActionBtn} onPress={() => setSelectedFloors(floors.map((_, i) => i))}><Text style={styles.smallBtnText}>All</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.smallActionBtn, {backgroundColor: '#FEE2E2'}]} onPress={deleteSelectedFloors}><Text style={[styles.smallBtnText, {color: '#EF4444'}]}>Delete</Text></TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setAreaBatchModalOpen(true)}><Text style={styles.btnText}>Apply Area</Text></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.closeBtn} onPress={() => setBuildingOpen(false)}><Text style={styles.btnText}>Done</Text></TouchableOpacity>
            )}

            {areaOpen && selectedFloor !== null && (
              <Animated.View style={[styles.roomsScreen, { transform: [{ translateY: areaSlideAnim }] }]}>
                <View style={styles.roomsHeader}>
                  <TouchableOpacity onPress={() => { setAreaOpen(false); }}>
                    <Ionicons name="arrow-back" size={28} color="#1F2937" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>{`Floor ${floors[selectedFloor].floorNo}`}</Text>
                  <View style={{ width: 28 }} />
                </View>

                <View style={styles.row}>
                  <TextInput 
                    placeholder="Area (sq.ft)" 
                    placeholderTextColor="#9CA3AF" 
                    keyboardType="number-pad" 
                    value={areaInput} 
                    onChangeText={setAreaInput} 
                    style={[styles.input, styles.inputCompact]} 
                  />
                  <TouchableOpacity style={styles.setBtn} onPress={() => {
                    const num = parseInt(areaInput);
                    if (isNaN(num) || num <= 0) return;
                    const updated = [...floors];
                    updated[selectedFloor].area = num;
                    setFloors(updated);
                    setAreaOpen(false);
                    setAreaInput('');
                  }}>
                    <Text style={styles.btnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {areaBatchModalOpen && (
              <View style={styles.batchPopup}>
                <Text style={styles.popupTitle}>Apply Area to {selectedFloors.length} Floors</Text>
                <TextInput placeholder="sq.ft" placeholderTextColor="#9CA3AF" keyboardType="number-pad" value={areaInput} onChangeText={setAreaInput} autoFocus style={styles.batchInput} />
                <View style={styles.row}>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => setAreaBatchModalOpen(false)}><Text style={styles.secondaryBtnText}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.primaryBtn, {marginLeft: 10}]} onPress={applyBatchArea}><Text style={styles.btnText}>Apply</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
