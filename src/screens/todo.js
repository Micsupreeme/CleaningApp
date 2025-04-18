import { React, useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, Linking } from 'react-native'
import LocalCleaningDB from '../data/localCleaningDb'
import LocalAsyncStore from '../data/localAsyncStore'
import LocalCleaningInfoAPI from '../data/localCleaningInfoAPI'
import TaskListItem from '../components/taskListItem'
import { TouchableHighlight } from 'react-native-gesture-handler'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'

const Todo = ({navigation, route}) => {

    const [userObject, setUserObject] = useState({})
    const [todoData, setTodoData] = useState([])
    const [cleaningInfoObject, setCleaningInfoObject] = useState({})
    var refreshInterval

    /**
     * Calls the database for the locally-stored todo data to be refreshed
     */
    function refreshData() {
        LocalCleaningDB.selectTodoCustom(setTodoData)
        getUserData()
    }
    
    /**
     * Asynchronously fetches the user object from async storage
     */
    getUserData = async () => {
        try {
            let userObject = await LocalAsyncStore.getAsyncUser()
            setUserObject(userObject)
            //console.log("TODO: user found")
        } catch (err) {
            console.log("TODO: user not found")
        }
    }

    /**
     * Returns a random whole number between 0 and a specified maximum value
     * The random number is inclusive of 0 (the minimum), and the maximum
     * So it may return 0, the maximum, or anything in between
     * @param maximum the random number that is returned will be between 0 and this value
     */
    function getRandomFromZeroTo(maximum) {
        return Math.round(Math.random() * maximum)
    }

    /**
     * Returns a random CleaningInfo item (as an object) from LocalCleaningInfoAPI
     * @returns a random CleaningInfo item (as an object) from LocalCleaningInfoAPI
     */
    function getRandomCleaningInfo() {
        let maximumInfoIndex = LocalCleaningInfoAPI.getCleaningInfoArrSize() - 1 //the maximum valid array index is always 1 less than the number of items because arrays start from 0
        let randomInfoIndex = getRandomFromZeroTo(maximumInfoIndex)
        let randomInfoItem = LocalCleaningInfoAPI.getCleaningInfo(randomInfoIndex)
        return randomInfoItem
    }

    /**
     * Asynchronously opens the specified link if it is supported (e.g., valid https or http)
     */
    openLink = async (url) => {
        const linkIsSupported = await Linking.canOpenURL(url)

        if (linkIsSupported) {
            await Linking.openURL(url)
        } else {
            console.log("Cannot open url \"" + url + "\"")
        }
    }

    /**
     * Returns a component containing a cleaning fact/tip/info for the current session
     * @returns a component containing a cleaning fact/tip/info for the current session
     */
    function renderCleaningInfo() {
        let headlineText
        switch(cleaningInfoObject.headlineType) {
            case 1:
                headlineText = "Did you know?"
                break
            case 2:
                headlineText = "Cleaning tip"
                break
        }

        return  <TouchableHighlight 
                    activeOpacity={0.6}
                    underlayColor='#F4F4F4'
                    onPress={() => openLink(cleaningInfoObject.sourceUrl)}
                    style={Styles.infoWrapper}
                >
                    <View>
                        <View style={Styles.infoHeader}>
                            <MaterialCommunityIcons name="lightbulb-on" size={28} color="black"/>
                            <Text style={{fontSize: 20}}>{headlineText}</Text>
                            <MaterialCommunityIcons name="lightbulb-on" size={28} color="black"/>
                        </View>
                        <Text style={Styles.infoBody}>{cleaningInfoObject.body}</Text>
                    </View>
                </TouchableHighlight>
    }

    /**
     * This runs only on the first render...
     */
    useEffect(() => {
        getUserData()
        refreshData()      
        clearInterval(refreshInterval)
        refreshInterval = setInterval(refreshData, 700)
    }, [])

    /**
     * This runs every time this screen is focussed (i.e., navigated to)
     */
    useFocusEffect(
        useCallback(() => {
            setCleaningInfoObject(getRandomCleaningInfo) //gets a new random cleaning fact
            //This could be improved by remembering and avoiding the last cleaning fact index
            //so that it changes every time.
        }, [])
      )

    /**
     * Render block
     */
    return (
        <View style={Styles.wrapper}>
            {renderCleaningInfo()}
            <FlatList
                data={todoData}
                renderItem={({item}) => (
                    <TaskListItem 
                        taskItem={item}
                        user={userObject}
                        onPress={()=> navigation.push('Details', {user: userObject, taskItem: item})}
                        onPressOrt={()=> navigation.push('Details', {user: userObject, taskItem: item})}
                        onPressEdit={()=> navigation.push('Add', {user: userObject, taskItem: item})}
                    />
                )}
                keyExtractor={(item) => item.task_id}
            />
            <TouchableHighlight 
                activeOpacity={0.6}
                underlayColor='#F4F4F4'
                onPress={()=> navigation.push('Add', {user: userObject, taskItem: false})}
                //onPress={()=> LocalCleaningDB.selectTodoCustom(setTodoData)}
                style={Styles.addButton}
            >
                <Text style={Styles.addButtonText}>Add task</Text>
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
        paddingVertical: 5
    },

    infoWrapper: {
        margin: 5,
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 10
    },

    infoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    infoBody: {
        textAlign: 'center',
        paddingHorizontal: 30
    },

    addButton: {
        margin: 5,
        backgroundColor: 'skyblue',
        borderRadius: 10,
        padding: 10
    },

    addButtonText: {
        textAlign: 'center',
        fontSize: 15
    }
})

export default Todo