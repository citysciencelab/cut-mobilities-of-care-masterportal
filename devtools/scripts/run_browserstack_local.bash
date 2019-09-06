#File: run_browserstack_local.bash
#!/bin/bash -e

wget http://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip
unzip BrowserStackLocal-linux-x64.zip
./BrowserStackLocal ${BROWSERSTACK_ACCESSKEY} > /dev/null &
sleep 10
