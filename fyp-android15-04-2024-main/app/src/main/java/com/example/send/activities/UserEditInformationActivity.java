package com.example.send.activities;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.support.annotation.NonNull;
import android.util.Base64;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import com.example.send.R;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;
import com.makeramen.roundedimageview.RoundedImageView;
import com.squareup.picasso.Picasso;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Part;
import retrofit2.http.Path;

import com.google.firebase.firestore.FirebaseFirestore;


public class UserEditInformationActivity extends AppCompatActivity {

    private String apilink = "http://10.0.2.2:8081/";
    //private String apilink = "http://192.168.137.1:8081/";
    private EditText inputUserName;
    private EditText inputUserContactNumber;

    private EditText inputUserEmail;
    private UserService userService;
    private PreferenceManager preferenceManager;
    private RoundedImageView imageProfile;
    private  String encodedImage = null;

    private TextView inputBirthday ;

    private DatePickerDialog.OnDateSetListener mDateSetListener;

    private Spinner spinnerGender;

    private Spinner spinnerCountry;

    private  String selectedGender = null;

    private  String [] country = null;

    private EditText inputUserAboutMe;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_edit_information);


        inputUserName = findViewById(R.id.inputUserName);
        inputUserContactNumber = findViewById(R.id.inputUserContactNumber);
        inputUserEmail = findViewById(R.id.inputUserEmail);
        imageProfile = findViewById(R.id.imageProfile);
        inputBirthday = findViewById(R.id.inputBirthday);
        spinnerGender = findViewById(R.id.spinner_gender);
        spinnerCountry = findViewById(R.id.spinnerCountry);
        inputUserAboutMe = findViewById(R.id.inputAboutMe);

        // Initialize Retrofit service
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink) // replace with your server URL
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        userService = retrofit.create(UserService.class);

        // Initialize PreferenceManager
        preferenceManager = new PreferenceManager(this);
        System.out.println("this is ID " + preferenceManager.getString(Constants.SQL_USER_ID));
        fetchUserData();
        setGender();

        country = getResources().getStringArray(R.array.country_group);
        setCountry();


        inputUserName.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                if (event.getAction() == MotionEvent.ACTION_DOWN) {
                    // Set the background resource when the EditText is touched
                    inputUserName.setBackgroundResource(R.drawable.background_input_state);
                }
                return false;
            }
        });

        inputUserEmail.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                if (event.getAction() == MotionEvent.ACTION_DOWN) {
                    // Set the background resource when the EditText is touched
                    inputUserEmail.setBackgroundResource(R.drawable.background_input_state);
                }
                return false;
            }
        });
    }

    private void fetchUserData() {
        String token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        String userId = preferenceManager.getString(Constants.SQL_USER_ID);
        String authToken = "Bearer " + token;
        Call<User> call = userService.getUser(authToken, userId);

        call.enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                if (response.isSuccessful()) {
                    User user = response.body();
                    // Populate EditText fields

                    inputUserName.setText(user.getName());

                    if(!user.get_User_Contact_Number().equals("0")) {
                        inputUserContactNumber.setText(user.get_User_Contact_Number());
                    }

                    inputUserEmail.setText(user.get_User_Email());
                    inputUserAboutMe.setText(user.get_User_AboutMe());

                    String isoDateString = user.get_User_Birthday();
                    try {
                        SimpleDateFormat isoFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
                        Date date = isoFormatter.parse(isoDateString);

                        SimpleDateFormat desiredFormat = new SimpleDateFormat("yyyy-MM-dd");
                        String formattedDate = desiredFormat.format(date);

                        inputBirthday.setText(formattedDate);
                    } catch (Exception e) {
                        showToast("Date parsing error: " + e.getMessage());
                    }



                    spinnerCountry.setSelection(((ArrayAdapter<String>)spinnerCountry.getAdapter()).getPosition(user.get_User_Location()));
                    spinnerGender.setSelection(((ArrayAdapter<String>)spinnerGender.getAdapter()).getPosition(user.get_User_Gender()));

                    // Get the image URL
                    if(user.get_User_image()!= null){
                        String imageUrl = apilink + user.get_User_image().replace("\\", "/");
                        // Load the image using Picasso
                        Picasso.get().load(imageUrl).into(imageProfile);
                    }

                    showToast("no bug  ");
                } else {
                    // Handle error
                    showToast("something have bug. Error code: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                showToast("something have bug !!");
            }
        });

    }


    public void setGender() {
        // 添加真正的选项
        String[] genderOptions = new String[]{"Male", "Female"};
        List<String> genderList = new ArrayList<>(Arrays.asList(genderOptions));

        // 创建一个自定义的 ArrayAdapter
        ArrayAdapter<String> adapter = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, genderList) {
            @Override
            public boolean isEnabled(int position) {
                // 使第一个项（提示项）不可选择
                return position != 0;
            }

            @Override
            public View getDropDownView(int position, View convertView, ViewGroup parent) {
                View view = super.getDropDownView(position, convertView, parent);
                TextView tv = (TextView) view;

                // 将提示项显示为灰色
                if (position == 0) {
                    tv.setTextColor(Color.GRAY);
                } else {
                    tv.setTextColor(Color.BLACK);
                }
                return view;
            }
        };

        // 在列表的开头添加提示项
        genderList.add(0, "Select Gender");

        spinnerGender.setAdapter(adapter);

        spinnerGender.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> adapterView, View view, int position, long id) {
                if (position > 0) {
                    String selectedGender = genderList.get(position);
                    // 使用 selectedGender 进行后续操作
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> adapterView) {
                // 用户未选择任何选项
            }
        });
    }

    public String getSelectedGender() {
        // Get the selected item from the Spinner
        String selectedGender = spinnerGender.getSelectedItem().toString();
        return selectedGender;
    }


    public void setCountry(){
        ArrayAdapter<String> conditionTypeAdapter = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, country);
        spinnerCountry.setAdapter(conditionTypeAdapter);

    }

    public String getSelectedCountry() {
        // Get the selected item from the Spinner
        String selectedCountry = spinnerCountry.getSelectedItem().toString();
        return selectedCountry;
    }




class User {
    private String ID;
    private String Name;
    private String User_Email;
    private String User_Contact_Number;
    private String User_image;

    private String User_AboutMe;

    private String User_Birthday;

    private String User_Location;

    private String User_Gender;

    // Getters
    public String getID() {
        return ID;
    }

    public String getName() {
        return Name;
    }

    public String get_User_Email() {
        return User_Email;
    }

    public String get_User_Contact_Number() {
        return User_Contact_Number;
    }

    public String get_User_image() {
        return User_image;
    }

    public String get_User_AboutMe() {
        return User_AboutMe;
    }

    public String get_User_Birthday() {
        return User_Birthday;
    }

    public String get_User_Location() { return User_Location; }

    public String get_User_Gender(){ return  User_Gender; }


}

    public interface UserService {
        @GET("user/{user_id}")
        Call<User> getUser(@Header("Authorization") String token, @Path("user_id") String userId);

        @Multipart
        @POST("editUserdata/{user_id}")
        Call<ResponseBody> updateUser(
                @Header("Authorization") String token,
                @Path("user_id") String userId,
                @Part("Name") RequestBody name,
                @Part("User_Email") RequestBody email,
                @Part("User_Contact_Number") RequestBody contactNumber,
                @Part("User_Birthday") RequestBody birthday,
                @Part("User_AboutMe") RequestBody aboutMe,
                @Part("User_Location") RequestBody country,
                @Part("User_Gender") RequestBody gender,
                @Part MultipartBody.Part image

        );

    }

    private void showToast(String message){
        Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }

    private String encodedImage(Bitmap bitmap){
        int previewWidth =150;
        int previewHeight = bitmap.getHeight() * previewWidth / bitmap.getWidth();
        Bitmap previewBitmap = Bitmap.createScaledBitmap(bitmap, previewWidth, previewHeight, false);
        ByteArrayOutputStream byteArrayOutputStream =new ByteArrayOutputStream();
        previewBitmap.compress(Bitmap.CompressFormat.JPEG, 50, byteArrayOutputStream);
        byte[] bytes = byteArrayOutputStream.toByteArray();
        return Base64.encodeToString(bytes, Base64.DEFAULT);
    }

   private final ActivityResultLauncher<Intent> pickImage= registerForActivityResult(  //go to video 3 to see how to do
            new ActivityResultContracts.StartActivityForResult(),
           result -> {
               if(result.getResultCode() == RESULT_OK){
                    Uri imageUri = result.getData().getData();
                    try {
                        InputStream inputStream = getContentResolver().openInputStream(imageUri);
                       Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
                        imageProfile.setImageBitmap(bitmap);
                        encodedImage = encodedImage(bitmap);
                    }catch (FileNotFoundException e){
                       e.printStackTrace();
                   }

               }
            }
   );


    public void uploadImage(View view){
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        pickImage.launch(intent);
    }

    public void saveTheChange(View view){
        if(checkEmpty()){
            return;
        }
        String token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        String userId = preferenceManager.getString(Constants.SQL_USER_ID);
        String authToken = "Bearer " + token;

        String name = inputUserName.getText().toString();
        String email = inputUserEmail.getText().toString();
        String contactNumber = inputUserContactNumber.getText().toString();
        String birthday = inputBirthday.getText().toString();
        String aboutMe = inputUserAboutMe.getText().toString();
        String selectedCountry = getSelectedCountry();

        String selectedGender = getSelectedGender();

        // Create RequestBody instances from String
        RequestBody nameBody = RequestBody.create(MediaType.parse("text/plain"), name);
        RequestBody emailBody = RequestBody.create(MediaType.parse("text/plain"), email);
        RequestBody contactNumberBody = RequestBody.create(MediaType.parse("text/plain"), contactNumber);
        RequestBody birthdayBody = RequestBody.create(MediaType.parse("text/plain"), birthday);
        RequestBody aboutMeBody = RequestBody.create(MediaType.parse("text/plain"), aboutMe);
        RequestBody countryBody = RequestBody.create(MediaType.parse("text/plain"), selectedCountry);
        RequestBody genderBody = RequestBody.create(MediaType.parse("text/plain"), selectedGender);

        MultipartBody.Part imagePart = null;

        if (encodedImage != null) {
            // Firstly, decode the base64 string to byte[]
            byte[] decodedString = Base64.decode(encodedImage, Base64.DEFAULT);

            // Then, write the byte[] into a file
            File outputDir = getApplicationContext().getCacheDir(); // context being the Activity pointer
            File outputFile = null;
            try {
                outputFile = File.createTempFile("image", ".jpg", outputDir);
                FileOutputStream fos = new FileOutputStream(outputFile);
                fos.write(decodedString);
                fos.close();
            } catch (IOException e) {
                e.printStackTrace();
            }

            // Create a RequestBody instance from the image file
            RequestBody requestFile = RequestBody.create(MediaType.parse("image/jpeg"), outputFile);
            imagePart = MultipartBody.Part.createFormData("User_image", outputFile.getName(), requestFile);
        }

        // Call the Retrofit method
        Call<ResponseBody> call = userService.updateUser(authToken, userId, nameBody, emailBody, contactNumberBody,birthdayBody,aboutMeBody, countryBody,genderBody,imagePart);

        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    showToast("User data updated successfully");
                    updateUserInFirestore(userId, name, email, encodedImage);
                } else {
                    showToast("Update failed. Error code: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                showToast("Update failed: " + t.getMessage());
            }
        });
    }

    public void updateUserInFirestore(String userID, String name, String email, String base64Image) {
        FirebaseFirestore db = FirebaseFirestore.getInstance();

        db.collection("users")
                .whereEqualTo("userID", userID)
                .get()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        for (QueryDocumentSnapshot document : task.getResult()) {
                            DocumentReference documentReference = db.collection("users").document(document.getId());

                            Map<String, Object> userData = new HashMap<>();
                            userData.put("name", name);
                            userData.put("email", email);
                            if (base64Image != null) {
                                userData.put("imageBase64", base64Image); // Store base64 image
                            }

                            documentReference.update(userData)
                                    .addOnSuccessListener(aVoid -> showToast("User data in Firestore updated successfully"))
                                    .addOnFailureListener(e -> showToast("Update in Firestore failed: " + e.getMessage()));
                        }
                    } else {
                        showToast("Error getting documents: " + task.getException());
                    }
                });
    }


    public void goBack(View view){
        Intent intent = new Intent(UserEditInformationActivity.this, MainActivity.class);
        startActivity(intent);
        finish();
    }


    public boolean checkEmpty(){
        if(inputUserName.getText().toString().isEmpty() ){
            inputUserName.setBackgroundResource(R.drawable.error_border);
            showToast("Please enter your name");
            return true;
        }

        if(inputUserEmail.getText().toString().isEmpty() ){
            inputUserEmail.setBackgroundResource(R.drawable.error_border);
            showToast("Please enter your email");
            return true;
        }

        return false;
    }



    public void setBirthday(View view){
        Calendar cal = Calendar.getInstance();
        int year = cal.get(Calendar.YEAR);
        int month = cal.get(Calendar.MONTH);
        int day = cal.get(Calendar.DAY_OF_MONTH);

        mDateSetListener = new DatePickerDialog.OnDateSetListener() {
            public void onDateSet(DatePicker datePicker, int year, int month, int day) {
                month = month + 1;
                String date = year + "-" + month + "-" + day ;
                inputBirthday.setText(date);
            }
        };

        DatePickerDialog dialog = new DatePickerDialog(
                UserEditInformationActivity.this,
                android.R.style.Theme_Holo_Light_Dialog_MinWidth,
                mDateSetListener,
                year, month, day);
        dialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        dialog.show();
    }

}