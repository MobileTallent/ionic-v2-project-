Parse.Push Plugin
==============================

Parse.Push plugin for Phonegap/Cordova/ionic. Works for both hosted Parse.com and open source parse-server.

[Parse.com's](http://parse.com) Javascript API has no mechanism to register a device for or receive push notifications, which
makes it fairly useless for PN in Phonegap/Cordova. This plugin bridges the gap by leveraging native Parse.com SDKs
to register/receive PNs and expose a simple API to Javascript.

* Phonegap/Cordova > 3.0

How Is This Fork Different?
--------------------------

**Works with hosted Parse.com and open source parse-sever**

**Can handle cold start**

**API**

* **getInstallationId**( successCB, errorCB )
* **getSubscriptions**( successCB, errorCB )
* **subscribe**( channel, successCB, errorCB )
* **unsubscribe**( channel, successCB, errorCB )

ParsePushPlugin makes these notification events available: `openPN, receivePN, receivePN:customEvt`.
To handle notification events in JS, do this:

```javascript
ParsePushPlugin.on('receivePN', function(pn){
	console.log('yo i got this push notification:' + JSON.stringify(pn));
});

//customEvt can be any string of your choosing, i.e., chat, system, upvote, etc.
ParsePushPlugin.on('receivePN:chat', function(pn){
	console.log('yo i can also use custom event to keep things like chat modularized');
});

ParsePushPlugin.on('openPN', function(pn){
	//you can do things like navigating to a different view here
	console.log('Yo, I get this when the user clicks open a notification from the tray');
});
```



**Multiple notifications**

Android: to prevent flooding the notification tray, this plugin retains only the last PN with the same `title` field.
For messages without the `title` field, the application name is used. A count of unopened PNs is shown.

iOS: iOS handles the notification tray.


**Foreground vs. Background**

Android: Only add an entry to the notification tray if the application is not running in foreground.
The actual PN payload is always forwarded to your javascript when it is received.

iOS: Forward the PN payload to javascript in foreground mode. When app inactive or in background, iOS
holds PNs in the tray. Only when the user opens these PNs would we have access and forward them to javascript.


**Navigate to a specific view when user opens a notification**

Simply add a `urlHash` field in your PN payload that contains either a url hash, i.e. #myhash,
or a url parameter string, i.e. ?param1=a&param2=b. If your app is already running, you can always
handle page transition via javascript.

```javascript
ParsePushPlugin.on('openPN', function(pn){
	if(pn.urlHash){
		window.location.hash = hash;
	}
});
```

Android: If `urlHash` starts with "#" or "?", this plugin will pass it along as an extra in the
android intent to launch your MainActivity. For the cold start case, you can change your initial url
in  `MainActivity.onCreate()`:

```java
@Override
public void onCreate(Bundle savedInstanceState)
{
    //
    // your code...
    //

    String urlHash = intent.hasExtra("urlHash") ? intent.getStringExtra("urlHash") : "";
    loadUrl(launchUrl + urlHash);
}
```

iOS: ... haven't tried yet but probably should be handled in `AppDelegate.didReceiveRemoteNotification`


Installation
------------

Read the [Parse server push guide](https://github.com/ParsePlatform/parse-server/wiki/Push) for an overview of the Push configuration.

For both Android and iOS, run

```
cordova plugin add https://github.com/taivo/parse-push-plugin --variable GCM_SENDER_ID=1234256789
```

To get your GCM sender ID, enable GCM for your Android project in the Google Developer Console. Take note of your
project number. It should be a large integer like 123427208255. This project number is your GCM sender ID.

####Install Push Certificates on Server:

- Hosted Parse.com
   - iOS
      1. Create SSL push certificate with Apple. You may find  [this tutorial useful](https://github.com/ParsePlatform/PushTutorial/tree/master/iOS). All steps prior to adding code to your iOS application are applicable.
      2. Use Parse Dashboard to upload the generated `p12` push certificate.
   - Android - no need for certificate setup. Parse.com uses its own push credentials.

- Open Source parse-server
   1. Setup `parse-server`

      There are plenty of guides out there to help you get started on popular hosting services like Heroku and AWS. If you want to setup parse-server on your laptop [for local development, here's a quick-start guide](https://taivo.github.io/guides/parse-server-for-local-development).
   2. Once you have a working `parse-server`, generate your push credentials:

      - iOS
         1. Create SSL push certificate with Apple. You may find  [this tutorial useful](https://github.com/ParsePlatform/PushTutorial/tree/master/iOS). All steps prior to adding code to your iOS application are applicable.
         2. Place the `p12` certificate file from the previous step on your server.
      - Android
         1. Get the sender id (your project number) from your google developer console. It's a long integer.
         2. Enable push notification for your project on google developer console and generate a server API key.
   3. Update your `parse-server` configuration to use the push credentials. Here is an example:

   ```json
   {
      "appId": "MY_APP_ID",
      "masterKey": "SUPER_SECRET",
      "cloud": "./myCloudDir/main.js",
      "push": {
         "android":{
            "senderId": "SENDER_ID_AKA_PROJECT_NUMBER",
            "apiKey": "SERVER_API_KEY_FROM_GOOGLE_DEVELOPER_CONSOLE"
         },
         "ios":{
            "pfx": "my-push-certificate.p12",
            "bundleId": "com.company.myapp",
            "production": false
         }
      }
   }
   ```
   4. Restart your `parse-server` for the new settings to take effect.

####Android Plugin Setup:

Phonegap/Cordova doesn't define a custom `android.app.Application`, it only defines an android `Activity`. With an `Activity` alone,
we should be able to receive PNs just fine while our app is running. However, if a PN arrives when the app is not running,
the app will be automatically invoked, and this plugin's `ParsePushPluginReceiver` runs before the `Activity` class or any javascript code
gets a chance to call `Parse.initialize()`. The result is a crash dialog. To fix this, do the following:

1. Define a custom Application class that calls `Parse.initialize()` in its `onCreate` method. This way, the Parse
subsystem gets initialized before the PN-handling code runs. Crash avoided. In your application's Java source path,
e.g., `platforms/android/src/com/example/app`, create a file named MainApplication.java and define it this way
    ```java
    package com.example.app;  //REPLACE THIS WITH YOUR package name

    import android.app.Application;
    import com.parse.Parse;
    import com.parse.Parse.Configuration.Builder;
    import com.parse.ParseInstallation;

    public class MainApplication extends Application {
	    @Override
        public void onCreate() {
            super.onCreate();
            Parse.initialize(new Parse.Configuration.Builder(this)
                .applicationId("PARSE_APP_ID")
                .clientKey(null)
                .server("PARSE_SERVER_URL") // The trailing slash is important.
                .build()
            );
            ParseInstallation.getCurrentInstallation().saveInBackground();
        }
    }
    ```
2. Now register MainApplication in AndroidManifest.xml so it's used instead of the default.
In the `<application>` tag, add the attribute `android:name="MainApplication"`. Obviously, you don't have
to name your application class this way, but you have to use the same name in 1 and 2.

3. Optional. To customize background color for the push notification icon in Android Lollipop, go to
your `platforms/android/res/values` folder and create a file named `colors.xml`. Paste the following
content in it and replace the hex color value of the form `#AARRGGBB` to your liking.

    ```xml
	<?xml version="1.0" encoding="utf-8"?>
    <resources>
        <color name="parse_push_icon_color">#ff112233</color>
    </resources>
    ```

####iOS Plugin Setup:

For `Parse.Push` to work, the native Parse platform needs to be initialized. Open `platforms/ios/ProjectName/Classes/AppDelegate.m` and add the `Parse/Parse.h` header as well as code to the following function. Cordova should have defined the function for you already so search for it first. Uncomment the appropriate code block to initialize either hosted Parse.com or open source parse-server.

```objective-c
#import <Parse/Parse.h>

- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{
    //
    // Stuff already defined by Cordova
    //

    //
    // Initialize app for soon-to-depart Parse.com hosted service
    //
    //[Parse setApplicationId:@"YOUR_PARSE_APPID" clientKey:@"YOUR_PARSE_CLIENT_KEY"];
    //

    //
    // Initialize open source parse-server (which no longer uses clientKey)
    //
    //[Parse initializeWithConfiguration:[ParseClientConfiguration configurationWithBlock:^(id<ParseMutableClientConfiguration> configuration) {
    //     configuration.applicationId = @"YOUR_PARSE_APPID";
    //     configuration.server = @"YOUR_PARSER_SERVER_URL";
    //}]];
    //

    //
    // Basic notification config, left as cut-and-paste instead of part of plugin code for easy customization
    UIUserNotificationType userNotificationTypes = (UIUserNotificationTypeAlert | UIUserNotificationTypeBadge | UIUserNotificationTypeSound);
    UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:userNotificationTypes categories:nil];
    [application registerUserNotificationSettings:settings];
    [application registerForRemoteNotifications];

    return YES;
}
```


Usage
-----

When your app starts, ParsePushPlugin automatically obtains and stores necessary device tokens to your native `ParseInstallation`.
This plugin also registers a javascript callback that will be triggered when a push notification is received or opened on the native side.
This setup enables the following simple API and event handling.

**API**


```javascript
ParsePushPlugin.getInstallationId(function(id) {
    alert(id);
}, function(e) {
    alert('error');
});

ParsePushPlugin.getSubscriptions(function(subscriptions) {
    alert(subscriptions);
}, function(e) {
    alert('error');
});

ParsePushPlugin.subscribe('SampleChannel', function(msg) {
    alert('OK');
}, function(e) {
    alert('error');
});

ParsePushPlugin.unsubscribe('SampleChannel', function(msg) {
    alert('OK');
}, function(e) {
    alert('error');
});
```


**Receiving push notifications**

Anywhere in your code, you can set a listener for notification events using the ParsePushPlugin object (it extends Parse.Events).
```javascript
if(window.ParsePushPlugin){
	ParsePushPlugin.on('receivePN', function(pn){
		alert('yo i got this push notification:' + JSON.stringify(pn));
	});

	//
	//you can also listen to your own custom subevents
	// Note: to push custom subevent, include 'event' key in your push payload,
   // e.g. {alert: "sup", event:'chat'}
	ParsePushPlugin.on('receivePN:chat', chatEventHandler);
	ParsePushPlugin.on('receivePN:serverMaintenance', serverMaintenanceHandler);
}
```


**Silent Notifications**

For Android, a silent notification can be sent by omitting the `title` and `alert` fields in the
JSON payload. This means the push notification will not be shown in the system tray, but its JSON
payload will still be delivered to your `receivePN` and `receivePN:customEvt` handlers.


**Troubleshooting**
Android: Starting with the Parse Android SDK v1.10.1 update, your app may crash at start and the log says
something about a missing method in OkHttpClient. Just update the cordova libs of your project
via `cordova platform update android`. If your previous cordova libs are old, you may run into
further compilation errors that has to do with the new cordova libs setting your android target
to be 22 or higher. Look at file `platforms/android/project.properties` and make sure that is
consistent with your `config.xml`

iOS: This plugin takes advantage of the `cordova.exec` bridge. If calls to `cordova.exec` only gets triggered
after pressing your device's Home button, try inspecting your Content-Security-Policy. Your `frame-src` must allow
`gap:` because the cordova bridge on iOS works via Iframe.
