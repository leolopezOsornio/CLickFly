// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  ApiBackend: 'https://leocorreosapi-1050140474439.us-central1.run.app/',
  // ApiBackend: 'http://localhost:5000/',
  firebaseConfig: {
    apiKey: 'AIzaSyCTlCTCSN63uuYmCR3Gj_FRymRfARqgAOY',
    authDomain: 'extraionic.firebaseapp.com',
    projectId: 'extraionic',
    storageBucket: 'extraionic.firebasestorage.app',
    messagingSenderId: '717737136099',
    appId: '1:717737136099:web:08792d23e501b6f9b09ad6',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
