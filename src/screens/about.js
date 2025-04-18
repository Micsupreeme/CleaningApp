import { React } from 'react'
import { View, Text, StyleSheet, TouchableHighlight, Image, Linking, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const About = () => {

    /**
     * Asynchronously opens the specified link if it is supported (e.g., valid https or http)
     */
    openLink = async (url) => {
        const linkIsSupported = await Linking.canOpenURL(url)

        if (linkIsSupported) {
            await Linking.openURL(url)
        } else {
            console.log("Cannot open url \"" + url + "\"")
        }
    }

    /**
     * Render block
     */
    return (
        <ScrollView style={Styles.wrapper}>
            <Text style={Styles.title}>CleaningApp</Text>
            <Image
                source={require("../../assets/icon.png")}
                style={Styles.logo}
                alt={"CleaningApp logo"}
            />
            <View style={Styles.sectionWrapper}>
                <Text style={Styles.bodyText}>
                    A lifestyle management app that helps you to stay on top of the household cleaning tasks.{"\n\n"}
                    CleaningApp provides full flexibility in terms of naming tasks and naming the rooms in your home,
                    which you can change at any time. It enables you to schedule both one-time tasks and automatically
                    repeating tasks. The "Routine" screen keeps track of repeating tasks and their estimated durations,
                    and you can enable due date notifications on a per-task basis.
                </Text>
            </View>
            <View style={Styles.sectionWrapper}>
                <View style={Styles.rowWrapper}>
                    <MaterialCommunityIcons name="source-commit" size={24} color="black" style={Styles.inlineIcon}/>
                    <Text style={Styles.bodyText}>Version 1.0.0</Text>
                </View>
            </View>
            <View style={Styles.sectionWrapper}>
                <View style={Styles.rowWrapper}>
                    <Text style={Styles.bodyText}>Developed by</Text>
                    <TouchableHighlight
                        onPress={() => openLink("https://github.com/Micsupreeme")}
                    >
                        <Text style={Styles.linkText}>Michael Whatley</Text>
                    </TouchableHighlight>
                </View>
                <View style={Styles.rowWrapper}>
                    <Text style={Styles.bodyText}>© 2023</Text>
                </View>
            </View>
        </ScrollView>
    )
}

/**
 * CSS
 */
const Styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#3C3C3C',
        paddingBottom: 20,
        paddingHorizontal: 20
    },

    sectionWrapper: {
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20
    },

    rowWrapper: {
        flexDirection: 'row',
        alignSelf: 'center'
    },

    developerWrapper: {
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        flexDirection: 'row',
        alignSelf: 'center'
    },

    title: {
        fontSize: 24,
        textAlign: 'center',
        color:'#F4F4F4',
        marginTop: 20
    },

    bodyText: {
        fontSize: 18
    },

    linkText: {
        fontSize: 18,
        textDecorationLine: 'underline',
        color: 'royalblue',
        marginHorizontal: 5
    },

    logo: {
        resizeMode: 'center',
        width: '100%',
        height: 300,
        borderRadius: 10,
        marginVertical: 20
    }
})

export default About