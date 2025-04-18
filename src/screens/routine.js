import { React, useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import LocalCleaningDB from '../data/localCleaningDb'
import LocalAsyncStore from '../data/localAsyncStore'
import RoutineListItem from '../components/routineListItem'

const Routine = ({navigation, route}) => {

    const [userObject, setUserObject] = useState({})
    const [routineData, setRoutineData] = useState([])
    const [dailyTotal, setDailyTotal] = useState(0)
    const [weeklyTotal, setWeeklyTotal] = useState(0)
    const [monthlyTotal, setMonthlyTotal] = useState(0)
    var refreshInterval

    /**
     * Asynchronously calculates the estimated cleaning duration on a daily, weekly, and monthly basis,
     * based on information available in the database about the repeating tasks
     * 
     * Totals never include fractional tasks. They only include the full task duration, once for
     * every time that the repeat frequency occurs within the specified time period.
     * e.g., a weekly task won't increase the daily total,
     * but its estimated duration will be applied once to the weekly total, and 4 times to the monthly total
     * e.g., a yearly task won't increase any of these totals,
     * because it's not guaranteed to occur during any of the specified time periods
     */
    getTotals = async () => {
        var monthlyDurationMins = 0
        var weeklyDurationMins = 0
        var dailyDurationMins = 0
        for (var i = 0; i < routineData.length; i++) {
            if (routineData[i].task_repeat_freq_days == 1) {
                dailyDurationMins += routineData[i].task_duration_mins
            }
            var weeklyOccurances = Math.floor(7 / routineData[i].task_repeat_freq_days)
            var weeklyTotal = weeklyOccurances * routineData[i].task_duration_mins
            weeklyDurationMins += weeklyTotal

            var monthlyOccurances = Math.floor(31 / routineData[i].task_repeat_freq_days)
            var monthlyTotal = monthlyOccurances * routineData[i].task_duration_mins
            monthlyDurationMins += monthlyTotal
        }

        setDailyTotal(dailyDurationMins)
        setWeeklyTotal(weeklyDurationMins)
        setMonthlyTotal(monthlyDurationMins)
    }

    /**
     * Calls the database for the locally-stored routine data to be refreshed,
     * and then calls for the totals (which are based on the above data) to be refreshed
     */
    function refreshData() {
        LocalCleaningDB.selectRoutineCustom(setRoutineData)
        getTotals()
        getUserData()
    }

    /**
     * Returns the readable "x hours y minutes" string based on the specified number of minutes
     * @param totalMins the number of minutes to convert into a more readable format
     * @returns the readable "x hours y minutes" string based on the specified number of minutes
     */
    function getHoursAndMinsString(totalMins) {
        const hours = Math.floor(totalMins / 60)
        const minutes = totalMins % 60

        var hoursString
        if (hours == 0) {
            hoursString = ""
        } else if (hours == 1) {
            hoursString = hours + " hour "
        } else {
            hoursString = hours + " hours "
        }

        var minsString
        if (minutes == 0) {
            minsString = ""
        } else if (minutes == 1) {
            minsString = minutes + " min"
        } else {
            minsString = minutes + " mins"
        }

        return hoursString + minsString + "\n"
    }

    /**
     * Asynchronously fetches the user object from async storage
     */
    getUserData = async () => {
        try {
            let userObject = await LocalAsyncStore.getAsyncUser()
            setUserObject(userObject)
            //console.log("ROUTINE: user found")
        } catch (err) {
            console.log("ROUTINE: user not found")
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
            {dailyTotal > 0 || weeklyTotal > 0 || monthlyTotal > 0 ?
                <View style={Styles.allTotalsWrapper}>
                    <View style={Styles.totalWrapper}>
                        <Text style={Styles.totalText}>Daily</Text>
                        <MaterialCommunityIcons name="calendar-today" size={38} color="black"/>
                        <Text style={Styles.totalText}>{getHoursAndMinsString(dailyTotal)}(Approx.)</Text>
                    </View>
                    <View style={Styles.totalWrapper}>
                        <Text style={Styles.totalText}>Weekly</Text>
                        <MaterialCommunityIcons name="calendar-week" size={38} color="black"/>
                        <Text style={Styles.totalText}>{getHoursAndMinsString(weeklyTotal)}(Approx.)</Text>
                    </View>
                    <View style={Styles.totalWrapper}>
                        <Text style={Styles.totalText}>Monthly</Text>
                        <MaterialCommunityIcons name="calendar-blank" size={38} color="black"/>
                        <Text style={Styles.totalText}>{getHoursAndMinsString(monthlyTotal)}(Approx.)</Text>
                    </View>
                </View>
            :
                null
            }
            {dailyTotal > 120 ? 
                <View style={Styles.warningWrapper}>
                    <View style={Styles.warningHeader}>
                        <MaterialCommunityIcons name="exclamation-thick" size={28} color="black"/>
                        <Text style={{fontSize: 20}}>Warning</Text>
                        <MaterialCommunityIcons name="exclamation-thick" size={28} color="black"/>
                    </View>
                    <Text style={Styles.warningBody}>We recommend that your daily cleaning routine does not exceed 2 hours</Text>
                </View>
            :
                null
            }
            <FlatList
                data={routineData}
                renderItem={({item}) => (
                    <RoutineListItem
                        taskItem={item}
                        onPress={()=> navigation.push('Details', {user: userObject, taskItem: item})}
                    />
                )}
                keyExtractor={(item) => item.task_id}
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

    allTotalsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        margin: 5,
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 10
    },

    totalWrapper: {
        alignItems: 'center'
    },

    warningWrapper: {
        margin: 5,
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 10
    },

    warningHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    warningBody: {
        textAlign: 'center',
        paddingHorizontal: 30
    },

    totalText: {
        textAlign: 'center'
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

export default Routine