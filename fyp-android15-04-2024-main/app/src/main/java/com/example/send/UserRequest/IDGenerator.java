package com.example.send.UserRequest;

public class IDGenerator {
    // Prefix for request donations
    private static final String REQUEST_DONATION_PREFIX = "RD";

    public static String generateRequestDonationId() {
        long timestampPart = System.currentTimeMillis();
        int randomPart = (int) (Math.random() * (9999 - 1000 + 1)) + 1000;
        // Prepend the prefix to the generated ID
        return REQUEST_DONATION_PREFIX + timestampPart + "" + randomPart;
    }
}
