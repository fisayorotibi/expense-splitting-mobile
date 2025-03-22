import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from '../../App';
import 'expo-router/entry';

// Register the app
if (module.hot) {
  module.hot.accept('../../App', () => {
    const NextApp = require('../../App').default;
    registerRootComponent(NextApp);
  });
}

// Only run in browser environment
if (typeof document !== 'undefined') {
  // Use the app container as the DOM node for the app
  AppRegistry.runApplication('main', {
    initialProps: {},
    rootTag: document.getElementById('app-container'),
  });
}

// Register the app component
AppRegistry.registerComponent('main', () => App); 