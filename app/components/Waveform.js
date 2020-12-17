import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";

class Waveform extends Component {

    state = {
        uri: this.props.uri,
    }

    componentDidMount = () => {
    
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