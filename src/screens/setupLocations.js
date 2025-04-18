import { React, useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableHighlight, TextInput, FlatList } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LocationListItem from '../components/locationListItem'
import EditableLocationListItem from '../components/editableLocationListItem'
import LocalCleaningDB from '../data/localCleaningDb'

const SetupLocations = ({navigation, route}) => {

    const maxRooms = 30
    const thisRoute = useRoute()

    const [roomIndex, setRoomIndex] = useState(0)
    const [roomName, setRoomName] = useState('')
    const [roomsArr, setRoomsArr] = useState([])
    let updatesArr = []

    /**
     * Returns true if the mode is "setup", false otherwise
     * @returns true if the mode is "setup", false otherwise
     */
    function isSetupMode() {
        return thisRoute.params.mode == "setup"
    }

    /**
     * Returns the next available "ID" value to be assigned to the next new room
     * @returns the next available "ID" value to be assigned to the next new room
     */
    function getNextAvailableId() {
        return roomsArr[roomsArr.length - 1].id + 1
    }

   /**
    * Removes duplicates from the updates array (UpdatesArr),
    * then sorts the array so that the locations are in the same order as they were before the edit(s)
    * 
    * e.g., turning:
    *    ID: 0, Name: bathroom
    *    ID: 1, Name: garage
    *    ID: 2, Name: bedroom
    *    ID: 3, Name: kitchen
    *    ID: 2, Name: bedroom1
    *    ID: 2, Name: bedroom11
    *
    * into:
    *    ID: 0, Name: bathroom
    *    ID: 1, Name: garage
    *    ID: 2, Name: bedroom11
    *    ID: 3, Name: kitchen
    * 
    * @returns an ordered array that describes what the contents of the "location" table should be updated to match
    */
    function getSanitisedUpdatesArr() {
        //Step 1: remove the duplicates from the original updates array (updatesArr)
        let condensedUpdatesArr = []
        let idsAdded = []
        for (let i = updatesArr.length - 1; i > -1; i--) {
            if (!idsAdded.includes(updatesArr[i].id)) {
                let updateItem = {id: updatesArr[i].id, name: updatesArr[i].name}
                console.log("ID: " + updateItem.id + ", Name: " + updateItem.name)
                condensedUpdatesArr.push(updateItem)
                idsAdded.push(updateItem.id)
            }
        }

        //Step 2: sort the results of the previous step by ID
        //so that the locations are in the same order as they were before the edit(s)
        let sanitisedUpdatesArr = []
        idsAdded = []
        let prevAdded = -1
        while (idsAdded.length != condensedUpdatesArr.length) {
            for (let i = condensedUpdatesArr.length - 1; i > -1; i--) {
                if (condensedUpdatesArr[i].id == prevAdded + 1) {
                    console.log("insert: " + condensedUpdatesArr[i].name + " at index " + condensedUpdatesArr[i].id)
                    let finalUpdateItem = {id: condensedUpdatesArr[i].id, name: condensedUpdatesArr[i].name}
                    sanitisedUpdatesArr.push(finalUpdateItem)
                    prevAdded = finalUpdateItem.id
                    idsAdded.push(finalUpdateItem.id)
                }
            }
        }
        console.log("sanitisedUpdatesArr.length: " + sanitisedUpdatesArr.length)
        return sanitisedUpdatesArr
    }

    /**
     * Calls to fetch data from the database to reflect the current state of the "location"
     * table in the interface
     */
    getDataToEdit = async () => {
        console.log("Edit rooms: load rooms")
        LocalCleaningDB.selectAllLocationsWithAliases(setRoomsArr)
    }

    /**
     * Inserts all locations that are currently in <roomsArr> into the local database,
     * then navigates to onboarding stage 3
     */
    function submitLocations() {
        if(isSetupMode()) {
            for (var i = 0; i < roomsArr.length; i++) {
                LocalCleaningDB.insertLocation(roomsArr[i].name)
            }
            navigation.push('Setup Notification Time', {mode: thisRoute.params.mode, user: thisRoute.params.user})
        } else {
            console.log("sanitised update")
            let updatedLocations = getSanitisedUpdatesArr()

            /*Since we may be both updating existing locations and adding new ones,
            it's simplier to clear and repopulate the location table, instead of worrying about updating records that do not yet exist.
            getSanitisedUpdatesArr() also preserves the original order of locations,
            so inner joins on task.loc_id and location.loc_id should not be affected*/
            LocalCleaningDB.dropTableByName("location") //we need to drop instead of delete from because this resets SQL autoincrement
            LocalCleaningDB.createLocationTable()
            for (var i = 0; i < updatedLocations.length; i++) {
                LocalCleaningDB.insertLocation(updatedLocations[i].name)
            }
            navigation.pop()
        }
    }

    /**
     * Returns true if the array contains at least <maxRooms> rooms, false otherwise
     * @returns true if the array contains at least <maxRooms> rooms, false otherwise
     */
    function roomLimitReached() {
        if(roomsArr.length >= maxRooms) {
            return true
        } else {
            return false
        }
    }

    /**
     * Adds a room object to the rooms array,
     * where the id is automatically determined,
     * and the name is determined by the current value of the textinput (roomName)
     */
    function addRoom() {
        if(!roomLimitReached()) {
            if(isSetupMode()) {
                var newRoom = {id: roomIndex, name: roomName}
                setRoomsArr(roomsArr => [...roomsArr, newRoom])
                setRoomIndex(roomIndex + 1)
                setRoomName("")
            } else {
                var newRoom = {id: getNextAvailableId(), name: roomName}
                setRoomsArr(roomsArr => [...roomsArr, newRoom])
                setRoomName("")
            }
        }
    }

    /**
     * Every time the value in any of the "room" TextInputs changes, a new update is recorded
     * 
     * This function adds a new entry to the list of updates with the specified index and room name
     * This list will be unordered and contain duplicates, so it is later consolidated by getSanitisedUpdatesArr()
     * @param updateIndex the "loc_id" of the room, as per the value stored in the database
     * @param roomName the updated name of the room
     */
    function recordUpdate(updateIndex, roomName) {
        updateIndex -- //arrays start at 0, but SQL autoincrement starts at 1, so this value needs to be decreased by 1
        let update = {id: updateIndex, name: roomName}
        updatesArr.push(update)
    }
    
    /**
     * Removes the specified room ID from the rooms array
     * @param deleteIndex the ID of the room to be removed from the rooms array
     */
    function deleteRoom(deleteIndex) {
        var updatedRoomsArr = []
        for (var i = 0; i < roomsArr.length; i++) {
            if (roomsArr[i].id != deleteIndex) {
                var newRoom = {id: roomsArr[i].id, name: roomsArr[i].name}
                updatedRoomsArr.push(newRoom)
            }
        }
        setRoomsArr(updatedRoomsArr)
    }

    /**
     * Clears the rooms array
     */
    function resetRooms() {
        setRoomsArr([])
        setRoomIndex(0)
    }
    
    /**
     * This runs only on the first render...
     */
    useEffect(() => {
        console.log("SetupLocations: " + thisRoute.params.mode)
        if(!isSetupMode()) {
            getDataToEdit()
        }
    }, [])

    /**
     * Render block
     */
    return (
        <View style={Styles.wrapper}>
            {isSetupMode() ?
                <Text style={Styles.title}>Hi {thisRoute.params.user.name}!</Text>
            :
                null
            }
            <View style={Styles.questionWrapper}>
                <Text style={Styles.subtitle}>Let's list the rooms in your home...</Text>
                <TextInput
                    value={roomName}
                    onChangeText={(value) => setRoomName(value)}
                    keyboardType='default'
                    style={Styles.textInput}
                />
                <View style={Styles.buttonWrapper}>
                    {roomLimitReached() ?
                        <TouchableHighlight 
                            activeOpacity={0.6}
                            underlayColor='#F4F4F4'
                            disabled={true}
                            style={[Styles.buttonDisabled, Styles.addRoomButton]}
                        >
                            <Text style={Styles.buttonText}>Add room</Text>
                        </TouchableHighlight>
                    :
                        <TouchableHighlight 
                            activeOpacity={0.6}
                            underlayColor='#F4F4F4'
                            onPress={addRoom}
                            style={[Styles.button, Styles.addRoomButton]}
                        >
                            <Text style={Styles.buttonText}>Add room</Text>
                        </TouchableHighlight>
                    }
                    {isSetupMode() ?
                        <TouchableHighlight 
                            activeOpacity={0.6}
                            underlayColor='#F4F4F4'
                            onPress={resetRooms}
                            style={[Styles.button, Styles.resetButton]}
                        >
                            <Text style={Styles.buttonText}>Reset</Text>
                        </TouchableHighlight>
                    :
                        null
                    }
                </View>
                <KeyboardAwareScrollView>
                    {isSetupMode() ?
                        <FlatList
                            data={roomsArr}
                            renderItem={({item}) => (
                                <LocationListItem
                                    locationItem={item}
                                    onPress={()=> deleteRoom(item.id)}
                                />
                            )}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                    :
                        <FlatList
                            data={roomsArr}
                            renderItem={({item}) => (
                                <EditableLocationListItem
                                    locationItem={item}
                                    onPress={(roomName)=> recordUpdate(item.id, roomName)}
                                />
                            )}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                    }
                </KeyboardAwareScrollView>
            </View>
            {roomsArr.length > 0 ?
                <TouchableHighlight 
                    activeOpacity={0.6}
                    underlayColor='#F4F4F4'
                    onPress={submitLocations}
                    style={[Styles.button, Styles.continueButton]}
                >
                    <View>
                        {isSetupMode() ?
                            <Text style={Styles.buttonText}>Continue</Text>
                        :
                            <Text style={Styles.buttonText}>Save</Text>
                        }
                    </View>
                </TouchableHighlight>
            :
                <TouchableHighlight 
                    activeOpacity={0.6}
                    underlayColor='#F4F4F4'
                    disabled={true}
                    style={[Styles.buttonDisabled, Styles.continueButton]}
                >
                    <View>
                        {isSetupMode() ?
                            <Text style={Styles.buttonText}>Continue</Text>
                        :
                            <Text style={Styles.buttonText}>Save</Text>
                        }
                    </View>
                </TouchableHighlight>
            }
        </View>
    )
}

/**
 * CSS
 */
const Styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#3C3C3C',
        padding: 20
    },

    questionWrapper: {
        flex: 5,
        justifyContent: 'flex-start'
    },

    buttonWrapper: {
        flexDirection: 'row'
    },

    title: {
        color: '#F4F4F4',
        fontSize: 24,
        textAlign: 'center',
        flex: 1
    },

    subtitle: {
        color: '#F4F4F4',
        fontSize: 20,
        textAlign: 'center'
    },

    textInput: {
        backgroundColor: '#F4F4F4',
        fontSize: 15,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 10
    },

    button: {
        backgroundColor: 'skyblue',
        borderRadius: 10,
        padding: 10,
        marginTop: 10
    },

    addRoomButton: {
        flex: 3,
        marginRight: 5,
        marginBottom: 10
    },

    resetButton: {
        flex: 1,
        marginLeft: 5,
        backgroundColor: '#EBA487',
        marginBottom: 10
    },

    continueButton: {
        flex: 0.18
    },

    buttonDisabled: {
        backgroundColor: 'grey',
        borderRadius: 10,
        padding: 10,
        marginTop: 10
    },

    buttonText: {
        textAlign: 'center',
        fontSize: 15
    }
})

export default SetupLocations