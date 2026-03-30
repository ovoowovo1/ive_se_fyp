package com.example.send.Calender;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.example.send.R;

import com.example.send.databinding.ActivityAddFreeTimeBinding;
import com.example.send.databinding.ActivitySignInBinding;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Locale;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.Header;
import retrofit2.http.POST;

public class AddFreeTimeActivity extends AppCompatActivity {

    private ActivityAddFreeTimeBinding binding;

    private PreferenceManager preferenceManager;
    private boolean isRepeat = false;
    private ArrayList<Integer> selectedWeekDays = new ArrayList<>();

    private String apilink = "http://10.0.2.2:8081/";
//    private String apilink = "http://192.168.137.1:8081/";

    private Retrofit retrofit = new Retrofit.Builder()
            .baseUrl(apilink) // 替换为你的API基础URL
            .addConverterFactory(GsonConverterFactory.create())
            .build();

    private String userID;
    private String token;

    private userAddFreeTimeService userAddFreeTimeService;

    private String startDate;
    private String endDate;
    private String repeat;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_add_free_time);

        binding = ActivityAddFreeTimeBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());


        preferenceManager = new PreferenceManager(getApplicationContext());
        userID = preferenceManager.getString(Constants.KEY_USER_ID);
        token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        token = "Bearer " + token;



        binding.rlStartDate.setOnClickListener(view -> {
            if (!isRepeat) {
                showDateTimeDialog(binding.textViewEnterStartDate);
            } else {
                //showTimePickerDialog(binding.textViewEnterStartDate);
                showDateTimeDialog(binding.textViewEnterStartDate);
            }
        });
        binding.rlEndDate.setOnClickListener(view -> {
            if (!isRepeat) {
                showDateTimeDialog(binding.textViewEnterEndDate);
            } else {
                //showTimePickerDialog(binding.textViewEnterEndDate);
                showDateTimeDialog(binding.textViewEnterEndDate);
            }
        });

        binding.rlRepeat.setOnClickListener(view -> showRepeatOptionsDialog());
        binding.addFreeTimeButton.setOnClickListener(view -> saveDateAction());

    }


    private void showDateTimeDialog(final TextView textView) {
        final Calendar currentCalendar = Calendar.getInstance();
        DatePickerDialog datePickerDialog = new DatePickerDialog(AddFreeTimeActivity.this,
                (datePicker, year, month, dayOfMonth) -> {
                    Calendar newDate = Calendar.getInstance();
                    newDate.set(year, month, dayOfMonth);

                    // 继续选择时间
                    TimePickerDialog timePickerDialog = new TimePickerDialog(AddFreeTimeActivity.this,
                            (view, hourOfDay, minute) -> {
                                newDate.set(Calendar.HOUR_OF_DAY, hourOfDay);
                                newDate.set(Calendar.MINUTE, minute);
                                SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());

                                // 更新按钮文本
                                textView.setText(formatter.format(newDate.getTime()));

                                if (textView.getId() == R.id.textViewEnterStartDate) {
                                    startDate = formatter.format(newDate.getTime());
                                } else {
                                    endDate = formatter.format(newDate.getTime());
                                }

                            }, currentCalendar.get(Calendar.HOUR_OF_DAY), currentCalendar.get(Calendar.MINUTE), false);
                    timePickerDialog.show();
                }, currentCalendar.get(Calendar.YEAR), currentCalendar.get(Calendar.MONTH), currentCalendar.get(Calendar.DAY_OF_MONTH));
        datePickerDialog.show();
    }
/*
    private void showTimePickerDialog(final TextView textView) {
        final Calendar currentCalendar = Calendar.getInstance();
        TimePickerDialog timePickerDialog = new TimePickerDialog(this,
                (view, hourOfDay, minute) -> {
                    currentCalendar.set(Calendar.HOUR_OF_DAY, hourOfDay);
                    currentCalendar.set(Calendar.MINUTE, minute);
                    SimpleDateFormat formatter = new SimpleDateFormat("HH:mm", Locale.getDefault());
                    // 如果是重复事件，我们不更新日期按钮的文本，因为只关心时间
                    // 您可能需要保存或处理这个时间值
                    textView.setText(formatter.format(currentCalendar.getTime()));

                    if (textView.getId() == R.id.textViewEnterStartDate) {
                        startDate = formatter.format(currentCalendar.getTime());
                    } else {
                        endDate = formatter.format(currentCalendar.getTime());
                    }
                }, currentCalendar.get(Calendar.HOUR_OF_DAY), currentCalendar.get(Calendar.MINUTE), false);
        timePickerDialog.show();
    }

 */

    private void showRepeatOptionsDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Repeat option")
                .setSingleChoiceItems(new String[]{"Not repeating", "Repeat"}, isRepeat ? 1 : 0, (dialog, which) -> {
                    isRepeat = which == 1;
                    dialog.dismiss();
                    if (isRepeat) {
                        showWeekDaysDialog();
                    }
                });
        builder.show();
    }

    private void showWeekDaysDialog() {
        selectedWeekDays.clear();
        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
        boolean[] checkedItems = new boolean[days.length];
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Select repeating weeks")
                .setMultiChoiceItems(days, checkedItems, (dialog, which, isChecked) -> {
                    if (isChecked) {
                        selectedWeekDays.add(which + 1);
                    } else {
                        selectedWeekDays.remove(Integer.valueOf(which + 1));
                    }
                })
                .setPositiveButton("Confirm", (dialog, which) -> {
                    // 用户点击确定后，更新按钮文本为用户选择的星期几
                    updateButtonText();
                })
                .setNegativeButton("Cancel", (dialog, which) -> {
                    // 用户点击取消，不做任何操作
                    dialog.dismiss();
                });
        builder.show();
    }

    private void updateButtonText() {
        //StringBuilder buttonText = new StringBuilder("Select day of the week：");
        StringBuilder buttonText = new StringBuilder("");
        for (Integer day : selectedWeekDays) {
            switch (day) {
                case 1:
                    buttonText.append("Mon ");
                    break;
                case 2:
                    buttonText.append("Tue ");
                    break;
                case 3:
                    buttonText.append("Wed ");
                    break;
                case 4:
                    buttonText.append("Thu ");
                    break;
                case 5:
                    buttonText.append("Fri ");
                    break;
                case 6:
                    buttonText.append("Sat ");
                    break;
                case 7:
                    buttonText.append("Sun ");
                    break;
            }
        }

        binding.textViewNoRepeat.setText(buttonText.toString().trim());
        repeat = buttonText.toString().trim();

    }



    private void saveDateAction(){
        userAddFreeTimeService = retrofit.create(userAddFreeTimeService.class);

        String remark = binding.etRemark.getText().toString();

        SaveData data = new SaveData(userID , startDate, endDate, repeat , remark);
        Call<ResponseBody> call = userAddFreeTimeService.saveData(token, data);
        call.enqueue(new retrofit2.Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, retrofit2.Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    showToaster("Add free time successful");
                } else {
                    showToaster("add free time failed");
                    Log.d("UserReport", "onResponse: " + response.code());
                    Log.d("UserReport", "onResponse: " + response.message());

                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                showToaster("onFailure add free time failed");

            }
        });
    }

    public interface userAddFreeTimeService {
        @POST("useraddfreetime")
        Call<ResponseBody> saveData(@Header("Authorization") String token,
                                      @Body SaveData data);
    }


    public class SaveData{

        private String userID;
        private String repeat;
        private String startDate;
        private String endDate;
        private String remark;

        public SaveData(String userID, String startDate, String endDate, String repeat,String remark) {
            this.userID = userID;
            this.startDate = startDate;
            this.endDate = endDate;
            this.repeat = repeat;
            this.remark = remark;
        }
    }


    private void  showToaster(String message){
        Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }

}