import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';

import Waveform from "./Waveform";
import SelectTune from "./SelectTune";

class Deck extends Component {

    state = {
        artist: "Deck Empty",
        song: "Nothing Loaded",
        userTunes: this.props.userTunes,
        selectTuneEnabled: false,
        isPlaying: false,
        playbackInstance: null,
        volume: this.props.volume,
        isBuffering: false,
        pitchControl: 1,
        displayPitch: 1,
        uri: null,
        iconShadow: {
            textShadowColor: this.props.color,
            textShadowRadius: 1,
        }
    }

    upDatevolume = (newVolume) => {
        if (this.state.playbackInstance != null) {
            console.log(newVolume)
            this.state.playbackInstance.setStatusAsync({
                volume: parseFloat(newVolume),
            })
        }
        this.setState({
            volume: newVolume,
        });
    }

    // static getDerivedStateFromProps = (newProps, oldProps) => {
    //     if (oldProps.userTunes !== newProps.userTunes) {
    //         return {
    //             userTunes: newProps.userTunes,
    //         }
    //     } else {
    //         return null;
    //     }
    // }

    componentDidUpdate = (prevProps) => {
        if (this.props.volume !== prevProps.volume) {
            this.upDatevolume(this.props.volume)
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
                isBuffering: false,
                pitchControl: 1,
                displayPitch: 1,
                selectTuneEnabled: false,
                uri: uri,
            })
            this.loadAudio(uri)
        }
    }

    playButtonTemplate = (name, onpress) => {
        return (
            <TouchableOpacity style={{ flex: 1 }} onPress={onpress}>
                <View style={[styles.playButton, {borderColor: this.props.buttonColor}]}>
                    <SimpleLineIcons name={name} adjustsFontSizeToFit size={30} color={this.props.color} style={this.state.iconShadow}/>
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

    backToDeck = () => {
        this.setState({
            selectTuneEnabled: false,
        })
    }

    render = () => {
        if (this.state.selectTuneEnabled) {
            return (
                <View style={styles.container}>
                    <SelectTune userTunes={this.state.userTunes} color={this.props.color} selectTuneEnabled={this.state.selectTuneEnabled} goBack={this.backToDeck} selectTrack={this.selectTrack} />
                </View>
            )
        } else {
            return (
                <View style={styles.container}>
                    <View style={styles.title}>
                        <Text
                            style={[styles.titleText, { color: this.props.color, textShadowColor: this.props.color, textShadowRadius: 1 }]}
                            numberOfLines={1}
                        >
                            {this.state.artist + " - " + this.state.song}
                        </Text>
                    </View>

                    <View style={[styles.Component, styles.mainElement, { flex: 1 }]}>
                        <Waveform 
                            uri={this.state.uri}
                        />
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
                            <View style={[styles.playButton, { padding: 0, borderColor: this.props.buttonColor }]}>
                                <Text
                                    adjustsFontSizeToFit
                                    numberOfLines={1}
                                    style={{
                                        fontSize: 30,
                                        color: this.props.color,
                                        textShadowColor: this.props.color,
                                        textShadowRadius: 1,
                                    }}
                                >CUE</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ width: 10 }} />
                        {this.playButton()}
                        <View style={{ width: 10 }} />
                        <TouchableOpacity style={{ flex: 1 }} onPress={this.loadTrack}>
                            <View style={[styles.playButton, {borderColor: this.props.buttonColor}]}>
                                <AntDesign 
                                    name="addfile" 
                                    adjustsFontSizeToFit size={30} 
                                    color={this.props.color} 
                                    style={this.state.iconShadow}
                                />
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
                            <View style={[styles.playButton, {borderColor: this.props.buttonColor}]}>
                                <SimpleLineIcons name="minus" adjustsFontSizeToFit size={30} color={this.props.color} style={this.state.iconShadow} />
                            </View>
                        </TouchableOpacity>
                        <View style={{ width: 10 }} />
                        <View style={{ width: 50, alignItems: "center" }}>
                            <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: "grey", fontSize: 15}}>
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
                            <View style={[styles.playButton, {borderColor: this.props.buttonColor}]}>
                                <SimpleLineIcons name="plus" adjustsFontSizeToFit size={30} color={this.props.color} style={this.state.iconShadow}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.Component, styles.mainElement, { flex: 1, flexDirection: "row"}]}>
                        <View style={{width: "10%", alignItems: "flex-start"}}>
                            <TouchableOpacity
                                style={{ width: 30, height: "100%", justifyContent: "center", alignItems: "flex-start" }}
                                onPressIn={() => this.nudgeTouch(-0.03)}
                                onPressOut={() => this.nudgeTouch(0)}
                            >
                                <SimpleLineIcons name="arrow-left" adjustsFontSizeToFit size={27} color={this.props.color} style={this.state.iconShadow}/>
                            </TouchableOpacity>
                        </View>
                        <Slider
                            style={{ height: 20, flexGrow: 1 }}
                            minimumValue={0.92}
                            maximumValue={1.08}
                            value={this.state.pitchControl}
                            minimumTrackTintColor={"rgba(0,0,0,0)"}
                            maximumTrackTintColor={"grey"}
                            onSlidingComplete={(value) => {
                                this.pitchSliderValueChange(value)
                            }}
                            onValueChange={(value) => {
                                this.pitchSliderValueChange(value);
                                this.setState({
                                    displayPitch: value,
                                })
                            }}

                            thumbTintColor={this.props.color}
                            thumbImage={this.props.color == "#00f2ff" ? require("../images/circleTurquoise.png") : require("../images/circleOrange.png") }
                        />
                        <View style={{width: "10%", alignItems: "flex-end"}}>
                            <TouchableOpacity
                                style={{ width: 30, height: "100%", justifyContent: "center", alignItems: "flex-end" }}
                                onPressIn={() => this.nudgeTouch(0.03)}
                                onPressOut={() => this.nudgeTouch(0)}
                            >
                                <SimpleLineIcons name="arrow-right" adjustsFontSizeToFit size={27} color={this.props.color} style={this.state.iconShadow} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[styles.Component, styles.mainElement, { flex: 1, flexDirection: "row" }]}>
                        <View style={styles.eqComponent}>
                            <View style={styles.eqTextContainer}>
                                <Text style={styles.eqText}>
                                    Low
                                </Text>
                            </View>
                            <View style={styles.eqSlider}>
                                <Slider
                                    style={{ width: "100%", height: 20 }}
                                    minimumValue={0}
                                    maximumValue={1}
                                    value={1}
                                    minimumTrackTintColor={"rgba(0,0,0,0)"}
                                    maximumTrackTintColor={"grey"}
                                    thumbTintColor={this.props.color}
                                />
                            </View>
                        </View>
                        <View style={styles.eqComponent}>
                            <View style={styles.eqTextContainer}>
                            <Text style={styles.eqText}>
                                    Mid
                                </Text>
                            </View>
                            <View style={styles.eqSlider}>
                                <Slider
                                    style={{ width: "100%", height: 20 }}
                                    minimumValue={0}
                                    maximumValue={1}
                                    value={1}
                                    minimumTrackTintColor={"rgba(0,0,0,0)"}
                                    maximumTrackTintColor={"grey"}
                                    thumbTintColor={this.props.color}
                                />
                            </View>
                        </View>
                        <View style={styles.eqComponent}>
                            <View style={styles.eqTextContainer}>
                                <Text style={styles.eqText}>
                                    Hi
                                </Text>
                            </View>
                            <View style={styles.eqSlider}>
                                <Slider
                                    style={{ width: "100%", height: 20 }}
                                    minimumValue={0}
                                    maximumValue={1}
                                    value={1}
                                    minimumTrackTintColor={"rgba(0,0,0,0)"}
                                    maximumTrackTintColor={"grey"}
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
    },
    eqComponent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
    },
    eqText: {
        color: "grey",
        fontSize: 15,
    },
    eqSlider: {
        width: "100%",
    },
    eqTextContainer: {
        margin: 10,
    }
})

export default Deck;