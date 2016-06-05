package org.apache.cordova;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import com.parse.Parse;
import com.parse.Parse.Configuration;
import com.parse.Parse.Configuration.Builder;
import com.parse.ParseInstallation;

/**
 * Required to handle push notifications when the app is closed. See the following links:
 * https://www.parse.com/questions/push-notification-in-android-while-app-closed
 * https://www.parse.com/questions/cannot-send-push-to-android-after-app-is-closed-until-screen-unlock
 */
public class CustomApplication extends Application {

    private static CustomApplication instance = new CustomApplication();

    public static final String LOGTAG = "CustomApplication";

    private static final ActivityCounter activityCounter = new ActivityCounter();

    public CustomApplication() {
        instance = this;
    }

    public static Context getContext() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();

        registerActivityLifecycleCallbacks(activityCounter);

        Log.i(LOGTAG, "Calling Parse.initialize()");

        Parse.initialize(new Parse.Configuration.Builder(this)
            .applicationId("@@parseAppId")
            .clientKey(null)
            .server("@@serverUrl@@parseMount") // The trailing slash is important.
            .build()
        );
        //PushService.setDefaultPushCallback(this, PushClient.class);
        //PushService.subscribe(this, "Channel", PushClient.class);
        ParseInstallation.getCurrentInstallation().saveInBackground();
    }

    public static boolean isForeground() {
        return activityCounter.isForeground();
    }

    public static boolean isBackground() {
        return activityCounter.isBackground();
    }


    /**
     * Keeps a reference count of the started activities so we know if we are in the foreground
     * Further reading - http://steveliles.github.io/is_my_android_app_currently_foreground_or_background.html
     */
    private static class ActivityCounter implements Application.ActivityLifecycleCallbacks {

        private int activityRefCount = 0;

        public boolean isForeground() {
            return activityRefCount > 0;
        }

        public boolean isBackground() {
            return activityRefCount == 0;
        }

        @Override
        public void onActivityStarted(Activity activity) {
            activityRefCount++;
        }

        @Override
        public void onActivityStopped(Activity activity) {
            activityRefCount--;
        }

        @Override
        public void onActivityCreated(Activity activity, Bundle savedInstanceState) {}

        @Override
        public void onActivityResumed(Activity activity) {}

        @Override
        public void onActivityPaused(Activity activity) {}

        @Override
        public void onActivitySaveInstanceState(Activity activity, Bundle outState) {}

        @Override
        public void onActivityDestroyed(Activity activity) {}
    }
}