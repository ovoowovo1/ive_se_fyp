package com.example.send.UserRequest;

public class DonatedItem {
    private String Donate_User_ID;

    public String getDonate_User_ID() {
        return Donate_User_ID;
    }

    public void setDonate_User_ID(String donate_User_ID) {
        Donate_User_ID = donate_User_ID;
    }
    private String Donate_Item_ID;

    public String getDonate_Item_ID() {
        return Donate_Item_ID;
    }

    public void setDonate_Item_ID(String donate_Item_ID) {
        Donate_Item_ID = donate_Item_ID;
    }

    private String donateItemName;
    private String donatePhoto;


    // Other fields...

    // Constructor, other methods...

    // Getter for the item name
    public String getDonateItemName() {
        return donateItemName;
    }

    // Getter for the first photo URL
    public String getDonatePhoto() {
        return donatePhoto;
    }

    // Setters for the fields
    public void setDonateItemName(String donateItemName) {
        this.donateItemName = donateItemName;
    }

    public void setDonatePhoto(String donatePhoto) {
        this.donatePhoto = donatePhoto;
    }

    // Other getters and setters...
}
