import React, { Component } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SegmentedControlIOS,
  StyleSheet,
  Text,
  Alert,
  TextInput,
  TouchableHighlight,
  View,
  ScrollView,
} from 'react-native';

import * as Keychain from 'react-native-keychain';
//const Keychain = require('react-native-keychain');

const ACCESS_CONTROL_OPTIONS = ['None', 'Passcode', 'Password'];
const ACCESS_CONTROL_MAP = [null, Keychain.ACCESS_CONTROL.DEVICE_PASSCODE, Keychain.ACCESS_CONTROL.APPLICATION_PASSWORD, Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET]

export default class KeychainExample extends Component {
  state = {
    key: '',
    value: '',
    status: '',
    biometryType: null,
    accessControl: null,
  };

  componentDidMount() {
    Keychain.getSupportedBiometryType().then(biometryType => {
      this.setState({ biometryType });
    });
  }

  async save(accessControl) {
    try {
      await Keychain.setItem(
        this.state.key,
        this.state.value,
        { accessControl: this.state.accessControl }
      );
      this.setState({ key: '', value: '', status: 'Credentials saved!' });
    } catch (err) {
      this.setState({ status: 'Could not save credentials, ' + err });
    }
  }

  async load() {
    try {
      const credentials = await Keychain.getItem(this.state.key, { accessControl: this.state.accessControl });
      console.debug("credentials"+credentials);

      if (credentials) {
        this.setState({ ...credentials, status: 'Credentials loaded!' });
      } else {
        this.setState({ status: 'No credentials stored.' });
      }
    } catch (err) {
      console.debug("credentialserrror"+err);

      this.setState({ status: 'Could not load credentials. ' + err });
    }
  }
  async removekey() {
    try {
      const credentials = await Keychain.removeItem(this.state.key, { accessControl: this.state.accessControl });
      console.debug("credentials"+credentials);

      if (credentials) {
        this.setState({ ...credentials, status: 'Credentials removed!' });
      } else {
        this.setState({ status: 'No credentials removed.' });
      }
    } catch (err) {
      console.debug("credentialserrror"+err);

      this.setState({ status: 'Could not remove credentials. ' + err });
    }
  }

  async reset() {
    try {
      await Keychain.resetAll();
      this.setState({
        status: 'Credentials Reset!',
        key: '',
        value: '',
      });
    } catch (err) {
     // console.debug("Keychainerrror"+JSON.stringify(Keychain));

      this.setState({ status: 'Could not reset credentials, ' + err });
    }
  }

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Keychain Example</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Key</Text>
            <TextInput
              style={styles.input}
              autoFocus={true}
              autoCapitalize="none"
              value={this.state.key}
              onChange={event =>
                this.setState({ key: event.nativeEvent.text })}
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Value</Text>
            <TextInput
              style={styles.input}
              value={true}
              autoCapitalize="none"
              value={this.state.value}
              onChange={event =>
                this.setState({ value: event.nativeEvent.text })}
              underlineColorAndroid="transparent"
            />
          </View>
          {Platform.OS === 'ios' && (
            <View style={styles.field}>
              <Text style={styles.label}>Access Control</Text>
              <SegmentedControlIOS
                selectedIndex={0}
                values={this.state.biometryType ? [...ACCESS_CONTROL_OPTIONS, this.state.biometryType] : ACCESS_CONTROL_OPTIONS}
                onChange={({ nativeEvent }) => {
                  this.setState({
                    accessControl: ACCESS_CONTROL_MAP[nativeEvent.selectedSegmentIndex],
                  });                  
                }}
              />
            </View>
          )}
          {!!this.state.status && (
            <Text style={styles.status}>{this.state.status}</Text>
          )}

          <View style={styles.buttons}>
            <TouchableHighlight
              onPress={() => this.save()}
              style={styles.button}
            >
              <View style={styles.save}>
                <Text style={styles.buttonText}>Save</Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight
              onPress={() => this.load()}
              style={styles.button}
            >
              <View style={styles.load}>
                <Text style={styles.buttonText}>Load</Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight
              onPress={() => this.reset()}
              style={styles.button}
            >
              <View style={styles.reset}>
                <Text style={styles.buttonText}>Reset</Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight
              onPress={async() => {
                if (Platform.OS !== 'android') {
                  alert('android-only feature');
                  return;
                }
                const level = await Keychain.getSecurityLevel();
                alert(level)
              }}
              style={styles.button}
            >
              <View style={styles.load}>
                <Text style={styles.buttonText}>Get security level</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={styles.buttons}>
            <TouchableHighlight
              onPress={() => this.removekey()}
              style={styles.button}
            >
              <View style={styles.save}>
                <Text style={styles.buttonText}>Removekey</Text>
              </View>
            </TouchableHighlight></View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  content: {
    marginHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '200',
    textAlign: 'center',
    marginBottom: 20,
  },
  field: {
    marginVertical: 5,
  },
  label: {
    fontWeight: '500',
    fontSize: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    backgroundColor: 'white',
    height: 32,
    fontSize: 14,
    padding: 8,
  },
  status: {
    color: '#333',
    fontSize: 12,
    marginTop: 15,
  },
  biometryType: {
    color: '#333',
    fontSize: 12,
    marginTop: 15,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    borderRadius: 3,
    overflow: 'hidden',
  },
  save: {
    backgroundColor: '#0c0',
  },
  load: {
    backgroundColor: '#333',
  },
  reset: {
    backgroundColor: '#c00',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
