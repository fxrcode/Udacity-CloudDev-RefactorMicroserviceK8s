// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
	production: false,
	appName: 'Udagram',
	apiHost:
		// 'http://a6649c8c723d74929b40f5482e59c5db-1832022010.eu-west-2.elb.amazonaws.com:8080/api/v0',
		// "http://localhost:8080/api/v0",
		"http://ac882de7f911749a69d370284d490024-2002419506.us-west-1.elb.amazonaws.com:8080/api/v0",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
