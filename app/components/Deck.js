import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';

import Waveform from "./Waveform";
import SelectTune from "./SelectTune";

class Deck extends Component {

    state = {
        artist: "",
        song: "",
        userTunes: this.props.userTunes,
        selectTuneEnabled: false,
        isPlaying: false,
        playbackInstance: null,
        volume: 1.0,
        isBuffering: false,
        pitchControl: 1,
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

    playbackInstance = null;


    async componentDidMount() {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
            shouldDuckAndroid: true,
            staysActiveInBackground: true,
            playThroughEarpieceAndroid: true
          })
        } catch (e) {
          console.log(e)
        }
      }


    async loadAudio(uri) {
        this.setState({
            pitchControl: 1,
        })
        const {pitchControl, volume} = this.state;
        try {
                const playbackInstance = new Audio.Sound()
                const source = {
                    uri: uri
            }
        
            const status = {
                shouldPlay: false,
                volume: volume,
                rate: pitchControl,
                shouldCorrectPitch: false,
                isMuted: false
            }
        
            playbackInstance.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate)     
            await playbackInstance.loadAsync(source, status, false)
            this.setState({
                playbackInstance: playbackInstance,
                isPlaying: false,
            })
            } catch (e) {
            console.log(e)
        }
    }

    onPlaybackStatusUpdate = status => {
        this.setState({
            isBuffering: status.isBuffering
        })
    }

    loadTrack = () => {
        this.setState({
            selectTuneEnabled: true,
        })
    }

    play = () => {
        this.state.playbackInstance.playAsync();
        this.setState({
            isPlaying: true,
        })
    }

    pause = () => {
        this.state.playbackInstance.pauseAsync();
        this.setState({
            isPlaying: false,
        })
    }

    nudgeUp = () => {
        this.pitchUp();
        setTimeout(() => {
            this.pitchDown();
        }, 50)
    }

    nudgeDown = () => {
        this.pitchDown();
        setTimeout(() => {
            this.pitchUp();
        }, 50)
    }

    pitchUp = () => {
        let pitch = this.state.pitchControl;
        let newPitch = pitch * 999/1000;
        this.setState({
            pitchControl: newPitch,
        });
        this.state.playbackInstance.setStatusAsync({
            rate: newPitch,
        })
    }

    pitchDown = () => {
        let pitch = this.state.pitchControl;
        let newPitch = (pitch * 1000/999);
        this.setState({
            pitchControl: newPitch,
        });
        this.state.playbackInstance.setStatusAsync({
            rate: newPitch,
        })
    }

    selectTrack = async (artist, title, uri) => {

        if(this.state.isPlaying){
            alert("Still playing track")
        }else{
            if(this.state.playbackInstance){
                await this.state.playbackInstance.unloadAsync();
            }
            this.setState({
                artist: artist,
                song: title,
                selectTuneEnabled: false,
                playbackInstance: null,
            })
            this.loadAudio(uri)
        }
    }

    render = () => {
        if(this.state.selectTuneEnabled){
            return (
                <View style={styles.container}>
                    <View style={styles.title}>
                        <Text 
                            style={[styles.titleText, {color: this.props.color}]}
                            numberOfLines={1}
                        >
                            {this.state.artist + " - " + this.state.song}
                        </Text>
                    </View>
                    <SelectTune userTunes={this.state.userTunes} selectTuneEnabled={this.state.selectTuneEnabled} selectTrack={this.selectTrack}/>
                </View>
            )
        }else{
            return (
                <View style={styles.container}>
                    <View style={styles.title}>
                        <Text 
                            style={[styles.titleText, {color: this.props.color}]}
                            numberOfLines={1}
                        >
                            {this.state.artist + " - " + this.state.song}
                        </Text>
                    </View>
    
                    <View style={[styles.Component, styles.mainElement, {flex: 1.5}]}>
                        <Waveform></Waveform>
                    </View>
    
                    <View style={[styles.Component, styles.mainElement, {flex: 1, flexDirection: "row"}]}>
                        <TouchableOpacity style={{flex: 1}} onPress={this.play}>
                            <View style={styles.playButton}>
                                <SimpleLineIcons name="control-play" adjustsFontSizeToFit size={30} color={this.props.color} />
                            </View>
                        </TouchableOpacity>
                        <View style={{width: 10}} />
                        <TouchableOpacity style={{flex: 1}} onPress={this.pause}>
                            <View style={styles.playButton}>
                                <SimpleLineIcons name="control-pause" adjustsFontSizeToFit size={30} color={this.props.color} />
                            </View>
                        </TouchableOpacity>
                        <View style={{width: 10}} />
                        <TouchableOpacity style={{flex: 1}} onPress={this.loadTrack}>
                            <View style={styles.playButton}>
                                <AntDesign name="addfile" adjustsFontSizeToFit size={30} color={this.props.color} />
                            </View>
                        </TouchableOpacity>
                    </View>
    
                    <View style={[styles.Component, styles.mainElement, {flex: 1, flexDirection: "row"}]}>
                        <TouchableOpacity style={{flex: 1}} onPress={this.nudgeDown}>
                            <View style={styles.playButton}>
                                <SimpleLineIcons name="control-rewind" adjustsFontSizeToFit size={30} color={this.props.color} />
                            </View>
                        </TouchableOpacity>
                        <View style={{width: 10}} />
                        <TouchableOpacity style={{flex: 1}} onPress={this.pitchUp}>
                            <View style={styles.playButton}>
                                <SimpleLineIcons name="minus" adjustsFontSizeToFit size={30} color={this.props.color} />
                            </View>
                        </TouchableOpacity>
                        <View style={{width: 10}} />
                        <TouchableOpacity style={{flex: 1}} onPress={this.pitchDown}>
                            <View style={styles.playButton}>
                                <SimpleLineIcons name="plus" adjustsFontSizeToFit size={30} color={this.props.color} />
                            </View>
                        </TouchableOpacity>
                        <View style={{width: 10}} />
                        <TouchableOpacity style={{flex: 1}} onPress={this.nudgeUp}>
                            <View style={styles.playButton}>
                                <SimpleLineIcons name="control-forward" adjustsFontSizeToFit size={30} color={this.props.color} />
                            </View>
                        </TouchableOpacity>
                    </View>
    
                    <View style={[styles.Component, styles.mainElement, {flex: 1, flexDirection: "row"}]}>
                        <View style={styles.eqComponent}>
                            <View style={styles.eqTextContainer}>
                                <Text style={[styles.eqText, {color: this.props.color}]}>
                                    Low
                                </Text> 
                            </View>
                            <View style={styles.eqSlider}>
                                <Slider
                                    style={{width: "100%", height: 20}}
                                    minimumValue={0}
                                    maximumValue={1}
                                    value={1}
                                    minimumTrackTintColor={this.props.color}
                                    maximumTrackTintColor="#e3e3e3"
                                    thumbTintColor={this.props.color}
                                />
                            </View>
                        </View>
                        <View style={styles.eqComponent}>
                            <View style={styles.eqTextContainer}>
                                <Text style={[styles.eqText, {color: this.props.color}]}>
                                    Mid
                                </Text> 
                            </View>
                            <View style={styles.eqSlider}>
                                <Slider
                                    style={{width: "100%", height: 20}}
                                    minimumValue={0}
                                    maximumValue={1}
                                    value={1}
                                    minimumTrackTintColor={this.props.color}
                                    maximumTrackTintColor="#e3e3e3"
                                    thumbTintColor={this.props.color}
                                />
                            </View>
                        </View>
                        <View style={styles.eqComponent}>
                            <View style={styles.eqTextContainer}>
                                <Text style={[styles.eqText, {color: this.props.color}]}>
                                    Hi
                                </Text> 
                            </View>
                            <View style={styles.eqSlider}>
                                <Slider
                                    style={{width: "100%", height: 20}}
                                    minimumValue={0}
                                    maximumValue={1}
                                    value={1}
                                    minimumTrackTintColor={this.props.color}
                                    maximumTrackTintColor="#e3e3e3"
                                    thumbTintColor={this.props.color}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            )
        }
    }
}




const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    Component: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    mainElement: {
        marginTop: 10,
    },
    title: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    titleText: {
        fontSize: 15,   
    },
    playButton: {
        flex: 1,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: "#e3e3e3"
    },
    eqComponent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
    },
    eqText: {
        opacity: 0.5,
    },
    eqSlider: {
        width: "100%",
    },
    eqTextContainer: {
        margin: 10,
    }
})

export default Deck;