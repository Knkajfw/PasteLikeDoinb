param ($reqUrl)

$source = @"
public class WinHttp
{
    [System.Runtime.InteropServices.StructLayout(System.Runtime.InteropServices.LayoutKind.Sequential)]
    public struct WinhttpCurrentUserIeProxyConfig
    {
        [System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.Bool)]
        public bool AutoDetect;
        [System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.LPWStr)]
        public string AutoConfigUrl;
        [System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.LPWStr)]
        public string Proxy;
        [System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.LPWStr)]
        public string ProxyBypass;

    }

    [System.Runtime.InteropServices.DllImport("winhttp.dll", SetLastError = true)]
    static extern bool WinHttpGetIEProxyConfigForCurrentUser(ref WinhttpCurrentUserIeProxyConfig pProxyConfig);

    public static string GetProxyForUrl(string reqUrl)
    {
        var config = new WinhttpCurrentUserIeProxyConfig();

        WinHttpGetIEProxyConfigForCurrentUser(ref config);

        // System.Console.WriteLine("Proxy: {0}", config.Proxy); // eg. 104.129.192.32:443
        // System.Console.WriteLine("AutoConfigUrl: {0}", config.AutoConfigUrl); // http://xxxxx/nam.filt.pac
        // System.Console.WriteLine("AutoDetect: {0}", config.AutoDetect); // True
        // System.Console.WriteLine("ProxyBypass: {0}", config.ProxyBypass); // *.microsoft.com;*.corp.com;*.dev.microsoft.com;*.ms.com;*.local;<local>

        var w = System.Net.WebRequest.GetSystemWebProxy();
        var url = new System.Uri(reqUrl);
        if (w.IsBypassed(url)) return "DIRECT";
        return w.GetProxy(url).ToString();
    }
}
"@

if ($reqUrl.length -eq 0) {
    echo "Missing argument"
    echo "getSystemProxyForUrl.ps1 -- will determine the proxy to be used for the given url"
    echo "Example:"
    echo "    powershell .\getSystemProxyForUrl.ps1 http://microsoft.com"
    echo "Outputs proxy url to standard out"
    echo "or if no proxy is required, outputs the word DIRECT"
    exit
}

Add-Type -TypeDefinition $Source -Language CSharp  

([WinHttp]::GetProxyForUrl($reqUrl))