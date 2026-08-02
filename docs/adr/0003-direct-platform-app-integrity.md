# Direct Platform App Integrity

Status: accepted

The Public Client API will validate native app integrity directly with Apple App Attest for iOS and Google Play Integrity for Android instead of introducing Firebase App Check. This avoids adding Firebase as a project dependency, at the cost of owning more backend verification and platform-specific security code.
