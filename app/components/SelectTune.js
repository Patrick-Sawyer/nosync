import React, { Component } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import MusicInfo from 'expo-music-info';

const jsmediatags = require('jsmediatags');

class SelectTune extends Component {

    state = {
        userTunes: this.props.tuneData,
    }

    static getDerivedStateFromProps = (newProps, oldProps) => {
        if(oldProps.userTunes !== newProps.userTunes){
          return {
            userTunes: newProps.userTunes,
          }
        }else{
          return null;
        }
      }

    updateTuneData() {
        for (let i = 0; i < this.state.userTunes.length; i++) {
            //this.getTuneTitleAndArtist(i);
            this.blah(i)
        }
      }

    blah = (i) => {
        let tune = this.state.userTunes[i];
        new Promise((resolve, reject) => {
            new jsmediatags.Reader(tune.uri)
              .read({
                onSuccess: (tag) => {
                  console.log('Success!');

                },
                onError: (error) => {
                  console.log('Error');

                }
            });
          })
            .then(tagInfo => {
              console.log(tagInfo)
            })
            .catch(error => {
                console.log(error)
            });
    }
    
    // async getTuneTitleAndArtist(i) {
    //     let tune = this.state.userTunes[i];
    //     const metadata = await MusicInfo.getMusicInfoAsync(tune.uri, {
    //         title: true,
    //         artist: true,
    //     });
    //     let array = [...this.state.userTunes];
    //     array[i].metadata = metadata;
    //     this.setState({
    //         userTunes: array
    //     })

    // }

    componentDidMount = () => {
        this.updateTuneData();
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