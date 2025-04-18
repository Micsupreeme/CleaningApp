import * as SQLite from 'expo-sqlite'
import dayjs from 'dayjs'

const cleaningDbLogPrefix = "[CleaningDB] "
const cleaningDb = SQLite.openDatabase("cleaning.db")

/**
 * Creates the location table (if it does not already exist)
 */
function createLocationTable ()
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "CREATE TABLE IF NOT EXISTS location " +
                "(loc_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "loc_name TEXT);",
            null,
            () => {console.log(cleaningDbLogPrefix + "Success! location table exists")},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "createLocationTable: " + err)},
        )
    })
}

/**
 * Creates the task table (if it does not already exist)
 */
function createTaskTable ()
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "CREATE TABLE IF NOT EXISTS task " +
                "(task_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "task_name TEXT NOT NULL, " +
                "task_level INTEGER NOT NULL, " +
                "task_duration_mins INTEGER NOT NULL, " +
                "task_completed INTEGER NOT NULL, " +
                "task_can_be_done_advance INTEGER NOT NULL, " +
                "task_has_reminders INTEGER NOT NULL, " +
                "task_set INTEGER NOT NULL, " +
                "task_due INTEGER NOT NULL, " +
                "task_repeat_freq_days INTEGER NOT NULL, " +
                "task_motivation TEXT, " +
                "task_prev_completed_times INTEGER NOT NULL, " +
                "task_prev_completed_last INTEGER NOT NULL, " +
                "loc_id INTEGER NOT NULL, " +
                "FOREIGN KEY (loc_id) REFERENCES location (loc_id));",
            null,
            () => {console.log(cleaningDbLogPrefix + "Success! task table exists")},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "createTaskTable: " + err)},
        )
    })
}

/**
 * Creates the log table (if it does not already exist)
 */
function createLogTable ()
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "CREATE TABLE IF NOT EXISTS log " +
                "(log_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "log_type INTEGER NOT NULL, " +
                "log_time INTEGER NOT NULL, " +
                "task_id INTEGER NOT NULL, " +
                "FOREIGN KEY (task_id) REFERENCES task (task_id));",
            null,
            () => {console.log(cleaningDbLogPrefix + "Success! log table exists")},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "createLogTable: " + err)},
        )
    })
}

/**
 * Creates all tables, in order
 */
function createAllTablesInOrder ()
{
    createLocationTable()
    createTaskTable()
    createLogTable()
}

/**
 * Drops the specified table (if it exists)
 */
function dropTableByName (table)
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "DROP TABLE IF EXISTS " + table + ";",
            null,
            () => {console.log(cleaningDbLogPrefix + "Table dropped")},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "dropTableByName: " + err)},
        )
    })
}

/**
 * Drops all tables, in order
 */
function dropAllTablesInOrder ()
{
    dropTableByName("log")
    dropTableByName("task")
    dropTableByName("location")
}

/**
 * Inserts a new location record with the specified name
 * @param locName name of the location to be added (e.g., "bedroom")
 */
function insertLocation (locName)
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "INSERT INTO location (loc_name) " +
            "VALUES (?);",
            [locName],
            (_txObj, data) => {console.log(data)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "insertLocation: " + err)},
        )
    })
}

/**
 * Inserts test data into the location table
 */
function insertDummyLocations() {
    insertLocation("bedroom")
    insertLocation("bathroom")
    insertLocation("kitchen")
    insertLocation("garage")
}

/**
 * Inserts a new task record with the specified values
 * @param taskName 
 * @param taskLevel 
 * @param taskDurationMins 
 * @param taskCompleted 
 * @param taskCanBeDoneAdvance 
 * @param taskSet 
 * @param taskDue 
 * @param taskRepeatFreqDays 
 * @param taskMotivation 
 * @param taskPrevCompletedTimes 
 * @param taskPrevCompletedLast 
 * @param locId 
 */
function insertTask (taskName, taskLevel, taskDurationMins, taskCompleted, taskCanBeDoneAdvance, taskHasReminders, taskSet, taskDue, taskRepeatFreqDays, taskMotivation, taskPrevCompletedTimes, taskPrevCompletedLast, locId)
{
    let sql = "INSERT INTO task (" +
    "task_name, " +
    "task_level, " +
    "task_duration_mins, " +
    "task_completed, " +
    "task_can_be_done_advance, " +
    "task_has_reminders," +
    "task_set, " +
    "task_due, " +
    "task_repeat_freq_days, " +
    "task_motivation, " +
    "task_prev_completed_times, " +
    "task_prev_completed_last, " +
    "loc_id) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);" //12 wildcards for the 12 parameters, which must be provided in the prescribed order. This approach minimises the threat of SQL injection.
    cleaningDb.transaction(tx => { tx.executeSql(
            sql,
            [taskName, taskLevel, taskDurationMins, taskCompleted, taskCanBeDoneAdvance, taskHasReminders, taskSet, taskDue, taskRepeatFreqDays, taskMotivation, taskPrevCompletedTimes, taskPrevCompletedLast, locId],
            (_txObj, data) => {console.log("Executed: " + sql + ", Data: " + JSON.stringify(data))},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "insertTask: " + err)},
        )
    })
}

/**
 * Inserts test data into the task table
 */
function insertDummyTasks() {
    insertTask("LastYearEvent", 3, 30, 0, 1, 1656260697, 1656347097, 0, "", 0, 0, 1)
    insertTask("Make the bed", 1, 2, 0, 0, 1685118297, 1687796697, 1, "", 3, 1687796697, 1)
    insertTask("Vacuum the floor", 2, 15, 0, 1, 1687710297, 1687796697, 7, "", 1, 1687796697, 1)
    insertTask("OneTimeEvent", 3, 30, 0, 1, dayjs().unix(), dayjs().unix(), 0, "", 0, 0, 1)
}

/**
 * Inserts a new task record with the specified values
 * @param logType 
 * @param logTime 
 * @param taskId 
 */
function insertLog (logType, logTime, taskId)
{
    let sql = "INSERT INTO log (" +
    "log_type, " +
    "log_time, " +
    "task_id) " +
    "VALUES (?, ?, ?);" //3 wildcards for the 3 parameters, which must be provided in the prescribed order. This approach minimises the threat of SQL injection.
    cleaningDb.transaction(tx => { tx.executeSql(
            sql,
            [logType, logTime, taskId],
            (_txObj, data) => {console.log("Executed: " + sql + ", Data: " + JSON.stringify(data))},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "insertTask: " + err)},
        )
    })
}

/**
 * Selects the SQLite autoincrement counter for the task table
 */
function selectTaskAutoIncrement (setter)
{
    let sql = "SELECT seq FROM sqlite_sequence " +
    "WHERE name = \"task\";"
    cleaningDb.transaction(tx => { tx.executeSql(
            sql,
            null,
            (_txObj, data) => {setter(data.rows._array)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "selectTaskAutoIncrement: " + err)},
        )
    })
}


/**
 * Selects all location records
 */
function selectAllLocations (setter)
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "SELECT * FROM location;",
            null,
            (_txObj, data) => {setter(data.rows._array)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "selectAllLocations: " + err)},
        )
    })
}

/**
 * Selects all location records with column aliases to match the structure of locationlistitem objects
 */
function selectAllLocationsWithAliases (setter)
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "SELECT loc_id AS id, loc_name AS name " + 
            "FROM location;",
            null,
            (_txObj, data) => {setter(data.rows._array)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "selectAllLocations: " + err)},
        )
    })
}

/**
 * Selects a specified location record
 */
function selectLocationById (setter, locId)
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "SELECT * FROM location " +
            "WHERE loc_id = ?;",
            [locId],
            (_txObj, data) => {setter(data.rows._array)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "selectLocationById: " + err)},
        )
    })
}

/**
 * Selects all task records
 * @param setter the 'useState' setter to return the array of results to 
 */
function selectAllTasks (setter)
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "SELECT * FROM task;",
            null,
            (_txObj, data) => {setter(data.rows._array)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "selectAllTasks: " + err)},
        )
    })
}

/**
 * Selects all log records
 * @param setter the 'useState' setter to return the array of results to 
 */
function selectHistoryCustom (setter)
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "SELECT * FROM log " +
            "INNER JOIN task on task.task_id = log.task_id " +
            "INNER JOIN location on location.loc_id = task.loc_id " +
            "ORDER BY log_time DESC " +
            "LIMIT 30;",
            null,
            (_txObj, data) => {setter(data.rows._array)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "selectHistoryCustom: " + err)},
        )
    })
}

/**
 * Selects all uncompleted tasks that are due from 7 days ago, to 7 days ahead, with their respective locations
 * @param setter the 'useState' setter to return the array of results to 
 */
function selectTodoCustom (setter)
{
   let sevenDaysBehind = dayjs().subtract(7, 'day').unix() * 1000
   let sevenDaysAhead = dayjs().add(7, 'day').unix() * 1000
    
    cleaningDb.transaction(tx => { tx.executeSql(
            "SELECT * FROM task " + 
            "INNER JOIN location on location.loc_id = task.loc_id " +
            "WHERE task_completed = 0 AND task_due >= " + sevenDaysBehind + " AND task_due <= " + sevenDaysAhead + " " +
            "ORDER BY task_due ASC;",
            null,
            (_txObj, data) => {setter(data.rows._array)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "selectTodoCustom: " + err)},
        )
    })
}

/**
 * Selects all repeating tasks
 * @param setter the 'useState' setter to return the array of results to
 */
function selectRoutineCustom (setter)
{   
    cleaningDb.transaction(tx => { tx.executeSql(
            "SELECT * FROM task " + 
            "INNER JOIN location on location.loc_id = task.loc_id " +
            "WHERE task_repeat_freq_days > 0 " +
            "ORDER BY task_repeat_freq_days ASC, task_name DESC;",
            null,
            (_txObj, data) => {setter(data.rows._array)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "selectTodoCustom: " + err)},
        )
    })
}

/**
 * Selects all tasks with the specified 'task_completed' value
 * @param setter the 'useState' setter to return the array of results to
 * @param taskCompleted return tasks with this 'task_completed' value (e.g., 0)
 */
function selectTasksByCompletion (setter, taskCompleted)
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "SELECT * FROM task " +
            "WHERE task_completed = ?;",
            [taskCompleted],
            (_txObj, data) => {setter(data.rows._array)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "selectTasksByCompletion: " + err)},
        )
    })
}

/**
 * Updates the specified location with the specified name
 * @param locName
 * @param locId the 'loc_id' of the task to be updated with the above values
 */
function updateLocation (locName, locId)
{
    let sql = 
    "UPDATE location " +
    "SET loc_name = ?, " +
    "WHERE loc_id = ?;" //2 wildcards for the 2 parameters, which must be provided in the prescribed order. This approach minimises the threat of SQL injection.
    cleaningDb.transaction(tx => { tx.executeSql(
            sql,
            [locName, locId],
            (_txObj, data) => {console.log("Executed: " + sql + ", Data: " + JSON.stringify(data))},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "updateLocation: " + err)},
        )
    })
}

/**
 * Updates the specified task with the specified values
 * @param taskName 
 * @param taskLevel 
 * @param taskDurationMins 
 * @param taskCompleted 
 * @param taskCanBeDoneAdvance 
 * @param taskHasReminders
 * @param taskSet 
 * @param taskDue 
 * @param taskRepeatFreqDays 
 * @param taskMotivation 
 * @param taskPrevCompletedTimes 
 * @param taskPrevCompletedLast 
 * @param locId 
 * @param taskId the 'task_id' of the task to be updated with the above values
 */
function updateTask (taskName, taskLevel, taskDurationMins, taskCompleted, taskCanBeDoneAdvance, taskHasReminders, taskSet, taskDue, taskRepeatFreqDays, taskMotivation, taskPrevCompletedTimes, taskPrevCompletedLast, locId, taskId)
{
    let sql = 
    "UPDATE task " +
    "SET task_name = ?, " +
        "task_level = ?, " +
        "task_duration_mins = ?, " +
        "task_completed = ?, " +
        "task_can_be_done_advance = ?, " +
        "task_has_reminders = ?, " +
        "task_set = ?, " +
        "task_due = ?, " +
        "task_repeat_freq_days = ?, " +
        "task_motivation = ?, " +
        "task_prev_completed_times = ?, " +
        "task_prev_completed_last = ?, " +
        "loc_id = ? " +
    "WHERE task_id = ?;" //13 wildcards for the 13 parameters, which must be provided in the prescribed order. This approach minimises the threat of SQL injection.
    cleaningDb.transaction(tx => { tx.executeSql(
            sql,
            [taskName, taskLevel, taskDurationMins, taskCompleted, taskCanBeDoneAdvance, taskHasReminders, taskSet, taskDue, taskRepeatFreqDays, taskMotivation, taskPrevCompletedTimes, taskPrevCompletedLast, locId, taskId],
            (_txObj, data) => {console.log("Executed: " + sql + ", Data: " + JSON.stringify(data))},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "updateTask: " + err)},
        )
    })
}

/**
 * Updates the completion status of a specified task
 * @param taskCompleted update the specified task with this 'task_completed' value (e.g., 1)
 * @param taskId the 'task_id' of the task to be updated with the above values
 */
function updateTaskCompletion (taskCompleted, taskId)
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "UPDATE task " +
            "SET task_completed = ? " +
            "WHERE task_id = ?;",
            [taskCompleted, taskId],
            (_txObj, data) => {console.log(data)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "updateTaskCompletion: " + err)},
        )
    })
}

/**
 * Deletes all locations (but the table will still exist afterwards)
 */
function deleteAllLocations ()
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "DELETE FROM location;",
            null,
            (_txObj, data) => {console.log(data)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "deleteAllLocations: " + err)},
        )
    })
}

/**
 * Deletes a specified task
 * @param taskId the 'task_id' of the task to be deleted
 */
function deleteTask (taskId)
{
    cleaningDb.transaction(tx => { tx.executeSql(
            "DELETE FROM task " +
            "WHERE task_id = ?;",
            [taskId],
            (_txObj, data) => {console.log(data)},
            (_txObj, err) => {console.log(cleaningDbLogPrefix + "deleteTask: " + err)},
        )
    })
}

//Wrap up functions as an object
const LocalCleaningDB = {
    createLocationTable,
    createTaskTable,
    createLogTable,
    createAllTablesInOrder,
    dropTableByName,
    dropAllTablesInOrder,
    insertLocation,
    insertDummyLocations,
    insertTask,
    insertDummyTasks,
    insertLog,
    selectTaskAutoIncrement,
    selectAllLocations,
    selectAllLocationsWithAliases,
    selectLocationById,
    selectAllTasks,
    selectHistoryCustom,
    selectTodoCustom,
    selectRoutineCustom,
    selectTasksByCompletion,
    updateLocation,
    updateTask,
    updateTaskCompletion,
    deleteAllLocations,
    deleteTask
}
    
export default LocalCleaningDB