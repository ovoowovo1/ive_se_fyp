package com.example.send.chat;

public class User {
    private String userID;
    private String name;

    public User(){}
    public User(String username, String userID){
        this.name = username;
        this.userID = userID;
    }
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUserId(){ return userID;}

    public void setUserId(String userID){ this.userID=userID;}
}
