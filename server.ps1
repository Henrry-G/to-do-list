$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8090/')
$listener.Start()
Write-Host "CloudDo server running at http://localhost:8090"

$rootPath = "d:\vibe-coding\test-run\todo-list"

function Get-ContentType($path) {
    switch ([System.IO.Path]::GetExtension($path).ToLower()) {
        '.html' { return 'text/html; charset=utf-8' }
        '.css'  { return 'text/css; charset=utf-8' }
        '.js'   { return 'application/javascript; charset=utf-8' }
        '.json' { return 'application/json; charset=utf-8' }
        '.png'  { return 'image/png' }
        '.jpg'  { return 'image/jpeg' }
        '.svg'  { return 'image/svg+xml' }
        default { return 'application/octet-stream' }
    }
}

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $path = $context.Request.Url.AbsolutePath
    if ($path -eq '/') { $path = '/index.html' }
    
    $filePath = Join-Path $rootPath $path.TrimStart('/')
    
    if (Test-Path $filePath) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $context.Response.ContentType = Get-ContentType $filePath
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $context.Response.StatusCode = 404
        $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
        $context.Response.OutputStream.Write($body, 0, $body.Length)
    }
    
    $context.Response.Close()
}
