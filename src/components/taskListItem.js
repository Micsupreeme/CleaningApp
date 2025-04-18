import { React } from 'react'
import { StyleSheet, View, TouchableHighlight, Text, Alert } from 'react-native'
import dayjs from 'dayjs'
import LocalCleaningDB from '../data/localCleaningDb'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Notification from "expo-notifications"

const TaskListItem = (props) => {

    const defaultReminderHour = 12
    const defaultReminderMinute = 0
    const notificationIdentifierPrefix = "CleaningTaskID"
    let formattedDue = dayjs(props.taskItem.task_due).format("DD-MM-YY")
    let startOfToday = new Date().setHours(0, 0, 0, 0)
    let endOfToday = new Date().setHours(23, 59, 59, 999)
    let startOfTodayUnix = dayjs(startOfToday).unix() * 1000    // * 1000 because milliseconds must be added in order to
    let endOfTodayUnix = dayjs(endOfToday).unix() * 1000        // compare with props.taskItem.task_due
    let dueString
    if (props.taskItem.task_can_be_done_advance == 1) {
        dueString = "Due by"
    } else {
        dueString = "Due"
    }

    /**
     * returns the number of seconds between now and the task due date at the established "notification time"
     * @param taskItem the taskItem that the notification is for
     * @returns the number of seconds between now and the task due date at the established "notification time"
     */
    function getNotificationSeconds(taskItem) {
        let due = dayjs(getTaskNextDue(taskItem, "completed or rescheduled")).toDate()
        if (props.user.reminderHour > -1 && props.user.reminderMinute > -1) {
            due.setHours(props.user.reminderHour)
            due.setMinutes(props.user.reminderMinute)
            due.setSeconds(0)
            due.setMilliseconds(0)
        } else {
            //no user-specified reminder time, use default
            due.setHours(defaultReminderHour)
            due.setMinutes(defaultReminderMinute)
            due.setSeconds(0)
            due.setMilliseconds(0)
        }

        console.log("Notification due: " + dayjs(due).format("DD-MM-YYYY HH:mm:ss:SSS"))
        //below is the time difference in different units
        let diffDays = dayjs(due).diff(dayjs(), "day")
        let diffHours = dayjs(due).diff(dayjs(), "hour")
        let diffMins = dayjs(due).diff(dayjs(), "minute")
        let diffSecs = dayjs(due).diff(dayjs(), "second")
        console.log(" Seconds until notification due: " + diffSecs +
                    "(" + diffDays + " days / " +
                    diffHours + " hours / " +
                    diffMins + " mins)")
        return diffSecs
    }
    
    /**
     * Attempts to schedule a "task due today" notification for the day that the task is due, at the user-specified "reminder time"
     * @param notifIdentifier the identifier for the notification that will be scheduled
     * @param taskItem the taskItem that the notification is for
     */
    function scheduleNotification(notifIdentifier, taskItem) {
        let notifSeconds = getNotificationSeconds(taskItem)
        if (notifIdentifier != null && notifSeconds > 0) {
            console.log("Scheduling notification '" + notifIdentifier + "'")
            //Notification settings for when the app is running in the foreground
            Notification.setNotificationHandler({
                handleNotification: async () => ({
                    shouldPlaySound: true,
                    shouldShowAlert: true,
                    shouldSetBadge: false
                })
            })
            //Schedule the local notification
            Notification.scheduleNotificationAsync({
                identifier: notifIdentifier,
                content: {
                    title: "CleaningApp",
                    body: "Hey " + props.user.name + ", \"" + taskItem.task_name + "\" is due today",
                },
                trigger: {
                    seconds: notifSeconds
                }
            })
        } else {
            console.log("Notification not scheduled. Either identifier was missing, or seconds trigger was negative")
        }
    }

    /**
     * Calculates the date when the specified task is next due
     * @param taskItem the task item for the repeating task
     * @param completedOrRescheduled was this repeating task just "completed", or is it being "rescheduled"?
     * @returns the date (as a date) when the specified task is next due
     */
    function getTaskNextDue(taskItem, completedOrRescheduled) {
        let taskNextDue = new Date().setHours(23, 59, 59, 999)
        taskNextDue = dayjs(taskNextDue).add(taskItem.task_repeat_freq_days, 'day')
        console.log("Repeating task was " + completedOrRescheduled + " today " + dayjs().unix() + " (AKA: " + dayjs().format("DD-MM-YY HH:mm:ss:SSS") + ")")
        console.log("Task repeats every " + taskItem.task_repeat_freq_days + " days")
        console.log("Repeating task next due: " + dayjs(taskNextDue).unix() + " (AKA: " + dayjs(taskNextDue).format("DD-MM-YY HH:mm:ss:SSS") + ")")
        return taskNextDue
    }

    /**
     * Iterates the specified repeating task by updating its database record
     * @param taskItem the task item for the repeating task, to be automatically rescheduled upon completion
     */
    function iterateRepeatingTask(taskItem) {
        let taskNextDue = getTaskNextDue(taskItem, "completed")

        /*to iterate a task, the task record is updated
        by setting task_completed to 0,
        incrementing task_prev_completed_times,
        setting task_prev_completed_last to today,
        and setting the due date to <task_repeat_freq_dats> from today, in the future*/
        LocalCleaningDB.updateTask(
            taskItem.task_name, 
            taskItem.task_level,
            taskItem.task_duration_mins,
            0, //not completed
            taskItem.task_can_be_done_advance,
            taskItem.task_has_reminders,
            taskItem.task_set,
            dayjs(taskNextDue).unix() * 1000,
            taskItem.task_repeat_freq_days,
            taskItem.task_motivation,
            taskItem.task_prev_completed_times + 1,
            dayjs().unix() * 1000,
            taskItem.loc_id,
            taskItem.task_id)  
    }

    /**
     * Reschedules the specified repeating task by updating its database record
     * @param taskItem the task item for the repeating task, to be manually rescheduled
     */
    function rescheduleRepeatingTask(taskItem) {
        let taskNextDue = getTaskNextDue(taskItem, "rescheduled")

        /*to reschedule a task, the task record is updated
        by setting the due date to <task_repeat_freq_days> from today, in the future*/
        LocalCleaningDB.updateTask(
            taskItem.task_name, 
            taskItem.task_level,
            taskItem.task_duration_mins,
            taskItem.task_completed,
            taskItem.task_can_be_done_advance,
            taskItem.task_has_reminders,
            taskItem.task_set,
            dayjs(taskNextDue).unix() * 1000,
            taskItem.task_repeat_freq_days,
            taskItem.task_motivation,
            taskItem.task_prev_completed_times,
            taskItem.task_prev_completed_last,
            taskItem.loc_id,
            taskItem.task_id)
        LocalCleaningDB.insertLog(5, dayjs().unix(), taskItem.task_id)

        let notifIdentifier = notificationIdentifierPrefix + taskItem.task_id
        Notification.cancelScheduledNotificationAsync(notifIdentifier)
        if (taskItem.task_has_reminders > 0) {
            scheduleNotification(notifIdentifier, taskItem)
        }
    }

    /**
     * Presents a "completed!" alert, then marks the task as complete (or auto-reschedules for repeating tasks),
     * and then inserts a log about what just happened
     * @param taskItem the task item that was just marked as completed
     */
    function completeTaskAndPraise(taskItem) {
            Alert.alert(
            "Completed!", "Well done, you completed '" + taskItem.task_name + "'!",
            [
                { 
                    text: "OK",
                    onPress: () => {
                        if (taskItem.task_repeat_freq_days > 0) {
                            //repeating task
                            iterateRepeatingTask(taskItem)
                            LocalCleaningDB.insertLog(2, dayjs().unix(), taskItem.task_id)
                            //task has iterated, so the due date has changed, ensure notifications update too
                            let notifIdentifier = notificationIdentifierPrefix + taskItem.task_id
                            Notification.cancelScheduledNotificationAsync(notifIdentifier)
                            if (taskItem.task_has_reminders > 0) {
                                scheduleNotification(notifIdentifier, taskItem)
                            }
                        } else {
                            //one-time task
                            LocalCleaningDB.updateTaskCompletion(1, taskItem.task_id)
                            LocalCleaningDB.insertLog(3, dayjs().unix(), taskItem.task_id)
                            //task is complete - ensure user does not receive any notifications about it in the future
                            let notifIdentifier = notificationIdentifierPrefix + taskItem.task_id
                            Notification.cancelScheduledNotificationAsync(notifIdentifier)
                        }
                    }
                }
            ],
            { cancelable: false }
        )
    }

    /**
     * Presents a "completed?" alert that asks the user if they want to mark the task as completed.
     * If they respond "Confirm", completeTaskAndPraise is called, else nothing happens
     * @param taskItem the task item that was just marked as completed
     */
    function completeTaskWithConfirmation(taskItem) {
        Alert.alert(
            "Completed?", "Mark '" + taskItem.task_name + "' as completed?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Task completion cancelled"),
                    style: "cancel"
                }, { 
                    text: "Confirm",
                    onPress: () => {
                        completeTaskAndPraise(taskItem)
                    }
                }
            ],
            { cancelable: false }
        )
    }

    /**
     * Presents a "reschedule?" alert that asks the user if they want to reschedule the repeating task.
     * If they respond "Yes", rescheduleRepeatingTask is called, else nothing happens
     * @param taskItem the task item that the user just requested to be rescheduled
     */
    function rescheduleTaskWithConfirmation(taskItem) {
        Alert.alert(
            "Reschedule?", "Overdue repeating tasks can be automatically rescheduled. Would you like to do this?",
            [
                {
                    text: "No",
                    onPress: () => console.log("Task reschedule cancelled"),
                    style: "cancel"
                }, { 
                    text: "Yes",
                    onPress: () => {
                        rescheduleRepeatingTask(taskItem)
                    }
                }
            ],
            { cancelable: false }
        )
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
                <View>
                    <View style={Styles.nameWrapper}>
                        {props.taskItem.task_repeat_freq_days > 0 ?
                            //is the task repeating? then show the repeat icon
                            <MaterialCommunityIcons name="repeat" size={20} color="black" style={Styles.repeatIcon}/>
                        :
                            //the task is a one-time-task, so it's best not to show any icon
                            null
                        }
                        <Text style={Styles.name}>{props.taskItem.task_name}</Text>
                    </View>
                    <View style={Styles.locationEditWrapper}>
                        <View style={Styles.locationNameWrapper}>
                            <MaterialCommunityIcons name="map-marker" size={14} color="black"/>
                            <Text> {props.taskItem.loc_name}</Text>
                        </View>
                        <TouchableHighlight
                            activeOpacity={0.6}
                            underlayColor='#F4F4F4'
                            onPress={props.onPressEdit}
                        >
                            <MaterialCommunityIcons name="square-edit-outline" size={30} color="black"/>
                        </TouchableHighlight>
                    </View>
                    {props.taskItem.task_due < startOfTodayUnix ? 
                        //is the task overdue? Then state that
                        <Text style={Styles.overdueText}>Overdue</Text>
                    :
                        //the task is not overdue, so it must either be due in the future, or due today
                        <View style={Styles.dueWrapper}>
                            {props.taskItem.task_due >= startOfTodayUnix && props.taskItem.task_due <= endOfTodayUnix ?
                                //is the task due today? Then state that
                                <Text style={Styles.dueTodayText}>{dueString} Today</Text>
                            :
                                //the task must be due in the future
                                <Text style={Styles.dueText}>{dueString} {formattedDue}</Text>
                            }
                        </View>
                    }

                    <View style={Styles.actionWrapper}>
                        {props.taskItem.task_due < startOfTodayUnix && props.taskItem.task_repeat_freq_days > 0 ?
                            //is the task overdue and repeating? Then it should be re-schedule-able
                            <TouchableHighlight
                            activeOpacity={0.6}
                            underlayColor='#F4F4F4'
                            onPress={() => rescheduleTaskWithConfirmation(props.taskItem)}
                            >
                                <MaterialCommunityIcons name="calendar-arrow-right" size={28} color="purple"/>
                            </TouchableHighlight>                     
                        :
                            //the task is either not overdue, or not repeating
                            <View>
                                {props.taskItem.task_can_be_done_advance ?
                                    //can the task be done in advance? Then it should always be complete-able
                                    <TouchableHighlight
                                        activeOpacity={0.6}
                                        underlayColor='#F4F4F4'
                                        onPress={() => completeTaskWithConfirmation(props.taskItem)}
                                    >
                                        <MaterialCommunityIcons name="check-outline" size={30} color="green"/>
                                    </TouchableHighlight>
                                :
                                    //the task cannot be done in advance, so it should only be complete-able starting from the due date
                                    <View>
                                        {props.taskItem.task_due >= startOfTodayUnix && props.taskItem.task_due <= endOfTodayUnix ?
                                            //is the task due today? Then it should be complete-able
                                            <TouchableHighlight
                                                activeOpacity={0.6}
                                                underlayColor='#F4F4F4'
                                                onPress={() => completeTaskWithConfirmation(props.taskItem)}
                                            >
                                                <MaterialCommunityIcons name="check-outline" size={30} color="green"/>
                                            </TouchableHighlight>
                                        :
                                            //the task is not due today, so it must be either due in the future, or overdue
                                            <View>
                                                {props.taskItem.task_due < startOfTodayUnix ?
                                                    //is the task overdue? Then it should be complete-able
                                                    <TouchableHighlight
                                                    activeOpacity={0.6}
                                                    underlayColor='#F4F4F4'
                                                    onPress={() => completeTaskWithConfirmation(props.taskItem)}
                                                    >
                                                        <MaterialCommunityIcons name="check-outline" size={30} color="green"/>
                                                    </TouchableHighlight>                         
                                                :
                                                    //the task must be due in the future, so it should not be complete-able
                                                    <TouchableHighlight
                                                    activeOpacity={0.6}
                                                    underlayColor='#F4F4F4'
                                                    >
                                                        <MaterialCommunityIcons name="check-outline" size={30} color="lightgrey"/>
                                                    </TouchableHighlight>
                                                }
                                            </View>
                                        }
                                    </View>
                                }
                            </View>
                        }
                    </View>                      
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

    nameWrapper: {
        flexDirection: 'row',
        alignItems: 'baseline'
    },

    locationEditWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    locationNameWrapper: {
        flexDirection: 'row',
        alignItems: 'baseline'
    },

    dueWrapper: {
        flexDirection: 'row'
    },

    actionWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },

    repeatIcon: {
        marginRight: 5
    },

    name: {
        fontSize: 20
    },

    overdueText: {
        color: 'purple',
        fontWeight: 'bold',
        fontSize: 15
    },

    dueTodayText: {
        color: 'blue',
        fontSize: 15
    },

    dueText: {
        fontSize: 15
    }
}) 

export default TaskListItem