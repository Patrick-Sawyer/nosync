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
        displayPitch: 1,
    }

    upDatevolume = (newVolume) => {
        this.setState({
            volume: newVolume,
        });
        if (this.state.playbackInstance != null) {
            this.state.playbackInstance.setStatusAsync({
                volume: newVolume,
            })
        }
    }

    static getDerivedStateFromProps = (newProps, oldProps) => {
        if (oldProps.userTunes !== newProps.userTunes) {
            return {
                userTunes: newProps.userTunes,
            }
        } else {
            return null;
        }
    }

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
        const { volume } = this.state;
        try {
            const playbackInstance = new Audio.Sound()
            const source = {
                uri: uri
            }

            const status = {
                shouldPlay: false,
                volume: volume,
                rate: 1,
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
        if (this.state.playbackInstance != null) {
            this.state.playbackInstance.playAsync();
            this.setState({
                isPlaying: true,
            })
        }
    }

    pause = () => {
        if (this.state.playbackInstance != null) {
            this.state.playbackInstance.pauseAsync();
            this.setState({
                isPlaying: false,
            })
        }
    }

    nudgeTouch = (change) => {
        this.pitchChange(change, true);
    }

    pitchChange = (change, nudge = false) => {
        let newPitch = this.state.pitchControl + change;
        if (!nudge) {
            this.setState({
                pitchControl: newPitch,
                displayPitch: newPitch,
            });
        }
        if (this.state.playbackInstance != null) {
            this.state.playbackInstance.setStatusAsync({
                rate: newPitch,
            })
        }
    }

    getPitchAsPercentage = () => {
        let value = "";
        console.log(this.state.displayPitch)
        if(this.state.displayPitch > 1){
            value = "+";
        }
        value += ((this.state.displayPitch - 1) * 100).toFixed(2) + "%"
        return value 
    }

    selectTrack = async (artist, title, uri) => {

        if (this.state.isPlaying) {
            alert("Still playing track")
            this.setState({
                selectTuneEnabled: false,
            })
        } else {
            if (this.state.playbackInstance) {
                await this.state.playbackInstance.unloadAsync();
            }
            this.setState({
                artist: artist,
                song: title,
                isPlaying: false,
                playbackInstance: null,
                volume: 1.0,
                isBuffering: false,
                pitchControl: 1,
                displayPitch: 1,
                selectTuneEnabled: false,
            })
            this.loadAudio(uri)
        }
    }

    playButtonTemplate = (name, onpress) => {
        return (
            <TouchableOpacity style={{ flex: 1 }} onPress={onpress}>
                <View style={styles.playButton}>
                    <SimpleLineIcons name={name} adjustsFontSizeToFit size={30} color={this.props.color} />
                </View>
            </TouchableOpacity>
        )
    }

    playButton = () => {
        return !this.state.isPlaying ? this.playButtonTemplate("control-play", this.play) : this.playButtonTemplate("control-pause", this.pause);
    }

    pitchSliderValueChange = (value) => {
        this.setState({
            pitchControl: value,
        })
        if (this.state.playbackInstance != null) {
            this.state.playbackInstance.setStatusAsync({
                rate: value,
            })
        }
    }

    render = () => {
        if (this.state.selectTuneEnabled) {
            return (
                <View style={styles.container}>
                    <View style={styles.title}>
                        <Text
                            style={[styles.titleText, { color: this.props.color }]}
                            numberOfLines={1}
                        >
                            {this.state.artist + " - " + this.state.song}
                        </Text>
                    </View>
                    <SelectTune userTunes={this.state.userTunes} selectTuneEnabled={this.state.selectTuneEnabled} selectTrack={this.selectTrack} />
                </View>
            )
        } else {
            return (
                <View style={styles.container}>
                    <View style={styles.title}>
                        <Text
                            style={[styles.titleText, { color: this.props.color }]}
                            numberOfLines={1}
                        >
                            {this.state.artist + " - " + this.state.song}
                        </Text>
                    </View>

                    <View style={[styles.Component, styles.mainElement, { flex: 1 }]}>
                        <Waveform></Waveform>
                    </View>

                    <View style={[styles.Component, styles.mainElement, { flex: 1, flexDirection: "row" }]}>
                        <TouchableOpacity 
                            style={{ flex: 1 }}
                            onPress={() => {
                                if(this.state.playbackInstance != null){
                                    this.state.playbackInstance.setPositionAsync(0)
                                }
                            }}
                        >
                            <View style={[styles.playButton, { padding: 0 }]}>
                                <Text
                                    adjustsFontSizeToFit
                                    numberOfLines={1}
                                    style={{
                                        fontSize: 30,
                                        color: this.props.color
                                    }}
                                >CUE</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ width: 10 }} />
                        {this.playButton()}
                        <View style={{ width: 10 }} />
                        <TouchableOpacity style={{ flex: 1 }} onPress={this.loadTrack}>
                            <View style={styles.playButton}>
                                <AntDesign name="addfile" adjustsFontSizeToFit size={30} color={this.props.color} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.Component, styles.mainElement, { flex: 1, flexDirection: "row" }]}>
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPressIn={() => this.pitchChange(-0.0001)}
                            delayLongPress={200}
                            onLongPress={() => {
                                this.setState({
                                    longPressDown: setInterval(() => {
                                        this.pitchChange(-0.0050)
                                    }, 500)
                                })
                            }}
                            onPressOut={() => {
                                if (this.state.longPressDown != null) {
                                    clearInterval(this.state.longPressDown);
                                    this.setState({
                                        longPressDown: null,
                                    })
                                }
                            }}

                        >
                            <View style={styles.playButton}>
                                <SimpleLineIcons name="minus" adjustsFontSizeToFit size={30} color={this.props.color} />
                            </View>
                        </TouchableOpacity>
                        <View style={{ width: 10 }} />
                        <View style={{ width: 50, alignItems: "center" }}>
                            <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: this.props.color, textAlign: "center" }}>
                                {"Pitch:"}
                            </Text>
                            <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: this.props.color, textAlign: "center" }}>
                                {this.getPitchAsPercentage()}
                            </Text>
                        </View>
                        <View style={{ width: 10 }} />
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPressIn={() => this.pitchChange(0.0001)}
                            delayLongPress={200}
                            onLongPress={() => {
                                this.setState({
                                    longPressUp: setInterval(() => {
                                        this.pitchChange(0.0050)
                                    }, 500)
                                })
                            }}
                            onPressOut={() => {
                                if (this.state.longPressUp != null) {
                                    clearInterval(this.state.longPressUp);
                                    this.setState({
                                        longPressUp: null,
                                    })
                                }
                            }}
                        >
                            <View style={styles.playButton}>
                                <SimpleLineIcons name="plus" adjustsFontSizeToFit size={30} color={this.props.color} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.Component, styles.mainElement, { flex: 1, flexDirection: "row"}]}>
                        <TouchableOpacity
                            style={{ width: 30, height: "100%", justifyContent: "center", alignItems: "flex-start" }}
                            onPressIn={() => this.nudgeTouch(-0.03)}
                            onPressOut={() => this.nudgeTouch(0)}
                        >
                            <SimpleLineIcons name="arrow-left" adjustsFontSizeToFit size={30} color={this.props.color} />
                        </TouchableOpacity>
                        <Slider
                            style={{ height: 20, flexGrow: 1 }}
                            minimumValue={0.92}
                            maximumValue={1.08}
                            value={this.state.pitchControl}
                            minimumTrackTintColor={this.props.color}
                            maximumTrackTintColor={"#e3e3e3"}
                            onSlidingComplete={(value) => {
                                this.pitchSliderValueChange(value)
                            }}
                            onValueChange={(value) => {
                                this.setState({
                                    displayPitch: value
                                })
                            }}
                            thumbTintColor={this.props.color}
                        />
                        <TouchableOpacity
                            style={{ width: 30, height: "100%", justifyContent: "center", alignItems: "flex-end" }}
                            onPressIn={() => this.nudgeTouch(0.03)}
                            onPressOut={() => this.nudgeTouch(0)}
                        >
                            <SimpleLineIcons name="arrow-right" adjustsFontSizeToFit size={30} color={this.props.color} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.Component, styles.mainElement, { flex: 1, flexDirection: "row" }]}>
                        <View style={styles.eqComponent}>
                            <View style={styles.eqTextContainer}>
                                <Text style={[styles.eqText, { color: this.props.color }]}>
                                    Low
                                </Text>
                            </View>
                            <View style={styles.eqSlider}>
                                <Slider
                                    style={{ width: "100%", height: 20 }}
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
                                <Text style={[styles.eqText, { color: this.props.color }]}>
                                    Mid
                                </Text>
                            </View>
                            <View style={styles.eqSlider}>
                                <Slider
                                    style={{ width: "100%", height: 20 }}
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
                                <Text style={[styles.eqText, { color: this.props.color }]}>
                                    Hi
                                </Text>
                            </View>
                            <View style={styles.eqSlider}>
                                <Slider
                                    style={{ width: "100%", height: 20 }}
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
        padding: 5,
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