import { React, useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native'
import { useRoute } from '@react-navigation/native'
import DateTimePicker from '@react-native-community/datetimepicker'
import dayjs from 'dayjs'
import LocalAsyncStore from '../data/localAsyncStore'

const SetupTime = ({navigation, route}) => {

    const thisRoute = useRoute()
    const [continueEnabled, setContinueEnabled] = useState(false)

    const [dpNotTime, setDpNotTime] = useState(dayjs().toDate())
    const [dpNotTimeMode, setDpNotTimeMode] = useState('date')
    const [dpNotTimeShow, setDpNotTimeShow] = useState(false)

    const onDpNotTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate
        setDpNotTimeShow(false)
        setDpNotTime(currentDate)
        setContinueEnabled(true)
    }

    const dpNotTimeShowMode = (currentMode) => {
        setDpNotTimeShow(true)
        setDpNotTimeMode(currentMode)
    }

    const showDpNotTime = () => {
        dpNotTimeShowMode('time')
    }

    /**
     * returns true if the mode is "setup", false otherwise
     * @returns true if the mode is "setup", false otherwise
     */
    function isSetupMode() {
        return thisRoute.params.mode == "setup"
    }

    function setInitialTime() {
        let initTime
        if(isSetupMode() == false && thisRoute.params.user.reminderHour > -1 && thisRoute.params.user.reminderMinute > -1) {
            //There is already a reminder time - display it as the initial value
            initTime = dayjs().toDate()
            initTime.setHours(thisRoute.params.user.reminderHour)
            initTime.setMinutes(thisRoute.params.user.reminderMinute)
            initTime.setSeconds(0)
            setDpNotTime(initTime)
        } else {
            //There is currently no reminder time set - just display the time right now as the initial value
            initTime = dayjs().toDate()
            setDpNotTime(initTime)
        }
    }

    /**
     * Updates the user object with the reminder time provided by the datetimepicker
     * then navigates to onboarding step 4
     */
    function updateUser() {
        const updatedUser = {name: thisRoute.params.user.name, reminderHour: dpNotTime.getHours(), reminderMinute: dpNotTime.getMinutes()}
        LocalAsyncStore.setAsyncUser(updatedUser)
        if(isSetupMode()) {
            navigation.push('Setup Complete', {mode: thisRoute.params.mode, user: updatedUser})
        } else {
            thisRoute.params.userSetter(updatedUser)
            navigation.pop()
        }
    }
    
    /**
     * This runs only on the first render...
     */
        useEffect(() => {
            console.log("SetupTime: " + thisRoute.params.mode)
            setInitialTime()
        }, [])

    /**
     * Render block
     */
    return (
        <View style={Styles.wrapper}>
            {isSetupMode() ?
                <Text style={Styles.title}>With CleaningApp, you can enable or disable due date notifications on a per-task basis.</Text>
            :
                null
            }
            <View style={Styles.questionWrapper}>
                <Text style={Styles.subtitle}>When you enable notifications, what is the best time of day to notify you?</Text>
                {dpNotTimeShow && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={dpNotTime}
                        mode={dpNotTimeMode}
                        is24Hour={true}
                        onChange={onDpNotTimeChange}
                    />
                )}
                <TouchableHighlight
                    activeOpacity={0.6}
                    underlayColor='#3C3C3C'
                    onPress={() => showDpNotTime()}>
                        <Text style={Styles.notTimeLabel}>{dayjs(dpNotTime).format("HH:mm")}</Text>
                </TouchableHighlight>
            </View>
            {continueEnabled == true ?
                <TouchableHighlight 
                    activeOpacity={0.6}
                    underlayColor='#F4F4F4'
                    onPress={updateUser}
                    style={Styles.doneButton}
                >
                    <View>
                        {isSetupMode() ?
                            <Text style={Styles.doneButtonText}>Continue</Text>
                        :
                            <Text style={Styles.doneButtonText}>Save</Text>
                        }
                    </View>
                </TouchableHighlight>
            :
                <TouchableHighlight 
                    activeOpacity={0.6}
                    underlayColor='#F4F4F4'
                    disabled={true}
                    style={Styles.doneButtonDisabled}
                >
                    <View>
                        {isSetupMode() ?
                            <Text style={Styles.doneButtonText}>Continue</Text>
                        :
                            <Text style={Styles.doneButtonText}>Save</Text>
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
    
    notTimeLabel: {
        backgroundColor: '#F4F4F4',
        fontSize: 15,
        marginVertical: 10,
        padding: 8,
        textAlign: 'center',
        borderRadius: 10,
    },

    doneButton: {
        backgroundColor: 'skyblue',
        borderRadius: 10,
        padding: 10,
    },

    doneButtonDisabled: {
        backgroundColor: 'grey',
        borderRadius: 10,
        padding: 10,
    },

    doneButtonText: {
        textAlign: 'center',
        fontSize: 15
    }
})

export default SetupTime