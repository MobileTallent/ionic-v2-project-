<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->

# Google Location Services for Cordova - Android

This Cordova plugin provides information about the device's location, such as
latitude and longitude and uses the [Google Play services location APIs](https://developers.google.com/android/reference/com/google/android/gms/location/package-summary).

This  plugin exists mainly because the [cordova geolocation plugin](http://plugins.cordova.io/#/package/org.apache.cordova.geolocation) does not use Android code anymore : https://issues.apache.org/jira/browse/CB-5977.
It relies on the geolocation capability of the WebView.

Depending on your particular needs, this plugin may be more suitable.

## Installation

[Add the Android Support and Google Repository](https://developer.android.com/tools/support-library/setup.html).

The plugin is published on [npm](https://www.npmjs.com/package/cordova-plugin-locationservices):

    cordova plugin add cordova-plugin-locationservices

If you use Cordova Android platform 4

    cordova plugin add cordova-plugin-locationservices@legacy

### Google play services version

This plugin use the latest available Google Location services release.

If you want to use a specific version, add a [build-extras.gradle](http://cordova.apache.org/docs/en/latest/guide/platforms/android/tools.html) file:

```gradle
ext.postBuildExtras = {
  configurations.all {
    resolutionStrategy.eachDependency { DependencyResolveDetails details ->
      def dep = details.requested.group + ":" + details.requested.name
      if (dep == 'com.google.android.gms:play-services-location')
        details.useVersion '8.3.0'
    }
  }
}
```
### Tests
The plugin use the [Cordova Plugin Test Framework](https://github.com/apache/cordova-plugin-test-framework) and tests based on the [Cordova Geolocation Plugin](https://www.npmjs.com/package/cordova-plugin-geolocation).

Clone the [test app](https://github.com/louisbl/cordova-plugin-locationservices-tests) and run it on a device/emulator.

## Supported Platforms

- Android


## Methods

- cordova.plugins.locationServices.geolocation.getCurrentPosition
- cordova.plugins.locationServices.geolocation.watchPosition
- cordova.plugins.locationServices.geolocation.clearWatch

## Objects (Read-Only)

- cordova.plugins.locationServices.Position
- cordova.plugins.locationServices.PositionError
- cordova.plugins.locationServices.Coordinates
- cordova.plugins.locationServices.Priorities

## LocationServices.getCurrentPosition

Returns the device's current position to the `geolocationSuccess`
callback with a `Position` object as the parameter.  If there is an
error, the `geolocationError` callback is passed a
`PositionError` object.

    cordova.plugins.locationServices.geolocation.getCurrentPosition(geolocationSuccess,
                                             [geolocationError],
                                             [geolocationOptions]);

### Parameters

- __geolocationSuccess__: The callback that is passed the current position.

- __geolocationError__: _(Optional)_ The callback that executes if an error occurs.

- __geolocationOptions__: _(Optional)_ The geolocation options.


### Example

    // onSuccess Callback
    // This method accepts a Position object, which contains the
    // current GPS coordinates
    //
    var onSuccess = function(position) {
        alert('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    cordova.plugins.locationServices.geolocation.getCurrentPosition(onSuccess, onError);

## LocationServices.watchPosition

Returns the device's current position when a change in position is detected.
When the device retrieves a new location, the `geolocationSuccess`
callback executes with a `Position` object as the parameter.  If
there is an error, the `geolocationError` callback executes with a
`PositionError` object as the parameter.

    var watchId = cordova.plugins.locationServices.geolocation.watchPosition(geolocationSuccess,
                                                      [geolocationError],
                                                      [geolocationOptions]);

### Parameters

- __geolocationSuccess__: The callback that is passed the current position.

- __geolocationError__: (Optional) The callback that executes if an error occurs.

- __geolocationOptions__: (Optional) The geolocation options.

### Returns

- __String__: returns a watch id that references the watch position interval. The watch id should be used with `cordova.plugins.locationServices.geolocation.clearWatch` to stop watching for changes in position.

### Example

    // onSuccess Callback
    //   This method accepts a `Position` object, which contains
    //   the current GPS coordinates
    //
    function onSuccess(position) {
        var element = document.getElementById('geolocation');
        element.innerHTML = 'Latitude: '  + position.coords.latitude      + '<br />' +
                            'Longitude: ' + position.coords.longitude     + '<br />' +
                            '<hr />'      + element.innerHTML;
    }

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    // Options: throw an error if no update is received every 30 seconds.
    //
    var watchID = cordova.plugins.locationServices.geolocation.watchPosition(onSuccess, onError, {
      timeout: 30000,
      priority: cordova.plugins.locationServices.geolocation.priorities.PRIORITY_HIGH_ACCURACY
    });


## geolocationOptions

Optional parameters to customize the retrieval of the geolocation
`Position`.

    {
      maximumAge: 3000,
      timeout: 5000,
      enableHighAccuracy: true,
      priority: cordova.plugins.locationServices.geolocation.priorities.PRIORITY_HIGH_ACCURACY,
      interval: 6000,
      fastInterval: 1000
    };

### Options

- __enableHighAccuracy__: Provides a hint that the application needs the best possible results. It will force the plugin to check if the GPS is enabled before any action. _(Boolean)_

- __timeout__: The maximum length of time (milliseconds) that is allowed to pass from the call to `cordova.plugins.locationServices.geolocation.getCurrentPosition` or `cordova.plugins.locationServices.geolocation.watchPosition` until the corresponding `geolocationSuccess` callback executes. If the `geolocationSuccess` callback is not invoked within this time, the `geolocationError` callback is passed a `PositionError.TIMEOUT` error code. (Note that when used in conjunction with `cordova.plugins.locationServices.geolocation.watchPosition`, the `geolocationError` callback could be called on an interval every `timeout` milliseconds!) _(Number)_

- __maximumAge__: Accept a cached position whose age is no greater than the specified time in milliseconds. _(Number)_

- __priority__: The priority of the request is a strong hint for which location sources to use. For example, PRIORITY_HIGH_ACCURACY is more likely to use GPS, and PRIORITY_BALANCED_POWER_ACCURACY is more likely to use WIFI & Cell tower positioning, but it also depends on many other factors (such as which sources are available) and is implementation dependent.  _(Number)_

- __interval__: Set the desired interval for active location updates, in milliseconds.

    The location client will actively try to obtain location updates for your application at this interval, so it has a direct influence on the amount of power used by your application. Choose your interval wisely.

    This interval is inexact. You may not receive updates at all (if no location sources are available), or you may receive them slower than requested. You may also receive them faster than requested (if other applications are requesting location at a faster interval). The fastest rate that that you will receive updates can be controlled with __fastInterval__. By default this fastest rate is 6x the interval frequency.

    Applications with only the coarse location permission may have their interval silently throttled.

    An interval of 0 is allowed, but not recommended, since location updates may be extremely fast on future implementations. _(Number)_

- __fastInterval__: Explicitly set the fastest interval for location updates, in milliseconds.

    This controls the fastest rate at which your application will receive location updates, which might be faster than __interval__ in some situations (for example, if other applications are triggering location updates).

    This allows your application to passively acquire locations at a rate faster than it actively acquires locations, saving power.

    Unlike __interval__, this parameter is exact. Your application will never receive updates faster than this value.

    If you don't call this method, a fastest interval will be selected for you. It will be a value faster than your active interval (__interval__).

    An interval of 0 is allowed, but not recommended, since location updates may be extremely fast on future implementations.  _(Number)_

## LocationServices.clearWatch

Stop watching for changes to the device's location referenced by the
`watchID` parameter.

    cordova.plugins.locationServices.geolocation.clearWatch(watchID);

### Parameters

- __watchID__: The id of the `watchPosition` interval to clear. (String)

### Example

    // Options: watch for changes in position, and use the most
    // accurate position acquisition method available.
    //
    var watchID = cordova.plugins.locationServices.geolocation.watchPosition(onSuccess, onError, { enableHighAccuracy: true });

    // ...later on...

    cordova.plugins.locationServices.geolocation.clearWatch(watchID);

## Position

Contains `cordova.plugins.locationServices.Position` coordinates and timestamp, created by the geolocation API.

### Properties

- __coords__: A set of geographic coordinates. _(Coordinates)_

- __timestamp__: Creation timestamp for `coords`. _(DOMTimeStamp)_

## Coordinates

A `cordova.plugins.locationServices.Coordinates` object is attached to a `Position` object that is
available to callback functions in requests for the current position.
It contains a set of properties that describe the geographic coordinates of a position.

### Properties

* __latitude__: Latitude in decimal degrees. _(Number)_

* __longitude__: Longitude in decimal degrees. _(Number)_

* __altitude__: Height of the position in meters above the ellipsoid. _(Number)_

* __accuracy__: Accuracy level of the latitude and longitude coordinates in meters. _(Number)_

* __altitudeAccuracy__: Accuracy level of the altitude coordinate in meters. _(Number)_

* __heading__: Direction of travel, specified in degrees counting clockwise relative to the true north. _(Number)_

* __speed__: Current ground speed of the device, specified in meters per second. _(Number)_

### Android Quirks

__altitudeAccuracy__: Not supported by Android devices, returning `null`.

## PositionError

The `cordova.plugins.locationServices.PositionError` object is passed to the `geolocationError`
callback function when an error occurs with LocationServices.

### Properties

- __code__: One of the predefined error codes listed below.

- __message__: Error message describing the details of the error encountered.

### Constants

- `cordova.plugins.locationServices.PositionError.PERMISSION_DENIED`
  - Returned when users do not allow the app to retrieve position information. This is dependent on the platform.
- `cordova.plugins.locationServices.PositionError.POSITION_UNAVAILABLE`
  - Returned when the device is unable to retrieve a position. In general, this means the device is not connected to a network or can't get a satellite fix.
- `cordova.plugins.locationServices.PositionError.TIMEOUT`
  - Returned when the device is unable to retrieve a position within the time specified by the `timeout` included in `geolocationOptions`. When used with `cordova.plugins.locationServices.geolocation.watchPosition`, this error could be repeatedly passed to the `geolocationError` callback every `timeout` milliseconds.

## Priorities

This object holds the constants to use with __priority__ options.

### Constants

- cordova.plugins.locationServices.geolocation.priorities.PRIORITY_HIGH_ACCURACY
- cordova.plugins.locationServices.geolocation.priorities.PRIORITY_BALANCED_POWER_ACCURACY
- cordova.plugins.locationServices.geolocation.priorities.PRIORITY_LOW_POWER
- cordova.plugins.locationServices.geolocation.priorities.PRIORITY_NO_POWER
