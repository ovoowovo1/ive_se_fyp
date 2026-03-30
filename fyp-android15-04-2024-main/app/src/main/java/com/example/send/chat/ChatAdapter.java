package com.example.send.chat;
import static android.content.ContentValues.TAG;

import android.app.Dialog;
import android.content.DialogInterface;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaPlayer;
import android.os.Handler;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.view.LayoutInflater;

import com.bumptech.glide.Glide;
import com.example.send.R;
import com.example.send.chat.ChatMessage;
import com.google.android.material.button.MaterialButton;
import com.google.firebase.Timestamp;
import com.google.gson.annotations.SerializedName;
import com.makeramen.roundedimageview.RoundedImageView;

import androidx.appcompat.app.AlertDialog;
import androidx.cardview.widget.CardView;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;
import androidx.recyclerview.widget.RecyclerView;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Locale;

import okhttp3.MediaType;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public class ChatAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    private static String apilink = "http://10.0.2.2:8081/";
    //private static String apilink = "http://192.168.137.1:8081/";

    private List<ChatMessage> chatmessages;
    private String currentUserId;
    private String receiverId;

    private static final int VIEW_TYPE_SENT = 1;
    private static final int VIEW_TYPE_RECEIVED = 2;

    public ChatAdapter(List<ChatMessage> chatmessages, String currentUserId, String receiverId ) {
        this.chatmessages = chatmessages;
        this.currentUserId = currentUserId;
        this.receiverId = receiverId;

    }

    @Override
    public int getItemViewType(int position) {
        ChatMessage chatmessage = chatmessages.get(position);
        if (chatmessage.getReceiverId().equals(currentUserId) &&
                receiverId.equals(chatmessage.getSenderId())) {
            return VIEW_TYPE_RECEIVED;
        } else {
            return VIEW_TYPE_SENT;
        }
    }


    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view;
        if (viewType == VIEW_TYPE_SENT) {
            view = LayoutInflater.from(parent.getContext()).inflate(R.layout.user_sent_message, parent, false);
            return new SentMessageViewHolder(view);
        } else {
            view = LayoutInflater.from(parent.getContext()).inflate(R.layout.user_received_message, parent, false);
            return new ReceivedMessageViewHolder(view);
        }
    }

    @Override
    public void onBindViewHolder(RecyclerView.ViewHolder holder, int position) {
        ChatMessage chatmessage = chatmessages.get(position);

        switch (holder.getItemViewType()) {
            case VIEW_TYPE_SENT:
                ((SentMessageViewHolder) holder).bind(chatmessage);
                break;
            case VIEW_TYPE_RECEIVED:
                ((ReceivedMessageViewHolder) holder).bind(chatmessage);
                break;
        }
    }

    @Override
    public int getItemCount() {
        return chatmessages.size();
    }

    // ViewHolder for sent messages
    private static class SentMessageViewHolder extends RecyclerView.ViewHolder {
        TextView messageText, dateTimeText ,voiceMessageDurationText;
        ImageView messageImage;
        CardView imageMessageCard;
        MaterialButton playButton;
        ConstraintLayout constraintLayout ,voiceMessageLayout;

        private MediaPlayer mediaPlayer;
        private boolean isPlaying = false;

        SentMessageViewHolder(View itemView) {
            super(itemView);
            messageText = itemView.findViewById(R.id.textMessage);
            dateTimeText = itemView.findViewById(R.id.textDateTime);
            messageImage = itemView.findViewById(R.id.imageMessage);
            imageMessageCard = itemView.findViewById(R.id.imageMessageCard);
            playButton = itemView.findViewById(R.id.playButtonSent);
            voiceMessageLayout = itemView.findViewById(R.id.voiceMessageLayout);
            voiceMessageDurationText = itemView.findViewById(R.id.voiceMessageDurationText);
            constraintLayout = (ConstraintLayout) itemView;
        }

        void bind(ChatMessage chatMessage) {
            if (chatMessage.getImageBase64() != null && !chatMessage.getImageBase64().isEmpty()) {
                // 有圖片的處理
                byte[] decodedString = Base64.decode(chatMessage.getImageBase64(), Base64.DEFAULT);
                Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                messageImage.setImageBitmap(decodedByte);
                messageText.setVisibility(View.GONE);
                voiceMessageLayout.setVisibility(View.GONE);
                imageMessageCard.setVisibility(View.VISIBLE); // 确保CardView也是可见的
            } else if(chatMessage.getAudioBase64() != null && !chatMessage.getAudioBase64().isEmpty()){
                // Show play button for voice messages
                voiceMessageLayout.setVisibility(View.VISIBLE);
                playButton.setOnClickListener(v -> ((ChatAdapter) getBindingAdapter()).playAudio(chatMessage.getAudioBase64(), playButton, itemView.findViewById(R.id.voiceMessageProgress)));
                messageText.setVisibility(View.GONE);
                imageMessageCard.setVisibility(View.GONE);

                setLongClickListener(voiceMessageLayout, chatMessage);

                // Calculate and store the voice message duration
                MediaPlayer mediaPlayer = new MediaPlayer();
                byte[] audioBytes = Base64.decode(chatMessage.getAudioBase64(), Base64.DEFAULT);
                File audioFile = new File(itemView.getContext().getCacheDir(), "temp_audio.wav");

                try {
                    FileOutputStream fos = new FileOutputStream(audioFile);
                    fos.write(audioBytes);
                    fos.close();

                    mediaPlayer.setDataSource(audioFile.getAbsolutePath());
                    mediaPlayer.prepare();

                    int duration = mediaPlayer.getDuration();
                    chatMessage.setAudioDuration(duration);

                    mediaPlayer.release();
                } catch (IOException e) {
                    e.printStackTrace();
                }

                // Display the voice message duration
                String durationText = ((ChatAdapter) getBindingAdapter()).formatDuration(chatMessage.getAudioDuration());
                voiceMessageDurationText.setText(durationText);

            } else {
                // 純文字消息的處理
                messageText.setText(chatMessage.getMessage());
                messageText.setVisibility(View.VISIBLE);
                voiceMessageLayout.setVisibility(View.GONE);
                imageMessageCard.setVisibility(View.GONE); // 没有图片时隐藏CardView
            }

            // 更新日期時間視圖
            dateTimeText.setText(formatTimestamp(chatMessage.getTimestamp()));
            adjustDateTimeTextPosition();
        }

        private void adjustDateTimeTextPosition() {
            ConstraintSet constraintSet = new ConstraintSet();
            constraintSet.clone(constraintLayout);

            if (imageMessageCard.getVisibility() == View.VISIBLE) {
                // 如果顯示圖片，將dateTimeText放在CardView右下方
                constraintSet.connect(dateTimeText.getId(), ConstraintSet.TOP, imageMessageCard.getId(), ConstraintSet.BOTTOM, 8);
                constraintSet.connect(dateTimeText.getId(), ConstraintSet.END, imageMessageCard.getId(), ConstraintSet.END, 16);
            } else if (voiceMessageLayout.getVisibility() == View.VISIBLE) {
                // 如果顯示語音消息，將dateTimeText放在voiceMessageLayout右下方
                constraintSet.connect(dateTimeText.getId(), ConstraintSet.TOP, voiceMessageLayout.getId(), ConstraintSet.BOTTOM, 8);
                constraintSet.connect(dateTimeText.getId(), ConstraintSet.END, voiceMessageLayout.getId(), ConstraintSet.END, 16);
            } else {
                // 如果顯示文字，將dateTimeText放在messageText右下方
                constraintSet.connect(dateTimeText.getId(), ConstraintSet.TOP, messageText.getId(), ConstraintSet.BOTTOM, 6);
                constraintSet.connect(dateTimeText.getId(), ConstraintSet.END, messageText.getId(), ConstraintSet.END, 16);
            }

            constraintSet.applyTo(constraintLayout);
        }
    }

    // ViewHolder for received messages
    private static class ReceivedMessageViewHolder extends RecyclerView.ViewHolder {
        TextView messageText, dateTimeText ,voiceMessageDurationText;
        ImageView messageImage;
        CardView imageMessageCard;
        MaterialButton playButton;
        ConstraintLayout constraintLayout , voiceMessageLayout;

        private MediaPlayer mediaPlayer;
        private boolean isPlaying = false;

        ReceivedMessageViewHolder(View itemView) {
            super(itemView);
            messageText = itemView.findViewById(R.id.textMessage);
            dateTimeText = itemView.findViewById(R.id.textDateTime);
            messageImage = itemView.findViewById(R.id.imageMessage);
            imageMessageCard = itemView.findViewById(R.id.imageMessageCard);
            playButton = itemView.findViewById(R.id.playButtonSent);
            voiceMessageLayout = itemView.findViewById(R.id.voiceMessageLayout);
            voiceMessageDurationText = itemView.findViewById(R.id.voiceMessageDurationText);
            constraintLayout = (ConstraintLayout) itemView;
        }

        void bind(ChatMessage chatMessage) {
            if (chatMessage.getImageBase64() != null && !chatMessage.getImageBase64().isEmpty()) {
                // Processing of images
                byte[] decodedString = Base64.decode(chatMessage.getImageBase64(), Base64.DEFAULT);
                Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                messageImage.setImageBitmap(decodedByte);
                messageText.setVisibility(View.GONE);
                voiceMessageLayout.setVisibility(View.GONE);
                imageMessageCard.setVisibility(View.VISIBLE); // Make sure CardView is also visible
            }  else if(chatMessage.getAudioBase64() != null && !chatMessage.getAudioBase64().isEmpty()){
                // Show play button for voice messages
                voiceMessageLayout.setVisibility(View.VISIBLE);
                playButton.setOnClickListener(v -> ((ChatAdapter) getBindingAdapter()).playAudio(chatMessage.getAudioBase64(), playButton, itemView.findViewById(R.id.voiceMessageProgress)));
                messageText.setVisibility(View.GONE);
                imageMessageCard.setVisibility(View.GONE);

                setLongClickListener(voiceMessageLayout, chatMessage);

// Calculate and store the voice message duration
                MediaPlayer mediaPlayer = new MediaPlayer();
                byte[] audioBytes = Base64.decode(chatMessage.getAudioBase64(), Base64.DEFAULT);
                File audioFile = new File(itemView.getContext().getCacheDir(), "temp_audio.wav");

                try {
                    FileOutputStream fos = new FileOutputStream(audioFile);
                    fos.write(audioBytes);
                    fos.close();

                    mediaPlayer.setDataSource(audioFile.getAbsolutePath());
                    mediaPlayer.prepare();

                    int duration = mediaPlayer.getDuration();
                    chatMessage.setAudioDuration(duration);

                    mediaPlayer.release();
                } catch (IOException e) {
                    e.printStackTrace();
                }

                // Display the voice message duration
                String durationText = ((ChatAdapter) getBindingAdapter()).formatDuration(chatMessage.getAudioDuration());
                voiceMessageDurationText.setText(durationText);

            } else {
                // Processing of plain text messages
                messageText.setText(chatMessage.getMessage());
                messageText.setVisibility(View.VISIBLE);
                voiceMessageLayout.setVisibility(View.GONE);
                imageMessageCard.setVisibility(View.GONE); //Hide CardView when there is no picture
            }

            //Update date and time view
            dateTimeText.setText(formatTimestamp(chatMessage.getTimestamp()));
            adjustDateTimeTextPosition();
        }

        private void adjustDateTimeTextPosition() {
            ConstraintSet constraintSet = new ConstraintSet();
            constraintSet.clone(constraintLayout);

            if (imageMessageCard.getVisibility() == View.VISIBLE) {
                // If the picture is displayed, place the dateTimeText below the CardView and align it to the left (start)
                constraintSet.connect(dateTimeText.getId(), ConstraintSet.TOP, imageMessageCard.getId(), ConstraintSet.BOTTOM, 8);
                constraintSet.connect(dateTimeText.getId(), ConstraintSet.START, ConstraintLayout.LayoutParams.PARENT_ID, ConstraintSet.START, 8);
            } else if (voiceMessageLayout.getVisibility() == View.VISIBLE) {
                // If the voice message layout is visible, place the dateTimeText below the voiceMessageLayout and align it to the left (start)
                constraintSet.connect(dateTimeText.getId(), ConstraintSet.TOP, voiceMessageLayout.getId(), ConstraintSet.BOTTOM, 8);
                constraintSet.connect(dateTimeText.getId(), ConstraintSet.START, ConstraintLayout.LayoutParams.PARENT_ID, ConstraintSet.START, 8);
            } else {
                // If text is displayed, place dateTimeText below textMessage and align it to the left (start)
                constraintSet.connect(dateTimeText.getId(), ConstraintSet.TOP, messageText.getId(), ConstraintSet.BOTTOM, 6);
                constraintSet.connect(dateTimeText.getId(), ConstraintSet.START, messageText.getId(), ConstraintSet.START, 0);
            }

            constraintSet.applyTo(constraintLayout);
        }


    }
    private static String formatTimestamp(Timestamp timestamp) {
        return new SimpleDateFormat("hh:mm a, MMM dd, yyyy").format(timestamp.toDate());
    }

    private void playAudio(String audioBase64, MaterialButton playButton, ProgressBar progressBar) {
        Log.d("audioBase64", audioBase64);
        Log.d(TAG, "playAudio: Starting audio playback");


        byte[] audioBytes = Base64.decode(audioBase64, Base64.DEFAULT);
        File audioFile = new File(playButton.getContext().getCacheDir(), "temp_audio.wav");

        try {
            FileOutputStream fos = new FileOutputStream(audioFile);
            fos.write(audioBytes);
            fos.close();

            MediaPlayer mediaPlayer;
            if (playButton.getTag() == null) {
                mediaPlayer = new MediaPlayer();
                playButton.setTag(mediaPlayer);
            } else {
                mediaPlayer = (MediaPlayer) playButton.getTag();
                mediaPlayer.reset();
            }

            mediaPlayer.setDataSource(audioFile.getAbsolutePath());
            mediaPlayer.prepare();

            // Show the audio duration
            int duration = mediaPlayer.getDuration();
            progressBar.setMax(duration);

            boolean isPlaying = mediaPlayer.isPlaying();
            if (!isPlaying) {
                // Start playing the audio
                mediaPlayer.start();

                // Change the play button icon to a stop icon
                playButton.setIconResource(R.drawable.ic_stop);
            } else {
                // Stop the audio playback
                mediaPlayer.stop();
                mediaPlayer.reset();

                // Change the play button icon to a play icon
                playButton.setIconResource(R.drawable.ic_play);
            }

            // Update the play button click listener to toggle audio playback
            playButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (mediaPlayer.isPlaying()) {
                        mediaPlayer.stop();
                        mediaPlayer.reset();
                        playButton.setIconResource(R.drawable.ic_play);
                        progressBar.setProgress(0); // Reset the progress bar
                    } else {
                        try {
                            mediaPlayer.setDataSource(audioFile.getAbsolutePath());
                            mediaPlayer.prepare();
                            mediaPlayer.start();
                            playButton.setIconResource(R.drawable.ic_stop);
                            progressBar.setMax(mediaPlayer.getDuration()); // Set the max value of the progress bar
                            progressBar.setProgress(0); // Reset the progress bar before starting playback

                            // Update the UI to show the current playback position
                            final Handler handler = new Handler();
                            handler.post(new Runnable() {
                                @Override
                                public void run() {
                                    if (mediaPlayer != null && mediaPlayer.isPlaying()) {
                                        int currentPosition = mediaPlayer.getCurrentPosition();
                                        progressBar.setProgress(currentPosition);

                                        handler.postDelayed(this, 500);
                                    }
                                }
                            });
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
            });

            // Update the UI to show the current playback position
            final Handler handler = new Handler();
            handler.post(new Runnable() {
                @Override
                public void run() {
                    if (mediaPlayer != null && mediaPlayer.isPlaying()) {
                        int currentPosition = mediaPlayer.getCurrentPosition();
                        progressBar.setProgress(currentPosition);

                        handler.postDelayed(this, 500);
                    }
                }
            });

            // Set a listener to change the play button icon and reset the MediaPlayer when playback is completed
            mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                @Override
                public void onCompletion(MediaPlayer mp) {
                    playButton.setIconResource(R.drawable.ic_play);
                    mediaPlayer.reset();
                    progressBar.setProgress(0);
                }
            });

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String formatDuration(int duration) {
        int minutes = duration / 1000 / 60;
        int seconds = duration / 1000 % 60;
        seconds = seconds + 1;
        return String.format(Locale.getDefault(), "%02d:%02d", minutes, seconds);
    }

    private static void setLongClickListener(ConstraintLayout voiceLayout, ChatMessage chatMessage) {
        voiceLayout.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                // 創建 AlertDialog.Builder
                AlertDialog.Builder builder = new AlertDialog.Builder(voiceLayout.getContext());
                builder.setTitle("Speed to Text")
                        .setMessage("Do you want to convert the voice message to text?")
                        .setPositiveButton("Convert", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {

                                // 處理 "Convert" 按鈕點擊事件
                                Retrofit retrofit = new Retrofit.Builder()
                                        .baseUrl(apilink)
                                        .addConverterFactory(GsonConverterFactory.create())
                                        .build();

                                speechToTextService service = retrofit.create(speechToTextService.class);

                                // Create a JSON object with the base64 audio data
                                JSONObject jsonObject = new JSONObject();
                                try {
                                    jsonObject.put("audioBase64", chatMessage.getAudioBase64());
                                } catch (JSONException e) {
                                    throw new RuntimeException(e);
                                }

                                // Create a request body from the JSON object
                                RequestBody requestBody = RequestBody.create(MediaType.parse("application/json"), jsonObject.toString());

                                Call<ResponseBody> call = service.sendVoiceMessage(requestBody);
                                call.enqueue(new retrofit2.Callback<ResponseBody>() {
                                    @Override
                                    public void onResponse(Call<ResponseBody> call, retrofit2.Response<ResponseBody> response) {
                                        try {
                                            String text = response.body().string();
                                            Log.d("Speech to Text", text);
                                            // 創建並顯示對話框
                                            AlertDialog.Builder builder = new AlertDialog.Builder(voiceLayout.getContext());
                                            builder.setTitle("Speech to Text")
                                                    .setMessage(text)
                                                    .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                                                        @Override
                                                        public void onClick(DialogInterface dialog, int which) {
                                                            // 處理 "OK" 按鈕點擊事件
                                                            dialog.dismiss();
                                                        }
                                                    });

                                            AlertDialog dialog = builder.create();
                                            dialog.show();
                                        } catch (IOException e) {
                                            e.printStackTrace();
                                        }
                                    }

                                    @Override
                                    public void onFailure(Call<ResponseBody> call, Throwable t) {
                                        Log.e("Speech to Text", t.getMessage());
                                    }
                                });

                            }
                        })
                        .setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                // 處理 "Cancel" 按鈕點擊事件
                                dialog.dismiss();
                            }
                        });

                // 創建並顯示對話框
                AlertDialog dialog = builder.create();
                dialog.show();


                return true;
            }
        });
    }


    public interface speechToTextService {
        @POST("AzureSpeechToText")
        Call<ResponseBody> sendVoiceMessage(@Body RequestBody requestBody);
    }
}
