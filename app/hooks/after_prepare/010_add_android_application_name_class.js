#!/usr/bin/env node

// Set a custom Android application class
// We do this to fix the Parse Push issue described at
// http://stackoverflow.com/questions/23560414/apache-cordova-app-crashes-after-receiving-parse-com-push-notification/23574678

var fs = require('fs');
var path = require('path');

var rootDir = process.argv[2];

var applicationClassName = 'org.apache.cordova.CustomApplication';
var applicationClassFileName = rootDir + '/platforms/android/src/org/apache/cordova/CustomApplication.java';
var androidManifestXmlPath = rootDir + '/platforms/android/AndroidManifest.xml'

function addAndroidNameTag() {
    // add the android:name attribute to the application tag
    try {
        var xml = fs.readFileSync(androidManifestXmlPath, 'utf8');

        var applicationTag = findApplicationTag(xml);
        if(!applicationTag) {
            console.log('Could not find application tag in ' + androidManifestXmlPath);
            return;
        }

        if(applicationTag.indexOf(applicationClassName) > -1) {
            console.log(applicationClassName + 'is already set');
            return;
        }

        var newApplicationTag = applicationTag

        var nameAttr = findNameAttr(applicationTag);
        if(nameAttr) {
            // body tag has existing class attribute, but not the currently configured on
            console.log('Found existing different android:name ' + nameAttr + '. Overwriting...');
            newApplicationTag = newApplicationTag.replace(nameAttr, " ")
        }

        // add name attribute to the application tag
        newApplicationTag = newApplicationTag.replace('>', ' android:name="' + applicationClassName + '">');

        xml = xml.replace(applicationTag, newApplicationTag);

        fs.writeFileSync(androidManifestXmlPath, xml, 'utf8');

        process.stdout.write('Updated AndroidManifest.xml application android:name with ' + applicationClassName + '\n');
    } catch(e) {
        process.stdout.write(e);
    }
}

function findApplicationTag(xml) {
    // get the application tag
    try{
        return xml.match(/<application(?=[\s>])(.*?)>/gi)[0];
    }catch(e){}
}

function findNameAttr(applicationTag) {
    // get the application tag's android:name attribute
    try{
        return applicationTag.match(/ android:name=["|'](.*?)["|']/gi)[0];
    }catch(e){}
}


if(fs.existsSync(androidManifestXmlPath)) {

	if(!fs.existsSync(applicationClassFileName)) {
		var msg = '!!----------------------------------------------------------------------!!\n' +
			'!!  Run/restart gulp to configure the custom Android application class  !!\n' +
			'!!----------------------------------------------------------------------!!\n';
		process.stdout.write(msg)
	}

    console.log('Ensuring org.apache.cordova.CustomApplication in AndroidManifest.xml...');
    addAndroidNameTag();
}
