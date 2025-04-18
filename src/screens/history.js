import { React, useEffect, useState } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import LocalCleaningDB from '../data/localCleaningDb'
import LocalAsyncStore from '../data/localAsyncStore'
import LogListItem from '../components/logListItem'

const History = ({navigation, route}) => {

    const [userObject, setUserObject] = useState({})
    const [historyData, setHistoryData] = useState([])
    var refreshInterval

    /**
     * Calls the database for the locally-stored history data to be refreshed
     */
    function refreshData() {
        LocalCleaningDB.selectHistoryCustom(setHistoryData)
        getUserData()
    } 

    /**
     * Asynchronously fetches the user object from async storage
     */
    getUserData = async () => {
        try {
            let userObject = await LocalAsyncStore.getAsyncUser()
            setUserObject(userObject)
            //console.log("HISTORY: user found")
        } catch (err) {
            console.log("HISTORY: user not found")
        }
    }

    /**
     * This runs only on the first render...
     */
    useEffect(() => {
        getUserData()
        refreshData()
        clearInterval(refreshInterval)
        refreshInterval = setInterval(refreshData, 1000)
    }, [])

    /**
     * Render block
     */
    return (
        <View style={Styles.wrapper}>
            <FlatList
                data={historyData}
                renderItem={({item}) => (
                    <LogListItem
                        logItem={item}
                        onPress={()=> navigation.push('Details', {user: userObject, taskItem: item})}
                    />
                )}
                keyExtractor={(item) => item.log_id}
            />
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

export default History