const db = require("../config/db");
const GuestNotificationModel = require("../models/guest.notification.model");

/**
 * Notification Types for Guests
 */
const GUEST_NOTIFICATION_TYPES = {
    PG_ADDED: {
        type: 'pg_added',
        icon: '🏠',
        color: '#2ecc71',
        linkPrefix: '/pgs/'
    },
    PG_UPDATED: {
        type: 'pg_updated',
        icon: '🏗️',
        color: '#3498db',
        linkPrefix: '/pgs/'
    },
    VACANT_ROOM: {
        type: 'vacant_room',
        icon: '🚪',
        color: '#1abc9c',
        linkPrefix: '/pgs/'
    },
    ROOM_AVAILABLE: {
        type: 'room_available',
        icon: '🛏️',
        color: '#2ecc71',
        linkPrefix: '/pgs/'
    }
};

/**
 * Send notification to a single guest
 */
const sendGuestNotification = async (guestId, type, data) => {
    try {
        const config = GUEST_NOTIFICATION_TYPES[type];
        if (!config) {
            throw new Error(`Invalid notification type: ${type}`);
        }

        const notificationId = await GuestNotificationModel.createGuestNotification(guestId, {
            type: config.type,
            title: data.title,
            message: data.message,
            entity_id: data.entity_id || null,
            entity_type: data.entity_type || null,
            link: data.link || (config.linkPrefix + (data.entity_id || '')),
            icon: data.icon || config.icon,
            color: data.color || config.color
        });

        return notificationId;
    } catch (error) {
        console.error('Error sending guest notification:', error);
        return null;
    }
};

/**
 * Send notification to multiple guests
 */
const sendNotificationsToGuests = async (guestIds, type, data) => {
    try {
        if (!guestIds || guestIds.length === 0) return [];

        const config = GUEST_NOTIFICATION_TYPES[type];
        if (!config) {
            throw new Error(`Invalid notification type: ${type}`);
        }

        const notificationData = {
            type: config.type,
            title: data.title,
            message: data.message,
            entity_id: data.entity_id || null,
            entity_type: data.entity_type || null,
            link: data.link || (config.linkPrefix + (data.entity_id || '')),
            icon: data.icon || config.icon,
            color: data.color || config.color
        };

        await GuestNotificationModel.createNotificationsForGuests(guestIds, notificationData);
        return guestIds.length;
    } catch (error) {
        console.error('Error sending notifications to guests:', error);
        return 0;
    }
};

/**
 * Get all notifications for a guest
 */
const getGuestNotifications = async (guestId, limit = 50, offset = 0) => {
    const notifications = await GuestNotificationModel.getGuestNotifications(guestId, limit, offset);
    const unreadCount = await GuestNotificationModel.getUnreadGuestCount(guestId);
    
    return {
        notifications,
        unreadCount,
        total: notifications.length
    };
};

/**
 * Get unread notifications for a guest
 */
const getUnreadGuestNotifications = async (guestId, limit = 20) => {
    const notifications = await GuestNotificationModel.getUnreadGuestNotifications(guestId, limit);
    const unreadCount = await GuestNotificationModel.getUnreadGuestCount(guestId);
    
    return {
        notifications,
        unreadCount
    };
};

/**
 * Get unread count for a guest
 */
const getUnreadGuestCount = async (guestId) => {
    return await GuestNotificationModel.getUnreadGuestCount(guestId);
};

/**
 * Mark notification as read
 */
const markGuestNotificationAsRead = async (notificationId, guestId) => {
    return await GuestNotificationModel.markGuestNotificationAsRead(notificationId, guestId);
};

/**
 * Mark all notifications as read
 */
const markAllGuestNotificationsAsRead = async (guestId) => {
    return await GuestNotificationModel.markAllGuestNotificationsAsRead(guestId);
};

/**
 * Delete a notification
 */
const deleteGuestNotification = async (notificationId, guestId) => {
    return await GuestNotificationModel.deleteGuestNotification(notificationId, guestId);
};

/**
 * Generate notification messages for guest events
 */
const generateGuestNotificationMessages = {
    pgAdded: (pg) => ({
        title: 'New PG Available',
        message: `A new PG "${pg.name}" has been added. Check it out!`,
        entity_id: pg.id,
        entity_type: 'pg'
    }),
    
    pgUpdated: (pg) => ({
        title: 'PG Updated',
        message: `PG "${pg.name}" has been updated with new details.`,
        entity_id: pg.id,
        entity_type: 'pg'
    }),
    
    vacantRoom: (room) => ({
        title: 'Vacant Room Available',
        message: `Room ${room.room_number} is now available in ${room.pg_name}.`,
        entity_id: room.id,
        entity_type: 'room'
    }),
    
    roomAvailable: (room) => ({
        title: 'New Room Available',
        message: `A new room is available in ${room.pg_name}.`,
        entity_id: room.id,
        entity_type: 'room'
    })
};

module.exports = {
    GUEST_NOTIFICATION_TYPES,
    sendGuestNotification,
    sendNotificationsToGuests,
    getGuestNotifications,
    getUnreadGuestNotifications,
    getUnreadGuestCount,
    markGuestNotificationAsRead,
    markAllGuestNotificationsAsRead,
    deleteGuestNotification,
    generateGuestNotificationMessages
};