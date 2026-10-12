# APK signing

The matching personal debug key is stored in the repository Actions secret `FORGE_WORKOUT_KEYSTORE_B64`. The workflow restores it only on the runner. No private signing key is committed here. Local SDK-only builds without that key generate a different debug identity; export a JSON backup before changing signing identity.
