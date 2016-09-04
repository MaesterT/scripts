$outputExtension = ".ogg"
   $bitrate = 128
   $channels = 2
   
   foreach($inputFile in get-childitem -recurse -Filter *.mp4)
   { 
     $outputFileName = [System.IO.Path]::GetFileNameWithoutExtension($inputFile.FullName) + $outputExtension;
     $outputFileName = [System.IO.Path]::Combine($inputFile.DirectoryName, $outputFileName);
     
     $programFiles = ${env:ProgramFiles(x86)};
     if($programFiles -eq $null) { $programFiles = $env:ProgramFiles; }
     
     $processName = $programFiles + "\VideoLAN\VLC\vlc.exe"
     $processArgs = "-I dummy -v --no-sout-video --sout-audio --no-sout-rtp-sap --no-sout-standard-sap --ttl=1 --sout-keep --sout=#transcode{acodec=`"vorb`",ab=`"$bitrate`",`"channels=$channels`"}:std{access=`"file`",mux=`"ogg`",dst=`"$outputFileName`"} `"$($inputFile.FullName)`" vlc://quit"
     
     start-process $processName $processArgs -wait
   }
