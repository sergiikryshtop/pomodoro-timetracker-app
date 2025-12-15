# GitHub Actions CD Pipeline Setup Plan

## Current Issue
The CD pipeline is failing because it's trying to build Android APK locally without proper Expo setup. We need to either:
1. Set up EAS Build with proper credentials, OR
2. Simplify the workflow to skip full APK building

## Option 1: Full EAS Build Setup (Recommended)

### Prerequisites
- Expo account (free tier works)
- EAS CLI installed globally
- EXPO_TOKEN for GitHub Actions

### Step-by-Step Setup

#### 1. Create Expo Account & Get Access Token

**Local commands:**
```bash
npm install -g eas-cli
eas login
# Login with your credentials or create new account
```

**Get Access Token:**
- Visit: https://expo.dev/accounts/[your-username]/settings/access-tokens
- Click "Create Token"
- Name: `GitHub Actions CD`
- Permissions: Default (full access)
- **Copy the token immediately** (only shown once)

#### 2. Add GitHub Repository Secret

**Navigation:**
1. Go to: https://github.com/sergiikryshtop/pomodoro-timetracker-app
2. Click **Settings** tab
3. Left sidebar: **Secrets and variables** → **Actions**
4. Click **New repository secret**

**Secret Configuration:**
- Name: `EXPO_TOKEN`
- Value: [Paste the token from Expo]
- Click **Add secret**

#### 3. Configure EAS Build in Project

**Run locally in project directory:**
```bash
cd c:\projects\epam\pomodoro-timetracker-app
eas build:configure
```

This creates `eas.json` with default configuration:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

**Commit the configuration:**
```bash
git add eas.json
git commit -m "chore: Add EAS build configuration"
git push
```

#### 4. Update CD Workflow File

Replace the build section in `.github/workflows/cd-android.yml`:

**FROM:**
```yaml
- name: Setup Expo
  uses: expo/expo-github-action@v8
  with:
    expo-version: latest

- name: Setup Java JDK
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '17'

- name: Setup Android SDK
  uses: android-actions/setup-android@v3

- name: Build Android APK
  run: |
    echo "Building Android APK..."
    npx expo prebuild --platform android
    cd android
    ./gradlew assembleRelease
  env:
    EXPO_PUBLIC_ENV: production
```

**TO:**
```yaml
- name: Setup Expo and EAS
  uses: expo/expo-github-action@v8
  with:
    eas-version: latest
    token: ${{ secrets.EXPO_TOKEN }}

- name: Build Android APK with EAS
  run: |
    echo "Building Android APK with EAS Build..."
    eas build --platform android --profile preview --non-interactive --local-build-plugin caching
  env:
    EXPO_PUBLIC_ENV: production

- name: Download built APK
  run: |
    # EAS build outputs APK location, we need to move it to expected path
    mkdir -p android/app/build/outputs/apk/release
    cp build-*.apk android/app/build/outputs/apk/release/ || echo "Build output location may differ"
```

**Commit and push:**
```bash
git add .github/workflows/cd-android.yml
git commit -m "ci: Update CD pipeline to use EAS Build"
git push
```

### Expected Outcome
- EAS Build runs in cloud (no local Android SDK needed)
- APK built automatically on push to main
- APK uploaded as artifact
- GitHub Release created with APK attached

---

## Option 2: Simplified Validation Workflow (Alternative)

If EAS setup is too complex or you want to build APKs manually, use this simpler approach:

### Updated Workflow (Validation Only)

Replace entire build job:
```yaml
jobs:
  validate-build:
    name: Validate Build Configuration
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18.x
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate Expo configuration
        run: npx expo config --json
      
      - name: Check if project can prebuild
        run: npx expo prebuild --no-install --dry-run
      
      - name: Get version info
        id: version
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "Build version: ${{ steps.version.outputs.version }}"
      
      - name: Create Release Notes
        if: github.event_name == 'push'
        uses: softprops/action-gh-release@v1
        with:
          tag_name: v${{ steps.version.outputs.version }}
          name: Release v${{ steps.version.outputs.version }}
          draft: false
          prerelease: false
          body: |
            ## 📱 Pomodoro Timer v${{ steps.version.outputs.version }}
            
            ### Build Instructions
            
            To build the APK locally:
            
            1. Clone the repository
            2. Install dependencies: `npm install`
            3. Build for Android:
               ```bash
               npx expo prebuild --platform android
               cd android
               ./gradlew assembleRelease
               ```
            4. Find APK in: `android/app/build/outputs/apk/release/`
            
            Or use EAS Build:
            ```bash
            eas build --platform android --profile preview
            ```
            
            See [INSTALLATION.md](https://github.com/sergiikryshtop/pomodoro-timetracker-app/blob/main/INSTALLATION.md) for details.
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Benefits of Option 2
- ✅ No external dependencies (Expo account, tokens)
- ✅ Validates code still compiles
- ✅ Creates GitHub releases with build instructions
- ✅ Developers can build APK locally when needed
- ❌ No automatic APK distribution

---

## Recommendation

**For production/public use:** Choose **Option 1** (EAS Build)
- Automated APK generation
- Easy distribution for end users
- Professional CD pipeline

**For personal/development use:** Choose **Option 2** (Validation only)
- Simpler setup
- No external service dependencies
- Manual build control

---

## Next Steps

1. **Choose which option** you want to implement
2. **If Option 1:** Follow EAS setup steps above
3. **If Option 2:** Apply simplified workflow changes
4. **Test:** Push to main and verify workflow runs successfully
5. **Verify:** Check that releases are created as expected

---

## Secrets Summary

### Currently Required
- `GITHUB_TOKEN` - ✅ Auto-provided by GitHub Actions

### For Option 1 (EAS Build)
- `EXPO_TOKEN` - ❌ Needs to be added manually

### Optional (For Signed APKs)
- `ANDROID_KEYSTORE_BASE64` - Base64 encoded keystore file
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias
- `ANDROID_KEY_PASSWORD` - Key password

---

## Troubleshooting

### EAS Build Fails
- Verify EXPO_TOKEN is correct
- Check Expo account has enough build quota (free tier: 30/month)
- Ensure `eas.json` is committed to repository

### Release Creation Fails
- Verify version in package.json is unique (not already released)
- Check GITHUB_TOKEN permissions (should be automatic)

### Build Takes Too Long
- EAS cloud builds can take 10-20 minutes
- Consider using local builds for development
