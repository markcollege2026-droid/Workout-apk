# Windows PowerShell SDK-only build. Requires JDK 17+ and Android SDK packages 35.
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Sdk = $env:ANDROID_SDK_ROOT
if (!$Sdk) { $Sdk = $env:ANDROID_HOME }
if (!$Sdk) { $Sdk = "$env:LOCALAPPDATA\Android\Sdk" }
if (!$env:JAVA_HOME) { throw 'Set JAVA_HOME to JDK 17+ (Android Studio jbr is suitable).' }
$Bt = "$Sdk\build-tools\35.0.0"
$Platform = "$Sdk\platforms\android-35\android.jar"
if (!(Test-Path $Platform)) { throw 'Install platforms;android-35 and build-tools;35.0.0 using sdkmanager.bat.' }
$Work = "$Root\build\apk"
if (Test-Path $Work) { Remove-Item $Work -Recurse -Force }
foreach ($Dir in @("$Work\gen","$Work\classes","$Work\dex","$Work\assets\www","$Root\release","$Root\signing")) { New-Item -ItemType Directory -Path $Dir -Force | Out-Null }
Copy-Item "$Root\www\*" "$Work\assets\www" -Recurse
& "$Bt\aapt2.exe" compile --dir "$Root\android\app\src\main\res" -o "$Work\resources.zip"
if ($LASTEXITCODE) { throw 'Resource compilation failed.' }
& "$Bt\aapt2.exe" link -o "$Work\linked.apk" -I $Platform --manifest "$Root\android\app\src\main\AndroidManifest.xml" --java "$Work\gen" -A "$Work\assets" --min-sdk-version 26 --target-sdk-version 35 --version-code 1 --version-name 1.0 "$Work\resources.zip"
if ($LASTEXITCODE) { throw 'APK linking failed.' }
$Sources = Get-ChildItem "$Root\android\app\src\main\java","$Work\gen" -Filter *.java -Recurse | ForEach-Object { '"' + $_.FullName + '"' }
[System.IO.File]::WriteAllLines("$Work\sources.txt",$Sources,[System.Text.UTF8Encoding]::new($false))
& "$env:JAVA_HOME\bin\javac.exe" -encoding UTF-8 -source 8 -target 8 -classpath $Platform -d "$Work\classes" "@$Work\sources.txt"
if ($LASTEXITCODE) { throw 'Java compilation failed.' }
$Classes = @(Get-ChildItem "$Work\classes" -Recurse -Filter *.class | ForEach-Object { $_.FullName })
& "$Bt\d8.bat" --lib $Platform --min-api 26 --output "$Work\dex" $Classes
if ($LASTEXITCODE) { throw 'Dex compilation failed.' }
Copy-Item "$Work\linked.apk" "$Work\unsigned.apk"
Push-Location "$Work\dex"
try { & "$env:JAVA_HOME\bin\jar.exe" uf "$Work\unsigned.apk" classes.dex } finally { Pop-Location }
& "$Bt\zipalign.exe" -f 4 "$Work\unsigned.apk" "$Work\aligned.apk"
if ($LASTEXITCODE) { throw 'Alignment failed.' }
$Key = "$Root\signing\forge-debug.keystore"
if (!(Test-Path $Key)) { & "$env:JAVA_HOME\bin\keytool.exe" -genkeypair -noprompt -keystore $Key -storepass android -keypass android -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=Android Debug,O=Forge Personal,C=US' }
$Apk = "$Root\release\Forge-Workout.apk"
& "$Bt\apksigner.bat" sign --ks $Key --ks-pass pass:android --key-pass pass:android --out $Apk "$Work\aligned.apk"
if ($LASTEXITCODE) { throw 'Signing failed.' }
& "$Bt\apksigner.bat" verify --verbose $Apk
if ($LASTEXITCODE) { throw 'Signature verification failed.' }
Write-Host "Built: $Apk"
Write-Host "Install: & '$Sdk\platform-tools\adb.exe' install -r '$Apk'"
