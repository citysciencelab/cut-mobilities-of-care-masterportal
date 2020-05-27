echo killing process on port $1

taskkill //PID `netstat -aon | grep $1 | grep -P '(?=LISTENING).*' -o -m1 | grep -P '\d*' -o` //F