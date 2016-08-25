FOR %%i IN (*.*) DO gzip < "%%i" > ".\gz\%%i"
aws s3 sync ./gz s3://gba.ninja/ --content-encoding=gzip
