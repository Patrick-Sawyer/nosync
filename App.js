import { StatusBar } from 'expo-status-bar';
import React, { Component} from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Constants from "expo-constants";
import Slider from '@react-native-community/slider';
import * as MediaLibrary from 'expo-media-library';
import MusicInfo from 'expo-music-info';

import Deck from "./app/components/Deck";
let meh = true;


export default class App extends Component {

  state = {
    userTunes: [],
    deckAVolume: 0.70,
    deckBVolume: 0.70,
  }

  async getTunes(lastId) {
    let media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 1000,
    })
    let filteredMedia = media.assets.filter((tune) => {
      if(tune.duration > 60){
        return true;
      }
    })
    this.setState({
      userTunes: filteredMedia
    })
    this.updateTuneData()
  }

  async updateTuneData() {
    for (let i = 0; i < this.state.userTunes.length; i++) {
        await this.getTuneTitleAndArtist(i);
    }
  }

  async getTuneTitleAndArtist(i) {
      let tune = this.state.userTunes[i];
      const metadata = await MusicInfo.getMusicInfoAsync(tune.uri, {
          title: true,
          artist: true,
      });
      let array = [...this.state.userTunes];
      array[i].metadata = metadata;
      this.setState({
          userTunes: array
      })
  }

  async componentDidMount() {
    let { status } = await MediaLibrary.requestPermissionsAsync();
    //ADD CODE FOR IF THEY REFUSE PERMISSIONS
    this.getTunes();
  }

  androidStatusBarPadding = () => {
    return (
      <View
        style={{
          height: Constants.statusBarHeight,
          }}
      ></View>
    )
  }

  lineBreak = () => {
    return (
      <View style={{borderTopWidth: 1, width: "80%", borderColor: "#edf5f2", margin: 20}}></View>
    )
  }

  loadingTest = () => {
    if(this.state.userTunes.length > 0){
      return (
        <React.Fragment>
          {this.lineBreak()}
          <View style={[styles.deck, styles.component]}>
            <Deck color={"#9e6737"} userTunes={this.state.userTunes} volume={this.state.deckAVolume}/>  
          </View>
          {this.lineBreak()}
          <View style={[styles.deck, styles.component]}>
            <Deck color={"#348185"} userTunes={this.state.userTunes} volume={this.state.deckBVolume}/>
          </View>
          {this.lineBreak()}
          <View style={[styles.component, styles.crossfadeContainer]}>
            <View style={styles.crossfade}>
              <View style={{flexShrink: 1}}>
                <Text style={{textAlign: "center", color: "#a65e28", opacity: 0.5}}>X-Fade</Text>
              </View>
              <View style={{flexGrow: 1, width: "100%", justifyContent: "center"}}>
                <Slider
                  style={{width: "100%", height: 20}}
                  minimumValue={-1}
                  maximumValue={1}
                  value={0}
                  maximumTrackTintColor="#bd865c"
                  minimumTrackTintColor="#bd865c"
                  thumbTintColor={"#a65e28"}
                  onValueChange={(value) => {
                    this.logarithmicCrossfade(value)
                  }}
                  onSlidingComplete={(value) => {
                    this.logarithmicCrossfade(value)
                  }}
                />
              </View>
            </View>
          </View>
        </React.Fragment>
      )
    }else{
      return (
        <Text style={{paddingTop: 20, color: "grey"}}>
          Loading your music library...
        </Text>
      )
    }
  }

  logarithmicCrossfade = (value) => {
    let angle = (value + 1) * (0.25 * Math.PI.toFixed(4));
    this.setState({
      deckAVolume: (value == 1) ? 0 : Math.cos(angle).toFixed(2),
      deckBVolume: (value == -1) ? 0 : Math.sin(angle).toFixed(2),
    })
    console.log("DECK A: " + this.state.deckAVolume);
    console.log("DECK B: " + this.state.deckBVolume);
  }

  render = () => {
    return (
      <SafeAreaView style={styles.container}>
        {this.androidStatusBarPadding()}
        <StatusBar style="auto" />
        <View style={styles.component}>
          <Text style={styles.titleText} numberOfLines={1} adjustsFontSizeToFit>
            NoSync
          </Text>
        </View>
        {this.loadingTest()}
      </SafeAreaView>
    );
  
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  deck: {
    flex: 4,
  },
  titleText: {
    fontSize: 50,
    color: "#348185",
  },
  component: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  crossfadeContainer: {
    paddingHorizontal: 10,
    flex: 1,
  },
  crossfade: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
