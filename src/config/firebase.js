const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
let firebaseApp;
let messaging;
let isFirebaseEnabled = false;

try {
  let serviceAccount = null;
  
  // Option 1: Try environment variable (Production - Render)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      console.log('✅ Firebase service account loaded from environment variable');
    } catch (parseError) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', parseError.message);
    }
  }
  
  // Option 2: Try local file (Development - only if env var not found)
  if (!serviceAccount) {
    const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      try {
        serviceAccount = require(serviceAccountPath);
        console.log('✅ Firebase service account loaded from local file');
      } catch (fileError) {
        console.warn('⚠️ Failed to load local service account file:', fileError.message);
      }
    } else {
      console.log('ℹ️ Local Firebase service account file not found at:', serviceAccountPath);
    }
  }
  
  // Initialize Firebase if we have service account
  if (serviceAccount) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    isFirebaseEnabled = true;
    console.log('✅ Firebase initialized successfully');
  } else {
    console.log('ℹ️ Firebase push notifications disabled - no service account found');
  }
} catch (error) {
  console.warn('⚠️ Firebase initialization failed:', error.message);
  console.log('ℹ️ Firebase push notifications will be disabled');
}

// Only create messaging if Firebase is enabled
if (isFirebaseEnabled && admin.messaging) {
  try {
    messaging = admin.messaging();
  } catch (e) {
    console.warn('⚠️ Failed to initialize Firebase messaging:', e.message);
    messaging = null;
  }
} else {
  messaging = null;
}

/**
 * Get FCM tokens for a tenant
 */
const getTenantFCMTokens = async (tenantId) => {
  try {
    const db = require('./db');
    const connection = await db.getConnection();
    
    try {
      const [rows] = await connection.execute(
        `SELECT fcm_token FROM tenant_devices 
         WHERE tenant_id = ? AND is_active = 1`,
        [tenantId]
      );
      return rows.map(row => row.fcm_token);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error getting FCM tokens:', error);
    return [];
  }
};

/**
 * Save FCM token for a tenant
 */
const saveFCMToken = async (tenantId, fcmToken, deviceType = 'android') => {
  const db = require('./db');
  const connection = await db.getConnection();
  
  try {
    // Check if token already exists
    const [existing] = await connection.execute(
      `SELECT id FROM tenant_devices WHERE tenant_id = ? AND fcm_token = ?`,
      [tenantId, fcmToken]
    );
    
    if (existing.length > 0) {
      await connection.execute(
        `UPDATE tenant_devices SET updated_at = NOW(), is_active = 1 WHERE id = ?`,
        [existing[0].id]
      );
    } else {
      await connection.execute(
        `INSERT INTO tenant_devices (tenant_id, fcm_token, device_type, is_active, created_at) 
         VALUES (?, ?, ?, 1, NOW())`,
        [tenantId, fcmToken, deviceType]
      );
    }
    
  } finally {
    connection.release();
  }
};

/**
 * Send push notification to a single device
 */
const sendPushNotification = async (fcmToken, notification, data = {}) => {
  if (!fcmToken) {
    console.warn('No FCM token provided');
    return null;
  }

  // Skip if Firebase is not enabled
  if (!isFirebaseEnabled || !messaging) {
    console.log('ℹ️ Push notification skipped - Firebase not configured');
    return null;
  }

  try {
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title || 'Livinkey',
        body: notification.body || 'You have a new notification',
      },
      data: {
        type: data.type || 'general',
        entity_id: String(data.entity_id || ''),
        action: data.action || 'open',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'livinkey_channel',
          priority: 'high',
          visibility: 'public',
          icon: '@mipmap/ic_launcher',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
        headers: {
          'apns-priority': '10',
        },
      },
    };

    const response = await messaging.send(message);
    return response;
  } catch (error) {
    console.error('❌ Failed to send push notification:', error);
    return null;
  }
};

/**
 * Send push notification to multiple devices
 */
const sendPushNotificationToMultiple = async (fcmTokens, notification, data = {}) => {
  if (!fcmTokens || fcmTokens.length === 0) {
    console.warn('No FCM tokens provided');
    return null;
  }

  // Skip if Firebase is not enabled
  if (!isFirebaseEnabled || !messaging) {
    console.log('ℹ️ Push notifications skipped - Firebase not configured');
    return null;
  }

  // FCM limit is 500 tokens per multicast
  const chunks = [];
  for (let i = 0; i < fcmTokens.length; i += 500) {
    chunks.push(fcmTokens.slice(i, i + 500));
  }

  const results = [];
  for (const chunk of chunks) {
    try {
      const message = {
        tokens: chunk,
        notification: {
          title: notification.title || 'Livinkey',
          body: notification.body || 'You have a new notification',
        },
        data: {
          type: data.type || 'general',
          entity_id: String(data.entity_id || ''),
          action: data.action || 'open',
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'livinkey_channel',
            priority: 'high',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await messaging.sendEachForMulticast(message);
      results.push({
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      });
      
    } catch (error) {
      console.error('❌ Multicast failed:', error);
      results.push({ error: error.message });
    }
  }

  return results;
};

/**
 * Remove invalid FCM token
 */
const removeFCMToken = async (tenantId, fcmToken) => {
  const db = require('./db');
  const connection = await db.getConnection();
  
  try {
    await connection.execute(
      `UPDATE tenant_devices SET is_active = 0, updated_at = NOW() 
       WHERE tenant_id = ? AND fcm_token = ?`,
      [tenantId, fcmToken]
    );
  } finally {
    connection.release();
  }
};

/**
 * Remove all FCM tokens for a tenant
 */
const removeAllFCMTokens = async (tenantId) => {
  const db = require('./db');
  const connection = await db.getConnection();
  
  try {
    await connection.execute(
      `UPDATE tenant_devices SET is_active = 0, updated_at = NOW() 
       WHERE tenant_id = ?`,
      [tenantId]
    );
  } finally {
    connection.release();
  }
};

module.exports = {
  getTenantFCMTokens,
  saveFCMToken,
  sendPushNotification,
  sendPushNotificationToMultiple,
  removeFCMToken,
  removeAllFCMTokens,
  isFirebaseEnabled,  // Export this so other modules can check
};