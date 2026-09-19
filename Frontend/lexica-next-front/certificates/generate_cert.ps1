$hostIp = '192.168.50.30'
$cert = New-SelfSignedCertificate `
 -Subject "CN=$hostIp" `
 -Type SSLServerAuthentication `
 -TextExtension "2.5.29.17={text}IPAddress=$hostIp" `
 -CertStoreLocation Cert:\CurrentUser\My `
 -KeyExportPolicy Exportable

$certPassword = Read-Host 'Certificate password' -AsSecureString
Export-PfxCertificate -Cert $cert -FilePath ".\certificates\lan.pfx" -Password $certPassword
Export-Certificate -Cert $cert -FilePath ".\certificates\lan.cer"

$env:LEXICA_HTTPS_PFX = ".\certificates\lan.pfx"
$env:LEXICA_HTTPS_PASSWORD = [System.Net.NetworkCredential]::new('', $certPassword).Password