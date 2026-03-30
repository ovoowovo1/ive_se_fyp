package com.example.send.UserRequest;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.send.R;
import com.example.send.activities.MainActivity;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.POST;

public class UserCreateRequestActivity extends AppCompatActivity {

    private Spinner  genderSpinner, itemsTypeSpinner, urgencySpinner;
    private EditText babyAgeEditText, itemSizeEditText, reasonForRequestEditText, additionalNotesEditText,quantityEditText;
    private Button submitRequestButton;
    private Retrofit retrofit;
    private String apilink = "http://10.0.2.2:8081/";
    //private String apilink = "http://192.168.137.1:8081/";
    private PreferenceManager preferenceManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_create_request); // Replace with your layout name
        String[] babyGenderArray = getResources().getStringArray(R.array.babyGender);
        String[] items_typeArray = getResources().getStringArray(R.array.items_type);
        String[] UrgencyArray = getResources().getStringArray(R.array.Urgency);

        // Initialize your Views
        quantityEditText = findViewById(R.id.quantityEditText);
        babyAgeEditText = findViewById(R.id.babyAge);
        genderSpinner = findViewById(R.id.genderSpinner);
        itemsTypeSpinner = findViewById(R.id.ItemsType);
        urgencySpinner = findViewById(R.id.urgencySpinner);
        itemSizeEditText = findViewById(R.id.itemSize);
        reasonForRequestEditText = findViewById(R.id.reasonForRequest);
        additionalNotesEditText = findViewById(R.id.additionalNotes);
        submitRequestButton = findViewById(R.id.submitRequestButton);

        retrofit = new Retrofit.Builder()
                .baseUrl(apilink) // replace with your API url
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        // Setup Spinners

        setupSpinner(genderSpinner, babyGenderArray);
        setupSpinner(itemsTypeSpinner, items_typeArray);
        setupSpinner(urgencySpinner, UrgencyArray);

        // Set the button click listener
        submitRequestButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Log.d("SubmitRequest", "Button clicked");
                submitRequest();
            }
        });
    }

    private void setupSpinner(Spinner spinner, String[] dataArray) {
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, dataArray);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
    }

    private void submitRequest() {
        preferenceManager = new PreferenceManager(getApplicationContext());
        String requesterId = preferenceManager.getString(Constants.KEY_USER_ID);
        if (requesterId == null || requesterId.isEmpty()) {
            Toast.makeText(this, "User ID is not available", Toast.LENGTH_SHORT).show();
            return;
        }

        String babyAge = babyAgeEditText.getText().toString();
        String gender = genderSpinner.getSelectedItem().toString();
        String itemType = itemsTypeSpinner.getSelectedItem().toString();
        String urgency = urgencySpinner.getSelectedItem().toString();
        String itemSize = itemSizeEditText.getText().toString();
        String reasonForRequest = reasonForRequestEditText.getText().toString();
        String additionalNotes = additionalNotesEditText.getText().toString();
        String quantity = quantityEditText.getText().toString();

        if (babyAge.isEmpty() || quantity.isEmpty()) {
            Toast.makeText(this, "Required fields are missing", Toast.LENGTH_SHORT).show();
            return;
        }

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("Request_User_ID", requesterId);
        requestBody.put("Baby_age", babyAge);
        requestBody.put("Gender", gender);
        requestBody.put("Item_type", itemType);
        requestBody.put("Expect_quantity", quantity);
        requestBody.put("Donated_quantity", "0");
        requestBody.put("Size_or_range", itemSize);
        requestBody.put("Urgency", urgency);
        requestBody.put("Reason_of_Request", reasonForRequest.isEmpty() ? "Not provided" : reasonForRequest);
        requestBody.put("Request_Status", "Open");
        requestBody.put("Additional_Note", additionalNotes);

        RequestApi service = retrofit.create(RequestApi.class);
        Call<ResponseBody> call = service.createUserRequest(requestBody);
        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(UserCreateRequestActivity.this, "Submitted successfully", Toast.LENGTH_LONG).show();
                    Intent intent = new Intent(UserCreateRequestActivity.this, MainActivity.class);
                    startActivity(intent);
                    finish();
                } else {
                    handleErrorResponse(response);
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                Toast.makeText(UserCreateRequestActivity.this, "Request failed: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void handleErrorResponse(Response<ResponseBody> response) {
        // This method handles the error response from the API.
        try {
            String errorResponse = response.errorBody().string();
            Log.e("SubmitRequest", "Error: " + errorResponse);
            Toast.makeText(UserCreateRequestActivity.this, "Error: " + errorResponse, Toast.LENGTH_LONG).show();
        } catch (IOException e) {
            Log.e("SubmitRequest", "Error reading error body", e);
        }
    }


    public interface RequestApi {
        @POST("createRequest")
        Call<ResponseBody> createUserRequest(@Body Map<String, String> body); // Or other annotations based on your API
    }

}
