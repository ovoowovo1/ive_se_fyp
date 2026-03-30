package com.example.send.Calender;


public class UserFreeTime {

    private String ID;
    private String UserID;
    private String Free_Time_Start;

    private String Free_Time_End;
    private String Remark;

    public UserFreeTime(String ID, String UserID, String Free_Time_Start, String Free_Time_End, String Remark) {
        this.ID = ID;
        this.UserID = UserID;
        this.Free_Time_Start = Free_Time_Start;
        this.Free_Time_End = Free_Time_End;
        this.Remark = Remark;
    }

    public String getID() {
        return ID;
    }

    public String getUserID() {
        return UserID;
    }

    public String getFree_Time_Start() {
        return Free_Time_Start;
    }

    public String getFree_Time_End() {
        return Free_Time_End;
    }

    public String getRemark() {
        return Remark;
    }

}
