package com.example.send.Notifications;

import com.google.firebase.Timestamp;

public class Notification {
    private String userId;
    private String type;
    private String message;
    private Timestamp timestamp;
    private boolean isRead;
    private String relatedId; // ID of the request that was donated to, for example

    // Default constructor required for calls to DataSnapshot.getValue(Notification.class)
    public Notification() {
    }

    // Constructor with parameters
    public Notification(String userId, String type, String message, Timestamp timestamp, boolean isRead, String relatedId) {
        this.userId = userId;
        this.type = type;
        this.message = message;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.relatedId = relatedId;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public String getRelatedId() {
        return relatedId;
    }

    public void setRelatedId(String relatedId) {
        this.relatedId = relatedId;
    }
}
