package com.example.send.Report;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.example.send.R;
import com.example.send.activities.DonateItemDataActivity;
import com.example.send.databinding.ActivitySuspiciousAccountBinding;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.squareup.picasso.Picasso;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.Header;
import retrofit2.http.POST;

public class SuspiciousAccount extends AppCompatActivity {

    private ActivitySuspiciousAccountBinding binding;

    private PreferenceManager preferenceManager;

    private String ReporterID;
    private String token;

    private String apilink = "http://10.0.2.2:8081/";
   // private String apilink = "http://192.168.137.1:8081/";

    private Retrofit retrofit = new Retrofit.Builder()
            .baseUrl(apilink) // 替换为你的API基础URL
            .addConverterFactory(GsonConverterFactory.create())
            .build();

    private userReportService userReportService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_suspicious_account);

        binding = ActivitySuspiciousAccountBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        preferenceManager = new PreferenceManager(getApplicationContext());
        ReporterID = preferenceManager.getString(Constants.KEY_USER_ID);
        token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        token = "Bearer " + token;

        String UserID = getIntent().getStringExtra("USER_ID");
        String DonationID = getIntent().getStringExtra("DONATE_ID");
        String DonationName = getIntent().getStringExtra("DonationName");
        String DonationImage = getIntent().getStringExtra("DonationImage");
        String REPORT_REASON = getIntent().getStringExtra("REPORT_REASON");

        binding.itemTitle.setText(DonationName);

        Picasso.get().load(DonationImage).into(binding.toolbarImage);
        setListeners(UserID, DonationID , REPORT_REASON);
    }


    private boolean checkInput(String userInputDetails) {
        if (userInputDetails.isEmpty()) {
            binding.etDetails.setError("Please enter details");
            return false;
        } else {
            binding.etDetails.setError(null);
            return true;
        }
    }

    private void setListeners(String UserID, String DonationID, String REPORT_REASON) {
        binding.btnReport.setOnClickListener(v -> {
            String userInputDetails =  binding.etDetails.getText().toString();
            if (!checkInput(userInputDetails)) {
                return;
            }else{
                userReportService = retrofit.create(userReportService.class);

                Report report = new Report(ReporterID , UserID, DonationID, REPORT_REASON , userInputDetails);
                Call<ResponseBody> call = userReportService.userReport(token, report);
                call.enqueue(new retrofit2.Callback<ResponseBody>() {
                    @Override
                    public void onResponse(Call<ResponseBody> call, retrofit2.Response<ResponseBody> response) {
                        if (response.isSuccessful()) {
                            showToaster("Report successful");
                            finish();
                        } else {
                            showToaster("Report failed");
                            Log.d("UserReport", "onResponse: " + response.code());
                            Log.d("UserReport", "onResponse: " + response.message());
                            binding.etDetails.setError("Please enter details");
                        }
                    }

                    @Override
                    public void onFailure(Call<ResponseBody> call, Throwable t) {
                        showToaster("onFailure Report failed");
                        binding.etDetails.setError("Please enter details");
                    }
                });
            }
        });
    }

    public interface userReportService {
        @POST("androiduserreporttheissue")
        Call<ResponseBody> userReport(@Header("Authorization") String token,
                                      @Body Report report);
    }

    public class Report {

        private String Reporter_ID;
        private String User_ID;
        private String Donation_ID;
        private String Report_Type;
        private String Report_Content;


        public Report(String ReporterID , String UserID, String DonationID,  String REPORT_REASON , String userInputDetails) {
            this.Reporter_ID = ReporterID;
            this.User_ID = UserID;
            this.Donation_ID = DonationID;
            this.Report_Type = REPORT_REASON;
            this.Report_Content = userInputDetails;
        }

    }

    private void  showToaster(String message){
        Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }

}