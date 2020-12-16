import React, { Component } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";

class SelectTune extends Component {

    state = {
        userTunes: this.props.tuneData,
    }

    static getDerivedStateFromProps = (newProps, oldProps) => {
        if((oldProps.userTunes !== newProps.userTunes)){
          return {
            userTunes: newProps.userTunes,
          }
        }else{
          return null;
        }
      }

    getTuneData = () => {
        let array = [];
        this.state.userTunes.forEach((tune, index) => {
            let artist = tune.filename;
            let title = "";
            if(tune.metadata != null && tune.metadata != undefined){
                if(tune.metadata.title == null || tune.metadata.title == undefined || tune.metadata.title.length == 0){
                    title = "Unknown Title";
                }else{
                    title = tune.metadata.title
                }
                if(tune.metadata.artist == null || tune.metadata.artist == undefined || tune.metadata.artist.length == 0){
                    artist = "Unknown Artist";
                }else{
                    artist = tune.metadata.artist;
                }
            }
            let titleComponent = () => {
                if(title.length > 0){
                    return (
                        <View style={[styles.data, {flex: 1.65}]}>
                            <Text numberOfLines={1}>{title}</Text>
                        </View>
                    )
                }
            }
            array.push(
                <TouchableOpacity key={index} onPress={() => {
                    this.props.selectTrack(artist, title, tune.uri)
                }}>
                    <View style={styles.tune}>
                        <View style={[styles.data, {flex: 1}]}>
                            <Text numberOfLines={1}>{artist}</Text>
                        </View>
                        {titleComponent()}
                    </View>
                </TouchableOpacity>
            )
        })
        return array;
    }

    render = () => {
        return (
            <ScrollView style={styles.container}>
                {this.getTuneData()}
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
    },
    tune: {
        width: "100%",
        height: 50,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    data: {
        height: "100%",
        justifyContent: "center",
    }
})

export default SelectTune;