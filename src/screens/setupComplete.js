import { React, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native'
import { useRoute } from '@react-navigation/native'

const SetupComplete = ({navigation, route}) => {

    const thisRoute = useRoute()

    /**
     * Sets the onboarding status to "complete",
     * which navigates the user to the default (Todo) screen
     */
    function finishOnboarding() {
        thisRoute.params.setter(true)
    }
    
    /**
     * This runs only on the first render...
     */
        useEffect(() => {
            console.log("SetupComplete: " + thisRoute.params.mode)
        }, [])


    /**
     * Render block
     */
    return (
        <View style={Styles.wrapper}>
            <Text style={Styles.title}>You're all set!</Text>
            <View style={Styles.questionWrapper}>
                <Text style={Styles.subtitle}>Remember, you can use the "Add task" button to schedule your first task.
                Why not start with something that you have been meaning to do for a while?</Text>
            </View>
            <TouchableHighlight 
                    activeOpacity={0.6}
                    underlayColor='#F4F4F4'
                    onPress={finishOnboarding}
                    style={Styles.doneButton}
                >
                    <Text style={Styles.doneButtonText}>Finish</Text>
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

    doneButton: {
        backgroundColor: 'skyblue',
        borderRadius: 10,
        padding: 10,
    },

    doneButtonText: {
        textAlign: 'center',
        fontSize: 15
    }
})

export default SetupComplete