FOR %%i IN (*.*) DO ..\..\..\bin\gzip.exe < "%%i" > ".\gz\%%i"
aws s3 sync ./gz s3://gba.ninja/ --content-encoding=gzip
