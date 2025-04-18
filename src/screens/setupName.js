import { React, useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableHighlight, TextInput } from 'react-native'
import { useRoute } from '@react-navigation/native'
import LocalAsyncStore from '../data/localAsyncStore'

const SetupName = ({navigation, route}) => {

    const thisRoute = useRoute()
    const [userName, setUserName] = useState('')
    const [continueEnabled, setContinueEnabled] = useState(false)

    /**
     * returns true if the mode is "setup", false otherwise
     * @returns true if the mode is "setup", false otherwise
     */
    function isSetupMode() {
        return thisRoute.params.mode == "setup"
    }

    /**
     * Creates the user object with the name provided in the text input,
     * and the default values for reminder time,
     * then navigates to onboarding step 2
     */
    function createUser() {
        if(isSetupMode()) {
            const newUser = {name: userName, reminderHour: -1, reminderMinute: -1}
            LocalAsyncStore.setAsyncUser(newUser)
            navigation.push('Setup Rooms', {mode: thisRoute.params.mode, user: newUser})
        } else {
            const updatedUser = {name: userName, reminderHour: thisRoute.params.user.reminderHour, reminderMinute: thisRoute.params.user.reminderMinute}
            LocalAsyncStore.setAsyncUser(updatedUser)
            thisRoute.params.userSetter(updatedUser)
            navigation.pop()
        }
    }
    
    /**
     * This runs only on the first render...
     */
        useEffect(() => {
            console.log("SetupName: " + thisRoute.params.mode)
        }, [])

    /**
     * This runs on every render...
     */
    useEffect(() => {
        if(userName.length > 0) {
            setContinueEnabled(true)
        } else {
            setContinueEnabled(false)
        }
    })

    /**
     * Render block
     */
    return (
        <View style={Styles.wrapper}>
            {isSetupMode() ?
                <Text style={Styles.title}>Welcome to CleaningApp!</Text>
            :
                null
            }
            <View style={Styles.questionWrapper}>
                <Text style={Styles.subtitle}>What's your name?</Text>
                {isSetupMode() ?
                    <TextInput
                        onChangeText={(value) => setUserName(value)}
                        keyboardType='default'
                        style={Styles.textInput}
                    />
                :
                    <TextInput
                        placeholder={thisRoute.params.user.name}
                        onChangeText={(value) => setUserName(value)}
                        keyboardType='default'
                        style={Styles.textInput}
                    />
                }
            </View>
            {continueEnabled == true ?
                <TouchableHighlight 
                    activeOpacity={0.6}
                    underlayColor='#F4F4F4'
                    onPress={createUser}
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

    textInput: {
        backgroundColor: '#F4F4F4',
        fontSize: 15,
        marginVertical: 10,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 10
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

export default SetupName