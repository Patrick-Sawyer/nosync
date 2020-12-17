import React, { Component } from "react";
import { View, StyleSheet, PixelRatio, TouchableWithoutFeedback } from "react-native";

class AppSlider extends Component {
    state = {
        minimumValue: this.props.minimumValue,
        maximumValue: this.props.maximumValue,
        color: this.props.color,
        initialValue: this.props.value,
        currentValue: 1.05,
        value: this.props.value,
        width: 0,
    }

    static getDerivedStateFromProps = (newProps, oldProps) => {
        if((oldProps.value !== newProps.value)){
          return {
            currentValue: newProps.value,
            value: value,
          }
        }else{
          return null;
        }
      }
      
    getWidth1 = () => {
        if(this.state.currentValue >= this.state.initialValue){
            return "50%"
        }else if(this.state.currentValue <= this.state.minimumValue){
            return "0%"
        }else{
            let amount = this.state.currentValue - this.state.minimumValue;
            let total = this.state.initialValue - this.state.minimumValue;
            let answer = amount * 50/total
            return answer + "%";
        }
    }

    getWidth2 = () => {
        if((this.state.currentValue >= this.state.maximumValue) || (this.state.currentValue <= this.state.minimumValue)){
            return "50%"
        } else if(this.state.currentValue == this.state.initialValue){
            return "0%"
        }else if(this.state.currentValue < this.state.initialValue){
            return (50 * (this.state.initialValue - this.state.currentValue)/(this.state.initialValue - this.state.minimumValue)) + "%";
        }else if(this.state.currentValue > this.state.initialValue){
            let test =  (50 * (this.state.currentValue - this.state.initialValue)/(this.state.maximumValue - this.state.initialValue));
            return (50 * (this.state.currentValue - this.state.initialValue)/(this.state.maximumValue - this.state.initialValue)) + "%";
            console.log(test);
        }
    }


    track = () => {
        return (
            <View style={[styles.track, {backgroundColor: this.props.buttonColor}]}>
                <View style={{backgroundColor: this.props.buttonColor, height: "100%", width: this.getWidth1()}}></View>
                <View style={{backgroundColor: this.state.color, height: "100%", width: this.getWidth2()}}></View>
            </View>
        )
    }

    thumbPosition = () => {
        let width = this.state.width - 24;
        let valueRange = this.state.maximumValue - this.state.minimumValue;
        let value = this.state.currentValue;
        if(value < this.state.minimumValue){
            value = this.state.minimumValue;
        }else if(value > this.state.maximumValue){
            value = this.state.maximumValue;
        }
        return parseInt(width * (value - this.state.minimumValue)/valueRange);
    }

    thumb = () => {
        return (

                <View style={[styles.thumb, {backgroundColor: this.state.color, left: this.thumbPosition(), shadowColor: this.state.color, shadowRadius: 8, elevation: 2, overflow: "visible"}]}></View>

        )
    }

    render = () => {
        return (
            <View 
                style={styles.container}
                onLayout={(event) => {
                    var {x, y, width, height} = event.nativeEvent.layout;
                    this.setState({
                        width: width
                    })
                  }}
            >
                {this.track()}
                {this.thumb()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        justifyContent: "center",
    },
    track: {
        height: 4 / PixelRatio.get(),
        flexDirection: "row",
        alignItems: "flex-start",
    },
    thumb: {
        height: 24,
        width: 24,
        borderRadius: 12,
        overflow: "hidden",
        position: "absolute",
    }
})

export default AppSlider;

// style={{ width: "100%", height: 20 }}
// minimumValue={0}
// maximumValue={1}
// value={1}
// minimumTrackTintColor={this.props.color}
// maximumTrackTintColor="#e3e3e3"
// thumbTintColor={this.props.color}