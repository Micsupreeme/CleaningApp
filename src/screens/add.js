import { React, useState, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableHighlight, TextInput, Alert } from 'react-native'
import { RadioGroup } from 'react-native-radio-buttons-group'
import { useRoute } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Notification from "expo-notifications"
import dayjs from 'dayjs'
import DateTimePicker from '@react-native-community/datetimepicker'
import Slider from '@react-native-community/slider'
import SelectDropdown from 'react-native-select-dropdown'
import LocalCleaningDB from '../data/localCleaningDb'
import ExpoCheckbox from 'expo-checkbox/build/ExpoCheckbox'

const Add = ({navigation, route}) => {

    const defaultReminderHour = 12
    const defaultReminderMinute = 0
    const notificationIdentifierPrefix = "CleaningTaskID"
    const thisRoute = useRoute()

    const [nextTaskIdRawData, setNextTaskIdRawData] = useState([])

    const [taskName, setTaskName] = useState('')

    const [rbTaskLevel, setRbTaskLevel] = useState(2)
    const rbTaskLevelItems = useMemo(() => ([
        { id: 1, label: 'Once-over', color: '#F4F4F4', labelStyle: Styles.radioLabel},
        { id: 2, label: 'Standard', color: '#F4F4F4', labelStyle: Styles.radioLabel},
        { id: 3, label: 'Deep clean', color: '#F4F4F4', labelStyle: Styles.radioLabel}
    ]), [])

    const [rbTaskType, setRbTaskType] = useState(1)
    const rbTaskTypeItems = useMemo(() => ([
        { id: 1, label: 'One-time task', color: '#F4F4F4', labelStyle: Styles.radioLabel},
        { id: 2, label: 'Repeating task', color: '#F4F4F4', labelStyle: Styles.radioLabel}
    ]), [])

    const [sldTaskDuration, setSldTaskDuration] = useState(0)

    let endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    const [dpTaskDue, setDpTaskDue] = useState(endOfToday)
    const [dpTaskDueMode, setDpTaskDueMode] = useState('date')
    const [dpTaskDueShow, setDpTaskDueShow] = useState(false)
    let taskCompleted, taskSet, taskDue, taskPrevCompletedTimes, taskPrevCompletedLast
    const [sldNextDue, setSldNextDue] = useState(100)
    const [nextDue, setNextDue] = useState('')

    const onDpTaskDueChange = (event, selectedDate) => {
        const currentDate = selectedDate
        setDpTaskDueShow(false)
        setDpTaskDue(currentDate)
    }

    const dpTaskDueShowMode = (currentMode) => {
        setDpTaskDueShow(true)
        setDpTaskDueMode(currentMode)
    }

    const showDpTaskDue = () => {
        dpTaskDueShowMode('date')
    }

    const [taskRepeatFreq, setTaskRepeatFreq] = useState(0)
    const [chkCanBeDoneAdvance, setChkCanBeDoneAdvance] = useState(true)
    let taskCanBeDoneAdvance
    const [chkHasReminders, setChkHasReminders] = useState(false)
    let taskHasReminders
    const [taskMotivation, setTaskMotivation] = useState('')

    const [locationRawData, setLocationRawData] = useState([])
    const [taskLocation, setTaskLocation] = useState(1)

    /**
     * returns a notification identifier for the task being edited or added
     * @returns a notification identifier for the task being edited or added
     */
    function getNotificationIdentifier() {
        let notifIdentifier = notificationIdentifierPrefix
        if (thisRoute.params.taskItem.task_id != undefined) {
            //edit mode - we are guaranteed to have the task ID
            notifIdentifier += thisRoute.params.taskItem.task_id
        } else {
            //add mode - we should have calculated the prospective task ID
            if (typeof nextTaskIdRawData[0] != "undefined") {
                //we have the prospective task ID
                let nextTaskId = nextTaskIdRawData[0].seq + 1
                notifIdentifier += nextTaskId
            } else {
                //we don't have the prospective task ID
                console.log("The next task ID could not be determined, assuming 1")
                return 1
            }
        }
        return notifIdentifier
    }

    /**
     * returns the number of seconds between now and the task due date at the established "notification time"
     * @returns the number of seconds between now and the task due date at the established "notification time"
     */
    function getNotificationSeconds() {
        let due = dayjs(taskDue).toDate() //(unix).toDate() expects a millisecond value that does not exist, so the value is padded with 0s
        if (thisRoute.params.user.reminderHour > -1 && thisRoute.params.user.reminderMinute > -1) {
            due.setHours(thisRoute.params.user.reminderHour)
            due.setMinutes(thisRoute.params.user.reminderMinute)
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
        console.log("Seconds until notification due: " + diffSecs +
                    "(" + diffDays + " days / " +
                    diffHours + " hours / " +
                    diffMins + " mins)")
        return diffSecs
    }

    /**
     * Attempts to schedule a "task due today" notification for the day that the task is due, at the user-specified "reminder time"
     */
    function scheduleNotification() {
        let notifIdentifier = getNotificationIdentifier()
        let notifSeconds = getNotificationSeconds()
        if (notifIdentifier != null && notifSeconds > 0) {
            console.log("Scheduling notification '" + notifIdentifier + "'")

            //Schedule the local notification
            Notification.scheduleNotificationAsync({
                identifier: notifIdentifier,
                content: {
                    title: "CleaningApp",
                    body: "Hey " + thisRoute.params.user.name + ", \"" + taskName + "\" is due today.",
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
     * Presents a "task is invalid!" alert, with the specified message
     * @param errorMessage the body text for the alert
     */
    function validationAlert(errorMessage) {
            Alert.alert(
            "Task is invalid!", errorMessage,
            [
                { 
                    text: "OK"
                }
            ],
            { cancelable: false }
        )
    }

    /**
     * Returns true if a task name exists, false otherwise
     * @returns true if a task name exists, false otherwise
     */
    function taskNameIsValid() {
        let result = !!taskName.trim()
        if (result == false) {
            validationAlert("Task name is required.")
        }
        return result
    }

    /**
     * Returns true if the task is due on or after the set date, false otherwise
     * @returns true if the task is due on or after the set date, false otherwise
     */
    function taskDatesAreValid() {
        let result = dayjs(taskDue).isAfter(dayjs()) || dayjs(taskDue).isSame(dayjs(), "day")
        console.log("taskSet: " + dayjs(taskSet).format("DD-MM-YY HH:mm:ss"))
        console.log("taskDue: " + dayjs(taskDue).format("DD-MM-YY HH:mm:ss"))
        console.log("today: " + dayjs().format("DD-MM-YY HH:mm:ss"))
        if (result == false) {
            validationAlert("Task cannot be due before it is set.")
        }
        return result
    }

    /**
     * Returns true if the task repeat frequency is a valid number, false otherwise
     * @returns true if the task repeat frequency is a valid number, false otherwise
     */
    function taskFrequencyIsValid() {
        let result = isNaN(taskRepeatFreq)
        if (result == true) {
            validationAlert("Task repeat frequency must be a number.")
        }
        return result
    }

    /**
     * Sets the "taskDue" variable to the unix timestamp for when this repeating task is next due,
     * based on both the repeat frequency, and the status of the "current status" slider
     */
    function getRepeatingTaskNextDue() {
        console.log("Repeating task due every " + taskRepeatFreq + " days")
        console.log("Current completeness at " + sldNextDue + "% (lower % means it needs doing sooner)")
        let daysUntilNextDue = 0
        if (sldNextDue > 0) {
            //avoid divide by zero
            daysUntilNextDue = Math.ceil(taskRepeatFreq * (sldNextDue / 100))
        }
        console.log("Next due in: " + daysUntilNextDue + " days")
        taskDue = dayjs().add(daysUntilNextDue, 'day').unix() * 1000
        console.log("(INT) [rep] task_due: " + taskDue + " (AKA: " + dayjs().add(daysUntilNextDue, 'day').format("DD-MM-YY HH:mm:ss:SSS") + ")")
    }

    /**
     * Presents a "delete?" alert that asks the user if they want to delete the task
     * If they respond "Confirm", deleteTask is called, else nothing happens
     */
    function deleteTaskWithConfirmation() {
        Alert.alert(
            "Delete?", "Delete '" + thisRoute.params.taskItem.task_name + "'?\n\nThis action cannot be undone.",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Task deletion cancelled"),
                    style: "cancel"
                }, { 
                    text: "Confirm",
                    onPress: () => {
                        deleteTask()
                    }
                }
            ],
            { cancelable: false }
        )
    }

    /**
     * Ensures that all task attributes are in SQLite database-friendly formats and logs them
     */
    function prepareAndLogTaskAttributes() {
        console.log("(TEXT) task_name: " + taskName)
        console.log("(INT) task_level: " + rbTaskLevel)
        console.log("(INT) task_duration_mins: " + sldTaskDuration)

        taskCompleted = 0
        console.log("(INT) task_completed: " + taskCompleted)

        if (chkCanBeDoneAdvance) {
            taskCanBeDoneAdvance = 1
        } else {
            taskCanBeDoneAdvance = 0
        }
        console.log("(INT) task_can_be_done_advance: " + taskCanBeDoneAdvance)

        if (chkHasReminders) {
            taskHasReminders = 1
        } else {
            taskHasReminders = 0
        }
        console.log("(INT) task_has_reminders: " + taskHasReminders)
        
        if (thisRoute.params.taskItem.task_id != undefined) {
            taskSet = thisRoute.params.taskItem.task_set
        } else {
            taskSet = dayjs().unix() * 1000
        }
        console.log("(INT) task_set: " + taskSet + " (AKA: " + dayjs(taskSet).format("DD-MM-YY HH:mm:ss:SSS") + ")")

        if (rbTaskType == 2 && taskRepeatFreq > 0) {
            //repeating task
            getRepeatingTaskNextDue()
        } else {
            //one-time task
            taskDue = dayjs(dpTaskDue).unix() * 1000
            console.log("(INT) [ott] task_due: " + taskDue + " (AKA: " + dayjs(taskDue).format("DD-MM-YY HH:mm:ss:SSS") + ")")
        }

        console.log("(INT) task_repeat_freq_days: " + taskRepeatFreq)
        console.log("(TEXT) task_motivation: " + taskMotivation)

        taskPrevCompletedTimes = 0
        taskPrevCompletedLast = 0
        console.log("(INT) task_prev_completed_times: " + taskPrevCompletedTimes)
        console.log("(INT) task_prev_completed_last: " + taskPrevCompletedLast)

        console.log("(INT) loc_id: " + taskLocation)
    }

    /**
     * Inserts a new log record to record either the insert or update procedure for this task
     * @param logType 1 for insert, 4 for update
     */
    function insertLog(logType) {
        if (logType == 1) {
            //add
            let nextTaskId
            if (typeof nextTaskIdRawData[0] != "undefined") {
                //we know what the to-be-inserted task's id will be
                nextTaskId = nextTaskIdRawData[0].seq + 1 //seq stores the last used autoincrement value, so the next one will be + 1
                console.log("Determined next task Id: " + nextTaskId)
            } else {
                //we don't know what the to-be-inserted task's id will be
                nextTaskId = -1
                console.log("Could not determine next task Id")
            }
            LocalCleaningDB.insertLog(logType, dayjs().unix(), nextTaskId)
        } else if (logType == 4) {
            //update
            LocalCleaningDB.insertLog(logType, dayjs().unix(), thisRoute.params.taskItem.task_id)
        }
    }

    /**
     * Initiates the process of adding a new task by:
     * 1. firstly checking that the prospective task is valid
     * 2. secondly inserting the new task into the task table
     * 3. thirdly inserting a new log into the log table, describing the prior step
     * 4. finally scheduling a local notification if that option was chosen
     * @returns nothing, but will exit early (during step 1) if the prospective task is invalid
     */
    function addTask() {
       console.log("addTask()")
       if (!taskNameIsValid()) {
           console.log("Cancel operation: taskName is not valid")
            return
       }
       if (taskFrequencyIsValid()) {
            console.log("Cancel operation: taskRepeatFreq is not valid")
            return
       }
       prepareAndLogTaskAttributes()
       if (!taskDatesAreValid()) { //this validation check has to be done after pALTA() because the due date is calcuated in that function
        console.log("Cancel operation: taskSet and taskDue are not valid")
        return
       }

       LocalCleaningDB.insertTask(taskName, 
                                rbTaskLevel, 
                                sldTaskDuration, 
                                taskCompleted,
                                taskCanBeDoneAdvance,
                                taskHasReminders, 
                                taskSet, 
                                taskDue, 
                                taskRepeatFreq, 
                                taskMotivation,
                                taskPrevCompletedTimes,
                                taskPrevCompletedLast,
                                taskLocation)
        insertLog(1)
        if (taskHasReminders > 0) {
            scheduleNotification()
        }
        navigation.pop()
    }

    /**
     * Deletes the task by:
     * 1. firstly removing the database record
     * 2. secondly inserting a new log into the log table, describing the prior step
     * 3. finally ensuring that there are no outstanding notification scheduled for the deleted task
     */
    function deleteTask() {
        LocalCleaningDB.deleteTask(thisRoute.params.taskItem.task_id)
        //task has been deleted, so ensure there are no outstanding notifications scheduled
        Notification.cancelScheduledNotificationAsync(getNotificationIdentifier())
        navigation.pop()
    }

    /**
     * Initiates the process of updating this existing task by:
     * 1. firstly checking that the updated task is valid
     * 2. secondly updating the task record in the task table
     * 3. thirdly inserting a new log into the log table, describing the prior step
     * 4. finally scheduling a local notification if that option was chosen
     * @returns nothing, but will exit early (during step 1) if the prospective task is invalid
     */
    function updateTask() {
        console.log("updateTask()")
        if (!taskNameIsValid()) {
            console.log("Cancel operation: taskName is not valid")
            return
        }
        if (taskFrequencyIsValid()) {
            console.log("Cancel operation: taskRepeatFreq is not valid")
            return
       }
       prepareAndLogTaskAttributes()
       if (!taskDatesAreValid()) { //this validation check has to be done after pALTA() because the due date is calcuated in that function
            console.log("Cancel operation: taskSet and taskDue are not valid")
            return
       }

        if (rbTaskType == 1) {
            //update one-time task - taskRepeatFreq must be 0
            LocalCleaningDB.updateTask(taskName, 
                                    rbTaskLevel, 
                                    sldTaskDuration, 
                                    thisRoute.params.taskItem.task_completed, 
                                    taskCanBeDoneAdvance,
                                    taskHasReminders, 
                                    taskSet, 
                                    taskDue, 
                                    0, 
                                    taskMotivation,
                                    thisRoute.params.taskItem.task_prev_completed_times,
                                    thisRoute.params.taskItem.task_prev_completed_last,
                                    taskLocation, 
                                    thisRoute.params.taskItem.task_id)
        } else {
            //update repeating task
            LocalCleaningDB.updateTask(taskName,
                                    rbTaskLevel,
                                    sldTaskDuration,
                                    thisRoute.params.taskItem.task_completed,
                                    taskCanBeDoneAdvance,
                                    taskHasReminders,
                                    taskSet,
                                    taskDue,
                                    taskRepeatFreq,
                                    taskMotivation,
                                    thisRoute.params.taskItem.task_prev_completed_times,
                                    thisRoute.params.taskItem.task_prev_completed_last,
                                    taskLocation,
                                    thisRoute.params.taskItem.task_id)
        }
        insertLog(4)
        //due date may have changed - cancel any existing notification for this task before scheduling a new one
        Notification.cancelScheduledNotificationAsync(getNotificationIdentifier())
        if (taskHasReminders > 0) {
            scheduleNotification()
        }
        navigation.pop()
    }

    /**
     * Sets all the task attribute fields to match the taskItem data that was sent to this screen
     */
    function updateUiAccordingToTaskItem() {
        setTaskName(thisRoute.params.taskItem.task_name)
        setTaskLocation(thisRoute.params.taskItem.loc_id)
        setRbTaskLevel(thisRoute.params.taskItem.task_level)
        setSldTaskDuration(thisRoute.params.taskItem.task_duration_mins)

        let unixTaskDueInMilliseconds = thisRoute.params.taskItem.task_due
        setDpTaskDue(dayjs(unixTaskDueInMilliseconds).toDate())

        if (thisRoute.params.taskItem.task_can_be_done_advance > 0) {
            setChkCanBeDoneAdvance(true)
        } else {
            setChkCanBeDoneAdvance(false)
        }

        if (thisRoute.params.taskItem.task_has_reminders > 0) {
            setChkHasReminders(true)
        } else {
            setChkHasReminders(false)
        }

        setTaskRepeatFreq(thisRoute.params.taskItem.task_repeat_freq_days)
        if (thisRoute.params.taskItem.task_repeat_freq_days > 0) {
            //repeating task
            setRbTaskType(2)
        } else {
            //one-time task
            setRbTaskType(1)
        }

        setTaskMotivation(thisRoute.params.taskItem.task_motivation)
    }

    /**
     * This runs only on the first render...
     */
    useEffect(() => {
        LocalCleaningDB.selectAllLocations(setLocationRawData)
        LocalCleaningDB.selectTaskAutoIncrement(setNextTaskIdRawData)

        //Check if we are editing a task or adding a new task
        if (thisRoute.params.taskItem.task_id != undefined) {
            //We are editing a task - set the UI to match what is currently stored
            console.log("*EDIT MODE* Received task ID: " + thisRoute.params.taskItem.task_id)
            navigation.setOptions({title: 'Edit task'})
            updateUiAccordingToTaskItem()
        } else {
            //We are adding a task
            console.log("*ADD MODE* Did not recieve a taskItem")
            navigation.setOptions({title: 'Add task'})
        }
    }, [])
    
    /**
     * Render block
     */
    return (
        <KeyboardAwareScrollView style={Styles.formWrapper}>
            <Text style={Styles.label}>Task name:</Text>
            <TextInput
                placeholder={"e.g. \"Pick up items off the floor\""}
                value={taskName}
                onChangeText={(value) => setTaskName(value)}
                keyboardType='default'
                style={Styles.textInput}
            />
            <Text style={Styles.label}>Location:</Text>
            <SelectDropdown
                data={locationRawData.map((item) => {
                    return item.loc_id + ": " + item.loc_name
                })}
                defaultButtonText={typeof locationRawData[taskLocation - 1] != "undefined" ? locationRawData[taskLocation - 1].loc_name : ""}
                onSelect={(selectedItem, index) => {
                    setTaskLocation(selectedItem.substring(0, selectedItem.indexOf(": ")))
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                    return selectedItem.substring(selectedItem.indexOf(": ") + 2)
                }}
                rowTextForSelection={(item, index) => {
                    return item.substring(item.indexOf(": ") + 2)
                }}
                buttonTextStyle={Styles.dropdownButtonText}
                buttonStyle={Styles.dropdownButton}
                rowStyle={Styles.dropdownRow}
                rowTextStyle={Styles.dropdownRowText}
                selectedRowStyle={Styles.dropdownRowSelected}
            />
            <RadioGroup 
                radioButtons={rbTaskLevelItems} 
                onPress={setRbTaskLevel}
                selectedId={rbTaskLevel}
                layout='row'
                containerStyle={Styles.radioGroup}
            />
            <RadioGroup 
                radioButtons={rbTaskTypeItems} 
                onPress={setRbTaskType}
                selectedId={rbTaskType}
                layout='row'
                containerStyle={Styles.radioGroup}
            />
            {rbTaskType == 1 ?
                <View>
                    <Text style={Styles.label}>Due date:</Text>
                        <TouchableHighlight
                            activeOpacity={0.6}
                            underlayColor='#3C3C3C'
                            onPress={() => showDpTaskDue()}
                        >
                            <Text style={Styles.dueDateLabel}>{dayjs(dpTaskDue).format("DD-MM-YY")}</Text>
                        </TouchableHighlight>
                        {dpTaskDueShow && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={dpTaskDue}
                                mode={dpTaskDueMode}
                                is24Hour={true}
                                onChange={onDpTaskDueChange}
                            />
                        )}
                </View>
            :
                <View>
                    <Text style={Styles.label}>Repeat frequency (days):</Text>
                    {thisRoute.params.taskItem.task_id != undefined ?
                        //edit mode
                        <View>
                            <TextInput
                                value={"" + taskRepeatFreq}
                                onChangeText={(value) => setTaskRepeatFreq(value)}
                                keyboardType='numeric'
                                style={Styles.textInput}
                            />
                        </View>
                    :
                        //add mode
                        <TextInput
                            placeholder={"e.g., \"7\" for a weekly task"}
                            onChangeText={(value) => setTaskRepeatFreq(value)}
                            keyboardType='numeric'
                            style={Styles.textInput}
                        />
                    }
                    {(sldNextDue == 0 &&
                        <Text style={Styles.label}>This task: needs doing now</Text>)
                    ||  (sldNextDue == 25 &&
                        <Text style={Styles.label}>This task: needs doing soon</Text>)
                    ||  (sldNextDue == 50 &&
                        <Text style={Styles.label}>This task: needs doing in a bit</Text>)
                    ||  (sldNextDue == 75 &&
                        <Text style={Styles.label}>This task: was recently completed</Text>)
                    ||  (sldNextDue == 100 &&
                        <Text style={Styles.label}>This task: was completed today</Text>) 
                    }
                    <Slider
                        value={sldNextDue}
                        onValueChange={(value) => setSldNextDue(value)}
                        minimumValue={0}
                        maximumValue={100}
                        step={25}
                        thumbTintColor='skyblue'
                        minimumTrackTintColor='skyblue'
                        maximumTrackTintColor='white'
                        style={Styles.slider}
                    />
                </View>
            }
            {(sldTaskDuration < 1 &&
                <Text style={Styles.label}>Estimated task duration:</Text>)
            ||  (sldTaskDuration == 60 &&
                <Text style={Styles.label}>Estimated task duration: 1 hour (approx.)</Text>)
            ||  (sldTaskDuration < 120 &&
                <Text style={Styles.label}>Estimated task duration: {sldTaskDuration} mins (approx.)</Text>)
            ||  (sldTaskDuration == 120 &&
                <Text style={Styles.label}>Estimated task duration: 2 hours (approx.)</Text>)     
            }
            <Slider
                value={sldTaskDuration}
                onValueChange={(value) => setSldTaskDuration(value)}
                minimumValue={0}
                maximumValue={120}
                step={2}
                thumbTintColor='skyblue'
                minimumTrackTintColor='skyblue'
                maximumTrackTintColor='white'
                style={Styles.slider}
            />
            <View style={Styles.checkboxWrapper}>
                <Text style={Styles.label}>Remind me on the due date</Text>
                <ExpoCheckbox
                    value={chkHasReminders}
                    onValueChange={(newValue) => setChkHasReminders(newValue)}
                    color='royalblue'
                    style={Styles.checkbox}
                />
            </View>
            <View style={Styles.checkboxWrapper}>
                <Text style={Styles.label}>Task can be done before the due date</Text>
                <ExpoCheckbox
                    value={chkCanBeDoneAdvance}
                    onValueChange={(newValue) => setChkCanBeDoneAdvance(newValue)}
                    color='royalblue'
                    style={Styles.checkbox}
                />
            </View>
            <Text style={Styles.label}>Notes:</Text>
                <TextInput
                    placeholder={"e.g., What is the benefit of completing this task?"}
                    value={taskMotivation}
                    onChangeText={(value) => setTaskMotivation(value)}
                    keyboardType='default'
                    multiline={true}
                    scrollEnabled={false}
                    style={Styles.textInput}
                />
            {thisRoute.params.taskItem.task_id != undefined ?
                <View>
                    <TouchableHighlight 
                        activeOpacity={0.6}
                        underlayColor='#F4F4F4'
                        onPress={()=> updateTask()}
                        style={Styles.doneButton}
                    >
                        <Text style={Styles.doneButtonText}>Update task</Text>
                    </TouchableHighlight>
                    <TouchableHighlight 
                        activeOpacity={0.6}
                        underlayColor='#F4F4F4'
                        onPress={()=> deleteTaskWithConfirmation()}
                        style={[Styles.doneButton, {backgroundColor: '#EBA487'}]}
                    >
                        <Text style={Styles.doneButtonText}>Delete task</Text>
                    </TouchableHighlight>
                </View>
            :
                <TouchableHighlight 
                    activeOpacity={0.6}
                    underlayColor='#F4F4F4'
                    onPress={()=> addTask()}
                    style={Styles.doneButton}
                >
                    <Text style={Styles.doneButtonText}>Schedule task</Text>
                </TouchableHighlight>
            }
        </KeyboardAwareScrollView>
    )
}

/**
 * CSS
 */
const Styles = StyleSheet.create({
    formWrapper: {
        marginTop: 5,
        marginBottom: 10,
        borderRadius: 10
    },

    label: {
        fontSize: 15,
        color: '#FFFFFF',
        margin: 10
    },

    textInput: {
        backgroundColor: '#F4F4F4',
        fontSize: 15,
        marginHorizontal: 10,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 10
    },

    dropdownButton: {
        backgroundColor: '#F4F4F4',
        width: 'auto',
        height: 'auto',
        marginHorizontal: 10,
        padding: 8,
        borderRadius: 10,
    },

    dropdownButtonText: {
        fontSize: 15
    },

    dropdownRow: {
        backgroundColor: '#F4F4F4'
    },

    dropdownRowText: {
        fontSize: 20
    },

    dropdownRowSelected: {
        backgroundColor: 'skyblue'
    },

    radioGroup: {
        alignSelf: 'center',
        marginTop: 10
    },

    radioLabel: {
        color: '#F4F4F4',
        fontSize: 14
    },

    dueDateLabel: {
        backgroundColor: '#F4F4F4',
        fontSize: 15,
        marginHorizontal: 10,
        padding: 8,
        textAlign: 'center',
        borderRadius: 10,
        flex: 1
    },

    slider: {
        marginHorizontal: 10
    },

    checkboxWrapper: {
        flexDirection: 'row',
    },

    checkbox: {
        marginTop: 10,
        marginHorizontal: 8
    },

    doneButton: {
        marginHorizontal: 5,
        marginTop: 10,
        backgroundColor: 'skyblue',
        borderRadius: 10,
        padding: 10
    },

    doneButtonText: {
        textAlign: 'center',
        fontSize: 15
    }
})

export default Add