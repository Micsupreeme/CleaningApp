import { React, useState }  from 'react'
import { StyleSheet, View, TouchableHighlight, TextInput } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const EditableLocationListItem = (props) => {

    const [roomName, setRoomName] = useState(props.locationItem.name)

    /**
     * Render block
     */
    return (
        <View style={Styles.wrapper}>
            <TextInput
                value={roomName}
                onChangeText={(value) => setRoomName(value)}
                style={Styles.textInput}/>
            <TouchableHighlight 
                    activeOpacity={0.6}
                    underlayColor='#F4F4F4'
                    onPress={props.onPress(roomName)}
            >
                <MaterialCommunityIcons name="check" size={28} color="#F4F4F4"/>
            </TouchableHighlight>
        </View>
    )
}

/**
 * CSS
 */
const Styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
        marginHorizontal: 10,
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 10
    },

    textInput: {
        flex: 1
    },

    roomName: {
        fontSize: 16
    },
}) 

export default EditableLocationListItem