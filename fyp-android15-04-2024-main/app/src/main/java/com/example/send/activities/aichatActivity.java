package com.example.send.activities;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.os.Bundle;
import android.support.annotation.NonNull;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import com.example.send.R;
import com.example.send.databinding.ActivityAichatBinding;
import com.example.send.databinding.ActivityUserDonateItemBinding;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.POST;


public class aichatActivity extends AppCompatActivity {

     private String apilink = "http://10.0.2.2:5001/";
    //private String apilink = "http://192.168.137.1:5001/";

    public static class Message {
        public enum Type {
            SENT, RECEIVED
        }

        private String text;
        private Type type;

        public Message(String text, Type type) {
            this.text = text;
            this.type = type;
        }

        public String getText() {
            return text;
        }

        public Type getType() {
            return type;
        }
    }

    // Adapter for the RecyclerView
    public static class ChatAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
        private List<Message> messages;

        public ChatAdapter(List<Message> messages) {
            this.messages = messages;
        }

        @Override
        public int getItemViewType(int position) {
            Message message = messages.get(position);
            return message.getType() == Message.Type.SENT ? 0 : 1;
        }

        @Override
        public RecyclerView.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
            if (viewType == 0) { // Sent message
                View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_sent_message, parent, false);
                return new SentViewHolder(view);
            } else { // Received message
                View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_received_message, parent, false);
                return new ReceivedViewHolder(view);
            }
        }

        @Override
        public void onBindViewHolder(RecyclerView.ViewHolder holder, int position) {
            Message message = messages.get(position);
            if (holder instanceof SentViewHolder) {
                ((SentViewHolder) holder).bind(message);
            } else {
                ((ReceivedViewHolder) holder).bind(message);
            }
        }

        @Override
        public int getItemCount() {
            return messages.size();
        }

        static class SentViewHolder extends RecyclerView.ViewHolder {
            TextView messageText;

            SentViewHolder(View itemView) {
                super(itemView);
                messageText = itemView.findViewById(R.id.sent_message_text);
            }

            void bind(Message message) {
                messageText.setText(message.getText());
            }
        }

        static class ReceivedViewHolder extends RecyclerView.ViewHolder {
            TextView messageText;

            ReceivedViewHolder(View itemView) {
                super(itemView);
                messageText = itemView.findViewById(R.id.received_message_text);
            }

            void bind(Message message) {
                messageText.setText(message.getText());
            }
        }
    }


    private ActivityAichatBinding binding;
    private List<Message> messageList = new ArrayList<>();
    private ChatAdapter chatAdapter;
    private RecyclerView recyclerView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_aichat);

        binding = ActivityAichatBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        recyclerView = findViewById(R.id.recyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        chatAdapter = new ChatAdapter(messageList);
        recyclerView.setAdapter(chatAdapter);

        binding.sendBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String messageText  = binding.messageTextText.getText().toString();
               System.out.println(messageText);
                if (!messageText.isEmpty()) {
                    Message userMessage = new Message(messageText, Message.Type.SENT);
                    messageList.add(userMessage); // Add message to list
                    chatAdapter.notifyItemInserted(messageList.size() - 1); // Notify adapter
                    scrollToBottom(); // Scroll to bottom
                    binding.messageTextText.setText(""); // Clear EditText
                    sendMessageToServer(messageText); // Send message to server
                }
            }
        });
    }



    private void sendMessageToServer(String message) {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        OpenAIAPIService service = retrofit.create(OpenAIAPIService.class);
        ChatRequest chatRequest = new ChatRequest(message);

        service.postUserString(chatRequest).enqueue(new Callback<ChatResponse>() {
            @Override
            public void onResponse(Call<ChatResponse> call, Response<ChatResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    // Add the received message to the chat
                    String reply = response.body().getResponse();
                    messageList.add(new Message(reply, Message.Type.RECEIVED));
                    chatAdapter.notifyItemInserted(messageList.size() - 1);
                    scrollToBottom();
                }else {
                    Log.d("AICS", "onResponse: " + response.code());
                    showToast("Failed to send message");
                }
            }

            @Override
            public void onFailure(Call<ChatResponse> call, Throwable t) {
                Log.d("AICS", "onFailure: " + t.getMessage());
                Log.d("AICS", "onFailure: " + t.getLocalizedMessage());
                Log.d("AICS", "onFailure: " + t.getCause());
                Log.d("AICS", "onFailure: " + t.getStackTrace());
                showToast("Failed to send message");
            }
        });
    }

    private void scrollToBottom() {
        recyclerView.scrollToPosition(chatAdapter.getItemCount() - 1);
    }


    interface OpenAIAPIService {
        @POST("/contact_ai")
        Call<ChatResponse> postUserString(@Body ChatRequest chatRequest);
    }

    class ChatRequest {
        private String user_string;

        public ChatRequest(String user_string) {
            this.user_string = user_string;
        }

        public String getUser_string() {
            return user_string;
        }


    }

    class ChatResponse {
        private String response;
        public ChatResponse(String chatbot_string) {
            this.response = chatbot_string;
        }
        public String getResponse() {
            return response;
        }
    }

    private void showToast(String message){
        Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }


}