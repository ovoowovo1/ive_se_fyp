package com.example.send.UserRequest;

import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.send.R;
import com.example.send.activities.MainActivity;
import com.example.send.chat.UserChatActivity;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.firebase.firestore.FirebaseFirestore;
import com.makeramen.roundedimageview.RoundedImageView;
import com.squareup.picasso.Picasso;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;
import androidx.appcompat.app.AlertDialog;


public class RequestItemDataActivity extends AppCompatActivity {

    private String apilink = "http://10.0.2.2:8081/";
    //private String apilink = "http://192.168.137.1:8081/";
    private Retrofit retrofit;
    private TextView userIDTextView, babyAgeTextView, babyGenderTextView, itemTypeTextView, quantityTextView, sizeRangeTextView, urgencyTextView, reasonTextView, additionalNotesTextView;
    private RoundedImageView profileImageView;
    private Button btnDecrement,btnIncrement;
    private UserRequest currentUserRequest;
    private EditText txtNumber;
    private String getCurrentUserId() {
        android.content.SharedPreferences prefs = getSharedPreferences(Constants.KEY_PREFERENCE_NAME, MODE_PRIVATE);
        return prefs.getString(Constants.KEY_USER_ID, ""); // "" is the default value if not found
    }

    private UserRequestApi userRequestApi;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_request_item_data);

        // Initialize your views
        profileImageView = findViewById(R.id.imageProfile);
        userIDTextView = findViewById(R.id.UserID);
        babyAgeTextView = findViewById(R.id.BabyAge);
        babyGenderTextView = findViewById(R.id.BabyGender);
        itemTypeTextView = findViewById(R.id.Item);
        quantityTextView = findViewById(R.id.Item_quantity);
        sizeRangeTextView = findViewById(R.id.size_or_range);
        urgencyTextView = findViewById(R.id.Urgency);
        reasonTextView = findViewById(R.id.Reason);
        additionalNotesTextView = findViewById(R.id.additionalNotes);
        txtNumber = findViewById(R.id.txtNumber);
        btnDecrement = findViewById(R.id.btnDecrement);
        btnIncrement = findViewById(R.id.btnIncrement);

        // Decrement button click listener
        btnDecrement.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                int number = Integer.parseInt(txtNumber.getText().toString());
                if (number > 0) {
                    number--;
                    txtNumber.setText(String.valueOf(number));
                }
            }
        });

// Increment button click listener
        btnIncrement.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                int number = Integer.parseInt(txtNumber.getText().toString());
                number++;
                txtNumber.setText(String.valueOf(number));
            }
        });

        // Get the data from the intent
        Intent intent = getIntent();
        String requestID = intent.getStringExtra("Request_ID");
        String userID = intent.getStringExtra("Request_User_ID");
        String itemType = intent.getStringExtra("Item_type");
        String quantity = intent.getStringExtra("Quantity");
        String userImage = intent.getStringExtra("User_image");
        // Add other fields as needed

        // Set the data to the views
        userIDTextView.setText(userID);
        // Set other fields
        itemTypeTextView.setText(itemType);
        quantityTextView.setText(quantity);
        // Load the user image using Picasso
        if (userImage != null && !userImage.isEmpty()) {
            Picasso.get().load(userImage).into(profileImageView);
        }
        // Set other fields based on the data


        fetchRequestDetails(requestID);


        //go to the chat page
        retrofit = new Retrofit.Builder()
                .baseUrl(apilink) // Replace with your server URL
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        // Initialize API interface
        userRequestApi = retrofit.create(UserRequestApi.class);


    }
    public void Offer(View view) {
        Log.d("OfferLog", "Offer method initiated.");
        String donatorId = getCurrentUserId();
        Log.d("OfferLog", "Current Donator ID: " + donatorId);
        if (currentUserRequest == null) {
            Log.e("OfferLog", "currentUserRequest is null. Exiting method.");
            Toast.makeText(this, "Error: Request details are not available.", Toast.LENGTH_SHORT).show();
            return;
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Confirm Donation");
        builder.setMessage("Do you want to donate?");
        builder.setPositiveButton("Yes", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String GenID = IDGenerator.generateRequestDonationId();
                String requestDonatedId = GenID;
                String requestId = currentUserRequest.getRequest_ID();
                String itemType = currentUserRequest.getItem_type();
                String requestUserId = currentUserRequest.getRequest_User_ID();
                int expectQuantity = currentUserRequest.getExpect_quantity();
                int additionalDonation = Integer.parseInt(txtNumber.getText().toString());
                String requestPostDate = currentUserRequest.getRequestPostDate(); // Fetch the post date from currentUserRequest

                if (additionalDonation == 0) {
                    Toast.makeText(RequestItemDataActivity.this, "No donation amount entered. Please enter a valid donation amount.", Toast.LENGTH_LONG).show();
                    return; // Exit the method if no donation is made
                }

                DonationRecord donationRecord = new DonationRecord(requestDonatedId, requestId, itemType, requestUserId, donatorId, expectQuantity, additionalDonation, requestPostDate);

                userRequestApi.addDonationRecord(donationRecord).enqueue(new Callback<ResponseBody>() {
                    @Override
                    public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                        if (response.isSuccessful()) {
                            Intent chatIntent = new Intent(RequestItemDataActivity.this, UserChatActivity.class);
                            chatIntent.putExtra("userId", requestUserId);
                            chatIntent.putExtra("DonateId", requestDonatedId);
                            startActivity(chatIntent);
                            Toast.makeText(RequestItemDataActivity.this, "Donation recorded successfully", Toast.LENGTH_SHORT).show();
                            addNotificationToFirestore(requestUserId, "Donor ID: " + donatorId + " wants to donate " + additionalDonation + " " + itemType + " to your request.", requestDonatedId);
                            sendAutoMessage(requestDonatedId, requestUserId, "Hi, I would like to donate " + additionalDonation + " " + itemType + ". Please let me know if you accept.");
                        } else {
                            Toast.makeText(RequestItemDataActivity.this, "Failed to record donation", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<ResponseBody> call, Throwable t) {
                        Toast.makeText(RequestItemDataActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
            }
        });

        builder.setNegativeButton("No", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
            }
        });

        AlertDialog dialog = builder.create();
        dialog.show();
    }



    private void sendAutoMessage(String donateId, String receiverId, String messageText) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        Map<String, Object> chatMessage = new HashMap<>();
        chatMessage.put("senderId", getCurrentUserId());
        chatMessage.put("receiverId", receiverId);
        chatMessage.put("message", messageText);
        chatMessage.put("donateId", donateId);
        chatMessage.put("timestamp", new com.google.firebase.Timestamp(new Date()));
        chatMessage.put("isRead", false);
        chatMessage.put("participants", Arrays.asList(getCurrentUserId(), receiverId));

        db.collection("chat").add(chatMessage)
                .addOnSuccessListener(documentReference -> Log.d("FirestoreChat", "Auto message sent successfully with ID: " + documentReference.getId()))
                .addOnFailureListener(e -> Log.e("FirestoreChat", "Failed to send auto message", e));
    }








    public interface UserRequestApi {
        @GET("api/user-request-details/{requestId}")
        Call<UserRequest> getUserRequestDetails(@Path("requestId") String requestId);



        @POST("api/addDonationRecord")
        Call<ResponseBody> addDonationRecord(@Body DonationRecord donationRecord);

    }



    private void fetchRequestDetails(String requestId) {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink) // Your API base URL
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        UserRequestApi api = retrofit.create(UserRequestApi.class);
        api.getUserRequestDetails(requestId).enqueue(new Callback<UserRequest>() {
            @Override
            public void onResponse(Call<UserRequest> call, Response<UserRequest> response) {
                if (response.isSuccessful() && response.body() != null) {
                    currentUserRequest = response.body(); // Store the fetched UserRequest
                    populateData(response.body());
                } else {
                    // Handle response error
                }
            }

            @Override
            public void onFailure(Call<UserRequest> call, Throwable t) {
                // Handle failure
            }
        });
    }

    private void populateData(UserRequest details) {
        userIDTextView.setText("User ID: " + details.getRequest_User_ID());
        babyAgeTextView.setText("Baby Age: " + details.getBaby_age());
        babyGenderTextView.setText("Baby Gender: "  +details.getGender());
        itemTypeTextView.setText(details.getItem_type());
        quantityTextView.setText(String.valueOf(details.getExpect_quantity()));
        sizeRangeTextView.setText(details.getSize_or_range());
        urgencyTextView.setText(details.getUrgency());
        reasonTextView.setText(details.getReason_of_Request());
        additionalNotesTextView.setText(details.getAdditional_Note());


        // Load user image
        String userImage = details.getUser_image();
        if (userImage != null && !userImage.isEmpty()) {
            // Assuming the base URL is required for the image URL
            userImage = apilink + userImage.replace("\\", "/");
            Picasso.get().load(userImage).into(profileImageView);
        } else {
            // Set a default image if none is available
            profileImageView.setImageResource(R.drawable.background_image);
        }

        // Set the corner radius and oval shape as in RequestFragment
        profileImageView.setCornerRadius(10); // Adjust the corner radius as desired
        profileImageView.setOval(true);
        Button btnOffer = findViewById(R.id.SendDetail);
        String currentUserId = getCurrentUserId();
        if (currentUserId.equals(details.getRequest_User_ID())) {
            btnOffer.setEnabled(false);
            btnOffer.setText("This is your request");
        } else {
            btnOffer.setEnabled(true);
            btnOffer.setText("Donate"); // Or whatever the default text should be
        }
    }

    // Example of adding a custom message and Request_Donated_ID to Firestore
    private void addNotificationToFirestore(String userId, String message, String requestDonatedId) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        Map<String, Object> notification = new HashMap<>();
        notification.put("userId", userId);
        notification.put("message", message);
        notification.put("timestamp", com.google.firebase.Timestamp.now());
        notification.put("isRead", false);
        notification.put("type", "Request");
        notification.put("relatedId", requestDonatedId); // Linking the notification to the specific donation action

        db.collection("notifications").add(notification)
                .addOnSuccessListener(documentReference -> Log.d("Notification", "Notification added with Request_Donated_ID: " + requestDonatedId))
                .addOnFailureListener(e -> Log.e("Notification", "Error adding notification", e));
    }





    //constructor
    public class UserRequest{

        private String requestPostDate;
        private String Request_ID;
        private String Request_User_ID;
        private String Baby_age;
        private String Gender;
        private String Item_type;
        private int Expect_quantity;
        private int Donated_quantity;
        private String Size_or_range;

        private String Urgency;
        private String Reason_of_Request;
        private String Additional_Note;

        public String getBaby_age() {
            return Baby_age;
        }

        public void setBaby_age(String baby_age) {
            Baby_age = baby_age;
        }

        public String getGender() {
            return Gender;
        }

        public void setGender(String gender) {
            Gender = gender;
        }

        public String getSize_or_range() {
            return Size_or_range;
        }

        public void setSize_or_range(String size_or_range) {
            Size_or_range = size_or_range;
        }

        public String getUrgency() {
            return Urgency;
        }

        public void setUrgency(String urgency) {
            Urgency = urgency;
        }

        public String getReason_of_Request() {
            return Reason_of_Request;
        }

        public void setReason_of_Request(String reason_of_Request) {
            Reason_of_Request = reason_of_Request;
        }

        public String getAdditional_Note() {
            return Additional_Note;
        }

        public void setAdditional_Note(String additional_Note) {
            Additional_Note = additional_Note;
        }

        private String User_image;

        public String getRequestPostDate() {
            return requestPostDate;
        }

        public void setRequestPostDate(String requestPostDate) {
            this.requestPostDate = requestPostDate;
        }

        public String getRequest_ID() {
            return Request_ID;
        }

        public void setRequest_ID(String request_ID) {
            Request_ID = request_ID;
        }

        public String getRequest_User_ID() {
            return Request_User_ID;
        }

        public void setRequest_User_ID(String request_User_ID) {
            Request_User_ID = request_User_ID;
        }

        public String getItem_type() {
            return Item_type;
        }

        public void setItem_type(String item_type) {
            Item_type = item_type;
        }

        public int getExpect_quantity() {
            return Expect_quantity;
        }

        public void setExpect_quantity(int Expect_quantity) {
            this.Expect_quantity = Expect_quantity;
        }

        public int getDonated_quantity() {
            return Donated_quantity;
        }

        public void setDonated_quantity(int Donated_quantity) {
            this.Donated_quantity = Donated_quantity;
        }

        public String getUser_image() {
            return User_image;
        }

        public void setUser_image(String user_image) {
            User_image = user_image;
        }
    }

    public class UpdateDonationRequest {
        private String requestId;
        private int additionalDonation;
        private String requestDonatedId;
        public String getRequestDonatedId() {
            return requestDonatedId;
        }

        public void setRequestDonatedId(String requestDonatedId) {
            this.requestDonatedId = requestDonatedId;
        }



        public UpdateDonationRequest(String requestId, int additionalDonation, String requestDonatedId) {
            this.requestId = requestId;
            this.additionalDonation = additionalDonation;
        }
    }

    public class DonationRecord {
        private String requestId;
        private String itemType;
        private String requestUserId;
        private String donatorId;
        private int expectQuantity;
        private int donatedQuantity;
        private String requestPostDate; // New field for the post date



        private String requestDonatedId;

        // Updated constructor to include requestPostDate
        public DonationRecord(String requestDonatedId,String requestId, String itemType, String requestUserId, String donatorId, int expectQuantity, int donatedQuantity, String requestPostDate) {
            this.requestId = requestId;
            this.itemType = itemType;
            this.requestUserId = requestUserId;
            this.donatorId = donatorId;
            this.expectQuantity = expectQuantity;
            this.donatedQuantity = donatedQuantity;
            this.requestPostDate = requestPostDate;
            this.requestDonatedId = requestDonatedId;// Set the post date
        }

        // Assume getters and setters are here, including for requestPostDate
        public String getRequestDonatedId() {
            return requestDonatedId;
        }

        public void setRequestDonatedId(String requestDonatedId) {
            this.requestDonatedId = requestDonatedId;
        }
        public String getRequestPostDate() {
            return requestPostDate;
        }

        public void setRequestPostDate(String requestPostDate) {
            this.requestPostDate = requestPostDate;
        }

        // Assume getters and setters are here

        public String getRequestId() {
            return requestId;
        }

        public void setRequestId(String requestId) {
            this.requestId = requestId;
        }

        public String getItemType() {
            return itemType;
        }

        public void setItemType(String itemType) {
            this.itemType = itemType;
        }

        public String getRequestUserId() {
            return requestUserId;
        }

        public void setRequestUserId(String requestUserId) {
            this.requestUserId = requestUserId;
        }

        public String getDonatorId() {
            return donatorId;
        }

        public void setDonatorId(String donatorId) {
            this.donatorId = donatorId;
        }

        public int getExpectQuantity() {
            return expectQuantity;
        }

        public void setExpectQuantity(int expectQuantity) {
            this.expectQuantity = expectQuantity;
        }

        public int getDonatedQuantity() {
            return donatedQuantity;
        }

        public void setDonatedQuantity(int donatedQuantity) {
            this.donatedQuantity = donatedQuantity;
        }
    }


}



