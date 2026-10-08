$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, 8765)
$listener.Start()
Write-Host "Serving $root at http://localhost:8765/  (Ctrl+C to stop)"
while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
        $stream = $client.GetStream()
        $reader = New-Object IO.StreamReader($stream)
        $requestLine = $reader.ReadLine()
        # 吃掉剩余请求头
        while ($reader.ReadLine() -ne '') { }
        $rel = '/'
        if ($requestLine -match '^\S+\s+(\S+)') { $rel = $Matches[1] }
        if ($rel -eq '/') { $rel = '/index.html' }
        $rel = $rel.Split('?')[0]
        $rel = [Uri]::UnescapeDataString($rel)
        $path = Join-Path $root ($rel.TrimStart('/').Replace('/', '\'))
        $status = '200 OK'
        $contentType = 'application/octet-stream'
        if (Test-Path -PathType Leaf $path) {
            $bytes = [IO.File]::ReadAllBytes($path)
            $ext = [IO.Path]::GetExtension($path).ToLower()
            switch ($ext) {
                '.html' { $contentType = 'text/html; charset=utf-8' }
                '.css'  { $contentType = 'text/css; charset=utf-8' }
                '.js'   { $contentType = 'application/javascript; charset=utf-8' }
                '.jpg'  { $contentType = 'image/jpeg' }
                '.jpeg' { $contentType = 'image/jpeg' }
                '.png'  { $contentType = 'image/png' }
                '.gif'  { $contentType = 'image/gif' }
                '.webp' { $contentType = 'image/webp' }
                '.mp3'  { $contentType = 'audio/mpeg' }
                '.m4a'  { $contentType = 'audio/mp4' }
                '.mp4'  { $contentType = 'video/mp4' }
            }
        } else {
            $status = '404 Not Found'
            $contentType = 'text/plain; charset=utf-8'
            $bytes = [Text.Encoding]::UTF8.GetBytes("404 Not Found: $rel")
        }
        $header = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
        $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($bytes, 0, $bytes.Length)
        $stream.Flush()
    } catch { }
    finally { $client.Close() }
}
