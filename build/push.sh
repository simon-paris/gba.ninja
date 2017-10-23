for f in $(ls); do gzip < $f > ./gz/$f; done;
aws s3 sync ./gz s3://gba.ninja/ --content-encoding=gzip
