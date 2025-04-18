import { React } from 'react'
import { StyleSheet, View, TouchableHighlight, Text, ScrollView, TextInput} from 'react-native'
import { useRoute } from '@react-navigation/native'
import dayjs from 'dayjs'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const Details = ({navigation, route}) => {

    const thisRoute = useRoute()
    let formattedSet = dayjs(thisRoute.params.taskItem.task_set).format("DD-MM-YYYY")
    let formattedDue = dayjs(thisRoute.params.taskItem.task_due).format("DD-MM-YYYY")
    let formattedLast = dayjs(thisRoute.params.taskItem.task_prev_completed_last).format("DD-MM-YYYY")

    /**
     * Returns the readable task duration string describing the task being presented
     * @returns the readable task duration string describing the task being presented
     */
    function getFormattedDuration() {
        switch(thisRoute.params.taskItem.task_duration_mins) {
            case 30:
                return "Around half an hour"
            case 60:
                return "Around 1 hour"
            case 90:
                return "Around 1 and a half hours"
            case 120:
                return "Around 2 hours"
            default:
                return "Around " + thisRoute.params.taskItem.task_duration_mins + " minutes"
        }
    }

    /**
     * Returns the readable task level string describing the task being presented, unless the task level is 2 (regular)
     * @returns the readable task level string describing the task being presented
     */
    function getFormattedLevel() {
        switch(thisRoute.params.taskItem.task_level) {
            case 1:
                return "Just a once-over"
            case 3:
                return "Deep clean"
        }
    }

    /**
     * Returns the readable previously completed times string for the task being presented
     * @returns the readable previously completed times string for the task being presented
     */
    function getFormattedPreviouslyCompleted() {
        switch(thisRoute.params.taskItem.task_prev_completed_times) {
            case 0:
                return "Never"
            case 1:
                return "1 time"
            default:
                return thisRoute.params.taskItem.task_prev_completed_times + " times"
        }
    }

    /**
     * Returns the readable task repeat frequency string for the task being presented
     * @returns the readable task repeat frequency string for the task being presented
     */
    function getFormattedRepeatStatus() {
        switch (thisRoute.params.taskItem.task_repeat_freq_days) {
            case 1:
                return "daily"
            case 2:
                return "every other day"
            case 7:
                return "weekly"
            case 14:
                return "fortnightly"
            case 30:
                return "monthly"
            case 31:
                return "monthly"
            case 60:
                return "every other month"
            case 61:
                return "every other month"
            case 62:
                return "every other month"
            case 90:
                return "quarterly"
            case 91:
                return "quarterly"
            case 92:
                return "quarterly"
            case 93:
                return "quarterly"
            case 182:
                return "semi-annually"
            case 183:
                return "semi-annually"
            case 365:
                return "annually"
            case 366:
                return "annually"
            default:
                return "every " + thisRoute.params.taskItem.task_repeat_freq_days + " days"
        }
    }

    /**
     * Returns a component describing the task repeat frequency for the task being presented
     * @returns a component describing the task repeat frequency for the task being presented
     */
    function renderRepeatStatus() {
        if (thisRoute.params.taskItem.task_repeat_freq_days > 0) {
            return  <View style={Styles.rowWrapper}>
                        <MaterialCommunityIcons name="repeat" size={20} color="black" style={Styles.inlineIcon}/>
                        <Text style={Styles.text}>Task repeats {getFormattedRepeatStatus()}</Text>
                    </View>
        } else {
            return  <View style={Styles.rowWrapper}>
                        <MaterialCommunityIcons name="repeat-off" size={20} color="black" style={Styles.inlineIcon}/>
                        <Text style={Styles.text}>Task does not repeat</Text>
                    </View>
        }
    }

    /**
     * Returns a component describing the task reminder status for the task being presented
     * @returns a component describing the task reminder status for the task being presented
     */
    function renderReminderStatus() {
        if (thisRoute.params.taskItem.task_has_reminders == 1) {
            return  <View style={Styles.rowWrapper}>
                        <MaterialCommunityIcons name="bell-ring" size={20} color="black" style={Styles.inlineIcon}/>
                        <Text style={Styles.text}>Due date reminder is ON</Text>
                    </View>
        } else {
            return  <View style={Styles.rowWrapper}>
                        <MaterialCommunityIcons name="bell-off" size={20} color="black" style={Styles.inlineIcon}/>
                        <Text style={Styles.text}>Due date reminder is OFF</Text>
                    </View>
        }
    }

    /**
     * Returns a component describing the "can be done in advance" status for the task being presented
     * @returns a component describing the "can be done in advance" status for the task being presented
     */
    function renderAdvanceStatus() {
        if (thisRoute.params.taskItem.task_can_be_done_advance == 1) {
            return  <View style={Styles.rowWrapper}>
                        <MaterialCommunityIcons name="check" size={20} color="black" style={Styles.inlineIcon}/>
                        <Text style={Styles.text}>Task can be completed before the due date</Text>
                    </View>
        } else {
            return  <View style={Styles.rowWrapper}>
                        <MaterialCommunityIcons name="close" size={20} color="black" style={Styles.inlineIcon}/>
                        <Text style={Styles.text}>Task cannot be completed before the due date</Text>
                    </View>
        }
    }

    /**
     * Render block
     */
    return (
        <ScrollView>
            <View style={Styles.wrapper}>
                <Text style={Styles.name}>{thisRoute.params.taskItem.task_name}</Text>
                <View style={Styles.rowWrapper}>
                    <MaterialCommunityIcons name="map-marker" size={20} color="black" style={Styles.inlineIcon}/>
                    <Text style={Styles.text}>{thisRoute.params.taskItem.loc_name}</Text>
                </View>
                {thisRoute.params.taskItem.task_duration_mins > 0 ?
                    <View style={Styles.rowWrapper}>
                        <MaterialCommunityIcons name="clock" size={20} color="black" style={Styles.inlineIcon}/>
                        <Text style={Styles.text}>{getFormattedDuration()}</Text>
                    </View>
                :
                    null
                }
                {thisRoute.params.taskItem.task_level != 2 ?
                    <View style={Styles.rowWrapper}>
                        <MaterialCommunityIcons name="broom" size={20} color="black" style={Styles.inlineIcon}/>
                        <Text style={Styles.text}>{getFormattedLevel()}</Text>
                    </View>
                :
                    null
                }
            </View>
            <View style={Styles.boxWrapper}>
                <View style={Styles.box}>
                    <Text style={Styles.boxText}>Set:</Text>
                    <Text style={Styles.boxText}>{formattedSet}</Text>
                </View>
                <View style={Styles.box}>
                    {thisRoute.params.taskItem.task_repeat_freq_days > 0 ?
                        <Text style={Styles.boxText}>Next due:</Text>
                    :
                        <Text style={Styles.boxText}>Due:</Text>
                    }
                    <Text style={Styles.boxText}>{formattedDue}</Text>
                </View>
            </View>
            {thisRoute.params.taskItem.task_repeat_freq_days > 0 ?
                <View style={Styles.boxWrapper}>
                    <View style={Styles.box}>
                        <Text style={Styles.boxText}>Previously completed:</Text>
                        <Text style={Styles.boxText}>{getFormattedPreviouslyCompleted()}</Text>
                    </View>
                    {thisRoute.params.taskItem.task_prev_completed_last > 0 ?
                        <View style={Styles.box}>
                            <Text style={Styles.boxText}>Last completed:</Text>
                            <Text style={Styles.boxText}>{formattedLast}</Text>
                        </View>
                    :
                        null
                    }
                </View>
            :
                null
            }
            <View style={Styles.sectionWrapper}>
                {renderReminderStatus()}
                {renderAdvanceStatus()}
                {renderRepeatStatus()}
            </View>
            {thisRoute.params.taskItem.task_motivation.length > 0 ?
                <View style={Styles.sectionWrapper}>
                    <Text style={Styles.text}>Notes:</Text>
                    <TextInput
                        value={thisRoute.params.taskItem.task_motivation}
                        multiline={true}
                        scrollEnabled={false}
                        readOnly={true}
                        style={Styles.notes}
                    />
                </View>
            :
                null
            }
            <TouchableHighlight 
                activeOpacity={0.6}
                underlayColor='royalblue'
                onPress={()=> navigation.push('Add', {user: thisRoute.params.user, taskItem: thisRoute.params.taskItem})}
                style={Styles.addButton}
            >
                <Text style={Styles.addButtonText}>Edit task</Text>
            </TouchableHighlight>
        </ScrollView>
    )
}

/**
 * CSS
 */
const Styles = StyleSheet.create({
    wrapper: {
        margin: 5,
        marginTop: 10,
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 10
    },

    sectionWrapper: {
        margin: 5,
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 10
    },

    rowWrapper: {
        flexDirection: 'row'
    },

    name: {
        fontSize: 20,
        marginBottom: 10,
        textAlign: 'center'
    },

    text: {
        fontSize: 16
    },
    
    box: {
        margin: 5,
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 10,
        flex: 1
    },
    
    boxWrapper: {
        flexDirection: 'row'
    },

    boxText: {
        fontSize: 16,
        textAlign: 'center'
    },

    notes: {
        fontSize: 16,
        color: '#000000'
    },

    inlineIcon: {
        marginRight: 5
    },

    addButton: {
        margin: 5,
        backgroundColor: 'skyblue',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10
    },

    addButtonText: {
        textAlign: 'center',
        fontSize: 15
    }
}) 

export default Details