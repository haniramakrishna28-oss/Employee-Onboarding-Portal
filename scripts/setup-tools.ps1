[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$binDir = 'C:\Users\Admin\bin'
if (-not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Force -Path $binDir | Out-Null
}

$nodeZip = Join-Path $binDir 'node.zip'
$gitZip = Join-Path $binDir 'git.zip'

if (-not (Test-Path 'C:\Users\Admin\bin\node\node.exe')) {
    Write-Host 'Downloading Node.js LTS (v20.18.0)...'
    Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip' -OutFile $nodeZip
    Write-Host 'Extracting Node.js...'
    Expand-Archive -Path $nodeZip -DestinationPath "$binDir\node_temp" -Force
    Move-Item -Path "$binDir\node_temp\node-v20.18.0-win-x64" -Destination "$binDir\node" -Force
    Remove-Item -Path "$binDir\node_temp" -Recurse -Force
    Remove-Item -Path $nodeZip -Force
}

if (-not (Test-Path 'C:\Users\Admin\bin\git\cmd\git.exe')) {
    Write-Host 'Downloading MinGit...'
    Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/MinGit-2.43.0-64-bit.zip' -OutFile $gitZip
    Write-Host 'Extracting MinGit...'
    Expand-Archive -Path $gitZip -DestinationPath "$binDir\git" -Force
    Remove-Item -Path $gitZip -Force
}

# Update User PATH permanently
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$pathsToAdd = @('C:\Users\Admin\bin\node', 'C:\Users\Admin\bin\git\cmd')
$newPath = $userPath

foreach ($p in $pathsToAdd) {
    if ($newPath -notmatch [regex]::Escape($p)) {
        $newPath = "$newPath;$p"
    }
}
[Environment]::SetEnvironmentVariable('Path', $newPath, 'User')

Write-Host "Setup completed successfully!"
