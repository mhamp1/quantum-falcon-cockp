# Backend Integration Guide for Push Notifications

This guide is for backend developers who need to send push notifications to the Quantum Falcon mobile app.

## Prerequisites

1. Firebase project set up (see `SETUP_GUIDE.md`)
2. Firebase Admin SDK installed on your backend
3. Service account credentials from Firebase Console
4. FCM tokens collected from mobile app users

## Firebase Admin SDK Setup

### Node.js/JavaScript

#### Installation
```bash
npm install firebase-admin --save
```

#### Initialize Firebase Admin
```javascript
const admin = require('firebase-admin');

// Initialize with service account
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### Python

#### Installation
```bash
pip install firebase-admin
```

#### Initialize Firebase Admin
```python
import firebase_admin
from firebase_admin import credentials, messaging

# Initialize with service account
cred = credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
```

### Java

#### Maven Dependency
```xml
<dependency>
  <groupId>com.google.firebase</groupId>
  <artifactId>firebase-admin</artifactId>
  <version>9.2.0</version>
</dependency>
```

#### Initialize Firebase Admin
```java
FileInputStream serviceAccount = new FileInputStream("path/to/serviceAccountKey.json");

FirebaseOptions options = FirebaseOptions.builder()
  .setCredentials(GoogleCredentials.fromStream(serviceAccount))
  .build();

FirebaseApp.initializeApp(options);
```

## Getting Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click gear icon → Project Settings
4. Navigate to "Service accounts" tab
5. Click "Generate new private key"
6. Save the JSON file securely (never commit to version control!)

## Sending Notifications

### 1. XP Award Notification

**Trigger**: User earns XP from completing quests, trades, achievements, etc.

#### Node.js
```javascript
async function sendXPAwardNotification(fcmToken, xpAmount, reason) {
  const message = {
    token: fcmToken,
    notification: {
      title: '🎉 XP Awarded!',
      body: `+${xpAmount} XP for ${reason}`
    },
    data: {
      type: 'xp_award',
      xp: xpAmount.toString(),
      reason: reason
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'xp_award_channel',
        color: '#00D9FF',
        icon: 'ic_notification',
        sound: 'default'
      }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          alert: {
            title: '🎉 XP Awarded!',
            body: `+${xpAmount} XP for ${reason}`
          }
        }
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent XP award notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending XP award notification:', error);
    throw error;
  }
}

// Usage
await sendXPAwardNotification(
  'user_fcm_token_here',
  50,
  'completing a daily quest'
);
```

#### Python
```python
def send_xp_award_notification(fcm_token, xp_amount, reason):
    message = messaging.Message(
        notification=messaging.Notification(
            title='🎉 XP Awarded!',
            body=f'+{xp_amount} XP for {reason}'
        ),
        data={
            'type': 'xp_award',
            'xp': str(xp_amount),
            'reason': reason
        },
        android=messaging.AndroidConfig(
            priority='high',
            notification=messaging.AndroidNotification(
                channel_id='xp_award_channel',
                color='#00D9FF',
                sound='default'
            )
        ),
        apns=messaging.APNSConfig(
            payload=messaging.APNSPayload(
                aps=messaging.Aps(
                    sound='default',
                    badge=1
                )
            )
        ),
        token=fcm_token
    )

    try:
        response = messaging.send(message)
        print('Successfully sent XP award notification:', response)
        return response
    except Exception as error:
        print('Error sending XP award notification:', error)
        raise

# Usage
send_xp_award_notification('user_fcm_token_here', 50, 'completing a daily quest')
```

### 2. Streak Reminder Notification

**Trigger**: Daily reminder at user's preferred time (scheduled job)

#### Node.js
```javascript
async function sendStreakReminderNotification(fcmToken, streakDays) {
  const message = {
    token: fcmToken,
    notification: {
      title: '🔥 Keep Your Streak!',
      body: `Don't break your ${streakDays}-day XP streak!`
    },
    data: {
      type: 'streak_reminder',
      streak_days: streakDays.toString()
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'streak_reminder_channel',
        color: '#FF8C00',
        icon: 'ic_notification',
        sound: 'default'
      }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          alert: {
            title: '🔥 Keep Your Streak!',
            body: `Don't break your ${streakDays}-day XP streak!`
          }
        }
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent streak reminder:', response);
    return response;
  } catch (error) {
    console.error('Error sending streak reminder:', error);
    throw error;
  }
}

// Usage - Schedule this to run daily
await sendStreakReminderNotification('user_fcm_token_here', 7);
```

#### Python
```python
def send_streak_reminder_notification(fcm_token, streak_days):
    message = messaging.Message(
        notification=messaging.Notification(
            title='🔥 Keep Your Streak!',
            body=f"Don't break your {streak_days}-day XP streak!"
        ),
        data={
            'type': 'streak_reminder',
            'streak_days': str(streak_days)
        },
        android=messaging.AndroidConfig(
            priority='high',
            notification=messaging.AndroidNotification(
                channel_id='streak_reminder_channel',
                color='#FF8C00',
                sound='default'
            )
        ),
        apns=messaging.APNSConfig(
            payload=messaging.APNSPayload(
                aps=messaging.Aps(
                    sound='default',
                    badge=1
                )
            )
        ),
        token=fcm_token
    )

    try:
        response = messaging.send(message)
        print('Successfully sent streak reminder:', response)
        return response
    except Exception as error:
        print('Error sending streak reminder:', error)
        raise

# Usage - Schedule this to run daily
send_streak_reminder_notification('user_fcm_token_here', 7)
```

### 3. Quest Reset Notification

**Trigger**: When daily/weekly quests reset (scheduled job)

#### Node.js
```javascript
async function sendQuestResetNotification(fcmToken, questType) {
  const message = {
    token: fcmToken,
    notification: {
      title: '📋 Quests Reset!',
      body: `Your ${questType} quests have been reset. Complete them for bonus XP!`
    },
    data: {
      type: 'quest_reset',
      quest_type: questType
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'quest_reset_channel',
        color: '#4169E1',
        icon: 'ic_notification',
        sound: 'default'
      }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          alert: {
            title: '📋 Quests Reset!',
            body: `Your ${questType} quests have been reset. Complete them for bonus XP!`
          }
        }
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent quest reset notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending quest reset notification:', error);
    throw error;
  }
}

// Usage - Schedule these based on quest reset times
await sendQuestResetNotification('user_fcm_token_here', 'daily');
await sendQuestResetNotification('user_fcm_token_here', 'weekly');
```

#### Python
```python
def send_quest_reset_notification(fcm_token, quest_type):
    message = messaging.Message(
        notification=messaging.Notification(
            title='📋 Quests Reset!',
            body=f'Your {quest_type} quests have been reset. Complete them for bonus XP!'
        ),
        data={
            'type': 'quest_reset',
            'quest_type': quest_type
        },
        android=messaging.AndroidConfig(
            priority='high',
            notification=messaging.AndroidNotification(
                channel_id='quest_reset_channel',
                color='#4169E1',
                sound='default'
            )
        ),
        apns=messaging.APNSConfig(
            payload=messaging.APNSPayload(
                aps=messaging.Aps(
                    sound='default',
                    badge=1
                )
            )
        ),
        token=fcm_token
    )

    try:
        response = messaging.send(message)
        print('Successfully sent quest reset notification:', response)
        return response
    except Exception as error:
        print('Error sending quest reset notification:', error)
        raise

# Usage - Schedule these based on quest reset times
send_quest_reset_notification('user_fcm_token_here', 'daily')
send_quest_reset_notification('user_fcm_token_here', 'weekly')
```

## Topic-Based Notifications

For sending notifications to multiple users at once (e.g., all active users), use topics:

### Subscribe User to Topic (Mobile App)
```dart
// In mobile app
await notificationService.subscribeToTopic('daily_quests');
await notificationService.subscribeToTopic('weekly_quests');
await notificationService.subscribeToTopic('all_users');
```

### Send to Topic (Backend)

#### Node.js
```javascript
async function sendToTopic(topic, notification) {
  const message = {
    topic: topic,
    notification: notification.notification,
    data: notification.data,
    android: notification.android,
    apns: notification.apns
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`Successfully sent to topic ${topic}:`, response);
    return response;
  } catch (error) {
    console.error(`Error sending to topic ${topic}:`, error);
    throw error;
  }
}

// Send daily quest reset to all subscribed users
await sendToTopic('daily_quests', {
  notification: {
    title: '📋 Daily Quests Reset!',
    body: 'New daily quests are available. Complete them for XP!'
  },
  data: {
    type: 'quest_reset',
    quest_type: 'daily'
  },
  android: {
    priority: 'high',
    notification: {
      channelId: 'quest_reset_channel',
      color: '#4169E1'
    }
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',
        badge: 1
      }
    }
  }
});
```

## Batch Notifications

Send to multiple users efficiently:

### Node.js
```javascript
async function sendBatchNotifications(tokens, notification) {
  const message = {
    tokens: tokens, // Array of FCM tokens
    notification: notification.notification,
    data: notification.data,
    android: notification.android,
    apns: notification.apns
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log(`${response.successCount} notifications sent successfully`);
    console.log(`${response.failureCount} notifications failed`);
    
    // Handle failures
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to ${tokens[idx]}:`, resp.error);
        }
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error sending batch notifications:', error);
    throw error;
  }
}

// Usage - Send XP awards to multiple users
await sendBatchNotifications(
  ['token1', 'token2', 'token3'],
  {
    notification: {
      title: '🎉 XP Awarded!',
      body: '+100 XP for event participation!'
    },
    data: {
      type: 'xp_award',
      xp: '100',
      reason: 'event participation'
    }
  }
);
```

## Scheduled Notifications

Use cron jobs or task schedulers to send notifications at specific times:

### Example with Node-Cron

```javascript
const cron = require('node-cron');

// Send streak reminders daily at 8 PM
cron.schedule('0 20 * * *', async () => {
  console.log('Running daily streak reminder job...');
  
  const users = await getUsersWithActiveStreaks();
  
  for (const user of users) {
    try {
      await sendStreakReminderNotification(user.fcmToken, user.streakDays);
    } catch (error) {
      console.error(`Failed to send to user ${user.id}:`, error);
    }
  }
  
  console.log('Streak reminder job completed.');
});

// Reset daily quests at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily quest reset job...');
  
  await sendToTopic('daily_quests', {
    notification: {
      title: '📋 Daily Quests Reset!',
      body: 'New daily quests are available!'
    },
    data: {
      type: 'quest_reset',
      quest_type: 'daily'
    }
  });
  
  console.log('Daily quest reset job completed.');
});

// Reset weekly quests every Monday at midnight
cron.schedule('0 0 * * 1', async () => {
  console.log('Running weekly quest reset job...');
  
  await sendToTopic('weekly_quests', {
    notification: {
      title: '📋 Weekly Quests Reset!',
      body: 'New weekly quests are available!'
    },
    data: {
      type: 'quest_reset',
      quest_type: 'weekly'
    }
  });
  
  console.log('Weekly quest reset job completed.');
});
```

## Managing FCM Tokens

### Store Tokens in Database

When a user logs in to the mobile app, their FCM token should be sent to your backend and stored:

```javascript
// Backend endpoint example (Express.js)
app.post('/api/users/:userId/fcm-token', async (req, res) => {
  const { userId } = req.params;
  const { fcmToken } = req.body;
  
  try {
    await database.updateUser(userId, { fcmToken });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    res.status(500).json({ error: 'Failed to update token' });
  }
});
```

### Handle Token Refresh

FCM tokens can expire or change. Listen for token updates from the mobile app:

```javascript
// When mobile app sends token refresh
app.put('/api/users/:userId/fcm-token', async (req, res) => {
  const { userId } = req.params;
  const { fcmToken, oldToken } = req.body;
  
  try {
    // Update token in database
    await database.updateUser(userId, { fcmToken });
    
    // Optionally unsubscribe old token from topics
    if (oldToken) {
      await admin.messaging().unsubscribeFromTopic([oldToken], 'all_users');
    }
    
    // Subscribe new token to topics
    await admin.messaging().subscribeToTopic([fcmToken], 'all_users');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error refreshing FCM token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});
```

### Clean Up Invalid Tokens

When FCM reports a token as invalid, remove it from your database:

```javascript
async function sendWithErrorHandling(fcmToken, message) {
  try {
    const response = await admin.messaging().send({
      token: fcmToken,
      ...message
    });
    return { success: true, response };
  } catch (error) {
    // Handle invalid token errors
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      console.log(`Token is invalid, removing from database: ${fcmToken}`);
      await database.removeInvalidToken(fcmToken);
    }
    return { success: false, error };
  }
}
```

## Testing Notifications

### Send Test Notification via Firebase Console

1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter title and body
4. Click "Send test message"
5. Enter FCM token (get from mobile app home screen)
6. Click "Test"

### Test with Backend Code

```javascript
// test-notifications.js
async function testNotifications() {
  const testToken = 'YOUR_TEST_FCM_TOKEN_HERE';
  
  console.log('Testing XP award notification...');
  await sendXPAwardNotification(testToken, 50, 'testing');
  
  console.log('Testing streak reminder...');
  await sendStreakReminderNotification(testToken, 7);
  
  console.log('Testing quest reset...');
  await sendQuestResetNotification(testToken, 'daily');
  
  console.log('All test notifications sent!');
}

testNotifications().catch(console.error);
```

## Best Practices

### 1. Rate Limiting
```javascript
// Limit notifications per user per day
const MAX_NOTIFICATIONS_PER_USER_PER_DAY = 20;

async function canSendNotification(userId) {
  const count = await database.getNotificationCount(userId, 'today');
  return count < MAX_NOTIFICATIONS_PER_USER_PER_DAY;
}
```

### 2. User Preferences
```javascript
// Check if user has notifications enabled
async function shouldSendNotification(userId, notificationType) {
  const preferences = await database.getUserPreferences(userId);
  
  if (!preferences.notificationsEnabled) {
    return false;
  }
  
  switch (notificationType) {
    case 'xp_award':
      return preferences.xpAwardsEnabled;
    case 'streak_reminder':
      return preferences.streakRemindersEnabled;
    case 'quest_reset':
      return preferences.questResetsEnabled;
    default:
      return false;
  }
}
```

### 3. Localization
```javascript
// Send notifications in user's preferred language
async function sendLocalizedNotification(userId, notificationType, data) {
  const user = await database.getUser(userId);
  const language = user.preferredLanguage || 'en';
  
  const translations = {
    xp_award: {
      en: { title: '🎉 XP Awarded!', body: `+${data.xp} XP for ${data.reason}` },
      es: { title: '🎉 ¡XP Otorgado!', body: `+${data.xp} XP por ${data.reason}` },
      // Add more languages
    }
  };
  
  const notification = translations[notificationType][language];
  await sendNotification(user.fcmToken, notification);
}
```

### 4. Error Handling
```javascript
async function sendNotificationSafely(fcmToken, message) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await admin.messaging().send({
        token: fcmToken,
        ...message
      });
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        console.error('Max retries reached:', error);
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
```

## Troubleshooting

### Issue: Notifications not delivered

**Possible causes**:
- Invalid FCM token
- Token not registered in Firebase
- User has notifications disabled on device
- App uninstalled

**Solution**: Check error codes and clean up invalid tokens

### Issue: Notifications delayed

**Possible causes**:
- Device in power-saving mode
- Network issues
- FCM server load

**Solution**: Set high priority for time-sensitive notifications

### Issue: iOS notifications not working

**Possible causes**:
- APNs not configured
- Invalid certificate
- Testing on simulator (not supported)

**Solution**: Test on physical device, verify APNs setup

## Security Considerations

1. **Never expose service account credentials**
   - Store in secure environment variables
   - Never commit to version control
   - Rotate keys periodically

2. **Validate notification content**
   - Sanitize user-generated content
   - Prevent XSS in notification bodies
   - Validate data types

3. **Implement rate limiting**
   - Prevent notification spam
   - Limit per user and globally
   - Monitor for abuse

4. **Respect user preferences**
   - Always check if notifications are enabled
   - Honor do-not-disturb times
   - Provide easy opt-out

## Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [FCM Server Documentation](https://firebase.google.com/docs/cloud-messaging/server)
- [FCM Message Format](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)
- [Error Codes Reference](https://firebase.google.com/docs/cloud-messaging/http-server-ref#error-codes)

## Support

For issues with backend integration:
- Review Firebase Admin SDK documentation
- Check Firebase Console for errors
- Test with Firebase Console's test message feature
- Contact Firebase support for platform issues
