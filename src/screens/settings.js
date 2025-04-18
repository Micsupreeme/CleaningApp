import { React, useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableHighlight, Alert } from 'react-native'
import LocalCleaningDB from '../data/localCleaningDb'
import LocalAsyncStore from '../data/localAsyncStore'

const Settings = ({navigation, route}) => {

    const [userObject, setUserObject] = useState({})

    /**
     * Asynchronously fetches the user object from async storage
     */
    getUserData = async () => {
        try {
            let userObject = await LocalAsyncStore.getAsyncUser()
            setUserObject(userObject)
            //console.log("SETTINGS: user found")
        } catch (err) {
            console.log("SETTINGS: user not found")
        }
    }

    /**
     * Resets all user data and wipes the database
     */
    function resetTaskData() {
        console.log("**CLEAR TASK AND LOG DATA**")
        LocalCleaningDB.dropTableByName("log")
        LocalCleaningDB.dropTableByName("task")
        LocalCleaningDB.dropTableByName("location")
        LocalCleaningDB.createAllTablesInOrder()
    }

    /**
     * Presents a "Clear all data?" alert that asks the user if they want to reset all of their data
     * If they respond "Confirm", resetTaskData is called, else nothing happens
     */
    function resetTaskDataWithConfirmation() {
        Alert.alert(
            "Clear all task data?", "Do you want to clear all of your CleaningApp task data?\n\nThis action cannot be undone.",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Reset data cancelled"),
                    style: "cancel"
                }, { 
                    text: "Confirm",
                    onPress: () => {
                        resetTaskData()
                        resetTaskDataDone()
                    }
                }
            ],
            { cancelable: false }
        )
    }

    /**
     * Presents a "Data cleared" alert that informs the user that the data has been cleared successfully.
     */
    function resetTaskDataDone() {
        Alert.alert(
            "Data cleared", "All tasks and logs have been deleted.\n\nOther information such as your name and your rooms can be managed by tapping \"Edit name\" or \"Edit rooms\" respectively.",
            [
                {
                    text: "OK"
                }
            ],
            { cancelable: false }
        )
    }

    /**
     * Navigates to the "Edit name" onboarding page, in edit mode
     */
    function editName() {
        navigation.push('Edit Name', {mode: "edit", user: userObject, userSetter: setUserObject})
    }

    /**
     * Navigates to the "Edit locations" onboarding page, in edit mode
     */
    function editRooms() {
        navigation.push('Edit Rooms', {mode: "edit"})
    }

    /**
     * Navigates to the "Edit Notification" onboarding page, in edit mode
     */
    function editTime() {
        navigation.push('Edit Notification Time', {mode: "edit", user: userObject, userSetter: setUserObject})
    }

    /**
     * Navigates to the "About" page
     */
    function aboutCleaningApp() {
        navigation.push('About')
    }

    /**
     * Deletes the user - for developmental purposes only!
     */
    function devDeleteAsyncUser() {
        LocalAsyncStore.deleteAsyncUser()
    }
    
    /**
     * This runs only on the first render...
     */
    useEffect(() => {
        getUserData()
    }, [])

    /**
     * Render block
     */
    return (
        <View style={Styles.wrapper}>
            <TouchableHighlight 
                activeOpacity={0.6}
                underlayColor='#F4F4F4'
                onPress={() => editName()}
                style={Styles.doneButton}
            >
                <Text style={Styles.doneButtonText}>Edit name</Text>
            </TouchableHighlight>
            <TouchableHighlight 
                activeOpacity={0.6}
                underlayColor='#F4F4F4'
                onPress={() => editRooms()}
                style={Styles.doneButton}
            >
                <Text style={Styles.doneButtonText}>Edit rooms</Text>
            </TouchableHighlight>
            <TouchableHighlight 
                activeOpacity={0.6}
                underlayColor='#F4F4F4'
                onPress={() => editTime()}
                style={Styles.doneButton}
            >
                <Text style={Styles.doneButtonText}>Edit notification time</Text>
            </TouchableHighlight>
            <TouchableHighlight 
                activeOpacity={0.6}
                underlayColor='#F4F4F4'
                onPress={() => aboutCleaningApp()}
                style={Styles.doneButton}
            >
                <Text style={Styles.doneButtonText}>About CleaningApp</Text>
            </TouchableHighlight>
            <TouchableHighlight 
                activeOpacity={0.6}
                underlayColor='#F4F4F4'
                onPress={() => resetTaskDataWithConfirmation()}
                style={[Styles.doneButton, {backgroundColor: '#EBA487'}]}
            >
                <Text style={Styles.doneButtonText}>Clear all task data</Text>
            </TouchableHighlight>
            <TouchableHighlight 
                activeOpacity={0.6}
                underlayColor='#F4F4F4'
                onPress={() => devDeleteAsyncUser()}
                style={[Styles.doneButton, {backgroundColor: '#EBA487', opacity: 0.5}]}
            >
                <Text style={Styles.doneButtonText}>*DEV* DeleteUser</Text>
            </TouchableHighlight>
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

    doneButton: {
        backgroundColor: 'skyblue',
        borderRadius: 10,
        marginBottom: 10,
        padding: 10,
    },

    doneButtonText: {
        textAlign: 'center',
        fontSize: 15
    }
})

export default Settings