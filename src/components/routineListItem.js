import { React } from 'react'
import { StyleSheet, View, TouchableHighlight, Text } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const RoutineListItem = (props) => {

    /**
     * Returns a description of the specified number-of-days frequency
     * @param freqDays
     * @returns a string describing the frequency of the task
     */
    function getFrequencyString(freqDays) {
        freqDays = Math.round(freqDays)
        switch (freqDays) {
            case 1:
                return "Daily"
            case 2:
                return "Every other day"
            case 7:
                return "Weekly"
            case 14:
                return "Fortnightly"
            case 30:
                return "Monthly"
            case 31:
                return "Monthly"
            case 60:
                return "Every other month"
            case 61:
                return "Every other month"
            case 62:
                return "Every other month"
            case 90:
                return "Quarterly"
            case 91:
                return "Quarterly"
            case 92:
                return "Quarterly"
            case 93:
                return "Quarterly"
            case 182:
                return "Semi-annually"
            case 183:
                return "Semi-annually"
            case 365:
                return "Annually"
            case 366:
                return "Annually"
            default:
                return "Every " + freqDays + " days"
        }
    }

    /**
     * Returns a description of the specified number-of-minutes duration
     * @param durationMins
     * @returns a string describing the duration of the task
     */
    function getDurationString(durationMins) {
        if (durationMins == 60) {
            return "around 1 hour"
        } else if (durationMins == 120) {
            return "around 2 hours"
        } else {
            return "around " + durationMins + " mins"
        }
    }

    /**
     * Render block
     */
    return (
        <View style={Styles.wrapper}>
            <TouchableHighlight         
                activeOpacity={0.6}
                underlayColor='#F4F4F4'
                onPress={props.onPress}>
                <View style={Styles.contentWrapper}>
                    <View style={Styles.dateTypeWrapper}>
                        <View style={Styles.dateWrapper}>
                            <Text style={Styles.name}>{props.taskItem.task_name}</Text>
                            <Text>{getFrequencyString(props.taskItem.task_repeat_freq_days)}</Text>
                        </View>
                    </View> 
                        {props.taskItem.task_duration_mins > 0 ?
                            <View style={Styles.durationWrapper}>
                                <MaterialCommunityIcons name="clock" size={24} color="black"/>
                                <Text style={Styles.duration}>{getDurationString(props.taskItem.task_duration_mins)}</Text>
                            </View>                          
                        :
                            <View style={Styles.durationWrapper}>
                                <MaterialCommunityIcons name="clock-plus" size={24} color="black"/>
                            </View>  
                        }
                </View>      
            </TouchableHighlight>
        </View>
    )
}

/**
 * CSS
 */
const Styles = StyleSheet.create({
    wrapper: {
        margin: 5,
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 10
    },

    contentWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    dateTypeWrapper: {
        flexDirection: 'row'
    },

    dateWrapper: {
        marginRight: 20
    },

    logTypeWrapper: {

    },

    actionString: {
        
    },

    durationWrapper: {
        alignItems: 'flex-end'
    },

    duration: {
        textAlign: 'right'
    },

    name: {
        fontSize: 20
    },
}) 

export default RoutineListItem