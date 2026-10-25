import NotificationPreference from "../models/NotificationPreference.js";

export const getNotificationPreferences = async (req, res) => {
    try {
        let preferences = await NotificationPreference.findOne({
            userId: req.params.uid
        });
        if (!preferences) {
            preferences = await NotificationPreference.create({
                userId: req.params.uid
            });
        }
        res.status(200).json({
            message: "Notification Preferences Fetched Successfully",
            status: 1,
            data: preferences
        });
    } catch (error) {
        console.error("Get Notification Preferences Error:", error);
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const updateNotificationPreferences = async (req, res) => {
    try {
        const {
            learningReminders,
            assessmentUpdates,
            jobAlerts
        } = req.body;
        const preferences = await NotificationPreference.findOneAndUpdate(
            { userId: req.params.uid },
            {
                learningReminders,
                assessmentUpdates,
                jobAlerts
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );
        res.status(200).json({
            message: "Notification Preferences Updated Successfully",
            status: 1,
            data: preferences
        });
    } catch (error) {
        console.error("Update Notification Preferences Error:", error);
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};