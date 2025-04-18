import { React } from 'react'
import { StyleSheet, View, TouchableHighlight, Text } from 'react-native'
import dayjs from 'dayjs'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const LogListItem = (props) => {

    const formattedDate = dayjs.unix(props.logItem.log_time).format("DD-MM-YY")
    const formattedTime = dayjs.unix(props.logItem.log_time).format("HH:mm:ss")
    let actionString = ""

    /**
     * Formats a specified string so that it starts a new line every charLimit characters
     * @param stringToWrap the input string to be formatted
     * @param charLimit the maximum number of characters for a single line
     * @returns the input string, but separated with "-\n" every charLimit characters
     */
    function wrapString(stringToWrap, charLimit) {
        var substringArray = []
        let wrappedString = ""

        for (var i = 0; i < stringToWrap.length; i += charLimit) {
            substringArray.push(stringToWrap.substring(i, i + charLimit))
        }

        for (var i = 0; i < substringArray.length; i += 1) {
            if (i == substringArray.length - 1) {
                wrappedString += substringArray[i]
            } else {
                wrappedString += substringArray[i] + "-\n"
            }
        }
        return wrappedString
    }

    /**
     * Returns the "log type" component for the specified log type
     * @param logType 
     * @returns the "log type" component for the specified log type
     */
    function renderLogType(logType) {
        switch (logType) {
            case 1:
                actionString = "Scheduled"
                return(
                    <View style={Styles.logTypeWrapper}>
                        <MaterialCommunityIcons name="calendar-plus" size={24} color="black"/>
                        <Text style={Styles.actionString}>{actionString}</Text>
                    </View>
                )
            case 2:
                actionString = "Completed\n" +
                               "& rescheduled"
                return(
                    <View style={Styles.logTypeWrapper}>
                        <MaterialCommunityIcons name="party-popper" size={24} color="black"/>
                        <Text style={Styles.actionString}>{actionString}</Text>
                    </View>
                )
            case 3:
                actionString = "Completed"
                return(
                    <View style={Styles.logTypeWrapper}>
                        <MaterialCommunityIcons name="party-popper" size={24} color="black"/>
                        <Text style={Styles.actionString}>{actionString}</Text>
                    </View>
                )
            case 4:
                actionString = "Updated"
                return(
                    <View style={Styles.logTypeWrapper}>
                        <MaterialCommunityIcons name="calendar-edit" size={24} color="black"/>
                        <Text style={Styles.actionString}>{actionString}</Text>
                    </View>
                )
            case 5:
                actionString = "Rescheduled"
                return(
                    <View style={Styles.logTypeWrapper}>
                        <MaterialCommunityIcons name="calendar-arrow-right" size={24} color="black"/>
                        <Text style={Styles.actionString}>{actionString}</Text>
                    </View>
                )
            case 6: //not currently used, as a "deleted" log item would link to a missing task record
                actionString = "Deleted"
                return(
                    <View style={Styles.logTypeWrapper}>
                        <MaterialCommunityIcons name="calendar-remove" size={24} color="black"/>
                        <Text style={Styles.actionString}>{actionString}</Text>
                    </View>
                )
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
                            <Text>{formattedDate}</Text>
                            <Text>{formattedTime}</Text>
                        </View>
                        {renderLogType(props.logItem.log_type)}
                    </View> 
                    <View>
                        <Text>"{wrapString(props.logItem.task_name, 27)}"</Text>
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
        
    }
}) 

export default LogListItem