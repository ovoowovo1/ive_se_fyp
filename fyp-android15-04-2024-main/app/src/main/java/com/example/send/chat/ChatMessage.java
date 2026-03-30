package com.example.send.chat;
import com.google.firebase.Timestamp;

public class ChatMessage {
    private String senderId;
    private String receiverId;
    private String message;
    private Timestamp timestamp;

    private String imageBase64;

    private boolean isRead = false;

    private String audioBase64;

    private int audioDuration;

    public ChatMessage(){}

    public ChatMessage(String senderId,String receiverId,String message,Timestamp timestamp ,String imageBase64){
        this.senderId=senderId;
        this.receiverId=receiverId;
        this.message=message;
        this.timestamp=timestamp;
        this.imageBase64=imageBase64;
    }
    public void setSenderId(String userId){this.senderId=userId;}
    public String getSenderId(){return senderId;}

    public void setReceiverId(String receiverId){this.receiverId=receiverId;}
    public String getReceiverId(){return receiverId;}

    public void setMessage(String message){this.message=message;}
    public String getMessage(){return message;}

    public void setTimestamp(Timestamp timestamp){this.timestamp=timestamp;}
    public Timestamp getTimestamp(){return timestamp;}

    public void setImageBase64(String imageBase64){this.imageBase64=imageBase64;}
    public String getImageBase64(){return imageBase64;}

    public void setIsRead(boolean isRead){this.isRead=isRead;}

    public boolean getIsRead(){return isRead;}

    public void setAudioBase64(String audioBase64){this.audioBase64=audioBase64;}

    public String getAudioBase64(){return audioBase64;}

    public void setAudioDuration(int audioDuration){this.audioDuration=audioDuration;}
    public int getAudioDuration(){return audioDuration;}


}
