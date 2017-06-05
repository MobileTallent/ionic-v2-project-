# README #

# buidling process for iOS platform #

server/

1. creating iOS development & APNS development certificate, and exporting .p12 file
2. creating iOS production & APNS production certificate, and exporting .p12 file
3. adding push notification configuration in config.json
4. confirming configuration again in parse-config.js

app/

1. npm install
2. gulp
3. ionic platform add ios
4. cordova plugin add https://github.com/taivo/parse-push-plugin
5. creating preference tags in config.xml https://github.com/taivo/parse-push-plugin
6. ionic build ios
7. ionic run ios

note: 
1) when running iOS version, please confirm this log:
]ParsePushPlugin is regisering your device for PN
]PN registration successful. Saving device token to installation
2) Must confirm one app id is used for both facebook login and push notification


Documentation is in the /docs folder