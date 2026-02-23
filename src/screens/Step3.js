import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  View
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Step3() {
  const router = useRouter();
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
  }, [buildingOpen]);

  useEffect(() => {
    if (roomsOpen) {
      Animated.timing(roomSlideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      roomSlideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [roomsOpen]);

  /* ================= LOGIC FUNCTIONS ================= */

  const generateFloors = () => {
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
      { text: "Delete", style: "destructive", onPress: () => {
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
      updated[selectedFloor].rooms[idx].beds = Math.min(6, num);
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
    room.beds = Math.max(1, Math.min(6, room.beds + change));
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

  const handleCompleteRegistration = () => {
    if (floors.length === 0) {
        Alert.alert("Error", "Please add at least one floor.");
        return;
    }
    Alert.alert("Success", "Hostel configuration complete!", [
      { text: "OK", onPress: () => router.replace('/home') }
    ]);
  };

  const totalRoomsCount = floors.reduce((acc, f) => acc + f.rooms.length, 0);
  const currentFloorRooms = selectedFloor !== null ? floors[selectedFloor]?.rooms.length : 0;
  const currentFloorBeds = selectedFloor !== null ? floors[selectedFloor]?.rooms.reduce((sum, r) => sum + r.beds, 0) : 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.stepText}>Step 3 of 3</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.title}>Structure Setup</Text>
        <Text style={styles.subtitle}>Define the layout of your building</Text>

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
             <Ionicons name="construct-outline" size={60} color="#D1D5DB" />
             <Text style={styles.emptyText}>Enter floor count to start building</Text>
          </View>
        )}

        <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteRegistration}>
          <Text style={styles.completeBtnText}>Complete Registration</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BUILDING CONFIG MODAL */}
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

            {/* ROOMS SCREEN OVERLAY */}
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
                      <Text style={[styles.cardTitle, (selectedRoom === index || selectedRooms.includes(index)) && {color: '#2F80ED'}]}>Room {room.roomNo}</Text>
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
                      <Text style={styles.sharingTitle}>Beds in Room {floors[selectedFloor].rooms[selectedRoom].roomNo}</Text>
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
  completeBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#10B981",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  completeBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
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
  }
});