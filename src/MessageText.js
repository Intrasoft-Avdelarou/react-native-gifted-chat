/* eslint no-use-before-define: ["error", { "variables": false }] */
import PropTypes from 'prop-types';
import React from 'react';
import { Linking, StyleSheet, Text, View, ViewPropTypes, WebView, Modal, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/EvilIcons'
import ParsedText from 'react-native-parsed-text';
import Communications from 'react-native-communications';

const WWW_URL_PATTERN = /^www\./i;

export default class MessageText extends React.Component {

  constructor(props) {
    super(props);
    this.onUrlPress = this.onUrlPress.bind(this);
    this.onPhonePress = this.onPhonePress.bind(this);
    this.onEmailPress = this.onEmailPress.bind(this);
    this.viewBrowserLink = this.viewBrowserLink.bind(this);
    this.hideBrowserLink = this.hideBrowserLink.bind(this);
    this.state = {
      url: '',
      showModal: false
    }
  }

  onUrlPress(url) {
    // When someone sends a message that includes a website address beginning with "www." (omitting the scheme),
    // react-native-parsed-text recognizes it as a valid url, but Linking fails to open due to the missing scheme.
    if (WWW_URL_PATTERN.test(url)) {
      this.viewBrowserLink(`http://${url}`);
    } else {
      Linking.canOpenURL(url).then((supported) => {
        if (!supported) {
          // eslint-disable-next-line
          console.error('No handler for URL:', url);
        } else {
          this.viewBrowserLink(url);
        }
      });
    }
  }

  viewBrowserLink(url) {
    this.setState({url: url});
    this.setState({showModal: true});
  }

  hideBrowserLink() {
    this.setState({showModal: false})
  }

  onPhonePress(phone) {
    const options = ['Call', 'Text', 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            Communications.phonecall(phone, true);
            break;
          case 1:
            Communications.text(phone);
            break;
          default:
            break;
        }
      },
    );
  }

  onEmailPress(email) {
    Communications.email([email], null, null, null, null);
  }

  render() {
    const linkStyle = StyleSheet.flatten([
      styles[this.props.position].link,
      this.props.linkStyle[this.props.position],
    ]);

    return (
      <View
        style={[
          styles[this.props.position].container,
          this.props.containerStyle[this.props.position],
        ]}
      >
        <ParsedText
          style={[
            styles[this.props.position].text,
            this.props.textStyle[this.props.position],
            this.props.customTextStyle,
          ]}
          parse={[
            ...this.props.parsePatterns(linkStyle),
            { type: 'url', style: linkStyle, onPress: this.onUrlPress },
            { type: 'phone', style: linkStyle, onPress: this.onPhonePress },
            { type: 'email', style: linkStyle, onPress: this.onEmailPress },
          ]}
          childrenProps={{ ...this.props.textProps }}
        >
          {this.props.currentMessage.text}
        </ParsedText>

        <Modal
              animationType={"slide"}
              visible={this.state.showModal}
              transparent={false}
              onRequestClose={this.hideBrowserLink} {...this.props}
          >
              <Image source={require('../../../../mynet/src/assets/img/dashboard_header_bak.png')} 
              style={{height: 100, width: '100%'}}>
                  <TouchableOpacity style={{
                      right: 20,
                      top: 25,
                      position: 'absolute',
                      zIndex: 1,
                      backgroundColor: 'transparent',
                  }} onPress={() => {
                      this.hideBrowserLink();
                  }}>
                      <Icon name="close" size={45} color={'#ffffff'}/>
                  </TouchableOpacity>
              </Image>
              <WebView
                  ref='WEBVIEW_REF'
                  scalesPageToFit={true}
                  source={{uri: this.state.url}}
                  style={{marginTop: 0}}
                  onBack={() => {
                      this.hideBrowserLink();
                  }}
              />
          </Modal>
      </View>
    );
  }
}

const textStyle = {
  fontSize: 16,
  lineHeight: 20,
  marginTop: 5,
  marginBottom: 5,
  marginLeft: 10,
  marginRight: 10,
};

const styles = {
  left: StyleSheet.create({
    container: {},
    text: {
      color: 'black',
      ...textStyle,
    },
    link: {
      color: 'black',
      textDecorationLine: 'underline',
    },
  }),
  right: StyleSheet.create({
    container: {},
    text: {
      color: 'white',
      ...textStyle,
    },
    link: {
      color: 'white',
      textDecorationLine: 'underline',
    },
  }),
};

MessageText.contextTypes = {
  actionSheet: PropTypes.func,
};

MessageText.defaultProps = {
  position: 'left',
  currentMessage: {
    text: '',
  },
  containerStyle: {},
  textStyle: {},
  linkStyle: {},
  customTextStyle: {},
  textProps: {},
  parsePatterns: () => [],
};

MessageText.propTypes = {
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  textStyle: PropTypes.shape({
    left: Text.propTypes.style,
    right: Text.propTypes.style,
  }),
  linkStyle: PropTypes.shape({
    left: Text.propTypes.style,
    right: Text.propTypes.style,
  }),
  parsePatterns: PropTypes.func,
  textProps: PropTypes.object,
  customTextStyle: Text.propTypes.style,
};
