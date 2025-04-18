import { React }  from 'react'
import { StyleSheet, View, TouchableHighlight, Text } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const LocationListItem = (props) => {

    /**
     * Render block
     */
    return (
        <View style={Styles.wrapper}>
            <Text style={Styles.roomName}>{props.locationItem.name}</Text>
            <TouchableHighlight 
                    activeOpacity={0.6}
                    underlayColor='#F4F4F4'
                    onPress={props.onPress}
            >
                <MaterialCommunityIcons name="close" size={28} color="black"/>
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

    roomName: {
        fontSize: 16
    },
}) 

export default LocationListItem