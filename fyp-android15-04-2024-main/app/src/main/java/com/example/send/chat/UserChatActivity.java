package com.example.send.chat;


import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.media.MediaRecorder;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.support.annotation.NonNull;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.util.Base64;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.AppCompatImageView;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.example.send.R;
import com.example.send.activities.UserComment;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.android.flexbox.FlexboxLayout;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.firebase.FirebaseApp;
import com.google.firebase.Timestamp;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.ListenerRegistration;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.SetOptions;
import com.google.gson.annotations.SerializedName;
import com.squareup.picasso.Picasso;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Date;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public class UserChatActivity extends AppCompatActivity {

     private String apilink = "http://10.0.2.2:8081/";
     private String apilink2 = "http://10.0.2.2:5001/";

    //private String apilink = "http://192.168.137.1:8081/";
    //private String apilink2 = "http://192.168.137.1:5001/";

    private ConstraintLayout userChatLayout;
    private EditText inputMessage;
    private RecyclerView chatRecyclerView;
    private AppCompatImageView imageSend ,btnRecordAudio;
    private FrameLayout layoutSend  , layoutSendImage;
    private ImageView iv_donationImage;
    private TextView textName ,tv_donationName , tvSuggestedReply;
    private ChatAdapter chatAdapter;
    private List<ChatMessage> chatMessages;
    private String currentUserId , receiverId ,donateId ,token ,audioFilePath;

    private static final int PICK_IMAGE_REQUEST = 1;
    private DonateItemService donateItemService;
    private ChatMessage lastMessage = null;
    private FlexboxLayout flexboxLayoutSmartReply;
    private static final int REQUEST_RECORD_AUDIO_PERMISSION = 200;
    private boolean permissionToRecordAccepted = false;
    private MediaRecorder mediaRecorder;


    private boolean isRequest = false; // Flag to identify if the chat is for a request

    private Button btnFinishDonationOrRequest;
    private boolean bothUsersCompleted = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_chat);
        Log.d("ActivityLifecycle", "onCreate called");


        PreferenceManager preferenceManager = new PreferenceManager(getApplicationContext());
        currentUserId = preferenceManager.getString(Constants.KEY_USER_ID);
        token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        token = "Bearer " + token;

        // Initialize views
        inputMessage = findViewById(R.id.inputMessage);
        layoutSend = findViewById(R.id.layoutSend);
        layoutSendImage = findViewById(R.id.layoutSendImage);
        chatRecyclerView = findViewById(R.id.chatRecyclerView);
        textName = findViewById(R.id.textName);
        tv_donationName = findViewById(R.id.tv_donationName);
        iv_donationImage = findViewById(R.id.iv_donationImage);
        flexboxLayoutSmartReply = findViewById(R.id.flexboxLayoutSmartReply);
        tvSuggestedReply = findViewById(R.id.tvSuggestedReply);
        btnRecordAudio = findViewById(R.id.btnRecordAudio);
        imageSend = findViewById(R.id.imageSend);
        userChatLayout = findViewById(R.id.userChatLayout);


         btnFinishDonationOrRequest = findViewById(R.id.btnFinishDonationOrRequest);



        // this make the message show on the top
        //LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        //layoutManager.setStackFromEnd(true); // This line might be making messages appear in the middle
        //chatRecyclerView.setLayoutManager(layoutManager);

        editTextMessage();
        setLinsteners();

        // Retrieve receiverId from intent (passed from UsersListActivity)
        receiverId = getIntent().getStringExtra("userId");
        donateId = getIntent().getStringExtra("DonateId");
        Log.d("ChatActivityDebug", "Intent Extra - donateId: " + donateId);
        if (donateId != null && donateId.startsWith("RD")) {
            isRequest = true;
        }
        keepToCheckComment();
        checkUserCompletionStatus();
        getChatData();

        Log.d("UserChatActivity", "Received UserId: " + receiverId);
        // Initialize your chat messages list and adapter
        chatMessages = new ArrayList<>();
        chatAdapter = new ChatAdapter(chatMessages, currentUserId, receiverId );
        chatRecyclerView.setAdapter(chatAdapter);

        layoutSend.setOnClickListener(v -> {
            String messageText = inputMessage.getText().toString();
            if (!messageText.isEmpty()) {
                sendMessage(messageText);
                inputMessage.setText("");
            }
        });

        layoutSendImage.setOnClickListener(v -> openImageChooser());


        // Method to fetch and display messages
        fetchMessages();
        markMessagesAsRead();
        Log.d("IntentData", "Received donateId: " + donateId + ", receiverId: " + receiverId);
        FirebaseApp.initializeApp(this);

    }

    private void sendMessage(String messageText) {
        Log.d("ChatActivityDebug", "Before Sending - donateId: " + donateId);
        Map<String, Object> message = new HashMap<>();
        message.put("senderId", currentUserId); // ID of the logged-in user
        message.put("receiverId", receiverId); // ID of the user being messaged
        message.put("donateId", donateId);  // ID of the donate being messaged
        message.put("message", messageText);
        message.put("timestamp", new Timestamp(new Date())); // Current time
        message.put("participants", Arrays.asList(currentUserId, receiverId));
        message.put("isRead", false);
        Log.d("FirebaseChatSend", "Sending message with donateId: " + donateId + ", receiverId: " + receiverId);

        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("chat").add(message)
                .addOnSuccessListener(documentReference -> {
                    Log.d("FirebaseData", "DocumentSnapshot added with ID: " + documentReference.getId());
                    // Message sent successfully. You might want to clear the EditText here or perform other UI updates.
                })
                .addOnFailureListener(e -> {
                    Log.w("FirebaseData", "Error adding document", e);
                    // Handle the failure. Show an error message or log the error.
                });


        ChatMessage newMessage = new ChatMessage();
        newMessage.setSenderId(currentUserId);
        newMessage.setReceiverId(receiverId);
        newMessage.setMessage(messageText);
        newMessage.setTimestamp(new Timestamp(new Date()));
        newMessage.setIsRead(false);
        chatMessages.add(newMessage);
        chatAdapter.notifyDataSetChanged();
        flexboxLayoutSmartReply.removeAllViews();

    }
    public void onFinishDonationClicked(View view) {
        if (bothUsersCompleted) {
            // 如果两个用户都已经完成了捐赠,直接启动 UserComment 活动
            if (isRequest) {
                updateDonationStatusOnServer(donateId);  // API call to modify the database
                updateDonationQuantities(donateId);
            }
            Intent intent = new Intent(UserChatActivity.this, UserComment.class);
            intent.putExtra("donateId", donateId);
            intent.putExtra("receiverId", receiverId);
            startActivity(intent);
        } else {
            // 如果还有用户未完成捐赠,显示警告对话框
            MaterialAlertDialogBuilder builder = new MaterialAlertDialogBuilder(this);
            builder.setTitle("Confirm donation completion");
            builder.setMessage("Are you sure you want to mark this donation as completed?");
            builder.setPositiveButton("Confirm", (dialog, which) -> {
                markDonationAsComplete(donateId, () -> {
                    Intent intent = new Intent(UserChatActivity.this, UserComment.class);
                    intent.putExtra("donateId", donateId);
                    intent.putExtra("receiverId", receiverId);
                    startActivity(intent);
                });
            });
            builder.setNegativeButton("Cancel", (dialog, which) -> {
                dialog.dismiss();
            });

            AlertDialog alertDialog = builder.create();
            alertDialog.show();
        }
    }

    interface CompletionCallback {
        void onCompleted();
    }



    private void fetchMessages() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();

        db.collection("chat")
                .whereIn("senderId", Arrays.asList(currentUserId, receiverId))
                .whereIn("receiverId", Arrays.asList(currentUserId, receiverId))
                .whereEqualTo("donateId", donateId)
                .orderBy("timestamp")
                .addSnapshotListener((queryDocumentSnapshots, e) -> {
                    if (e != null) {
                        Log.e("UserChatActivity", "Listen failed.", e);
                        return;
                    }

                    if (queryDocumentSnapshots != null) {
                        chatMessages.clear();
                        for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                            ChatMessage chatMessage = doc.toObject(ChatMessage.class);
                            if ((chatMessage.getSenderId().equals(currentUserId) && chatMessage.getReceiverId().equals(receiverId)) ||
                                    (chatMessage.getSenderId().equals(receiverId) && chatMessage.getReceiverId().equals(currentUserId))) {

                                if (chatMessage.getSenderId().equals(receiverId)) {
                                    chatMessage.setIsRead(true); // Set isRead to true for messages sent by the receiver
                                }
                                chatMessages.add(chatMessage);

                            }
                        }
                        if (!chatMessages.isEmpty()) {
                            lastMessage = chatMessages.get(chatMessages.size() - 1);
                        }
                        chatAdapter.notifyDataSetChanged();
                        getSmartReply();
                    }
                });
    }


    private void openImageChooser() {
        Intent intent = new Intent();
        intent.setType("image/*");
        intent.setAction(Intent.ACTION_GET_CONTENT);
        startActivityForResult(Intent.createChooser(intent, "Select Picture"), PICK_IMAGE_REQUEST);
    }

    private void sendImage(String imageBase64) {
        Map<String, Object> message = new HashMap<>();
        message.put("senderId", currentUserId); // ID of the logged-in user
        message.put("receiverId", receiverId); // ID of the user being messaged
        message.put("donateId", donateId);  // ID of the donate being messaged
        message.put("imageBase64", imageBase64);
        message.put("timestamp", new Timestamp(new Date())); // Current time
        message.put("participants", Arrays.asList(currentUserId, receiverId));
        message.put("isRead", false);

        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("chat").add(message)
                .addOnSuccessListener(documentReference -> {
                    // Message sent successfully. You might want to clear the EditText here or perform other UI updates.
                })
                .addOnFailureListener(e -> {
                    // Handle the failure. Show an error message or log the error.
                });



        ChatMessage newMessage = new ChatMessage();
        newMessage.setSenderId(currentUserId);
        newMessage.setReceiverId(receiverId);
        newMessage.setImageBase64(imageBase64);
        newMessage.setTimestamp(new Timestamp(new Date()));
        chatMessages.add(newMessage);
        chatAdapter.notifyDataSetChanged();
        flexboxLayoutSmartReply.removeAllViews();
    }
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK && data != null && data.getData() != null) {
            Uri imageUri = data.getData();
            try {
                // 从URI获取Bitmap
                Bitmap bitmap = MediaStore.Images.Media.getBitmap(this.getContentResolver(), imageUri);

                // 将Bitmap转换为Base64字符串
                String imageEncoded = encodeImage(bitmap);

                // 调用sendImage方法上传Base64字符串
                sendImage(imageEncoded);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private String encodeImage(Bitmap bitmap) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayOutputStream); // 你可以根据需要选择压缩格式和质量
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        return Base64.encodeToString(byteArray, Base64.DEFAULT);
    }




    private void getChatData() { //just change the name from getDonationData to getChatData
        textName.setText(getIntent().getStringExtra("userId"));
        if (isRequest) {
            fetchRequestData(); // Placeholder for fetching request details
        } else {
            // Existing code to fetch donation data remains here
            Retrofit retrofit = new Retrofit.Builder()
                    .baseUrl(apilink)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();

            DonateItemService donateItemService = retrofit.create(DonateItemService.class);
            Call<Donation> donateItemCall = donateItemService.getDonateItem(token, donateId);
            donateItemCall.enqueue(new Callback<Donation>() {
                @Override
                public void onResponse(Call<Donation> call, Response<Donation> response) {
                    if (response.isSuccessful()) {
                        Donation donation = response.body();
                        if (donation != null) {
                            tv_donationName.setText(donation.getDonateItemName());
                            if (!donation.getPhotos().isEmpty()) {
                                String imageUrl = apilink + donation.getPhotos().get(0).getDonatePhoto().replace("\\", "/");
                                Picasso.get().load(imageUrl).into(iv_donationImage);
                            }
                        }
                    } else {
                        showToast("Error: " + response.code());
                    }
                }

                @Override
                public void onFailure(Call<Donation> call, Throwable t) {
                    showToast("Error: " + t.getMessage());
                }
            });
        }
    }

    private void fetchRequestData() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink) // Your API Base URL
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        UserRequestProgressService service = retrofit.create(UserRequestProgressService.class);
        Call<UserRequestProgress> call = service.getRequestProgress(donateId);

        // Log the request URL
        Log.d("fetchRequestData", "Request URL: " + call.request().url().toString());

        call.enqueue(new Callback<UserRequestProgress>() {
            @Override
            public void onResponse(Call<UserRequestProgress> call, Response<UserRequestProgress> response) {
                if (response.isSuccessful()) {
                    UserRequestProgress requestProgress = response.body();

                    // Log the response body
                    Log.d("APIResponse", "Response Body: " + response.body().toString());

                    // Log right before setting text to verify execution path
                    Log.d("APIResponse", "Setting tv_donationName Text: " + requestProgress.getItemType());
                    tv_donationName.setText(requestProgress.getItemType());
                } else {
                    // Log error response
                    Log.e("fetchRequestData", "Error: " + response.code() + ", Message: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<UserRequestProgress> call, Throwable t) {
                // Log failure message
                Log.e("fetchRequestData", "Failure: " + t.getMessage());
            }
        });
    }





    private void markMessagesAsRead() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("chat")
                .whereEqualTo("receiverId", currentUserId)
                .whereEqualTo("senderId", receiverId)
                .whereEqualTo("donateId", donateId)
                .whereEqualTo("isRead", false)
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    for (QueryDocumentSnapshot documentSnapshot : queryDocumentSnapshots) {
                        documentSnapshot.getReference().update("isRead", true);
                    }
                });
    }

    private void editTextMessage() {
        inputMessage.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (TextUtils.isEmpty(s.toString())) {
                    btnRecordAudio.setVisibility(View.VISIBLE);
                    imageSend.setVisibility(View.GONE);
                } else {
                    btnRecordAudio.setVisibility(View.GONE);
                    imageSend.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {
            }
        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_RECORD_AUDIO_PERMISSION) {
            permissionToRecordAccepted = grantResults[0] == PackageManager.PERMISSION_GRANTED;
        }
    }

    private void startRecording() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, REQUEST_RECORD_AUDIO_PERMISSION);
        } else {
            audioFilePath = getExternalCacheDir().getAbsolutePath() + "/audio_" + System.currentTimeMillis() + ".3gp";
            mediaRecorder = new MediaRecorder();
            mediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            mediaRecorder.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP);
            mediaRecorder.setOutputFile(audioFilePath);
            mediaRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);

            try {
                mediaRecorder.prepare();
                mediaRecorder.start();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private void stopRecording() {
        if (mediaRecorder != null) {
            mediaRecorder.stop();
            mediaRecorder.release();
            mediaRecorder = null;
            sendAudio(audioFilePath);
        }
    }


    private void sendAudio(String audioFilePath) {
        File audioFile = new File(audioFilePath);
        byte[] audioBytes = new byte[(int) audioFile.length()];

        try {
            FileInputStream fileInputStream = new FileInputStream(audioFile);
            fileInputStream.read(audioBytes);
            fileInputStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

        String audioBase64 = Base64.encodeToString(audioBytes, Base64.DEFAULT);

        Map<String, Object> message = new HashMap<>();
        message.put("senderId", currentUserId);
        message.put("receiverId", receiverId);
        message.put("donateId", donateId);
        message.put("audioBase64", audioBase64);
        message.put("timestamp", new Timestamp(new Date()));
        message.put("participants", Arrays.asList(currentUserId, receiverId));
        message.put("isRead", false);

        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("chat").add(message)
                .addOnSuccessListener(documentReference -> {
                    // Message sent successfully. You might want to clear the EditText here or perform other UI updates.
                })
                .addOnFailureListener(e -> {
                    // Handle the failure. Show an error message or log the error.
                });
    }
    private void setLinsteners() {
        btnRecordAudio.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                if (event.getAction() == MotionEvent.ACTION_DOWN) {
                    showToast("Start recording");
                    btnRecordAudio.setImageTintList(ColorStateList.valueOf(Color.RED));
                    userChatLayout.setBackgroundTintList(ColorStateList.valueOf(Color.RED));
                    startRecording();
                    return true;
                } else if (event.getAction() == MotionEvent.ACTION_UP) {
                    showToast("Stop recording");
                    btnRecordAudio.setImageTintList(ColorStateList.valueOf(Color.BLACK));
                    int primaryColor = getResources().getColor(R.color.primary, null);
                    userChatLayout.setBackgroundTintList(ColorStateList.valueOf(primaryColor));
                    stopRecording();
                    return true;
                }
                return false;
            }
        });
    }

    private void markDonationAsComplete(String donateId, CompletionCallback callback) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        DocumentReference docRef = db.collection("donationCompletionStatus").document(donateId);

        // Update the current user's completion status to true
        Map<String, Object> updates = new HashMap<>();
        updates.put(currentUserId, true); // Assuming currentUserId is the ID of the current user
        Log.d("FirestoreOperation", "Attempting to write document");

        docRef.set(updates, SetOptions.merge())
                .addOnSuccessListener(aVoid -> {
                    Log.d("Firestore", "DocumentSnapshot successfully written!");

                    btnFinishDonationOrRequest.setText("Comment");
                    btnFinishDonationOrRequest.setEnabled(false);

                    checkIfDonationIsCompleted(donateId, () -> {
                        // 創建一個新的文檔來存儲評論狀態
                        callback.onCompleted();
                    });
                })
                .addOnFailureListener(e -> Log.w("Firestore", "Error writing document", e));
    }


    private void checkIfDonationIsCompleted(String donateId, CompletionCallback callback) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        DocumentReference docRef = db.collection("donationCompletionStatus").document(donateId);

        docRef.get().addOnCompleteListener(task -> {
            if (task.isSuccessful()) {
                DocumentSnapshot document = task.getResult();
                if (document.exists()) {
                    Map<String, Object> data = document.getData();
                    // Check if both users have marked the donation as complete
                    if (data != null && data.size() == 2 && data.values().stream().allMatch(status -> status.equals(true))) {
                        // Create a new document to store comment status

                        // Invoke the callback
                        callback.onCompleted();
                    }
                } else {
                    Log.d("Firestore", "No such document");
                }
            } else {
                Log.d("Firestore", "get failed with ", task.getException());
            }
        });
    }



    private void keepToCheckComment() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        ListenerRegistration listenerRegistration = db.collection("commentStatus").document(donateId)
                .addSnapshotListener((snapshot, e) -> {
                    if (e != null) {
                        Log.w("Firestore", "Listen failed.", e);
                        return;
                    }

                    if (snapshot != null && snapshot.exists()) {
                        Boolean currentUserCommented = snapshot.getBoolean(currentUserId);

                        if (currentUserCommented != null && currentUserCommented) {
                            // 如果當前用戶已經提交了評論,隱藏按鈕
                            btnFinishDonationOrRequest.setVisibility(View.GONE);
                        } else {
                            // 如果當前用戶還未提交評論,顯示按鈕
                            btnFinishDonationOrRequest.setVisibility(View.VISIBLE);
                        }
                    }
                });
    }
    private void checkUserCompletionStatus() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        DocumentReference docRef = db.collection("donationCompletionStatus").document(donateId);
        docRef.get().addOnCompleteListener(task -> {
            if (task.isSuccessful()) {
                DocumentSnapshot document = task.getResult();
                if (document.exists()) {
                    Map<String, Object> data = document.getData();
                    Boolean userCompleted = (Boolean) data.get(currentUserId);
                    Boolean otherUserCompleted = (Boolean) data.get(receiverId);

                    if (userCompleted != null && otherUserCompleted != null && userCompleted && otherUserCompleted) {
                        btnFinishDonationOrRequest.setText("Comment");
                        btnFinishDonationOrRequest.setEnabled(true);
                        bothUsersCompleted = true;
                    } else if (userCompleted != null && userCompleted) {
                        btnFinishDonationOrRequest.setText("Comment");
                        btnFinishDonationOrRequest.setEnabled(false);
                        bothUsersCompleted = false;
                    } else {
                        bothUsersCompleted = false;
                    }
                }
            } else {
                Log.d("Firestore", "get failed with ", task.getException());
            }
        });
    }

    private void updateDonationStatusOnServer(String donateId) {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink) // Ensure this is the correct URL for your React API
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        DonationCompletionService service = retrofit.create(DonationCompletionService.class);
        Call<Void> call = service.markAsDonated(donateId);
        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (!response.isSuccessful()) {
                    Log.e("API Call", "Failed to update donation status: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Log.e("API Call", "Error in API call: " + t.getMessage());
            }
        });
    }

    private void updateDonationQuantities(String donateId) {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)  // Use your API base URL
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        DonationCompletionService service = retrofit.create(DonationCompletionService.class);
        Call<Void> call = service.updateDonationQuantities(donateId);
        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.d("API Call", "Donation quantities updated successfully");
                } else {
                    Log.e("API Call", "Failed to update donation quantities: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Log.e("API Call", "Error in API call: " + t.getMessage());
            }
        });
    }

    public interface DonationCompletionService {
        @POST("/api/mark-as-donated")
        Call<Void> markAsDonated(@Query("donateId") String donateId);

        @POST("/api/update-donation-quantities")
        Call<Void> updateDonationQuantities(@Query("donateId") String donateId);
    }



    public interface UserRequestProgressService {
        @GET("api/user-request-progress/{requestDonatedId}")
        Call<UserRequestProgress> getRequestProgress(@Path("requestDonatedId") String requestDonatedId);
    }


    public class UserRequestProgress {
        @SerializedName("Request_Donated_ID")
        private String requestDonatedId;

        @SerializedName("Request_ID")
        private String requestId;

        @SerializedName("Item_type")
        private String itemType;

        @SerializedName("Request_User_ID")
        private String requestUserId;

        @SerializedName("Donator_ID")
        private String donatorId;

        @SerializedName("Expect_quantity")
        private int expectQuantity;

        @SerializedName("Donated_quantity")
        private int donatedQuantity;

        @SerializedName("Request_Post_Date")
        private String requestPostDate;

        @SerializedName("Donated_Date")
        private String donatedDate;

        @SerializedName("Donated_Status")
        private String donatedStatus;

        public UserRequestProgress(String requestDonatedId, String requestId, String itemType, String requestUserId, String donatorId, int expectQuantity, int donatedQuantity, String requestPostDate, String donatedDate, String donatedStatus) {
            this.requestDonatedId = requestDonatedId;
            this.requestId = requestId;
            this.itemType = itemType;
            this.requestUserId = requestUserId;
            this.donatorId = donatorId;
            this.expectQuantity = expectQuantity;
            this.donatedQuantity = donatedQuantity;
            this.requestPostDate = requestPostDate;
            this.donatedDate = donatedDate;
            this.donatedStatus = donatedStatus;
        }

        // Getters and Setters

        public String getRequestDonatedId() {
            return requestDonatedId;
        }

        public void setRequestDonatedId(String requestDonatedId) {
            this.requestDonatedId = requestDonatedId;
        }

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

        public String getRequestPostDate() {
            return requestPostDate;
        }

        public void setRequestPostDate(String requestPostDate) {
            this.requestPostDate = requestPostDate;
        }

        public String getDonatedDate() {
            return donatedDate;
        }

        public void setDonatedDate(String donatedDate) {
            this.donatedDate = donatedDate;
        }

        public String getDonatedStatus() {
            return donatedStatus;
        }

        public void setDonatedStatus(String donatedStatus) {
            this.donatedStatus = donatedStatus;
        }
    }


    public class Donation {

        @SerializedName("Donate_Item_ID")
        private int donateItemId;

        @SerializedName("Donate_Item_Name")
        private String donateItemName;

        @SerializedName("Donate_Item_type")
        private String donateItemType;

        @SerializedName("Donate_User_ID")
        private String donateUserId;

        @SerializedName("Donate_Item_Post_Date")
        private String donateItemPostDate;

        @SerializedName("Donate_Item_Status")
        private String donateItemStatus;

        @SerializedName("Donate_Status")
        private String donateStatus;

        @SerializedName("Donate_Item_Violation")
        private int donateItemViolation;

        @SerializedName("Donate_Item_Describe")
        private String donateItemDescribe;

        @SerializedName("Donate_Item_Location")
        private String donateItemLocation;

        @SerializedName("Donate_Item_Meetup")
        private String donateItemMeetup;

        @SerializedName("Donate_Item_MeetupLocation")
        private String donateItemMeetupLocation;

        @SerializedName("Donate_Item_MailingDelivery")
        private String donateItemMailingDelivery;

        @SerializedName("Donate_Item_MailingDeliveryMethod")
        private String donateItemMailingDeliveryMethod;

        @SerializedName("photos")
        private List<Photo> photos;

        // Getters and setters for all fields

        public String getDonateItemName() {
            return donateItemName;
        }

        public String getDonateItemStatus() {
            return donateItemStatus;
        }

        public String getDonateUserId() {
            return donateUserId;
        }

        public  String getDonateItemPostDate() {
            return donateItemPostDate;
        }

        public String getDonateItemDescribe() {
            return donateItemDescribe;
        }

        public String getDonateItemType() {
            return donateItemType;
        }

        public String getDonate_Item_Meetup() {
            return donateItemMeetup;
        }

        public String getDonate_Item_MeetupLocation() {
            return donateItemMeetupLocation;
        }

        public String getDonate_Item_MailingDelivery() {
            return donateItemMailingDelivery;
        }

        public String getDonate_Item_MailingDeliveryMethod() {
            return donateItemMailingDeliveryMethod;
        }
        // Getters and Setters...

        public List<Photo> getPhotos() {
            return photos;
        }
    }

    public class Photo {
        @SerializedName("Donate_Photo_ID")
        private int donatePhotoId;

        @SerializedName("Donate_Photo")
        private String donatePhoto;

        public String getDonatePhoto() {
            return donatePhoto;
        }
    }

    public class UserImage {

        @SerializedName("User_image")
        private String userImage;

        public String getUserImage() {
            return userImage;
        }
    }

    public class SmartReply {
        @SerializedName("message")
        private String message;

        public String getMessage() {
            return message;
        }
    }

    public interface DonateItemService {
        @GET("/donateitem/{donateitem_id}")
        Call<Donation> getDonateItem(
                @Header("Authorization") String token,
                @Path("donateitem_id") String donateItemId);
    }

    public interface SmartReplyService {
        @POST("/smart_reply")
        Call<List<SmartReply>> getSmartReply(@Body String message);
    }


    public void showToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    private void getSmartReply() {
        if(lastMessage == null ){
            Log.d("UserChatActivity", "lastMessage is null");
            return;
        }

        if( lastMessage.getSenderId().equals(currentUserId) || lastMessage.getMessage() == null || lastMessage.getMessage().equals("")){
            Log.d("UserChatActivity", "lastMessage may not be a valid message");
            return;
        }

        String message = lastMessage.getMessage();
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink2)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        SmartReplyService smartReplyService = retrofit.create(SmartReplyService.class);

        Call<List<SmartReply>> smartReplyCall = smartReplyService.getSmartReply(message);
        smartReplyCall.enqueue(new Callback<List<SmartReply>>() {
            @Override
            public void onResponse(Call<List<SmartReply>> call, Response<List<SmartReply>> response) {
                if (response.isSuccessful()) {

                    ArrayList<SmartReply> smartReplies = (ArrayList<SmartReply>) response.body();
                    flexboxLayoutSmartReply.removeAllViews();
                    for (SmartReply smartReply : smartReplies) {
                        //Create a button for each smart reply
                        Log.d("UserChatActivity", "SmartReply: " + smartReply.getMessage());
                        MaterialButton button = (MaterialButton) LayoutInflater.from(UserChatActivity.this)
                                .inflate(R.layout.material_button_smarteply, flexboxLayoutSmartReply, false);
                        button.setText(smartReply.getMessage());

                        button.setOnClickListener(v -> {
                            sendMessage(smartReply.getMessage());
                            flexboxLayoutSmartReply.removeAllViews();
                            tvSuggestedReply.setVisibility(TextView.GONE);
                        });
                        flexboxLayoutSmartReply.addView(button);
                        tvSuggestedReply.setVisibility(TextView.VISIBLE);

                    }

                } else {
                    showToast("Error: " + response.code());
                    Log.d("UserChatActivity", "getSmartReplyError: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<SmartReply>> call, Throwable t) {
                showToast("Error: " + t.getMessage());
                Log.d("UserChatActivity", "getSmartReplyError: " + t.getMessage());
            }
        });


    }


}