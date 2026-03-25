import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 50,
  },
});

export default class TestRunningSpinner extends Component {
  render() {
    const { testNumber } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Test {testNumber} is running...</Text>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }
}
