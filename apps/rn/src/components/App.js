import React, { Component } from 'react';

import ErrorDisplay from './ErrorDisplay';
import TestLauncher from './TestLauncher';
import TestRunningSpinner from './TestRunningSpinner';
import TestResultDisplay from './TestResultDisplay';

export default class App extends Component {
  static States = {
    TestLauncher: 'TestLauncher',
    TestRunning: 'TestRunning',
    TestDisplaying: 'TestDisplaying',
    Error: 'Error',
  };

  state = {
    state: App.States.TestLauncher,
  };

  handleLaunchTest = (testNumber, testLauncher) => {
    const start = Date.now();
    testLauncher()
      .then(({ base64Pdf }) => {
        if (!base64Pdf || base64Pdf.length < 1) {
          throw new Error('Missing `base64Pdf`');
        }
        const end = Date.now();
        const runtimeSecs = (end - start) / 1000;
        this.setState({
          runtimeSecs,
          base64Pdf,
          state: App.States.TestDisplaying,
        });
      })
      .catch((error) => {
        this.setState({ state: App.States.Error, error });
      });

    this.setState({ testNumber });

    // Only show the loading spinner screen for slow-running tests
    setTimeout(() => {
      const { state } = this.state;
      if (state === App.States.TestLauncher) {
        this.setState({ testNumber, state: App.States.TestRunning });
      }
    }, 50);
  };

  handleDone = () => {
    this.setState({ base64Pdf: undefined, state: App.States.TestLauncher });
  };

  render() {
    const { state, error, testNumber, base64Pdf, runtimeSecs } = this.state;

    if (state === App.States.TestLauncher) {
      return (
        <TestLauncher
          lastRunTest={testNumber}
          onLaunchTest={this.handleLaunchTest}
        />
      );
    }
    if (state === App.States.TestRunning) {
      return <TestRunningSpinner testNumber={testNumber} />;
    }
    if (state === App.States.TestDisplaying) {
      return (
        <TestResultDisplay
          runtimeSecs={runtimeSecs}
          base64Pdf={base64Pdf}
          onDone={this.handleDone}
        />
      );
    }
    if (state === App.States.Error) {
      return <ErrorDisplay error={error} />;
    }
  }
}
