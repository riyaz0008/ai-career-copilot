import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
    try {
        const { uid } = req.params;

        const notifications = await Notification.find({
            userId: uid
        }).sort({ createdAt: -1 });

        const unreadCount = notifications.filter(
            notification => !notification.read
        ).length;

        res.status(200).json({
            message: "Notifications Fetched Successfully",
            status: 1,
            data: {
                notifications,
                unreadCount
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.nid,
            {
                read: true
            },
            {
                new: true
            }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification Not Found",
                status: 0
            });
        }

        res.status(200).json({
            message: "Notification Marked As Read",
            status: 1,
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                userId: req.params.uid,
                read: false
            },
            {
                read: true
            }
        );

        res.status(200).json({
            message: "All Notifications Marked As Read",
            status: 1
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};
export const addNotification = async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;

        const notification = await Notification.create({
            userId,
            title,
            message,
            type: type || "system"
        });

        res.status(200).json({
            message: "Notification Added Successfully",
            status: 1,
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const getUnreadNotificationCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.params.uid,
            read: false
        });

        res.json({
            status: 1,
            count
        });
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error.message
        });
    }
};