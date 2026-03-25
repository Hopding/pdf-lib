import React, { Component } from 'react';
import { StyleSheet, SafeAreaView, Text, ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  stackText: {
    fontSize: 15,
    textAlign: 'left',
    margin: 10,
  },
});

export default class ErrorDisplay extends Component {
  render() {
    const { error } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Text style={styles.text}>An Error Occurred:</Text>
          {error instanceof Error ? (
            <>
              <Text style={styles.text}>{error.message}</Text>
              <Text style={styles.stackText}>{error.stack}</Text>
            </>
          ) : (
            <Text style={styles.text}>{String(error)}</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}
