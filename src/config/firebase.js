const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
let firebaseApp;
let messaging;

try {
  // Try to load service account file from src folder
  const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
  
  // Check if file exists
  const fs = require('fs');
  let serviceAccount;
  
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
    console.log('✅ Firebase service account found at:', serviceAccountPath);
  } else {
    console.warn('⚠️ Firebase service account NOT found at:', serviceAccountPath);
    console.warn('⚠️ Please download from Firebase Console and place at this location');
  }
  
  if (serviceAccount) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log('✅ Firebase Admin SDK initialized with service account');
  } else {
    throw new Error('Service account file not found');
  }
} catch (error) {
  console.warn('⚠️ Failed to load service account:', error.message);
  console.warn('⚠️ Firebase push notifications will be disabled.');
  
  // Create a dummy app to prevent crashes
  // This will still allow the server to run, but push notifications won't work
  try {
    firebaseApp = admin.initializeApp({
      projectId: 'dummy-project',
      credential: admin.credential.cert({
        projectId: 'dummy-project',
        clientEmail: 'dummy@example.com',
        privateKey: '-----BEGIN PRIVATE KEY-----\nDUMMY\n-----END PRIVATE KEY-----\n',
      })
    });
    console.log('⚠️ Firebase initialized with dummy credentials (push notifications disabled)');
  } catch (initError) {
    console.error('❌ Failed to initialize Firebase even with dummy credentials:', initError.message);
    // Create a minimal app that won't crash
    firebaseApp = { messaging: () => ({ send: async () => {}, sendEachForMulticast: async () => ({}) }) };
  }
}

// Only create messaging if admin is available
try {
  messaging = admin.messaging ? admin.messaging() : null;
} catch (e) {
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
    
    console.log(`✅ FCM token saved for tenant ${tenantId}`);
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

  // Skip if messaging is not available
  if (!messaging) {
    console.warn('⚠️ Firebase messaging not available, skipping push notification');
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
    console.log(`✅ Push notification sent: ${response}`);
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

  // Skip if messaging is not available
  if (!messaging) {
    console.warn('⚠️ Firebase messaging not available, skipping push notifications');
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
      
      console.log(`✅ Multicast: ${response.successCount} success, ${response.failureCount} failed`);
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
    console.log(`✅ FCM token deactivated for tenant ${tenantId}`);
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
    console.log(`✅ All FCM tokens deactivated for tenant ${tenantId}`);
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
};