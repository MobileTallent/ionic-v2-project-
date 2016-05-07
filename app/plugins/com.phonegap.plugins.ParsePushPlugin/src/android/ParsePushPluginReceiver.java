package com.phonegap.plugins;

import com.parse.ParsePushBroadcastReceiver;
import com.parse.ParseAnalytics;

import android.app.Activity;
import android.app.NotificationManager;
import android.app.TaskStackBuilder;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.net.Uri;
import android.util.Log;

import org.json.JSONObject;
import org.json.JSONException;

public class ParsePushPluginReceiver extends ParsePushBroadcastReceiver
{	
	public static final String LOGTAG = "ParsePushPluginReceiver";
	
	@Override
	protected void onPushReceive(Context context, Intent intent) {

        // Clear any previous notification so we don't flood the user with notifications
        // TODO should check for a flag or an id to pass to notificationManager.cancel()
        NotificationManager notificationManager = (NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.cancelAll();

        // By default (super call), a broadcast intent will be sent if an "action" is present in the data and
        // a notification will be show if "alert" and "title" are present in the data.
        // See https://parse.com/docs/android/api/com/parse/ParsePushBroadcastReceiver.html#onPushReceive(android.content.Context,%20android.content.Intent)
        // Only create a notification if the app is in the background
        if(org.apache.cordova.CustomApplication.isBackground()) {
            Log.d(LOGTAG, "App is in background, creating push notification");
            super.onPushReceive(context, intent);
        } else {
            Log.d(LOGTAG, "App is in foreground, skipping push notification");
        }

		JSONObject pushData = getPushData(intent);
		if(pushData != null) ParsePushPlugin.javascriptECB( pushData );
	}
	
	@Override
    protected void onPushOpen(Context context, Intent intent) {
		//
		// Note: preempt a Parse Android SDK bug observed in 1.7.0 and 1.7.1
		// where empty/null uri string causes crash
		//
        ParseAnalytics.trackAppOpenedInBackground(intent);

        JSONObject pushData = getPushData(intent);
        String uriString = pushData.optString("uri");
        Class<? extends Activity> cls = getActivity(context, intent);

        Intent activityIntent;
        if (!uriString.isEmpty()) {
            activityIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(uriString));
        } else {
            activityIntent = new Intent(context, cls);
        }

        activityIntent.putExtras(intent.getExtras());

        // We only have the one activity, so open it instead of starting a new one
        // Then we don't get kicked back to the home page
        activityIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(activityIntent);

        if(pushData != null) ParsePushPlugin.javascriptOnOpen( pushData );
    }
	
	private static JSONObject getPushData(Intent intent){
		JSONObject pushData = null;
		try {
            pushData = new JSONObject(intent.getStringExtra("com.parse.Data"));
        } catch (JSONException e) {
            Log.e(LOGTAG, "JSONException while parsing push data:", e);
        } finally{
        	return pushData;
        }
	}
}
