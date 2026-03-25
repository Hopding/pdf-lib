import React, { Component } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button } from 'react-native';
import PdfView from 'react-native-pdf';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e6e6',
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
  },
  pdf: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
});

export default class TestResultDisplay extends Component {
  state = {
    page: undefined,
    numberOfPages: undefined,
    filePath: undefined,
  };

  handleLoadComplete = (numberOfPages, filePath) => {
    this.setState({ filePath });
  };

  handlePageChanged = (page, numberOfPages) => {
    this.setState({ page, numberOfPages });
  };

  handleError = (e) => {
    console.warn('Failed to render PDF', e);
  };

  render() {
    const { base64Pdf, runtimeSecs, onDone } = this.props;
    const { page, numberOfPages } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topContainer}>
          <View style={{ flex: 1 }}>
            <Button title="Done" onPress={onDone} />
          </View>

          <Text style={styles.text}>
            Page {page}/{numberOfPages}
          </Text>

          <Text style={styles.text}>{runtimeSecs} secs</Text>
        </View>

        {base64Pdf && (
          <PdfView
            style={styles.pdf}
            source={{ uri: base64Pdf }}
            onLoadComplete={this.handleLoadComplete}
            onPageChanged={this.handlePageChanged}
            onError={this.handleError}
          />
        )}
      </SafeAreaView>
    );
  }
}
