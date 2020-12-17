import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import * as FileSystem from 'expo-file-system';

class Waveform extends Component {

    state = {
        uri: null,
    }

    componentDidMount = () => {

        // setTimeout(async () => {
        //     console.log(this.state.uri)
        //     if(this.state.uri != null){
        //         const audioFileAsString = await FileSystem.readAsStringAsync(this.state.uri , {
        //             encoding: FileSystem.EncodingType.UTF8,
        //        });

        //         // let first = fileBase64.substring(0,10000)
        //         let json = JSON.stringify(audioFileAsString)
        //         console.log(json)

        //     }
        // }, 5000)

    }

    static getDerivedStateFromProps = (newProps, oldProps) => {
        if (oldProps.uri !== newProps.uri) {
            return {
                uri: newProps.uri,
            }
        } else {
            return null;
        }
    }

    render = () => {
        return (
            <View style={styles.container}>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
    }
})

export default Waveform;