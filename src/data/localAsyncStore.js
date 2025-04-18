import AsyncStorage from '@react-native-async-storage/async-storage'
const asyncStoreLogPrefix = "[AsyncStore] "
const asyncUserKey = '@user'

/**
 * Increments the 'launches' value of the specified user object by 1
 * @param userObject the user object to store in async storage, under the '@user' key
 * NOTE: This function is not currently used,
 * but it could be used for a gamification badge based on the number of times the user has launched the app
 */
async function incrementAsyncUserLaunches(userObject) {
    try {
        userObject.launches = userObject.launches + 1
        const jsonValue = JSON.stringify(userObject)
        await AsyncStorage.setItem(asyncUserKey, jsonValue)
        console.log(asyncStoreLogPrefix + "incremented async user launches")
      } catch(e) {
        console.log(asyncStoreLogPrefix + "increment async user launches error")
      }
}

/**
 * Sets the async storage '@user' item to the JSON value of the specified user object
 * @param userObject the user object to store in async storage, under the '@user' key
 */
async function setAsyncUser(userObject) {
    try {
        const jsonValue = JSON.stringify(userObject)
        await AsyncStorage.setItem(asyncUserKey, jsonValue)
        console.log(asyncStoreLogPrefix + "set async user")
      } catch(e) {
        console.log(asyncStoreLogPrefix + "set async user error")
      }
}

/**
 * Gets the async storage '@user' object, if it exists
 * @returns the user object, if it exists, otherwise null
 */
async function getAsyncUser() {
    try {
        const jsonValue = await AsyncStorage.getItem(asyncUserKey)
        if (jsonValue != null) {
            const parsedObj = JSON.parse(jsonValue)
            //console.log(asyncStoreLogPrefix + "got async user")
            return parsedObj
        } else {
            console.log(asyncStoreLogPrefix + "got null instead of user")
            return null
        }
    } catch(e) {
        console.log(asyncStoreLogPrefix + "get async user error")
    }       
}

/**
 * Deletes the async storage '@user' object, if it exists
 */
async function deleteAsyncUser() {
    try {
        await AsyncStorage.removeItem(asyncUserKey)
        console.log(asyncStoreLogPrefix + "deleted async user")
    } catch(e) {
        console.log(asyncStoreLogPrefix + "delete async user error")
    }       
}

//Wrap up functions as an object
const LocalAsyncStore = {
    setAsyncUser,
    incrementAsyncUserLaunches,
    getAsyncUser,
    deleteAsyncUser
}
    
export default LocalAsyncStore