package com.example.send.Calender;

import android.support.annotation.NonNull;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.recyclerview.widget.RecyclerView;

import com.example.send.R;
import com.example.send.activities.TimeTable;

import java.time.LocalDate;
import java.util.List;

public class FreeTimeAdapter extends RecyclerView.Adapter<FreeTimeAdapter.ViewHolder> {
    private List<UserFreeTime> freeTimes;

    public FreeTimeAdapter(List<UserFreeTime> freeTimes) {
        this.freeTimes = freeTimes;
    }

    @NonNull
    @Override
    public FreeTimeAdapter.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_user_free_time, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull FreeTimeAdapter.ViewHolder holder, int position) {
        UserFreeTime freeTime = freeTimes.get(position);
        holder.freeTimeStartTextView.setText("Start Time :"+FreeTimeJustForTime(freeTime.getFree_Time_Start()));
        holder.freeTimeEndTextView.setText("End Time :"+FreeTimeJustForTime(freeTime.getFree_Time_End()));
        holder.freeTimeRemarkTextView.setText(freeTime.getRemark());
        // Set other fields as needed
    }

    @Override
    public int getItemCount() {
        return freeTimes.size();
    }

    public void setFreeTimes(List<UserFreeTime> freeTimes) {
        this.freeTimes = freeTimes;
        notifyDataSetChanged();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView freeTimeStartTextView, freeTimeEndTextView , freeTimeRemarkTextView;
        // Initialize other views

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            freeTimeStartTextView = itemView.findViewById(R.id.freeTimeStartTextView);
            freeTimeEndTextView = itemView.findViewById(R.id.freeTimeEndTextView);
            freeTimeRemarkTextView = itemView.findViewById(R.id.freeTimeRemarkTextView);
            // Initialize other views
        }
    }

    public String FreeTimeJustForTime(String dateTime){
        //dateTime just need time
        //the format of dateTime is "2024-02-29T03:51:00.000Z"

        String[] dateTimeArray = dateTime.split("T");

        //Change to UTC+8 time
        String[] timeArray = dateTimeArray[1].split(":");
        int hour = Integer.parseInt(timeArray[0]);
        int minute = Integer.parseInt(timeArray[1]);
        hour = hour + 8;
        if(hour >= 24){
            hour = hour - 24;
        }
        String newTime = hour + ":" + minute;
        return newTime;
    }

}

